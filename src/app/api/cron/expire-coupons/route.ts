import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/cron/expire-coupons
 *
 * Vercel Cron Job — runs every hour.
 * Finds all coupons where expires_at < now() and status = 'active',
 * flips them to 'expired', and revalidates the affected ISR pages.
 *
 * Authentication: Vercel automatically sends CRON_SECRET as a Bearer token
 * in the Authorization header. Set CRON_SECRET in your Vercel environment variables.
 */
export async function GET(req: NextRequest) {
  // --- Auth ---
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[expire-coupons] CRON_SECRET env var is not set");
    return NextResponse.json({ error: "server misconfigured" }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (token !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
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
      revalidatedSlugs.join(", ")
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
