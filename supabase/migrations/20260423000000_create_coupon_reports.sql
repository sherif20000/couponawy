-- coupon_reports: stores user-submitted reports about broken or expired coupons.
-- Inserted anonymously from the public /report-coupon page (anon key, RLS enforced).

create table if not exists public.coupon_reports (
  id          uuid primary key default gen_random_uuid(),
  coupon_id   uuid references public.coupons(id) on delete set null,
  coupon_url  text,
  issue_type  text not null check (issue_type in ('expired', 'not_working', 'incorrect', 'other')),
  note        text,
  created_at  timestamptz not null default now()
);

-- Only service role can read; anon can insert (no auth required for reporting).
alter table public.coupon_reports enable row level security;

create policy "anon_insert_coupon_reports"
  on public.coupon_reports
  for insert
  to anon, authenticated
  with check (true);

create policy "service_role_all_coupon_reports"
  on public.coupon_reports
  for all
  to service_role
  using (true)
  with check (true);
