"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { revalidatePath } from "next/cache";

/**
 * Mark a coupon as verified right now.
 *
 * Sets last_verified_at = now() so the freshness pill on the public detail
 * page flips back to green and the verify queue de-prioritizes this row.
 * Records who did it via verified_by (admin email) for accountability.
 *
 * Also bumps updated_at via the trigger so sitemap.xml gets a fresh lastmod —
 * a "this admin re-confirmed today" signal that flows to Google.
 */
export async function markVerifiedNow(couponId: string) {
  const { user } = await requireAdmin();

  // Service-role client for the actual write — bypasses RLS.
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("coupons")
    .update({
      last_verified_at: new Date().toISOString(),
      verified_by: user?.email ?? "unknown",
    })
    .eq("id", couponId);

  if (error) {
    console.error("[markVerifiedNow]", error);
    return { ok: false, error: error.message };
  }

  // Refresh: admin queue + the public coupon detail page (freshness pill).
  revalidatePath("/admin/verify-queue");
  revalidatePath("/admin/coupons");
  return { ok: true };
}

/**
 * Archive (= flip to `paused`) a coupon that's no longer valid.
 *
 * Uses `paused` because the coupon_status enum doesn't have an `archived`
 * value — `paused` carries the same semantics: not visible to users, kept
 * in DB, can be reactivated if rediscovered as working. Notes the reason
 * in verification_note so future admins know this was manual archival vs
 * the auto-archive cron.
 */
export async function archiveCoupon(couponId: string, note?: string) {
  const { user } = await requireAdmin();

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("coupons")
    .update({
      status: "paused",
      verified_by: user?.email ?? "unknown",
      verification_note:
        note ?? `Archived manually by ${user?.email ?? "unknown"}`,
    })
    .eq("id", couponId);

  if (error) {
    console.error("[archiveCoupon]", error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/verify-queue");
  revalidatePath("/admin/coupons");
  return { ok: true };
}
