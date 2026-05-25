// Sprint 2 · Day 2 — Daily coupon-verification cron (multi-source, free)
//
// Runs nightly via Vercel cron. Each invocation:
//   1. Picks the 5 active stores whose coupons have the OLDEST last_verified_at
//   2. For each store, fetches every adapter in ./sources/ in parallel
//      (couponava, arabiccoupon, alcoupon — all Arabic aggregators)
//   3. Merges the results, deduping by uppercase code. Codes that appear on
//      2+ sources get verification_method = 'multi-source' (high trust);
//      single-source codes get 'scrape'.
//   4. For every existing coupon whose code is still listed somewhere →
//      bump last_verified_at = now() + verification_method as above
//   5. For every newly-found code → upsert as a new coupon (skip dupes by slug)
//
// Why multi-source: one site changing markup or going down doesn't break the
// pipeline. Cross-source agreement is itself a trust signal — if 3 different
// aggregators all list code "VN32" for noon, that code is almost certainly real.
//
// Cost: zero. Native fetch + cheerio. No Firecrawl, no third-party API.
//
// Cycle math: 500 active stores ÷ 5 per run = full inventory covered every
// 100 days. Manual admin verification via /admin/verify-queue (Sprint 2 Day 3)
// cuts the long tail. Auto-archive of stale codes (Sprint 2 Day 4) prevents
// the dead-coupon backlog from growing without bound.
//
// Security: protected by CRON_SECRET. Vercel injects it on cron invocations;
// any other request gets 401.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { SOURCES, type CouponSource, type ScrapedCoupon, type SourceResult } from "./sources";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// 3 sources × 5 stores fetched in parallel-per-store w/ 500ms gap = ~15-20s.
// 60s gives us headroom for slow sources without timing out.
export const maxDuration = 60;

// ─── Config ─────────────────────────────────────────────────────────────────

const BATCH_SIZE = 5;
const PER_STORE_DELAY_MS = 500;
const FETCH_TIMEOUT_MS = 8000;

const USER_AGENT =
  "Mozilla/5.0 (compatible; CouponawyBot/1.0; +https://couponawy.com/about)";

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseDiscount(display: string | null | undefined): {
  type: "percentage" | "fixed" | "free_shipping" | "other";
  value: number | null;
} {
  if (!display) return { type: "other", value: null };

  const percentMatch = display.match(/(\d+(?:\.\d+)?)\s*%/);
  if (percentMatch) return { type: "percentage", value: parseFloat(percentMatch[1]) };

  const riyalMatch = display.match(/(\d+(?:\.\d+)?)\s*ر\.?س/);
  if (riyalMatch) return { type: "fixed", value: parseFloat(riyalMatch[1]) };

  if (display.includes("مجاني") || display.includes("مجانا") || display.includes("توصيل مجاني")) {
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

/** Quick code-shape sanity check — filters out noise like "GO", "COPY", etc. */
function looksLikeCode(code: string): boolean {
  const trimmed = code.trim();
  if (trimmed.length < 3 || trimmed.length > 30) return false;
  // Allow letters + digits, must contain at least one digit OR be all uppercase.
  // (Most real codes are SHEIN, VN32, ALC45 — either ALL CAPS or alphanumeric.)
  if (!/^[A-Z0-9_-]+$/i.test(trimmed)) return false;
  return true;
}

/** Fetch one source with timeout. Returns SourceResult — never throws. */
async function fetchOneSource(
  source: CouponSource,
  slug: string
): Promise<SourceResult & { source: string }> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(source.storeUrl(slug), {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "ar,en;q=0.9",
      },
    });
    if (res.status === 404) {
      return { source: source.name, store_found: false, coupons: [], status: "store_not_found" };
    }
    if (!res.ok) {
      return {
        source: source.name,
        store_found: false,
        coupons: [],
        status: "error",
        error: `HTTP ${res.status}`,
      };
    }
    const html = await res.text();
    const coupons = source.parse(html).filter((c) => looksLikeCode(c.code));
    return {
      source: source.name,
      store_found: true,
      coupons,
      status: coupons.length > 0 ? "ok" : "no_codes",
    };
  } catch (err) {
    return {
      source: source.name,
      store_found: false,
      coupons: [],
      status: "error",
      error: (err as Error).message.slice(0, 120),
    };
  } finally {
    clearTimeout(t);
  }
}

type MergedCoupon = ScrapedCoupon & { source_count: number; sources: string[] };

