# Couponawy.com

KSA-first coupon affiliate platform. Arabic-first, 8 Arab markets.

> **Status:** Phase 0 bootstrap.

## Environment variables

The following server-side env vars must be set in your Vercel project (or `.env.local` for local development):

| Variable                        | Description                                                         |
| ------------------------------- | ------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL (public)                                       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key (public)                                   |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service-role key — server only, never expose to the client |
| `REVALIDATE_SECRET`             | **\*\*** checked by `/api/revalidate` to trigger ISR cache purges   |
| `CRON_SECRET`                   | **\*\*** used by the Vercel cron routes (see below)                 |

## Deployment

### Cron routes

Two cron routes handle automated coupon lifecycle management:

- `/api/cron/expire-coupons` — marks past-expiry coupons as expired
- `/api/cron/archive-stale-coupons` — archives long-inactive coupons

Both routes authenticate incoming requests using a **`CRON_SECRET`** bearer token. Set this variable in the Vercel project environment so the routes use strong bearer-token auth. Without it, the routes fall back to a weaker Vercel user-agent check, which is not recommended for production.

In `vercel.json`, configure the cron schedule to call these routes, and Vercel will automatically inject the `CRON_SECRET` header when `CRON_SECRET` is set.
