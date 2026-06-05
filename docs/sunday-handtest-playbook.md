# Sunday hand-test ritual — couponawy.com

**Cadence:** every Sunday, ~30–45 minutes
**Goal:** confirm we still deserve the user's trust this week.

The coupon market lies a lot. Sites publish stale codes, scrape competitors,
and never look at their own pages again. Our differentiator is that a human
re-verifies what we ship. This playbook is that ritual.

---

## Pre-flight (2 min)

1. Open https://couponawy.com in a fresh incognito window.
2. Open https://couponawy.com/admin/verify-queue in a normal window (so you stay logged in).
3. Open the Vercel runtime logs filtered to `level=error` in a third tab:
   https://vercel.com/sherifs-projects-1d855918/couponawy/logs

---

## Step 1 — Verify queue (15–20 min)

Open `/admin/verify-queue`. Default filter: **«كل النشطة»** (oldest first).

For the **top 20 rows** (or all "never verified" + "60+ days", whichever is smaller):

1. Click the coupon title — opens the public page in a new tab.
2. Click **«اعرض الكود»** on the public page, copy the code.
3. Go to the destination store (button on the page).
4. Add any cheap item to cart, paste the code at checkout.
5. **If it works** → return to verify-queue tab, click **«تحقّقت»**. Pill flips green.
6. **If it does NOT work** → click **«أرشفة»**. Coupon is paused; admins can review the pause note later.

Tactical notes:

- For stores requiring login (Noon, Amazon SA, etc.) keep a throw-away test account ready.
- For coupons with `min_order` constraints, add the cheapest item that hits the threshold.
- If a coupon code is missing entirely (no `code` field), the "verify" is just confirming the destination URL still works and the merchant page still exists.
- 90+ day old "active" rows that you don't get to **will be auto-archived overnight Sunday** by the `archive-stale-coupons` cron (Sunday 03:00 UTC). The cron is a safety net, not a primary verifier. Hand-test trumps cron.

---

## Step 2 — Featured + Exclusive sweep (5 min)

These are the highest-traffic surfaces — broken codes here hurt the most.

1. Homepage → scroll through "كوبونات مختارة" (Featured) and "حصرية" (Exclusive) sections.
2. Open every coupon that has `last_verified_at > 14 days` (use the verify-queue filter to identify them first, then jump to the public detail page).
3. Same verify/archive flow as Step 1.

Rationale: featured rows get 10–50× the impressions of long-tail. Even if a code works for 95% of users, if it's broken for the 5% landing on the homepage we're losing the trust we built.

---

## Step 3 — Health-check spot tests (5 min)

Just hit each of these URLs and confirm nothing is visually broken:

```
/                       → homepage hero + ticker + featured grid renders
/coupons                → list page, pagination works
/stores                 → store grid loads, logos present (no "B" placeholders)
/categories             → category cards render
/categories/electronics → category detail loads with coupons
/stores/namshi          → store detail page loads with coupons
/blog                   → blog index renders
/guides                 → guides index renders
/api/og?title=test      → returns a 1200x630 PNG (sanity)
```

For each: status 200, page paints, no console errors. If you see anything weird, screenshot it and file a ticket with the URL.

---

## Step 4 — Log scan (3 min)

Vercel runtime logs tab → filter `level=error,fatal`, last 7 days.

Expected baseline:

- **0 AuthApiErrors** (we killed these in PR #17)
- **0 lookupType:5** from `/api/og` (we killed these in PR #18 by swapping Cairo→Tajawal)
- **0 expire-coupons 500s** (we killed these in PR #16)

Anything new = investigation. Save the request-id, search the codebase for the call site, file a bug.

---

## Step 5 — Index audit (5 min, monthly is fine if no Sunday time)

1. Open Google Search Console → Coverage report.
2. Confirm "Indexed" count ≥ last week.
3. Look for fresh entries in "Crawled — currently not indexed" or "Discovered — currently not indexed". Pattern-match:
   - All from `/coupons/[slug]`? → probably thin content. Open 3 random and check word count + value.
   - All from `/stores/[slug]`? → probably duplicate-content signal. Spot-check that store pages have unique editorial copy.
4. Check "Submitted URL not selected as canonical" — if it spikes, our `BASE_URL` sanitization may have broken (re-read the env var on Vercel).

---

## Step 6 — Close out (2 min)

- Update the `last_verified_at` count in your weekly tracker:
  - Run in admin DB (`/admin` → Stats card on dashboard):
    `coupons where last_verified_at > NOW() - INTERVAL '7 days'` should be ≥ 30 for a healthy week.
- If you archived more than 5 coupons today, that's a signal something upstream is broken (probably we're sourcing stale data from a partner feed). Note it.
- Tweet/Slack the team a one-line summary: "Sunday checked: 23 verified, 4 archived. Logs clean."

---

## What to do if you can't do Sunday this week

Skip everything except **Step 1 (verify queue) on Monday morning** instead. The auto-archive cron has already fired by then so the 90+ day stragglers are gone — but coupons in the 60–89 day band still need eyeballs. Skipping >2 weeks in a row defeats the differentiator. Block the calendar.
