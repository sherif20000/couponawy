-- Bug #2 Layer 1 — correct logo_url for 4 stores where Brandfetch returns a
-- byte-identical 1742-byte 'B' placeholder webp.
--
-- Diagnosis: each domain in the WHERE clause below resolves to a Brandfetch
-- 'logo not on file' placeholder (`HTTP 200 image/webp, 1742 bytes, identical
-- across all four`). Our naturalWidth < 32 fallback never fires because the
-- placeholder is 256×256 — it passes every dimensional check. The fix is to
-- point each store at the domain variant Brandfetch actually has data for:
--
--   amazon.sa        →  amazon.com         (1526b, real logo)
--   jahez.net        →  jahez.com          (1830b, real logo)
--   nahdionline.com  →  nahdi.sa           (4010b, real logo — sharper)
--   ninja.sa         →  ninjadelivery.com  (2622b, real logo)
--
-- Verified via direct curl with `?c=${NEXT_PUBLIC_BRANDFETCH_CLIENT_ID}` and
-- a browser User-Agent + Referer. Bytes are diagnostic: the 1742-byte file
-- is the placeholder, anything other byte-count = real artwork.
--
-- Layer 2 is a separate change: Namshi has NO data in Brandfetch (.com / .sa
-- / .ae all return a 426-byte empty fallback). Solving that requires either
-- self-hosting the logo or layering Logo.dev as a fallback CDN — out of
-- scope for this data-only migration.
--
-- Reversible: re-running each UPDATE swapped is a clean rollback.

UPDATE stores
SET logo_url = 'https://cdn.brandfetch.io/amazon.com/w/256/h/256',
    updated_at = NOW()
WHERE logo_url = 'https://cdn.brandfetch.io/amazon.sa/w/256/h/256';

UPDATE stores
SET logo_url = 'https://cdn.brandfetch.io/jahez.com/w/256/h/256',
    updated_at = NOW()
WHERE logo_url = 'https://cdn.brandfetch.io/jahez.net/w/256/h/256';

UPDATE stores
SET logo_url = 'https://cdn.brandfetch.io/nahdi.sa/w/256/h/256',
    updated_at = NOW()
WHERE logo_url = 'https://cdn.brandfetch.io/nahdionline.com/w/256/h/256';

UPDATE stores
SET logo_url = 'https://cdn.brandfetch.io/ninjadelivery.com/w/256/h/256',
    updated_at = NOW()
WHERE logo_url = 'https://cdn.brandfetch.io/ninja.sa/w/256/h/256';
