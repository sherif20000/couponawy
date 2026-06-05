/**
 * Coupon scraper — pulls coupons from couponava.com for every active store
 * and inserts them into the Supabase coupons table.
 *
 * Run: node scripts/scrape-coupons.mjs
 *
 * Reads from .env.local automatically. Skips stores that already have coupons.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// ─── Load env from .env.local ────────────────────────────────────────────────

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  const lines = readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) {
      process.env[key.trim()] = rest.join("=").trim();
    }
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FIRECRAWL_KEY = "fc-2a33a223734e4290b1792e78af3488c4";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── Firecrawl JSON extractor ─────────────────────────────────────────────────

async function scrapeCoupons(slug) {
  const url = `https://couponava.com/store/${encodeURIComponent(slug)}/`;

  const body = {
    url,
    formats: ["json"],
    jsonOptions: {
      prompt:
        "Extract all coupon/promo codes from this Arabic coupon page. For each coupon, extract: the promo code (short alphanumeric code like VN32, BG509 etc.), the Arabic title of the offer, and the discount display text (like 10% خصم, توصيل مجاني, 50 ريال خصم). Only return real promo codes, not placeholder text.",
      schema: {
        type: "object",
        properties: {
          coupons: {
            type: "array",
            items: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                  description: "The short alphanumeric promo code (e.g. VN32)",
                },
                title_ar: {
                  type: "string",
                  description: "Arabic title of the coupon offer",
                },
                discount_display: {
                  type: "string",
                  description:
                    "Human-readable discount text in Arabic (e.g. 10% خصم, توصيل مجاني)",
                },
              },
              required: ["code"],
            },
          },
          store_found: {
            type: "boolean",
            description: "False if the store page doesn't exist on couponava",
          },
        },
      },
    },
    onlyMainContent: true,
    waitFor: 2000,
  };

  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FIRECRAWL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Firecrawl ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return data?.data?.json ?? null;
}

// ─── Coupon parser ────────────────────────────────────────────────────────────

function parseDiscount(display) {
  if (!display) return { type: "other", value: null };

  const percentMatch = display.match(/(\d+(?:\.\d+)?)%/);
  if (percentMatch) {
    return { type: "percentage", value: parseFloat(percentMatch[1]) };
  }

  const riyalMatch = display.match(/(\d+(?:\.\d+)?)\s*ر\.?س/);
  if (riyalMatch) {
    return { type: "fixed", value: parseFloat(riyalMatch[1]) };
  }

  if (display.includes("مجاني") || display.includes("مجانا")) {
    return { type: "free_shipping", value: null };
  }

  return { type: "other", value: null };
}

function slugify(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0600-\u06FF-]/g, "")
    .slice(0, 100);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Fetching active stores from Supabase...");

  const { data: stores, error: storesErr } = await supabase
    .from("stores")
    .select("id, slug, name_ar, website_url")
    .eq("status", "active")
    .order("slug");

  if (storesErr) throw storesErr;
  console.log(`Found ${stores.length} active stores.\n`);

  // Get stores that already have coupons so we can skip them
  const { data: existingCoupons } = await supabase
    .from("coupons")
    .select("store_id");

  const alreadyScraped = new Set(existingCoupons?.map((c) => c.store_id) ?? []);
  const toScrape = stores.filter((s) => !alreadyScraped.has(s.id));

  console.log(
    `${alreadyScraped.size} stores already have coupons, scraping ${toScrape.length} remaining.\n`,
  );

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < toScrape.length; i++) {
    const store = toScrape[i];
    const progress = `[${i + 1}/${toScrape.length}]`;

    try {
      const result = await scrapeCoupons(store.slug);

      if (!result || result.store_found === false || !result.coupons?.length) {
        console.log(`${progress} ${store.slug} — no coupons found, skipping`);
        skipped++;
      } else {
        const couponsToInsert = result.coupons
          .filter((c) => c.code && c.code.length >= 2 && c.code.length <= 30)
          .map((c) => {
            const { type, value } = parseDiscount(c.discount_display);
            return {
              store_id: store.id,
              code: c.code.trim().toUpperCase(),
              title_ar: c.title_ar || `كوبون خصم ${store.name_ar}`,
              discount_display: c.discount_display || null,
              discount_type: type,
              discount_value: value,
              destination_url: store.website_url,
              status: "active",
              slug: slugify(`${store.slug}-${c.code}`),
            };
          });

        if (couponsToInsert.length === 0) {
          console.log(
            `${progress} ${store.slug} — codes extracted but all filtered out`,
          );
          skipped++;
        } else {
          const { error: insertErr } = await supabase
            .from("coupons")
            .upsert(couponsToInsert, {
              onConflict: "slug",
              ignoreDuplicates: true,
            });

          if (insertErr) {
            console.error(
              `${progress} ${store.slug} — insert error:`,
              insertErr.message,
            );
            failed++;
          } else {
            console.log(
              `${progress} ${store.slug} — inserted ${couponsToInsert.length} coupons`,
            );
            inserted += couponsToInsert.length;
          }
        }
      }
    } catch (err) {
      console.error(`${progress} ${store.slug} — scrape error:`, err.message);
      failed++;
    }

    // Rate limit: 1.5s between requests to be respectful
    if (i < toScrape.length - 1) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  console.log("\n─────────────────────────────────");
  console.log(`Done.`);
  console.log(`  Coupons inserted : ${inserted}`);
  console.log(`  Stores skipped   : ${skipped}`);
  console.log(`  Errors           : ${failed}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