/** Merge results across sources. Dedupe by UPPERCASE(code). */
function mergeResults(results: Array<SourceResult & { source: string }>): MergedCoupon[] {
  const byCode = new Map<string, MergedCoupon>();
  for (const r of results) {
    for (const c of r.coupons) {
      const key = c.code.trim().toUpperCase();
      const existing = byCode.get(key);
      if (existing) {
        existing.source_count += 1;
        existing.sources.push(r.source);
        // Prefer non-empty title/discount from later sources if current is blank
        if (!existing.title_ar && c.title_ar) existing.title_ar = c.title_ar;
        if (!existing.discount_display && c.discount_display) {
          existing.discount_display = c.discount_display;
        }
      } else {
        byCode.set(key, {
          code: key,
          title_ar: c.title_ar,
          discount_display: c.discount_display,
          source_count: 1,
          sources: [r.source],
        });
      }
    }
  }
  return Array.from(byCode.values());
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

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { ok: false, reason: "missing_supabase_env" },
      { status: 500 }
    );
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1. Pick the BATCH_SIZE stores whose coupons have the oldest verification.
  // We pick stores rather than individual coupons so we get the most value per
  // round — one store fetch can refresh many codes.
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
  let totalMultiSource = 0;
  let totalFailed = 0;
  const log: Array<{
    store: string;
    bumped: number;
    inserted: number;
    multi: number;
    sources: Record<string, string>;
  }> = [];

  for (let i = 0; i < uniqueStores.length; i++) {
    const store = uniqueStores[i];

    // Fetch all sources for this store in parallel — they're different hosts.
    const sourceResults = await Promise.all(
      SOURCES.map((s) => fetchOneSource(s, store.slug))
    );

    // Source-by-source status for the run log
    const sourceStatus: Record<string, string> = {};
    for (const r of sourceResults) {
      sourceStatus[r.source] = r.error ? `error:${r.error}` : `${r.status}(${r.coupons.length})`;
    }

    const merged = mergeResults(sourceResults);

    if (merged.length === 0) {
      // No source returned any code for this store — count as failure for visibility
      totalFailed += 1;
      log.push({
        store: store.slug,
        bumped: 0,
        inserted: 0,
        multi: 0,
        sources: sourceStatus,
      });
    } else {
      const now = new Date().toISOString();
      const liveByCode = new Map(merged.map((c) => [c.code, c]));

      // 2a. Bump last_verified_at on existing coupons whose code is in any live list.
      const { data: existingCoupons } = await supabase
        .from("coupons")
        .select("id, code")
        .eq("store_id", store.id)
        .eq("status", "active");

      // Split existing bumps into single-source vs multi-source for the cleaner DB tag
      const bumpMulti: string[] = [];
      const bumpSingle: string[] = [];
      for (const c of existingCoupons ?? []) {
        if (!c.code) continue;
        const live = liveByCode.get(c.code.toUpperCase());
        if (!live) continue;
        (live.source_count >= 2 ? bumpMulti : bumpSingle).push(c.id);
      }

      // Two updates so we can tag verification_method correctly. Casts because
      // the generated Database type hasn't been refreshed since the migration.
      type CouponUpdate = Database["public"]["Tables"]["coupons"]["Update"];
      if (bumpMulti.length > 0) {
        await supabase
          .from("coupons")
          .update({ last_verified_at: now, verification_method: "multi-source" } as unknown as CouponUpdate)
          .in("id", bumpMulti);
      }
      if (bumpSingle.length > 0) {
        await supabase
          .from("coupons")
          .update({ last_verified_at: now, verification_method: "scrape" } as unknown as CouponUpdate)
          .in("id", bumpSingle);
      }

      // 2b. Insert any newly-found codes (upsert by slug to avoid duplicates).
      const existingCodes = new Set(
        (existingCoupons ?? []).map((c) => (c.code ?? "").toUpperCase())
      );

      const toInsert = merged
        .filter((c) => !existingCodes.has(c.code))
        .map((c) => {
          const { type, value } = parseDiscount(c.discount_display);
          return {
            store_id: store.id,
            code: c.code,
            title_ar: c.title_ar || `كوبون خصم ${store.name_ar}`,
            discount_display: c.discount_display || null,
            discount_type: type,
            discount_value: value,
            destination_url: store.website_url,
            status: "active" as const,
            slug: slugify(`${store.slug}-${c.code}`),
            last_verified_at: now,
            verification_method: c.source_count >= 2 ? "multi-source" : "scrape",
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

      const bumped = bumpMulti.length + bumpSingle.length;
      totalBumped += bumped;
      totalInserted += toInsert.length;
      totalMultiSource += bumpMulti.length + toInsert.filter((t) => t.verification_method === "multi-source").length;
      log.push({
        store: store.slug,
        bumped,
        inserted: toInsert.length,
        multi: bumpMulti.length,
        sources: sourceStatus,
      });
    }

    // Gentle rate-limit between stores — we're hitting 3 different sites each
    // iteration so this is mostly courtesy, not strict per-host throttling.
    if (i < uniqueStores.length - 1) {
      await new Promise((r) => setTimeout(r, PER_STORE_DELAY_MS));
    }
  }

  return NextResponse.json({
    ok: true,
    batch_size: BATCH_SIZE,
    sources: SOURCES.map((s) => s.name),
    processed: uniqueStores.length,
    bumped: totalBumped,
    inserted: totalInserted,
    multi_source: totalMultiSource,
    failed: totalFailed,
    log,
    next_eta: "tomorrow 03:00 UTC",
  });
}
