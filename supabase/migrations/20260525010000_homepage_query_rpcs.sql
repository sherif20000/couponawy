-- Sprint 2 · Day 6 — Fix homepage URL-too-long bug
--
-- Background. Two homepage queries were doing a two-step pattern in JS:
--   1. SELECT id FROM coupons WHERE status = 'active'   (returns ~600 ids)
--   2. SELECT ... FROM other_table WHERE id IN (...600 ids)
-- The second .in() builds a Supabase REST URL > 16KB, which Node's undici
-- HTTP client rejects with HeadersOverflowError. On Vercel this surfaces as
-- a 500 to the user; locally it silently returns empty data — both bad.
--
-- Fix. Move the JOIN server-side into stable RPC functions so the client
-- only sees small arguments and a small result set.

-- ── get_visible_coupon_ids ──────────────────────────────────────────────
-- Returns the array of active coupon ids that should be VISIBLE to a user
-- in a given country.
--
-- Visibility rules (preserved exactly from the old JS implementation):
--   1. A coupon with NO rows in coupon_countries → global, visible everywhere.
--   2. A coupon WITH rows in coupon_countries → visible only in those rows.
--
-- Returns an empty array (not NULL) when nothing matches, so callers can
-- treat the result uniformly.
create or replace function public.get_visible_coupon_ids(p_country_code text)
returns uuid[]
language sql
stable
security invoker
set search_path = public
as $$
  with active as (
    select id from coupons where status = 'active'
  ),
  restricted_any as (
    -- Any coupon that has at least one country row → it is restricted
    select distinct coupon_id from coupon_countries
  ),
  restricted_for_country as (
    -- Coupons restricted specifically to the caller's country
    select coupon_id
    from coupon_countries
    where country_code = p_country_code
  )
  select coalesce(array_agg(a.id), '{}')
  from active a
  where
    a.id not in (select coupon_id from restricted_any)
    or a.id in (select coupon_id from restricted_for_country);
$$;

grant execute on function public.get_visible_coupon_ids(text) to anon, authenticated, service_role;

-- ── get_category_coupon_counts ──────────────────────────────────────────
-- Returns one row per category with the count of currently-active coupons
-- in that category. Caller turns the rows into a {[category_id]: count} map.
create or replace function public.get_category_coupon_counts()
returns table(category_id uuid, count bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select cc.category_id, count(cc.coupon_id)::bigint
  from coupon_categories cc
  inner join coupons c on c.id = cc.coupon_id
  where c.status = 'active'
  group by cc.category_id;
$$;

grant execute on function public.get_category_coupon_counts() to anon, authenticated, service_role;
