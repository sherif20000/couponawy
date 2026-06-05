# Couponawy Flagship Roadmap

> Single source of truth for turning couponawy from "functional" to "flagship".
> Derived from a 7-agent audit (content depth, detail pages, typography) + competitive
> intelligence on 17 KSA/GCC platforms. Generated 2026-05-26.

## How to use this roadmap

- Sprints run **top-to-bottom** — each one's outcome unblocks the next. Dependencies are noted.
- Each sprint has a **single measurable outcome** ("done" is unambiguous).
- Check off PRs as they merge. Update the **Status** column in the tracker.
- The **Business Development track** runs in parallel and is user-led (not code) — work it alongside any sprint.
- Effort estimates assume one focused implementation agent per PR.

**Status legend:** `TODO` · `WIP` · `DONE` · `BLOCKED`

---

## Master tracker

| Sprint | Theme                                | PRs     | Effort    | Status                           |
| ------ | ------------------------------------ | ------- | --------- | -------------------------------- |
| 0      | Foundation fixes                     | #25–#27 | 1 day     | DONE (PR #25, merged 2026-05-26) |
| 1      | Coupon page resurrection             | #26     | 3–4 days  | DONE (PR #26, merged 2026-05-28) |
| 2      | Shared content components            | #27     | 4–5 days  | DONE (PR #27, merged 2026-05-28) |
| 3      | Typography system                    | #28     | 2 days    | DONE (PR #28, merged 2026-05-28) |
| 4      | Homepage prominence reorder          | #33     | 1–2 days  | TODO                             |
| 5      | Schema & rich results                | #34–#36 | 4–5 days  | TODO                             |
| 6      | Flagship content                     | #37–#39 | 1–2 weeks | TODO                             |
| 7      | Sub-vertical hubs                    | #40–#42 | 1 week    | TODO                             |
| 8      | Store-page enrichment (17 platforms) | #43+    | rolling   | TODO                             |
| BD     | Affiliate / partnership track        | —       | ongoing   | TODO                             |

---

## Sprint 0 — Foundation Fixes

**Goal:** Fix the silent infrastructure bugs everything else compounds on.
**Outcome:** Every JSON-LD validates with a working `image`, Cairo renders crisply at all weights, and 100% of stores have a logo.
**Dependencies:** none — ship first.

| PR  | Task                                                                                                          | What "done" looks like                                                             |
| --- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| #25 | Load Cairo weights `300` + `500` in `next/font` (`src/app/layout.tsx`)                                        | `font-medium` (126 uses) renders real 500, not faux-interpolated. No layout shift. |
| #26 | Backfill `featured_image_url` on all 12 article/guide DB rows + add `image` to the 2 tool-page JSON-LD blocks | Rich Results Test shows a valid `image` on every article, guide, and tool page.    |
| #27 | Re-run Brandfetch logo sweep for the 166 stores missing `logo_url`                                            | Store grid shows brand logos, not initial-letter fallbacks, for >95% of stores.    |

**Why first:** the `featured_image_url` NULL bug breaks `Article` schema `image` site-wide (an SEO penalty Google has been logging silently). The Cairo 500 fix is one line and lifts legibility everywhere. Both are prerequisites for the typography + content sprints.

---

## Sprint 1 — Coupon Page Resurrection

