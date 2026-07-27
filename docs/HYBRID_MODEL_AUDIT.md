# Couponawy — Hybrid Model Audit (Coupons + Product Comparison)

**Date:** 2026-07-03 · Three parallel audits: structure/IA, business-model-as-wired,
and the 5prijzen-blueprint adaptation. Companion to the SleepyHero audit at
`~/Code/sleepyhero/sleepyhero/docs/audits/full-audit-2026-07.md`.

**One-line verdict:** the hybrid concept is validated and couponawy is ~70%
architecturally ready for it — but the business-model audit found revenue is
**hard-wired to zero** (0/413 coupons carry an affiliate link) and **67% of
"go to store" buttons open a dead page** (`placeholder.invalid`). Monetization
wiring comes before the comparison layer; conveniently, the same `/go` redirect
infrastructure serves both.

---

## 1 · Structure audit — 70% ready

**Reusable as-is (zero new work):**
- `stores` (612 rows) is already a retailer registry; `affiliate_networks`
  table + `stores.affiliate_network_id/affiliate_params` exist in schema
- Hierarchical `categories`, `countries` (multi-currency), `clicks` tracking
  (coupon_id already nullable — add offer_id and it covers offers)
- The entire detail-page machine: SSG + ISR 300 + `dynamicParams=false`,
  parameterized Arabic templates with per-row editorial overrides,
  4-block JSON-LD stack, PageHero/Section shell, card + rail components,
  seo_overrides, /api/og, sitemap with per-row lastmod
- A product page is the **fifth instance of an existing pattern**, not new
  architecture. No IA rework needed.

**Genuinely new (the 30%):** the price data layer —
```
products        (slug, name_ar, brand, category_id→categories, gtin,
                 specs jsonb, editorial_intro_ar, status)
product_offers  (product_id, store_id→stores, price, currency→countries,
                 url, in_stock, last_checked_at)
price_history   (offer_id, price, captured_at)   -- append-only, cron-fed
clicks          ADD COLUMN offer_id uuid NULL
```
Routes: `/products` + `/products/[slug]` + curated `/compare/[a]-vs-[b]` +
`/go/offer/[id]`. Category hubs shared between both layers.

**Structural debt to fix first:**
1. Base DB schema is NOT in `supabase/migrations/` (repo starts at fix
   migrations) — snapshot it before adding product tables.
2. `getCouponsByCategory` (lib/queries/categories.ts:59-91) uses the unbounded
   `.in(ids)` pattern that already caused two URL>16KB incidents — product
   queries must be joined/RPC from day one.
3. `/deals` has no index page (dead parent segment).

**Cannibalization guard:** coupon pages stay canonical for "كود خصم X" intent;
product pages target "سعر X / أفضل X" intent. PDP coupon modules link to the
canonical `/coupons/[slug]`, never clone them.

---

## 2 · Business model audit — revenue is structurally $0

| Stream | Verdict | Evidence |
|---|---|---|
| Affiliate | **NOT WIRED** | 0/413 live coupons have an affiliate-patterned URL (full-DB regex sweep); `affiliate_networks` has 0 rows; 0/612 stores have `affiliate_network_id`; ArabClicks/Admitad/CJ API keys all empty in `.env.local` |
| Sponsored slots | NOT WIRED | `is_featured`/`is_exclusive` are real query-backed placements, but **0 coupons use either flag** — homepage featured queries return empty |
| Newsletter | NOT WIRED | table exists (0 rows); no capture form anywhere in src/ |
| Ads / payments | NOT WIRED | zero stripe/adsense references |

**Worse — the placeholder.invalid epidemic:** 277 of 413 coupons (67%) have
`destination_url = placeholder.invalid` (inherited from the couponava.com seed
scrape, which carried names/logos but no URLs). Most "اذهب للمتجر" clicks open
a dead page today. This burns the exact trust the model depends on.

**Same disease as SleepyHero:** code comments oversell ("so the affiliate
cookie lands and we get paid" — there is no affiliate cookie), and
`coupon-reveal-hero.tsx:84` uses `noreferrer` (stripping attribution) while
`coupon-card.tsx` carefully preserves it — an internal contradiction.

**Measurement gap:** reveals + raw clicks are trackable; conversions,
order values, and commissions are not — no subid leaves the site, no postback
endpoint, no revenue column in the admin dashboard. `NEXT_PUBLIC_GA_ID` empty.

**Unit economics (blended 5% commission, $65 KSA basket → $3.25/order):**
- Coupon-only: ~$0.034/visit → $1K/mo needs ~30,000 visits/mo against
  entrenched "كود خصم" incumbents
- **Hybrid: ~$0.11–0.14/visit → $1K/mo needs ~7,500–9,000 visits/mo** —
  3–4× less traffic, on less-contested long-tail ("سعر X في نون")
- Both formulas yield **$0 until links carry network deep links + subids**

**Cost structure:** ~$0–25/mo. Burn is not the problem; wiring is.

---

## 3 · The hybrid blueprint (5prijzen adapted to KSA)

**Positioning:** couponawy becomes the Arabic shopping decision engine:
**"قارن السعر، فعّل الكوبون — أفضل سعر حقيقي."**

**The killer number — effective price** (price − live coupon, per store):
Pricena can't show it (no coupons), Almowafir can't show it (no comparison).
The coupon is the LIVE element, which makes dated price snapshots honest —
no fake "live prices" claims needed (the SleepyHero P0 lesson inverted into
an advantage).

**Product page (12 sections, 5prijzen adapted):**
1. Buy-box hero (best effective price, coupon-first CTA)
2. **Coupon module — promoted to slot #2, the differentiator** (reuses
   coupon-reveal-hero + trust-signals untouched)
