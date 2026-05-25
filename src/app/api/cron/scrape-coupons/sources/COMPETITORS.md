# Arabic Coupon Aggregator Landscape — Source Selection Notes

Audit performed 2026-05 for Sprint 2 D2 to populate the multi-source scraper.
This file documents what was evaluated and why each was kept or rejected, so
future maintainers don't waste hours re-investigating dead ends.

## Active sources (in `index.ts`)

| Source                          | URL pattern                                         | Region focus | Why kept |
|---------------------------------|------------------------------------------------------|--------------|----------|
| `couponava.com`                 | `/store/{slug}/`                                    | Pan-Arab     | Server-rendered, clean DOM, 11 codes/noon |
| `sa.arabiccoupon.com`           | `/ar/offers/{slug}`                                 | KSA          | Server-rendered, `data-offer-code` attrs |
| `saudi.alcoupon.com`            | `/ar/discount-codes/{slug}`                         | KSA          | Server-rendered, 12 codes/noon |
| `codekhasem.com`                | `/ar-sa/coupons/{slug}`                             | KSA          | Same template as alcoupon — parser reused |

## Rejected (and why)

| Source              | Status          | Why rejected |
|---------------------|-----------------|--------------|
| `almowafir.com`     | 200, but JS-rendered | React SPA — would need Playwright/headless browser (back to paid territory) |
| `couponskw.com`     | 200             | Odoo e-commerce, not a coupon aggregator. No tiles. |
| `arabcoupon.com`    | 200             | Uses numeric store IDs in URLs (e.g. `/ar/offers/49/1`) — would need a name→ID lookup we don't have |
| `coupoonat.com`     | 200             | Codes live only in `__NEXT_DATA__` SEO metadata, no real tile listing |
| `otlobcoupon.com`   | 200, codes via JSON-LD | Egypt-focused (EGP currency, Egypt region) — wrong audience for KSA |
| `couponzil.com`     | 200, JS app     | Client-rendered (`id="__next"`), codes hydrated at runtime |
| `almotasuq.com`     | 200             | Mostly English content, ~1 Arabic hit per page — different niche |
| `sahseh.co`         | 200             | Low Arabic content density, ~7 hits — likely JS-hydrated later |
| `clicflyer.com`     | 200             | Daily-flyer focus, not coupon-tile format — only 48 Arabic hits |
| `qyubic.com`        | 404 on store paths | URLs not findable via standard slug patterns |
| `everysavingksa.com`| 403 Forbidden   | Bot-blocked from CDN edge |
| `codesarabia.com`   | 200 root, 404 store paths | Store-page URL pattern not predictable |
| `cobone.com`        | 403 Forbidden   | Bot-blocked |
| `couponaat.com`     | 406 Not Acceptable | Requires specific Accept headers we'd need to fake |
| `savioplus.com`     | 200, but `ar:0` | Likely English-only despite KSA presence |
| `gulfcoupon.com`    | 200 (empty 114B) | Site appears defunct |
| `boxofcoupons.com`  | 200 (empty 1KB) | Site appears defunct |

## Future candidates worth re-evaluating

- **almowafir.com** — if we ever add a headless-browser path (Playwright on a
  separate worker, not in the Vercel cron), this is the biggest KSA aggregator
  we're missing. ~302 Arabic mentions per noon page once hydrated.
- **ArabClicks API** — Sprint 7 will plug their publisher API in as just
  another `CouponSource`. Returns coupons + correct affiliate URLs + commission
  data in one call. Beats scraping when available.
- **Store-official `/promo` pages** — many brands list their own codes
  (noon, namshi, ounass). Highest-trust source but needs one adapter per brand.

## How to add a new source

1. Create `sources/<name>.ts` exporting a `CouponSource` (see `./types.ts`)
2. Identify the tile container CSS selector by `curl`-fetching one page and
   inspecting the markup
3. Add the import to `sources/index.ts` and push the source into `SOURCES`
4. Smoke-test by running the cron route locally with `CRON_SECRET` set
5. Update this file with the new entry under "Active sources"
