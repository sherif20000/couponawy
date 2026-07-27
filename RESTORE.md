# Couponawy — Restore Guide

**Project parked:** 2026-07-27 · **Archive:** `couponawy-archive-2026-07.zip`
(Google Drive → `My Drive/Project-Archives/couponawy/`)

This repo is the long-term revival copy. The archive holds everything the repo
cannot (data, secrets, platform config). You need **both** to restore.

---

## 0 · What exists where

| Asset | Location | Notes |
|---|---|---|
| Source code | this GitHub repo (`sherif20000/couponawy`) | archived read-only; unarchive to resume |
| Schema migrations | `supabase/migrations/` (15 files) | **primary** schema source |
| Table data (1,141 rows) | archive → `data/*.json` | one file per table |
| Schema safety-net DDL | archive → `schema/schema-objects.sql` | ⚠️ contains a secret token |
| Env vars / secrets | archive → `config/vercel-env-*.txt` | **never in git** |
| Platform settings + DNS | archive → `config/` | crons, domains, DNS records |

**State at park time:** 421 coupons (3 active / 410 paused / 8 expired),
612 stores, 8 articles, 4 guides, 56 reveals, 1 auth user.
The mass-paused state is expected — see §6.

---

## 1 · Restore the database

1. Create a new Supabase project (any org; free tier is fine to start).
   Note the new project ref, URL, anon key, and service-role key.
2. Run the 15 migrations **in filename order**:
   ```bash
   supabase link --project-ref <NEW_REF>
   supabase db push          # or: psql < each file in supabase/migrations/
   ```
3. Sanity-check objects were created: 18 tables, 7 enums, the `coupon_public`
   view, and the RLS policies. If anything is missing, apply the relevant
   section of `schema/schema-objects.sql` (skip `notify_revalidate` for now —
   see step 5).
4. Import the data **in this order** (parents before children, so FKs hold):
   ```
   countries → categories → affiliate_networks → stores → coupons
   → store_categories → store_countries → coupon_categories → coupon_countries
   → articles → buying_guides → seo_overrides
   → user_profiles → reveals → clicks → coupon_reports
   → contact_messages → newsletter_subscribers
   ```
   Import script (run from the archive root, service-role key required):
   ```js
   // node import.js — writes JSON files back into a fresh project
   const fs = require('fs');
   const { createClient } = require('@supabase/supabase-js');
   const sb = createClient(process.env.SUPABASE_URL, process.env.SERVICE_ROLE_KEY);
   const order = ['countries','categories','affiliate_networks','stores','coupons',
     'store_categories','store_countries','coupon_categories','coupon_countries',
     'articles','buying_guides','seo_overrides','user_profiles','reveals','clicks',
     'coupon_reports','contact_messages','newsletter_subscribers'];
   (async () => {
     for (const t of order) {
       const rows = JSON.parse(fs.readFileSync(`data/${t}.json`));
       if (!rows.length) { console.log(t, '0 (skip)'); continue; }
       for (let i = 0; i < rows.length; i += 500) {
         const { error } = await sb.from(t).insert(rows.slice(i, i + 500));
         if (error) { console.error(t, error.message); break; }
       }
       console.log(t, rows.length);
     }
   })();
   ```
   ⚠️ `user_profiles.id` FKs to `auth.users`. Either recreate the auth user
   first (see §2) or import `user_profiles` after it.
5. Verify counts match `data/_export_counts.json` exactly before continuing.

## 2 · Recreate the auth user

`data/auth_users.json` holds the admin identity (passwords are **not**
exportable). Recreate via Supabase Dashboard → Authentication → Add user,
using the same email so `user_profiles.id` lines up — or create fresh and
update `user_profiles.id` to the new UUID.

## 3 · Recreate environment variables

Source: `config/vercel-env-production.txt` (33 vars), plus preview/development.

Rotate these rather than reusing — they were exposed in an archive:
- `SUPABASE_SERVICE_ROLE_KEY` (new project = new key anyway)
- `REVALIDATE_SECRET` / the `notify_revalidate` bearer token
- Any affiliate-network or API keys