3. Price snapshot table: store · price · shipping · "شوهد بتاريخ" · coupon ·
   **effective price**, best highlighted
4. "متى تشتري؟" seasonal timing (price chart only after ≥3 real snapshots)
5. Arabic editorial review (the EEAT moat — flagship-article spine)
6. Rating + methodology link · 7. Specs · 8. Tool tie-in (ported calculator
   per product type) · 9. Versus links · 10. "جيد أن تعرف" (KSA customs,
   returns, SFDA caveats) · 11. Buyer reviews (phase 2) · 12. Related rails

**Data strategy (no feeds — honesty IS the product):**
- Append-only `price_snapshots`; history accrues forward, never retro-authored
- Weekly cadence per product-store pair (Wave 1 ≈ 28 pairs ≈ 45 min/wk);
  manual-assisted first, then crawl4ai/Scrapling script
- Every price labeled "شوهد بتاريخ X"; >21 days old degrades to a
  "تحقق من السعر" link; effective price always labeled "بعد الكوبون"
- Retailer order: **noon first** (ArabClicks ~10%, code attribution) →
  Amazon.sa (needs in-country bank — GarnLoop is US, flag before relying) →
  IKEA (no program; include for value, BD outreach) → local sleep D2C
  (Sleep High / Deep Sleep / BedBoss — direct-deal targets)

**Pilot — sleep vertical (fills the "no independent Arabic sleep reviewer" gap):**
- **Wave 1 (~2 weeks):** `/sleep` hub + 8 PDPs (5 mattresses, 2 pillows,
  1 white-noise) + mattresses category hub + 1 versus + Arabic methodology
  page + 2 SleepyHero calculators ported (sleep-cycle, caffeine-cutoff).
  **Hard rule: no PDP indexes without a real ≥800-word Arabic review.**
- **Wave 2 (wk 3–5):** +8–10 products, pillows hub, first price charts
- **Wave 3 (wk 6–8):** 20–25 products, White Friday tie-in. Displaces
  roadmap Sprint 6 #39 + part of Sprint 7 — not stacked on top.

**Metrics (90-day):** ≥70% indexed by day 45; PDP→reveal CTR 8–12%; first
confirmed commission by day 90; refresh ≤2h/wk.
**Kill:** <30% indexed, or flat impressions 8 wks, or CTR <2% → keep hub as
guides+coupons, drop the snapshot table.

**Risks (top 3):** maintenance math (100 checks/wk at full pilot — cap
stores/product, 21-day degrade), thin content (the no-review-no-index rule),
stale-price trust bleed onto the coupon brand (honesty labels non-negotiable).

---

## 4 · Execution order — activation before expansion

The SleepyHero audit's #1 pattern risk ("five streams built, zero wired —
don't let the comparison layer meet the same fate") applies verbatim here.

| Wave | Scope | Type | Effort |
|---|---|---|---|
| 0 | **Founder:** ArabClicks + Admitad signups; decide Vercel Pro | accounts | days (approval wait) |
| 1 | **Fix the 277 dead links** (backfill destination_url from stores.website_url as stopgap); set GA_ID; flag 8–10 featured coupons | code+data | 1 day |
| 2 | **`/go/[clickId]` server redirect layer**: logs click, mints click-id as network subid, 302s to deep link; kills the noreferrer contradiction; populate affiliate_networks + store mappings for ArabClicks-covered stores (noon, SHEIN, Namshi, Temu, AliExpress) | code | 2–3 days |
| 3 | **Conversion loop**: nightly cron pulling network conversion reports keyed on subid → `conversions` table → revenue cards on /admin/dashboard | code | 2 days |
| 4 | Base-schema snapshot migration + product tables + `/products/[slug]` PDP template (reusing the detail-page machine) | code | 3–4 days |
| 5 | **Hybrid Wave 1: sleep vertical** (8 PDPs + hub + methodology + 2 calculators) | content+code | ~2 weeks |
| 6 | Waves 2–3 per blueprint; newsletter capture block; BD track (Keeta/NiceOne direct deals + local D2C) | rolling | — |

*Compiled from three parallel audit agents, 2026-07-03. Not committed to git —
owner to review first.*
