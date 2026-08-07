"""
Coupon scraper — pulls coupons from couponava.com for every active store
and inserts them into the Supabase coupons table.

NOTE: This script runs a real headless browser via Playwright (through crawl4ai).
It is an OFFLINE/LOCAL maintenance script — do NOT deploy to Vercel or any
serverless runtime. Run it on your local machine or a dedicated server.

Run:
    python scripts/scrape_coupons.py

Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
No scraping API keys are required — crawl4ai uses CSS-selector extraction only.
"""

import asyncio
import json
import os
import re
from pathlib import Path

from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode
from crawl4ai.extraction_strategy import JsonCssExtractionStrategy
from supabase import create_client, Client

# ─── CSS Extraction Schema ────────────────────────────────────────────────────
#
# ⚠️  VERIFY THESE SELECTORS AGAINST couponava.com ⚠️
#
# These are best-guess selectors based on typical coupon-site markup patterns.
# Before running for the first time:
#   1. Open https://couponava.com/store/<any-slug>/ in your browser.
#   2. Right-click a coupon card → Inspect.
#   3. Find the repeating container element and adjust BASE_SELECTOR.
#   4. Find the code, title, and discount text elements and adjust the
#      CODE_SELECTOR, TITLE_SELECTOR, and DISCOUNT_SELECTOR field selectors.
#
# The script fails gracefully (logs + skips) when zero coupons are extracted,
# so a wrong selector means "store skipped" rather than a crash.
#
BASE_SELECTOR = ".coupon-card, .coupon-item, article.coupon, .deal-card"
CODE_SELECTOR = ".coupon-code, .code, [class*='coupon-code'], [data-code]"
TITLE_SELECTOR = ".coupon-title, .title, h3, h2, [class*='coupon-title']"
DISCOUNT_SELECTOR = ".discount, .discount-value, .badge, [class*='discount']"

EXTRACTION_SCHEMA = {
    "name": "Coupons",
    "baseSelector": BASE_SELECTOR,
    "fields": [
        {
            "name": "code",
            "selector": CODE_SELECTOR,
            "type": "text",
        },
        {
            "name": "title_ar",
            "selector": TITLE_SELECTOR,
            "type": "text",
        },
        {
            "name": "discount_display",
            "selector": DISCOUNT_SELECTOR,
            "type": "text",
        },
    ],
}

# ─── Load env from .env.local ─────────────────────────────────────────────────


def load_env() -> None:
    """Parse .env.local and inject variables into os.environ (mirrors the JS loadEnv)."""
    env_path = Path(os.getcwd()) / ".env.local"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, rest = line.partition("=")
        key = key.strip()
        value = rest.strip()
        # Strip a single pair of matching surrounding quotes, if present.
        if len(value) >= 2 and value[0] == value[-1] and value[0] in ("\"", "'"):
            value = value[1:-1]
        if key:
            os.environ.setdefault(key, value)


load_env()

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_URL:
    raise SystemExit(
        "ERROR: NEXT_PUBLIC_SUPABASE_URL is missing. "
        "Add it to .env.local before running this script."
    )
if not SUPABASE_SERVICE_KEY:
    raise SystemExit(
        "ERROR: SUPABASE_SERVICE_ROLE_KEY is missing. "
        "Add it to .env.local before running this script."
    )

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# ─── Discount parser ──────────────────────────────────────────────────────────


def parse_discount(display: str | None) -> tuple[str, float | None]:
    """
    Parse Arabic discount text into (type, value).

    Rules (ported faithfully from the original JS):
      - '10%' → ('percentage', 10.0)
      - '50 ر.س' / '50رس' → ('fixed', 50.0)
      - contains 'مجاني' or 'مجانا' → ('free_shipping', None)
      - else → ('other', None)
    """
    if not display:
        return ("other", None)

    percent_match = re.search(r"(\d+(?:\.\d+)?)%", display)
    if percent_match:
        return ("percentage", float(percent_match.group(1)))

    riyal_match = re.search(r"(\d+(?:\.\d+)?)\s*ر\.?س", display)
    if riyal_match:
        return ("fixed", float(riyal_match.group(1)))

    if "مجاني" in display or "مجانا" in display:
        return ("free_shipping", None)

    return ("other", None)


# ─── Slugify ──────────────────────────────────────────────────────────────────