**Goal:** Fix the single worst structural problem in the audit.
**Outcome:** All **415 active coupon pages** jump from ~40 words (D-grade) to 1,000+ words (B-grade) — **with zero content writing.**
**Dependencies:** Sprint 0 (#26 image fields).

| PR  | Task                                                                                                                                                      | What "done" looks like                                                                                                                                                                                                                                                                |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #26 | Build `src/lib/content/coupon-templates.ts` mirroring the proven `store-templates.ts` pattern; add `<CouponLongCopy>`; mount in `coupons/[slug]/page.tsx` | ✅ Every coupon page renders ~1,000+ words of parameterized Arabic copy (about-offer, how-to-redeem, terms/eligibility, 8-Q FAQ) keyed off `{store_name, discount_type, discount_value, expires_at, code, min_order}`. Build green: all 415 `/coupons/[slug]` pages prerender as SSG. |

**Shipped (PR #26, merged 2026-05-28):** templated about-offer / redeem-steps / terms / savings-tactics / FAQ blocks, wording adapts per discount mechanic (percentage/fixed/free-shipping/bogo) to dodge duplicate-content flags. FAQPage JSON-LD emitted in sync with rendered questions. Reused the generic `StoreFaq` renderer instead of building a separate `CouponFaq` (it was already store-agnostic — DRYer). Admin `description_ar` overrides the about-block when present.

**Why this was the keystone sprint:** the store template already proves this pattern works (it generates ~1,200 words/page across 612 stores). Replicating it for coupons was the highest impact-to-effort move in the entire roadmap — it upgraded 415 live pages overnight without a single word of hand-written content or a DB migration.

---

## Sprint 2 — Shared Content Components

**Goal:** Make every long-form page interlink and convert.
**Outcome:** TOC, related-coupons, related-stores, and store-category chips render across blog, guides, tools, and detail pages. Internal-link equity stops dead-ending; the affiliate loop closes on editorial content.
**Dependencies:** Sprint 1 (coupon templates exist to link to).

| PR  | Task                                                                                                         | What "done" looks like                                                                                                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #27 | `<ArticleToc>` — auto-built from `##`/`###` headings, sticky desktop / collapsible mobile                    | ✅ Renders on `blog/[slug]`, `guides/[slug]`, both calculator pages. Dependency-free `extractToc()` + positional ID matching in `PostBody`; verified every TOC href resolves to a real heading id.    |
| #27 | `<RelatedCoupons>` + `<RelatedStores>` widgets (new `getRelatedStores` query in `lib/queries/detail.ts`)     | ✅ Guides (category-relevant, featured fallback) + both tools show a related-coupons rail; store + coupon pages show a related-stores rail (same category/country, capped id-list, country fallback). |
| #27 | `<TopCategoriesForStore>` chips in store hero (new `getTopCategoriesForStore` query over `store_categories`) | ✅ Store hero surfaces up to 4 category pills (white-on-red, ordered by display_order); doubles category interlinking per page.                                                                       |

**Shipped (PR #27, merged 2026-05-28):** all three components landed in one PR. TOC is zero-JS (server `<details>` + sticky `<nav>`); slugs keep Arabic letters + Arabic-Indic digits and dedupe like GitHub. Reused the existing `CouponCard` / `StoreCard` for the rails. Build green; tools pages stay static (cookie-free `getFeaturedCoupons`).

---

## Sprint 3 — Typography System

**Goal:** Replace generic Cairo usage with a purpose-built, decisive hierarchy.
**Outcome:** Headlines, numbers, decks, and eyebrows each have a dedicated token; the coupon-card "flat band" is fixed so the discount is the visual hero; Cairo OpenType features are on.
**Dependencies:** Sprint 0 (#25 weights loaded).

| PR  | Task                                                                                                                                                                                                                                                                                                                                                                   | What "done" looks like                                                                                                                                                                     |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| #28 | Tailwind v4 `@utility` classes (`text-headline-xl/lg/md/sm`, `text-numeric-xl/md`, `text-deck`, `text-body-default`, `text-eyebrow`); `liga` on headlines + `tnum`/`lnum` on numbers; the 8 highest-leverage swaps (homepage hero + stats, coupon-card discount badge, page-hero h1 + subtitle, post-body h2/h3, footer labels); remove `tracking-*` on Arabic strings | ✅ Discount % uses tabular numerals (no jitter across grid); page heroes use one token instead of ad-hoc inline clamp; no letter-spacing on Arabic (incl. removing page-hero's `-0.02em`). |

**Shipped (PR #28, merged 2026-05-28):** token utilities verified in build output (headline on guide h2/h3, numeric-xl on 176 pages, deck on 48, eyebrow in footer). Key cascade fix: moved base `h1–h6` rule into `@layer base` so token utilities win line-height/features (unlayered-beats-layered trap). `ss01` omitted (Cairo has no stylistic sets — silent no-op). Latin coupon-code displays keep `tracking-wider` (aids code legibility); only Arabic strings were de-tracked. Coupon-card title left at its compact size to avoid grid reflow — the discount badge + 3-tier hierarchy already reads clearly.

---

## Sprint 4 — Homepage Prominence Reorder

**Goal:** Make the homepage reflect the commercial reality from the 17-platform research.
**Outcome:** Hero, featured grid, and carousel match the composite ranking; "Rising / صاعد" badges live; sub-vertical hub links surfaced.
**Dependencies:** Sprints 1–3 (cards + typography look flagship first). The 17 platforms must exist as stores in the DB.

**Recommended layout (from research synthesis):**

- **Hero carousel (4):** Noon · iHerb · Nahdi · Jarir
- **Featured grid (6):** Amazon.sa · Sephora · Shein · HungerStation · Jahez · Temu
- **Carousel w/ "صاعد" badges (4):** Keeta · NiceOne · IKEA · AliExpress
- **Sub-vertical hub links:** `/coupons/pharmacy` · `/coupons/quick-commerce` · `/coupons/home-improvement` · `/coupons/bank-cards`

| PR  | Task                                                                                                                                        | What "done" looks like                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| #33 | Reorder homepage store prominence to the composite ranking; add a `is_rising` flag + badge component; surface sub-vertical hub entry points | Homepage hero shows the top-4 composite platforms; rising badges render on Keeta/NiceOne; hub links visible. |

---

## Sprint 5 — Schema & Rich Results

**Goal:** Win SERP features the content now qualifies for.
**Outcome:** `FAQPage` rich results across all content; coupon schema expands 2 → 5 blocks; callouts add visual rhythm.
**Dependencies:** Sprint 1 (coupon FAQ exists), Sprint 2 (content components).

| PR  | Task                                                                                                                          | What "done" looks like                                                                       |
| --- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| #34 | `FAQPage` JSON-LD emitter — fires when a body contains `## الأسئلة الشائعة` + Q/A pairs                                       | Articles, guides, tools, and coupon pages emit valid `FAQPage`; Rich Results Test passes.    |
| #35 | Expand coupon schema: `Offer` + `Article` wrapper + `Product` + `Review`/`AggregateRating` + `priceCurrency` + `availability` | Coupon pages emit 5 schema blocks vs 2 today.                                                |
| #36 | Markdown callout extension (`> [!note]` / `> [!tip]`) in `PostBody`                                                           | Long-form content renders styled callouts; visual rhythm no longer relies on headings alone. |

---

## Sprint 6 — Flagship Content

**Goal:** Bring the worst content up to flagship and build the seasonal engine.
**Outcome:** 8 blog articles rewritten to 3,000+ words; a `seasonal_events` content type powers event landing pages; a pharmacy price-comparison tool ships.
**Dependencies:** Sprints 2–5 (components, typography, schema all in place).

| PR  | Task                                                                                                                                                                                                                                                                                                                                                              | What "done" looks like                                                                          |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| #37 | Rewrite 8 P0 articles to 3,000+ words each, each with ≥3 images, ≥5 internal links, a comparison table, and an FAQ section. Priority order: `iherb-beginners-guide`, `amazon-savings-2026`, `noon-vs-namshi-vs-shein-clothes`, `best-laptop-2026`, `complete-flight-saving-guide` (merge/redirect into the traveler guide to kill cannibalization), then the rest | All 8 articles score flagship (80+) on the audit rubric.                                        |
| #38 | `seasonal_events` content type + `Event` JSON-LD; pre-build Yellow Friday / White Friday / Prime Day / 11.11 / Ramadan / National Day / Back-to-School pages                                                                                                                                                                                                      | Each major event has a landing page buildable 6 weeks ahead, with platform-specific code feeds. |
| #39 | `/tools/price-comparison` — skincare/supplement price widget across Nahdi · Al-Dawaa · iHerb · Amazon · NiceOne                                                                                                                                                                                                                                                   | Users compare an SKU's price across 5 pharmacy/beauty channels; converts pharmacy deal-seekers. |

---

## Sprint 7 — Sub-Vertical Hubs

**Goal:** Capture vertical-specific organic intent the flat catalog misses.
**Outcome:** Pharmacy, bank-card, and cross-border-customs hubs live and indexed.
**Dependencies:** Sprint 6 (#38 seasonal events, #39 price tool feed the hubs).

| PR  | Task                                                                                                                                                                                                | What "done" looks like                                                                 |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| #40 | `/coupons/pharmacy` hub — Nahdi + Al-Dawaa + Whites + Innova + Lemon + United, with Nuhdeek + Arbahi loyalty explainers. Copy must state "لا يشمل الأدوية الموصوفة" (SFDA: Rx excluded from promos) | Hub ranks for "كوبون صيدليات"; loyalty explainers published.                           |
| #41 | `/coupons/bank-cards/{bank}` taxonomy — Al Rajhi / SNB / Riyad / ANB / BSF × Amazon.sa (and others)                                                                                                 | Owns the Amazon.sa bank-card coupon long-tail ("خصم الراجحي أمازون").                  |
| #42 | Cross-border customs evergreen pillar — one guide serving AliExpress + iHerb + Temu shoppers, with platform-specific append sections                                                                | Ranks for "جمارك علي اكسبريس" / "هل ايهيرب يخلص جمارك"; linked from all 3 store pages. |

---

## Sprint 8 — Store-Page Enrichment (17 platforms)

**Goal:** Give each top platform a flagship store page from the research templates.
**Outcome:** All 17 ranked platforms have a 1,500+ word store page with hero claim, trust strip, 8 category chips, 5 long-copy sections, expanded schema, and sister-store links.
**Dependencies:** Sprints 1–5 (template + schema + typography infra). Roll out in ranking order.

**Rollout order (composite rank):**

1. **Batch A (Heroes):** Noon · iHerb · Nahdi · Jarir
2. **Batch B (Featured):** Amazon.sa · Sephora · Shein · HungerStation · Jahez · Temu
3. **Batch C (Rising/Carousel):** NiceOne · IKEA · Keeta · AliExpress
4. **Batch D (Sub-vertical):** Al-Dawaa · Ana Ninja · Abyat

| PR   | Task                                                                                                                                                                          | What "done" looks like                                                                                                                                                         |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| #43+ | Per-platform store-page upgrade using its research template (hero, trust strip, category chips, long copy, schema additions, sister links). One PR per batch or per platform. | Each store page hits 1,500+ words + platform-specific schema (e.g. `Pharmacy`+`LoyaltyProgram` for Nahdi, `Restaurant` aggregator for Jahez/Keeta, `FurnitureStore` for IKEA). |

**Per-platform schema additions (from research):**

- **Nahdi / Al-Dawaa:** `Pharmacy` + `LoyaltyProgram` (Nuhdeek / Arbahi)
- **Jahez / Keeta / HungerStation:** `Restaurant`/`FoodEstablishment` aggregator
- **Ana Ninja:** `OnlineGroceryStore` + `LocalBusiness`
- **IKEA / Jarir / Abyat:** `FurnitureStore`/`Store`/`HardwareStore` + `address` array for branches
- **Sephora / NiceOne:** `Brand` (curated brand list) + `LoyaltyProgram` (Beauty Pass)
- **iHerb:** `Product` (top SKUs) + `Brand` (top brands) + `Review` aggregation

---

## Business Development track (parallel, user-led)

Not code — these are partnership actions only Sherif can take. Work alongside any sprint.

| Action                                | Targets                                                                    | Why                                                                                                                                                                               |
| ------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Direct affiliate/partnership outreach | Keeta · Ana Ninja · Jahez · NiceOne · HungerStation · IKEA · Abyat · Jarir | 8 of 17 platforms have **no public affiliate program** — direct BD is the only path. Keeta + NiceOne are first-mover opportunities (both pre-formalization, both want awareness). |
| Apply to **#SephoraSquadME**          | Sephora ME                                                                 | Only formal route into Sephora KSA affiliate economics.                                                                                                                           |
| Join networks                         | Admitad MENA · ArabClicks · DCMnetwork · Amazon Associates                 | Dual-network coverage unlocks the full voucher-feed + deeplink inventory for Noon, Shein, Temu, AliExpress, iHerb.                                                                |
| Set up app-deeplink CTAs              | HungerStation · NiceOne · Keeta · Ninja · AliExpress · Temu · Shein        | 75–95% app-first audiences — web-only CTAs leak conversion. Use Branch.io / AppsFlyer OneLink with coupon pre-applied.                                                            |

---

## Sequencing rationale

- **Sprint 0 before everything** — schema/font fixes compound under every later sprint.
- **Sprint 1 is the keystone** — biggest impact-to-effort ratio; ship it before content rewrites.
- **Sprints 2–3 build the reusable infra** (components + tokens) the rest depends on.
- **Sprint 4 (homepage) waits for 1–3** so reordered cards already look flagship.
- **Sprints 5–8 are content/SEO depth** — sequence as capacity allows; 6 and 7 can overlap.
- **BD track is independent** — start outreach now; it has the longest lead time.

---

## Source

Every recommendation traces to the 2026-05-26 multi-agent audit:

- **Content depth audit** (articles/guides/tools) — 0/15 flagship, articles in gap tier, `featured_image_url` NULL bug
- **Detail-page audit** (stores/coupons) — stores B+, coupons D, `coupon-templates.ts` is the keystone fix
- **Typography audit** — Cairo 500 not loaded, flat-band coupon card, token system proposal
- **Competitive intelligence** — 17 platforms (Noon, iHerb, Nahdi, Jarir, Amazon, Sephora, Shein, HungerStation, Jahez, Temu, NiceOne, IKEA, Keeta, AliExpress, Al-Dawaa, Ana Ninja, Abyat) with composite homepage ranking + store-page templates
