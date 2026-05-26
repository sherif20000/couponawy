/**
 * Centralized site base URL.
 *
 * Reads from NEXT_PUBLIC_SITE_URL env var, with a hard-coded production
 * fallback. Critically sanitizes the value:
 *
 *   - .trim()                — strips leading/trailing whitespace
 *   - .replace(/\/+$/, "")   — strips trailing slashes
 *
 * Why this sanitization matters: this codebase had a real production bug
 * where the Vercel env var had a literal "\n" at the end (copy-paste from
 * the dashboard). The unsanitized value flowed into:
 *
 *   - robots.txt → `Sitemap: https://couponawy.com\n/sitemap.xml`
 *     → crawlers couldn't find the sitemap (line break broke the URL)
 *   - sitemap.xml → every <loc> tag had a trailing newline → invalid XML
 *   - JSON-LD Offer/Store/Breadcrumb URLs → broken canonicals
 *   - OG card image URLs → broken social previews
 *   - Canonical <link rel="canonical"> → SEO duplicate signals
 *
 * 15+ files were calling process.env.NEXT_PUBLIC_SITE_URL directly with
 * the same `?? "https://couponawy.com"` fallback. This single helper
 * replaces that pattern so the sanitization runs in exactly one place.
 *
 * Trailing-slash strip is defensive: if someone sets the env to
 * "https://couponawy.com/" we want every `${BASE_URL}/path` to produce
 * "https://couponawy.com/path", not "https://couponawy.com//path".
 */
export const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://couponawy.com"
)
  .trim()
  .replace(/\/+$/, "");
