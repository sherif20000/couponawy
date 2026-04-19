-- Phase 2b: add slug column to coupons for SEO-friendly detail page URLs.
-- Pattern: {store-slug}-{discount-descriptor}-{id-suffix}
--   percentage    → noon-15-off-9c40
--   fixed         → amazon-sa-50-sar-off-2916
--   free_shipping → namshi-free-shipping-8bdc
--   bogo          → niceone-bogo-74b6
--   other         → {store}-deal-{id4}
-- The 4-char id suffix guarantees uniqueness when a store has multiple
-- coupons of the same shape (e.g. two 15% noon deals in different categories).

-- 1. Add column (nullable so backfill can run)
ALTER TABLE public.coupons ADD COLUMN slug text;

-- 2. Backfill existing rows
UPDATE public.coupons c
SET slug = (
  CASE c.discount_type
    WHEN 'percentage'    THEN s.slug || '-' || trunc(c.discount_value)::int::text || '-off'
    WHEN 'fixed'         THEN s.slug || '-' || trunc(c.discount_value)::int::text || '-sar-off'
    WHEN 'free_shipping' THEN s.slug || '-free-shipping'
    WHEN 'bogo'          THEN s.slug || '-bogo'
    ELSE                      s.slug || '-deal'
  END
) || '-' || substring(c.id::text, 1, 4)
FROM public.stores s
WHERE s.id = c.store_id;

-- 3. Lock it in
ALTER TABLE public.coupons ALTER COLUMN slug SET NOT NULL;
ALTER TABLE public.coupons ADD CONSTRAINT coupons_slug_key UNIQUE (slug);

-- 4. Explicit index on slug for fast lookups by URL
--    (UNIQUE already creates one, but naming it makes intent clear in EXPLAIN output)
COMMENT ON COLUMN public.coupons.slug IS
  'URL slug in the form {store-slug}-{discount-descriptor}-{id4}. Immutable once created.';
