-- Sprint 2 · Daily-Fresh Coupon Engine
-- Adds verification metadata so the freshness pill on coupon cards reflects
-- a real "this coupon was verified at X" signal instead of the Sprint-1
-- updated_at proxy.

-- ─── Columns ────────────────────────────────────────────────────────────────

alter table public.coupons
  add column if not exists last_verified_at timestamptz,
  add column if not exists verified_by      uuid references auth.users(id) on delete set null,
  add column if not exists verification_method text;

-- verification_method values used by the app:
--   'scrape'       → set by the nightly cron at /api/cron/scrape-coupons
--   'manual'       → admin clicked "تم اختباره الآن" in /admin/verify-queue
--   'auto-import'  → seed scripts / one-time imports
-- Stored as text (not enum) so we can add new sources without a migration.

comment on column public.coupons.last_verified_at is
  'Timestamp of the most recent successful verification (scrape or admin). NULL until first verified.';
comment on column public.coupons.verified_by is
  'Admin user who last manually verified this coupon, if any. NULL for cron-verified rows.';
comment on column public.coupons.verification_method is
  'How this coupon was last verified: scrape | manual | auto-import.';

-- ─── Backfill ───────────────────────────────────────────────────────────────
-- Seed last_verified_at from updated_at for the existing inventory so the
-- freshness pill renders correctly on day 1 of Sprint 2. Mark these as
-- 'auto-import' so the admin queue knows they need a real verification pass.

update public.coupons
set last_verified_at = updated_at,
    verification_method = 'auto-import'
where last_verified_at is null
  and status = 'active';

-- ─── Index ──────────────────────────────────────────────────────────────────
-- The admin verify-queue sorts by oldest-verified-first. Partial index keeps
-- it cheap by only indexing rows the queue actually scans (active coupons).

create index if not exists coupons_last_verified_at_active_idx
  on public.coupons (last_verified_at asc nulls first)
  where status = 'active';

-- ─── RLS sanity ─────────────────────────────────────────────────────────────
-- No new RLS policies needed — these columns are visible/updatable under
-- the existing "admins manage coupons" + "public reads active coupons"
-- policies. Public reads can already see last_verified_at because it's a
-- safe-to-expose timestamp used by the freshness pill on the front-end.
