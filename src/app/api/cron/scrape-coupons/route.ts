// Sprint 2 · Day 2 — Daily coupon-verification cron
//
// Runs nightly via Vercel cron. Each invocation:
//   1. Picks the 5 active stores whose coupons have the OLDEST last_verified_at
//   2. Scrapes couponava.com for each via Firecrawl (Arabic coupon source)
//   3. For every existing coupon in DB whose code is still publicly listed →
//      bump last_verified_at = now() + verification_method = 'scrape'
//   4. For every newly-found code → upsert as a new coupon (skip dupes by slug)
//
// Cycle math: 500 active stores ÷ 5 per run = full inventory covered every
// 100 days. The freshness-pill semantics tolerate this: a store that hasn't
// been scraped in a week shows "this week" (white badge), older shows nothing.
// Manual admin verification via /admin/verify-queue (Sprint 2 Day 3) cuts
// the long tail.
//
// Security: protected by CRON_SECRET. Vercel injects it on cron invocations;
// any other request gets 401.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Stretch the time budget — Firecrawl can be slow, and we do 5 stores × ~3s each.
export const maxDuration = 60;

// ─── Config ─────────────────────────────────────────────────────────────────

const BATCH_SIZE = 5;
const FIRECRAWL_RATE_LIMIT_MS = 1500;
const COUPONAVA_BASE = "https://couponava.com/store";

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseDiscount(display: string | null | undefined): {
  type: "percentage" | "fixed" | "free_shipping" | "other";
  value: number | null;
} {
  if (!display) return { type: "other", value: null };

  const percentMatch = display.match(/(\d+(?:\.\d+)?)%/);
  if (percentMatch) return { type: "percentage", value: parseFloat(percentMatch[1]) };

  const riyalMatch = display.match(/(\d+(?:\.\d+)?)\s*ر\.?س/);
  if (riyalMatch) return { type: "fixed", value: parseFloat(riyalMatch[1]) };

  if (display.includes("مجاني") || display.includes("مجانا")) {
    return { type: "free_shipping", value: null };
  }
  return { type: "other", value: null };
}

function slugify(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w؀-ۿ-]/g, "")
    .slice(0, 100);
}

type ScrapedCoupon = {
  code: string;
  title_ar?: string;
  discount_display?: string;
};

async function scrapeStore(
  slug: string,
  firecrawlKey: string
): Promise<{ store_found: boolean; coupons: ScrapedCoupon[] } | null> {
  const url = `${COUPONAVA_BASE}/${encodeURIComponent(slug)}/`;

  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${firecrawlKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: ["json"],
      jsonOptions: {
        prompt:
          "Extract all coupon/promo codes from this Arabic coupon page. For each coupon, extract: the promo code (short alphanumeric code like VN32, BG509), the Arabic title of the offer, and the discount display text (like 10% خصم, توصيل مجاني, 50 ريال خصم). Only return real promo codes, not placeholder text.",
        schema: {
          type: "object",
          properties: {
            coupons: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  title_ar: { type: "string" },
                  discount_display: { type: "string" },
                },
                required: ["code"],
              },
            },
            store_found: { type: "boolean" },
          },
        },
      },
      onlyMainContent: true,
      waitFor: 2000,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Firecrawl ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  return data?.data?.json ?? null;
}

