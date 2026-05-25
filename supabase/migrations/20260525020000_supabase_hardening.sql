-- Audit follow-up — DB security + perf hardening sweep
--
-- This migration consolidates the actionable findings from the Supabase
-- security + performance advisors (audit run on 2026-05-25). It does NOT touch
-- the `coupon_public` SECURITY DEFINER view or the auth dashboard settings
-- (OTP expiry, leaked password protection) — those need separate, lower-risk
-- passes because they alter app-visible behavior or sit in the Supabase UI.
--
-- Sections, each idempotent:
--   1. B4 — Cover the 5 unindexed foreign keys
--   2. B7 — Pin a clean search_path on 4 functions with mutable scope
--   3. B6 — Revoke anon EXECUTE on 2 SECURITY DEFINER functions that
--           were never meant to be public RPC endpoints
--   4. B3 — Rewrite user_profiles SELECT policy so auth.uid() runs
--           once per query, not once per row (auth_rls_initplan)
--   5. B2 — Scope the 12 "Admins full access" policies to the
--           authenticated role only, killing 60 multiple-permissive
--           findings (every anon SELECT was evaluating both policies)

-- ── 1. B4 — Covering indexes for unindexed FKs ────────────────────────
-- Add btree indexes on the 5 foreign keys flagged by `unindexed_foreign_keys`.
-- Pure additive change; helps JOIN + ON DELETE performance, hurts nothing.
create index if not exists articles_category_id_idx
  on public.articles (category_id);
create index if not exists buying_guides_category_id_idx
  on public.buying_guides (category_id);
create index if not exists coupon_reports_coupon_id_idx
  on public.coupon_reports (coupon_id);
create index if not exists seo_overrides_updated_by_idx
  on public.seo_overrides (updated_by);
create index if not exists stores_affiliate_network_id_idx
  on public.stores (affiliate_network_id);

-- ── 2. B7 — Pin search_path on functions flagged by function_search_path_mutable
-- Empty search_path forces every reference to be fully schema-qualified inside
-- the function body, removing the "an attacker who controls search_path can
-- swap out a referenced function" attack surface. These four functions had
-- no search_path config at all (advisor flagged each).
alter function public.notify_revalidate() set search_path = '';
alter function public.set_updated_at() set search_path = '';
alter function public.handle_new_user() set search_path = '';
alter function public.increment_click_counters() set search_path = '';

-- ── 3. B6 — Revoke anon EXECUTE on 2 internal SECURITY DEFINER functions
-- `handle_new_user` is an auth trigger (runs on user signup); never called
-- via RPC. `notify_revalidate` is a webhook tickler from admin actions; never
-- called by anon either. Both were exposed via /rest/v1/rpc/<name> by default.
--
-- `is_admin` and `is_super_admin` are intentionally kept anon-callable because
-- they are referenced from RLS policies (and they return false for anon anyway).
-- `reveal_coupon` and `track_click` are kept anon-callable by design.
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.notify_revalidate() from anon;

-- ── 4. B3 — user_profiles SELECT policy: wrap auth.uid() in subselect
-- Per Supabase's auth_rls_initplan advisor: when a policy references
-- `auth.uid()` directly, Postgres re-evaluates it per row. Wrapping in a
-- scalar subselect `(select auth.uid())` lets the planner cache the value
-- once per query. Big win as the table grows; zero behavior change.
drop policy if exists "Users can read own profile" on public.user_profiles;
create policy "Users can read own profile"
  on public.user_profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

-- ── 5. B2 — Scope "Admins full access" policies to authenticated only
-- Today every "Admins full access to {table}" is defined `TO public`, meaning
-- Postgres evaluates `is_admin()` for every anon row read alongside the
-- "Public can read X" policy. Anon is never an admin, so the eval is wasted.
-- Scoping these policies to `TO authenticated` removes the duplicate for anon
-- while leaving admin write/read paths unchanged (admins are authenticated).
--
-- We can't ALTER POLICY ... TO authenticated (Postgres doesn't allow changing
-- the role list); so each one is DROP + CREATE inside a single statement
-- block. Wrapping all 12 in one transaction keeps RLS coverage intact across
-- the swap.
do $$
declare
  tbl text;
  tables text[] := array[
    'articles', 'buying_guides', 'categories', 'countries',
    'coupon_categories', 'coupon_countries', 'coupons',
    'seo_overrides', 'store_categories', 'store_countries', 'stores'
  ];
begin
  foreach tbl in array tables loop
    execute format('drop policy if exists %I on public.%I',
                   'Admins full access to ' || tbl, tbl);
    execute format(
      'create policy %I on public.%I '
      'for all to authenticated '
      'using (public.is_admin()) '
      'with check (public.is_admin())',
      'Admins full access to ' || tbl, tbl
    );
  end loop;
end $$;

-- user_profiles has a different policy name ("Super admin can manage all users")
-- but the same fix applies — scope to authenticated, not public.
drop policy if exists "Super admin can manage all users" on public.user_profiles;
create policy "Super admin can manage all users"
  on public.user_profiles
  for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());
