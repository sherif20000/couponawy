import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/cron/archive-stale-coupons
 *
 * Vercel Cron Job — runs Sunday 03:00 UTC (= Sunday 06:00 KSA) per vercel.json.
 * Finds active coupons that haven't been hand-verified in 90+ days
 * (or never verified) and flips them to `paused`. The admin verify-queue
 * page already nags about these — this cron is the safety net for ones the
 * admin forgot about.
 *
 * Why `paused` instead of a hypothetical `archived` status: the coupon_status
 * enum is {draft, active, paused, expired}. `paused` already means "hidden
 * from users, kept in DB, reactivatable." Adding `archived` would require an
 * enum migration with no real semantic gain.
 *
 * Records a verification_note so admins reviewing later understand WHY this
 * was paused (auto-archive vs manual). Also bumps updated_at so sitemap.xml
 * lastmod and revalidation pick it up.
 *
 * Auth: same two-layer pattern as expire-coupons.
 *   1. Preferred: `Authorization: Bearer ${CRON_SECRET}`
 *   2. Fallback: `user-agent: vercel-cron/*` when CRON_SECRET is unset.
 */
export async function GET(req: NextRequest) {
  // --- Auth ---
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization") ?? "";
  const userAgent = req.headers.get("user-agent") ?? "";

  if (secret) {
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (token !== secret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  } else {
    console.warn(
      "[archive-stale-coupons] CRON_SECRET not set — using vercel-cron user-agent fallback. Set CRON_SECRET for stronger auth."
    );
    if (!userAgent.startsWith("vercel-cron/")) {
      return NextResponse.json(
        { error: "unauthorized — no CRON_SECRET and not from vercel-cron" },
        { status: 401 }
      );
    }
  }

  const supabase = createAdminClient();

  // 90-day threshold. Adjust here if business wants a different cadence.
  const STALE_DAYS = 90;
  const threshold = new Date(
    Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();
  const now = new Date().toISOString();

  // Pull the at-risk set first so we can log slugs + revalidate detail pages.
  // Two predicates joined with OR: never verified, OR verified before threshold.
  // Limit to active coupons only — we never touch draft/paused/expired.
  const { data: stale, error: fetchError } = await supabase
    .from("coupons")
    .select("id, slug, title_ar, last_verified_at, store:stores(slug)")
    .eq("status", "active")
    .or(`last_verified_at.is.null,last_verified_at.lt.${threshold}`);

  if (fetchError) {
    console.error("[archive-stale-coupons] fetch", fetchError);
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!stale || stale.length === 0) {
    console.log("[archive-stale-coupons] No stale coupons to archive.");
    return NextResponse.json({
      ok: true,
      archived: 0,
      threshold_days: STALE_DAYS,
      timestamp: now,
    });
  }

  const ids = stale.map((c) => c.id);

  const { error: updateError } = await supabase
    .from("coupons")
    .update({
      status: "paused",
      verification_note: `Auto-archived ${now} — not hand-verified for ${STALE_DAYS}+ days`,
    })
    .in("id", ids);

  if (updateError) {
    console.error("[archive-stale-coupons] update", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Revalidate every affected detail page + listings + store pages so the
  // archived coupons disappear from public surfaces immediately instead of
  // waiting for ISR.
  revalidatePath("/");
  revalidatePath("/coupons");
  revalidatePath("/stores");
  revalidatePath("/categories");

  const revalidatedStores = new Set<string>();
  for (const coupon of stale) {
    if (coupon.slug) revalidatePath(`/coupons/${coupon.slug}`);
    const storeSlug =
      coupon.store && !Array.isArray(coupon.store)
        ? (coupon.store as { slug: string }).slug
        : null;
    if (storeSlug && !revalidatedStores.has(storeSlug)) {
      revalidatePath(`/stores/${storeSlug}`);
      revalidatedStores.add(storeSlug);
    }
  }

  const sample = stale
    .slice(0, 10)
    .map((c) => c.slug)
    .filter(Boolean)
    .join(", ");

  console.log(
    `[archive-stale-coupons] Auto-archived ${stale.length} coupons (threshold ${STALE_DAYS} days). Sample: ${sample}${stale.length > 10 ? "..." : ""}`
  );

  return NextResponse.json({
    ok: true,
    archived: stale.length,
    threshold_days: STALE_DAYS,
    revalidated_stores: revalidatedStores.size,
    timestamp: now,
  });
}
