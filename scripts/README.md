# Scripts

Offline/local maintenance scripts for the Couponawy project.

---

## `scrape_coupons.py` — Coupon scraper (crawl4ai, zero API keys)

Pulls coupon codes from [couponava.com](https://couponava.com) for every active
store in Supabase and upserts them into the `coupons` table.

> **No scraping API key needed.** This replaces the previous Firecrawl-based
> scraper and uses [crawl4ai](https://github.com/unclecode/crawl4ai) with
> CSS-selector extraction — no LLM, no paid API, no third-party keys of any
> kind.

### Prerequisites

- **Python 3.10 or later**
- Chromium installed via Playwright (one-time setup; see below)

### Setup

```bash
# 1. Install Python dependencies
pip install -r scripts/requirements.txt

# 2. Install Playwright's Chromium browser (one-time)
crawl4ai-setup
```

### Environment variables

Add the following to `.env.local` in the project root:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

Both variables are **required** — the script will exit with a clear error if
either is missing.  
**No scraping API key is needed anymore** — that is the whole point of this
migration away from Firecrawl.

### Running

```bash
python scripts/scrape_coupons.py
```

The script:

1. Fetches all active stores from Supabase.
2. Skips stores that already have at least one coupon.
3. For each remaining store, opens `couponava.com/store/{slug}/` in a headless
   Chromium browser and extracts coupon data via CSS selectors.
4. Parses discount text, filters codes (2–30 chars), slugifies, and upserts
   into `coupons` with `onConflict: slug, ignoreDuplicates: true`.
5. Applies a ~1.5 s delay between stores.
6. Prints a running progress log and a final summary.

> ⚠️ **Offline / local use only.** This script launches a full headless
> browser (Playwright + Chromium via crawl4ai) and uses the Supabase
> **service-role key** (which bypasses RLS). It is intentionally an offline
> maintenance tool — **never deploy it to Vercel or any serverless runtime.**

### ⚠️ CSS selectors must be verified before first use

The CSS selectors in `scrape_coupons.py` are best-guess values based on
typical coupon-site markup. Because couponava.com's DOM layout cannot be
inspected programmatically from here, **a human must verify and tune them
against the live page** before running for the first time:

1. Open `https://couponava.com/store/<any-slug>/` in your browser.
2. Right-click a coupon card → **Inspect**.
3. Identify the repeating container, code, title, and discount elements.
4. Update the constants near the top of `scrape_coupons.py`:
   - `BASE_SELECTOR`
   - `CODE_SELECTOR`
   - `TITLE_SELECTOR`
   - `DISCOUNT_SELECTOR`

If the selectors are wrong, the script will log `no coupons found, skipping`
for every store and skip gracefully — nothing will be inserted or broken.

---

## Other scripts

| File | Description |
|---|---|
| `seed-articles.mjs` | Seeds article content into Supabase |
| `seed-guides.mjs` | Seeds guide content into Supabase |
| `generate-logo-png.mjs` | Converts SVG logo to PNG |