def slugify(text: str) -> str:
    """
    Convert text to a URL-safe slug (ported faithfully from the original JS):
      - lowercase
      - replace whitespace runs with '-'
      - strip everything except ASCII [a-zA-Z0-9_], Arabic range U+0600–U+06FF,
        and '-'  (ASCII set chosen to match the JS \\w byte-for-byte; Python's
        \\w is Unicode-aware and would otherwise keep extra letters)
      - truncate to 100 chars
    """
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r"\s+", "-", text)
    text = re.sub(r"[^a-zA-Z0-9_\u0600-\u06FF-]", "", text)
    return text[:100]


# ─── Scraper ──────────────────────────────────────────────────────────────────


async def scrape_coupons(crawler: AsyncWebCrawler, slug: str) -> list[dict]:
    """
    Scrape couponava.com/store/{slug}/ using crawl4ai's JsonCssExtractionStrategy.
    Returns a list of raw coupon dicts (code, title_ar, discount_display).
    Returns an empty list when the page yields no structured results.
    """
    url = f"https://couponava.com/store/{slug}/"
    config = CrawlerRunConfig(
        extraction_strategy=JsonCssExtractionStrategy(EXTRACTION_SCHEMA),
        cache_mode=CacheMode.BYPASS,
        delay_before_return_html=2.0,  # let JS-rendered content settle
    )

    result = await crawler.arun(url=url, config=config)

    if not result.success or not result.extracted_content:
        return []

    try:
        coupons = json.loads(result.extracted_content)
    except (json.JSONDecodeError, TypeError):
        return []

    if not isinstance(coupons, list):
        return []

    return coupons


# ─── Main ─────────────────────────────────────────────────────────────────────


async def main() -> None:
    print("Fetching active stores from Supabase...")

    stores_resp = (
        supabase.table("stores")
        .select("id, slug, name_ar, website_url")
        .eq("status", "active")
        .order("slug")
        .execute()
    )
    stores = stores_resp.data or []
    print(f"Found {len(stores)} active stores.\n")

    # Get stores that already have coupons so we can skip them
    existing_resp = supabase.table("coupons").select("store_id").execute()
    already_scraped: set[str] = {
        row["store_id"] for row in (existing_resp.data or [])
    }
    to_scrape = [s for s in stores if s["id"] not in already_scraped]

    print(
        f"{len(already_scraped)} stores already have coupons, "
        f"scraping {len(to_scrape)} remaining.\n"
    )

    inserted = 0
    skipped = 0
    failed = 0

    # Launch ONE headless browser for the whole run (not one per store).
    async with AsyncWebCrawler(verbose=False) as crawler:
        for i, store in enumerate(to_scrape):
            progress = f"[{i + 1}/{len(to_scrape)}]"

            try:
                raw_coupons = await scrape_coupons(crawler, store["slug"])

                if not raw_coupons:
                    print(f"{progress} {store['slug']} — no coupons found, skipping")
                    skipped += 1
                else:
                    coupons_to_insert = []
                    for c in raw_coupons:
                        code = (c.get("code") or "").strip()
                        if not code or not (2 <= len(code) <= 30):
                            continue
                        discount_type, discount_value = parse_discount(
                            c.get("discount_display")
                        )
                        coupons_to_insert.append(
                            {
                                "store_id": store["id"],
                                "code": code.upper(),
                                "title_ar": c.get("title_ar") or f"كوبون خصم {store['name_ar']}",
                                "discount_display": c.get("discount_display") or None,
                                "discount_type": discount_type,
                                "discount_value": discount_value,
                                "destination_url": store["website_url"],
                                "status": "active",
                                "slug": slugify(f"{store['slug']}-{code}"),
                            }
                        )

                    if not coupons_to_insert:
                        print(
                            f"{progress} {store['slug']} — codes extracted but all filtered out"
                        )
                        skipped += 1
                    else:
                        supabase.table("coupons").upsert(
                            coupons_to_insert,
                            on_conflict="slug",
                            ignore_duplicates=True,
                        ).execute()
                        # supabase-py raises on error; if we get here it succeeded
                        print(
                            f"{progress} {store['slug']} — inserted {len(coupons_to_insert)} coupons"
                        )
                        inserted += len(coupons_to_insert)

            except Exception as err:
                print(f"{progress} {store['slug']} — scrape error: {err}")
                failed += 1

            # Rate limit: ~1.5s between store requests to be respectful
            if i < len(to_scrape) - 1:
                await asyncio.sleep(1.5)

    print("\n─────────────────────────────────")
    print("Done.")
    print(f"  Coupons inserted : {inserted}")
    print(f"  Stores skipped   : {skipped}")
    print(f"  Errors           : {failed}")


if __name__ == "__main__":
    asyncio.run(main())
