-- Sprint 0 (#27) — backfill logo_url for the 166 stores where it was NULL.
--
-- Every one of those 166 rows has a website_url, so we derive the Brandfetch
-- CDN logo URL from the domain using the SAME format already in use across the
-- catalog: https://cdn.brandfetch.io/{domain}/w/256/h/256
--
-- Domain derivation:
--   1. strip leading http:// or https:// and an optional www.
--   2. strip any path after the domain (everything from the first / onward)
--
-- Safety: the StoreLogo client component already falls back to Arabic initials
-- when Brandfetch returns a 1x1 placeholder (naturalWidth < 32) or errors, so
-- domains Brandfetch doesn't recognize degrade gracefully — no worse than the
-- prior NULL state, strictly better when Brandfetch has the logo.
--
-- Examples verified against the live catalog format:
--   https://namshi.com          -> https://cdn.brandfetch.io/namshi.com/w/256/h/256
--   https://www.shgardi.app     -> https://cdn.brandfetch.io/shgardi.app/w/256/h/256
--   https://www.sulindastore.com-> https://cdn.brandfetch.io/sulindastore.com/w/256/h/256

BEGIN;

UPDATE stores
SET logo_url =
  'https://cdn.brandfetch.io/'
  || regexp_replace(
       regexp_replace(website_url, '^https?://(www\.)?', ''),  -- drop scheme + www.
       '/.*$', ''                                              -- drop path
     )
  || '/w/256/h/256'
WHERE logo_url IS NULL
  AND website_url IS NOT NULL;

COMMIT;