Update to the new project's values: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

## 4 · Redeploy on Vercel

```bash
vercel link          # create/attach a project named "couponawy"
vercel env add ...   # or paste vars via the dashboard
vercel --prod
```
Settings to match (`config/vercel-project-settings.json`):
framework `nextjs`, Node `24.x`, all build/install commands default (null).
`vercel.json` already declares both crons:
- `/api/cron/expire-coupons` — daily 02:00 UTC
- `/api/cron/archive-stale-coupons` — Sundays 03:00 UTC

Set `CRON_SECRET` or the crons will 401.

## 5 · Re-enable revalidation

Recreate `notify_revalidate()` from `schema/schema-objects.sql` **with a new
bearer token**, matching the `REVALIDATE_SECRET` you set in Vercel. It fires
`net.http_post` to `https://<domain>/api/revalidate` on data changes and
requires the `pg_net` extension.

## 6 · Reactivate the catalog ⚠️ IMPORTANT

At park time only **3 coupons were active** — the weekly `archive-stale-coupons`
cron paused everything not re-verified recently. This is a freshness guard,
not data loss: all 421 coupons and their codes are intact.

Before relaunch:
- Re-verify coupon codes still work at each merchant, then flip
  `status` back to `active`.
- **112 coupons across 47 stores** still point at `placeholder.invalid` —
  they are deliberately paused. Fill in real domains using
  `docs/STORES_NEEDING_DOMAINS.md`, then reactivate.
- Refresh the expired big-brand coupons (noon, Amazon.sa, Nahdi, SHEIN,
  Jahez, HungerStation).
- The hero stats on the homepage (`src/app/page.tsx` ~line 126) are
  **hardcoded and inflated** ("+2,400 كوبون", "+500 متجر", "98% نجاح").
  Wire them to real counts or remove them.

## 7 · Repoint DNS (Namecheap)

From `config/dns-snapshot.txt` — original records:
| Host | Type | Value |
|---|---|---|
| `@` | A | `216.198.79.1` (Vercel) |
| `www` | CNAME | `cname.vercel-dns.com.` |
| `@` | MX | `eforward1-5.registrar-servers.com` (priorities 10/10/10/15/20) |
| `@` | TXT | `v=spf1 include:spf.efwd.registrar-servers.com ~all` |
| NS | — | `dns1/dns2.registrar-servers.com` |

Vercel may issue a different apex IP on the new project — take the value it
shows in Domains, and keep the MX/TXT records so email forwarding survives.

---

## 8 · Known issues to fix on revival

Full detail in `docs/HYBRID_MODEL_AUDIT.md`.

1. **No affiliate monetization** — 0 of 421 coupons carry affiliate links;
   `affiliate_networks` is empty; no `/go` redirect or subid attribution.
   Revenue is structurally $0 until this is wired (ArabClicks/Admitad first).
2. **Fabricated store domains** — some destinations were invented from slugs
   (`careem-food.com`, `ego-app-discount.com`, `bolt.com` for the rides app).
   Audit all 612 store URLs before sending traffic.
3. **Inflated homepage stats** (see §6).
4. **Unbounded `.in()` query** in `lib/queries/categories.ts:59-91` — will 500
   past ~1,000 rows per category.
5. **Base schema not in migrations** — the repo's migrations start at fix
   migrations; the original CREATE TABLEs live only in
   `schema/schema-objects.sql` + `database.types.ts`. Snapshot properly on
   revival.

## 9 · The hybrid plan (if reviving with intent)

`docs/HYBRID_MODEL_AUDIT.md` contains the full coupons + product-comparison
blueprint: the "effective price" concept (price − live coupon), the adapted
5prijzen product-page structure, the no-feeds data strategy, and a costed
sleep-vertical pilot. Structure is ~70% ready; the new work is the price layer
(`products`, `product_offers`, `price_history` + ingestion).
