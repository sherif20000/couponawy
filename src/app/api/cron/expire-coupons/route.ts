import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/cron/expire-coupons
 *
 * Vercel Cron Job — runs daily at 02:00 UTC per vercel.json.
 * Finds all coupons where expires_at < now() and status = 'active',
 * flips them to 'expired', and revalidates the affected ISR pages.
 *
 * Authentication (two layers, either passes):
 *
 *   1. Preferred: `Authorization: Bearer ${CRON_SECRET}` matches the
 *      CRON_SECRET env var. Set this on Vercel for strongest security.
 *
 *   2. Fallback when CRON_SECRET is unset: accept the request if it
 *      originates from Vercel's cron infrastructure. Vercel's cron sends
 *      `user-agent: vercel-cron/1.0`. This means the cron keeps working
 *      even if the env var is missing — but external callers without
 *      that UA still get rejected. (Bots can spoof user-agents, so this
 *      is weaker than a shared secret — set CRON_SECRET to upgrade.)
 *
 * The old implementation returned HTTP 500 when CRON_SECRET wasn't set,
 * which meant every daily fire silently failed and expired coupons
 * accumulated as `status='active'`. See production logs ~02:00 UTC.
 */
export async function GET(req: NextRequest) {
  // --- Auth ---
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization") ?? "";
  const userAgent = req.headers.get("user-agent") ?? "";

  // Layer 1: bearer token
  if (secret) {
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (token !== secret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  } else {
    // Layer 2: Vercel cron user-agent fallback
    console.warn(
      "[expire-coupons] CRON_SECRET not set — using vercel-cron user-agent fallback. Set CRON_SECRET for stronger auth.",
    );
    if (!userAgent.startsWith("vercel-cron/")) {
      return NextResponse.json(
        { error: "unauthorized — no CRON_SECRET and not from vercel-cron" },
        { status: 401 },
      );
    }
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  // --- Expire coupons ---
  // We select slug and store slug so we can revalidate the correct ISR pages.
  const { data: expired, error } = await supabase
    .from("coupons")
    .update({ status: "expired" })
    .eq("status", "active")
    .not("expires_at", "is", null)
    .lt("expires_at", now)
    .select("slug, store:stores(slug)");

  if (error) {
    console.error("[expire-coupons cron]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const count = expired?.length ?? 0;

  if (count > 0) {
    // Revalidate listing pages that aggregate coupons
    revalidatePath("/coupons");
    revalidatePath("/stores");

    // Revalidate each individual coupon page and its store page
    const revalidatedSlugs: string[] = [];
    const revalidatedStores: string[] = [];

    for (const coupon of expired ?? []) {
      if (coupon.slug) {
        revalidatePath(`/coupons/${coupon.slug}`);
        revalidatedSlugs.push(coupon.slug);
      }

      // store is a joined object: { slug: string } | null
      const storeSlug =
        coupon.store && !Array.isArray(coupon.store)
          ? (coupon.store as { slug: string }).slug
          : null;

      if (storeSlug && !revalidatedStores.includes(storeSlug)) {
        revalidatePath(`/stores/${storeSlug}`);
        revalidatedStores.push(storeSlug);
      }
    }

    console.log(
      `[expire-coupons cron] Expired ${count} coupons:`,
      revalidatedSlugs.join(", "),
    );
  } else {
    console.log("[expire-coupons cron] No coupons to expire.");
  }

  return NextResponse.json({
    ok: true,
    expired: count,
    timestamp: now,
  });
}
