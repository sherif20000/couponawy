"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils/slug";
import type { Database } from "@/types/database";

type CouponStatus = Database["public"]["Enums"]["coupon_status"];
type CouponDiscountType = Database["public"]["Enums"]["coupon_discount_type"];

export async function createCoupon(formData: FormData) {
  const supabase = createAdminClient();

  const title_ar = formData.get("title_ar") as string;
  const title_en = (formData.get("title_en") as string) || null;
  const slug =
    (formData.get("slug") as string) || slugify(title_en || title_ar);
  const code = (formData.get("code") as string) || null;
  const store_id = formData.get("store_id") as string;
  const destination_url = (formData.get("destination_url") as string) || "https://example.com";
  const discount_type = ((formData.get("discount_type") as string) || "other") as CouponDiscountType;
  const discount_value = formData.get("discount_value")
    ? parseFloat(formData.get("discount_value") as string)
    : null;
  const discount_display = (formData.get("discount_display") as string) || null;
  const description_ar = (formData.get("description_ar") as string) || null;
  const status = ((formData.get("status") as string) || "draft") as CouponStatus;
  const is_featured = formData.get("is_featured") === "true";
  const expires_at = (formData.get("expires_at") as string) || null;
  const display_order = parseInt(formData.get("display_order") as string) || 0;

  const { error } = await supabase.from("coupons").insert({
    title_ar,
    title_en,
    slug,
    code,
    store_id,
    destination_url,
    discount_type,
    discount_value,
    discount_display,
    description_ar,
    status,
    is_featured,
    expires_at: expires_at || null,
    display_order,
  });

  if (error) {
    console.error("[createCoupon]", error);
    redirect("/admin/coupons/new?error=1");
  }

  revalidatePath("/admin/coupons");
  revalidatePath("/");
  redirect("/admin/coupons");
}

export async function updateCoupon(id: string, formData: FormData) {
  const supabase = createAdminClient();

  const title_ar = formData.get("title_ar") as string;
  const title_en = (formData.get("title_en") as string) || null;
  const slug =
    (formData.get("slug") as string) || slugify(title_en || title_ar);
  const code = (formData.get("code") as string) || null;
  const store_id = formData.get("store_id") as string;
  const destination_url = (formData.get("destination_url") as string) || undefined;
  const discount_type = ((formData.get("discount_type") as string) || "other") as CouponDiscountType;
  const discount_value = formData.get("discount_value")
    ? parseFloat(formData.get("discount_value") as string)
    : null;
  const discount_display = (formData.get("discount_display") as string) || null;
  const description_ar = (formData.get("description_ar") as string) || null;
  const status = ((formData.get("status") as string) || "draft") as CouponStatus;
  const is_featured = formData.get("is_featured") === "true";
  const expires_at = (formData.get("expires_at") as string) || null;
  const display_order = parseInt(formData.get("display_order") as string) || 0;

  const { error } = await supabase
    .from("coupons")
    .update({
      title_ar,
      title_en,
      slug,
      code,
      store_id,
      destination_url,
      discount_type,
      discount_value,
      discount_display,
      description_ar,
      status,
      is_featured,
      expires_at: expires_at || null,
      display_order,
    })
    .eq("id", id);

  if (error) {
    console.error("[updateCoupon]", error);
    redirect(`/admin/coupons/${id}/edit?error=1`);
  }

  revalidatePath("/admin/coupons");
  revalidatePath(`/admin/coupons/${id}/edit`);
  revalidatePath("/");
  revalidatePath(`/coupons/${slug}`);
  redirect("/admin/coupons");
}

export async function deleteCoupon(id: string) {
  const supabase = createAdminClient();

  // Fetch slug before deleting so we can revalidate the public detail page
  const { data: coupon } = await supabase
    .from("coupons")
    .select("slug")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) console.error("[deleteCoupon]", error);

  revalidatePath("/admin/coupons");
  revalidatePath("/");
  if (coupon?.slug) revalidatePath(`/coupons/${coupon.slug}`);
}

/**
 * Cycles a coupon's status: active → paused, paused → active, draft → active.
 * Expired coupons stay expired — use the edit form to change them.
 */
export async function toggleCouponStatus(id: string, currentStatus: CouponStatus) {
  const supabase = createAdminClient();

  const nextStatus: Partial<Record<CouponStatus, CouponStatus>> = {
    active: "paused",
    paused: "active",
    draft: "active",
  };

  const newStatus = nextStatus[currentStatus];
  if (!newStatus) return; // e.g. expired — do nothing

  const { error } = await supabase
    .from("coupons")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) console.error("[toggleCouponStatus]", error);

  // Revalidate the public detail page for this coupon
  const { data: coupon } = await supabase
    .from("coupons")
    .select("slug")
    .eq("id", id)
    .single();

  revalidatePath("/admin/coupons");
  revalidatePath("/");
  if (coupon?.slug) revalidatePath(`/coupons/${coupon.slug}`);
}
