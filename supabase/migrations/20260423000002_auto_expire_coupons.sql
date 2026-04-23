-- Enable pg_cron extension (requires Supabase pg_cron add-on to be enabled in the dashboard)
create extension if not exists pg_cron;

-- Schedule hourly job: expire coupons whose expires_at has passed
select cron.schedule(
  'auto-expire-coupons',          -- job name (unique)
  '0 * * * *',                    -- every hour on the hour
  $$
    update public.coupons
    set    status = 'expired'
    where  expires_at < now()
      and  status = 'active';
  $$
);