// ─── Route ──────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  // Vercel cron injects CRON_SECRET via the Authorization header.
  // Reject anything else so this endpoint isn't a public scraping trigger.
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const firecrawlKey = process.env.FIRECRAWL_API_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { ok: false, reason: "missing_supabase_env" },
      { status: 500 }
    );
  }
  if (!firecrawlKey) {
    return NextResponse.json(
      {
        ok: false,
        reason: "missing_firecrawl_env",
        hint: "Add FIRECRAWL_API_KEY in Vercel env vars (Production + Preview)",
      },
      { status: 500 }
    );
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1. Pick the BATCH_SIZE stores whose coupons have the oldest verification.
  // We pick stores rather than individual coupons so we get the most value per
  // Firecrawl call (one page can refresh many codes for the same store).
  const { data: staleStores, error: storeErr } = await supabase
    .from("stores")
    .select(
      "id, slug, name_ar, website_url, coupons!inner(id, last_verified_at)"
    )
    .eq("status", "active")
    .eq("coupons.status", "active")
    .order("coupons(last_verified_at)", { ascending: true, nullsFirst: true })
    .limit(BATCH_SIZE);

  if (storeErr) {
    console.error("[scrape-coupons] store query", storeErr);
    return NextResponse.json({ ok: false, reason: storeErr.message }, { status: 500 });
  }

  if (!staleStores || staleStores.length === 0) {
    return NextResponse.json({
      ok: true,
      summary: "No active stores to scrape",
      processed: 0,
    });
  }

  // Dedupe by store id (a store with N coupons appears N times in the joined query)
  const seen = new Set<string>();
  const uniqueStores = staleStores.filter((s) => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });

  let totalBumped = 0;
  let totalInserted = 0;
  let totalFailed = 0;
  const log: Array<{ store: string; bumped: number; inserted: number; status: string }> = [];

  for (let i = 0; i < uniqueStores.length; i++) {
    const store = uniqueStores[i];
    try {
      const scraped = await scrapeStore(store.slug, firecrawlKey);

      if (!scraped || scraped.store_found === false || !scraped.coupons?.length) {
        log.push({ store: store.slug, bumped: 0, inserted: 0, status: "no_codes" });
      } else {
        const now = new Date().toISOString();
        // Normalize codes for comparison (uppercase, trimmed)
        const liveCodes = new Set(
          scraped.coupons
            .filter((c) => c.code && c.code.trim().length >= 2)
            .map((c) => c.code.trim().toUpperCase())
        );

        // 2a. Bump last_verified_at on existing coupons whose code is in the live list.
        const { data: existingCoupons } = await supabase
          .from("coupons")
          .select("id, code")
          .eq("store_id", store.id)
          .eq("status", "active");

        const idsToBump =
          existingCoupons
            ?.filter((c) => c.code && liveCodes.has(c.code.toUpperCase()))
            .map((c) => c.id) ?? [];

        if (idsToBump.length > 0) {
          // Cast payload — last_verified_at/verification_method exist in DB
          // but the generated Database type hasn't been refreshed yet.
          const updatePayload = {
            last_verified_at: now,
            verification_method: "scrape",
          } as unknown as Database["public"]["Tables"]["coupons"]["Update"];

          await supabase
            .from("coupons")
            .update(updatePayload)
            .in("id", idsToBump);
        }

        // 2b. Insert any newly-found codes (upsert by slug to avoid duplicates).
        const existingCodes = new Set(
          (existingCoupons ?? []).map((c) => (c.code ?? "").toUpperCase())
        );
        const toInsert = scraped.coupons
          .filter((c) => c.code && c.code.trim().length >= 2 && c.code.trim().length <= 30)
          .filter((c) => !existingCodes.has(c.code.trim().toUpperCase()))
          .map((c) => {
            const code = c.code.trim().toUpperCase();
            const { type, value } = parseDiscount(c.discount_display);
            return {
              store_id: store.id,
              code,
              title_ar: c.title_ar || `كوبون خصم ${store.name_ar}`,
              discount_display: c.discount_display || null,
              discount_type: type,
              discount_value: value,
              destination_url: store.website_url,
              status: "active" as const,
              slug: slugify(`${store.slug}-${code}`),
              last_verified_at: now,
              verification_method: "scrape",
            };
          });

        if (toInsert.length > 0) {
          const { error: insertErr } = await supabase
            .from("coupons")
            // @ts-expect-error - types regenerated post-migration
            .upsert(toInsert, { onConflict: "slug", ignoreDuplicates: true });
          if (insertErr) {
            console.error(`[scrape-coupons] insert ${store.slug}`, insertErr);
          }
        }

        totalBumped += idsToBump.length;
        totalInserted += toInsert.length;
        log.push({
          store: store.slug,
          bumped: idsToBump.length,
          inserted: toInsert.length,
          status: "ok",
        });
      }
    } catch (err) {
      console.error(`[scrape-coupons] ${store.slug}`, err);
      totalFailed += 1;
      log.push({
        store: store.slug,
        bumped: 0,
        inserted: 0,
        status: `error: ${(err as Error).message}`,
      });
    }

    // Rate-limit between stores
    if (i < uniqueStores.length - 1) {
      await new Promise((r) => setTimeout(r, FIRECRAWL_RATE_LIMIT_MS));
    }
  }

  return NextResponse.json({
    ok: true,
    batch_size: BATCH_SIZE,
    processed: uniqueStores.length,
    bumped: totalBumped,
    inserted: totalInserted,
    failed: totalFailed,
    log,
    next_eta: "tomorrow 03:00 UTC",
  });
}
