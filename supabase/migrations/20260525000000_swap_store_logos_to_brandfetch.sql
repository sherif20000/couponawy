-- Swap store logos from Google S2 favicons to Brandfetch's free Logo Link CDN.
--
-- WHY: Google S2 favicons return whatever native favicon a domain happens to
-- have — usually 16×16 or 32×32. Scaling those to 72-96px containers produces
-- the pixelated, generic-letter look that's been killing trust in the
-- "متاجر نثق بها" row. Brandfetch's Logo Link CDN serves real brand marks
-- (curated from each brand's brand-kit). Free tier covers our traffic by
-- orders of magnitude.
--
-- Rendering note: this migration writes the BASE URL only
-- (https://cdn.brandfetch.io/{domain}/w/256/h/256). The required `?c=CLIENT_ID`
-- query parameter is appended at render time by src/components/stores/store-logo.tsx
-- from the NEXT_PUBLIC_BRANDFETCH_CLIENT_ID env var. This keeps the DB row
-- environment-agnostic (same value works for prod + preview).
--
-- Rollback safety: the StoreLogo component already falls back to Arabic-letter
-- initials when an image fails to load (naturalWidth < 32). So if Brandfetch
-- doesn't have a logo for a domain, users see the brand initials in red —
-- visually closer to "on brand" than a pixelated favicon.

UPDATE stores
SET logo_url =
  'https://cdn.brandfetch.io/' ||
  substring(logo_url FROM 'domain=([^&]+)') ||
  '/w/256/h/256'
WHERE logo_url LIKE 'https://www.google.com/s2/favicons%'
  AND substring(logo_url FROM 'domain=([^&]+)') IS NOT NULL;

-- Sanity check (won't fail the migration; for log inspection only).
-- Expected output: most stores migrated, none stuck on s2/favicons.
DO $$
DECLARE
  brandfetch_count int;
  s2_remaining int;
BEGIN
  SELECT count(*) INTO brandfetch_count
  FROM stores WHERE logo_url LIKE 'https://cdn.brandfetch.io/%';

  SELECT count(*) INTO s2_remaining
  FROM stores WHERE logo_url LIKE 'https://www.google.com/s2/favicons%';

  RAISE NOTICE 'Store logos migrated to Brandfetch: %', brandfetch_count;
  RAISE NOTICE 'S2 favicons still remaining: %', s2_remaining;
END $$;
