-- Editorial override columns for the flagship-content push
--
-- Why: programmatic templates produce ~2000 ar words per store/category from
-- existing fields. That puts us at "decent". To get to flagship-grade
-- editorial depth (3000+ ar words, distinctive voice, factual specifics
-- about each brand) we need a path for editors to override the template
-- baseline on the top ~50 stores + top ~20 categories without forking the
-- codebase.
--
-- Each override column is a long-form markdown text field. The page renderer:
--   1. If override is set (non-empty), render the override.
--   2. Else fall back to the programmatic template (existing behavior).
--
-- Columns are all NULLABLE — adding them doesn't require backfill and the
-- site keeps rendering templates until an editor fills them in.

-- Stores: editorial intro, seasonal calendar, shipping/payment guide
alter table public.stores
  add column if not exists editorial_intro_ar    text,
  add column if not exists seasonal_calendar_ar  text,
  add column if not exists shipping_info_ar      text;

comment on column public.stores.editorial_intro_ar is
  'Long-form Arabic intro (markdown). Overrides the programmatic ' ||
  'aboutStoreCopy template when non-empty. Target ~400-500 ar words.';
comment on column public.stores.seasonal_calendar_ar is
  'Long-form Arabic seasonal savings calendar (markdown). Overrides ' ||
  'the programmatic seasonalCalendar template when non-empty. ' ||
  'Target ~400-500 ar words covering Ramadan, White Friday, Eid, etc.';
comment on column public.stores.shipping_info_ar is
  'Long-form Arabic shipping + returns + payment guide (markdown). ' ||
  'Overrides the programmatic shippingInfo template. Target ~300-400 ar words.';

-- Categories: editorial intro, seasonal calendar, shopping guide
alter table public.categories
  add column if not exists editorial_intro_ar    text,
  add column if not exists seasonal_calendar_ar  text,
  add column if not exists shopping_guide_ar     text;

comment on column public.categories.editorial_intro_ar is
  'Long-form Arabic intro (markdown). Overrides aboutCategoryCopy when set.';
comment on column public.categories.seasonal_calendar_ar is
  'Long-form Arabic seasonal calendar specific to this category (markdown).';
comment on column public.categories.shopping_guide_ar is
  'Long-form Arabic shopping tips specific to this category (e.g. sizing ' ||
  'guides for fashion, warranty notes for electronics).';
