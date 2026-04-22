import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { FeaturedCoupon } from "@/lib/queries/homepage";

type Category = Database["public"]["Tables"]["categories"]["Row"];

export type { Category };

// Used only in generateStaticParams — runs at build time without a request context,
// so we use the admin client (no cookies dependency) instead of the server client.
export async function getAllCategorySlugsBuildTime(): Promise<{ slug: string }[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("slug")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[getAllCategorySlugsBuildTime]", error);
    return [];
  }
  return data ?? [];
}

export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true })
    .order("name_ar", { ascending: true });

  if (error) {
    console.error("[getAllCategories]", error);
    return [];
  }
  return data ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[getCategoryBySlug]", error);
    return null;
  }
  return data;
}

export async function getCouponsByCategory(
  categoryId: string
): Promise<FeaturedCoupon[]> {
  const supabase = await createClient();

  const { data: junction, error: jErr } = await supabase
    .from("coupon_categories")
    .select("coupon_id")
    .eq("category_id", categoryId);

  if (jErr) {
    console.error("[getCouponsByCategory] junction", jErr);
    return [];
  }

  const ids = (junction ?? []).map((r) => r.coupon_id);
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("coupons")
    .select(`*, store:stores ( id, slug, name_ar, logo_url )`)
    .eq("status", "active")
    .in("id", ids)
    .order("is_featured", { ascending: false })
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[getCouponsByCategory] coupons", error);
    return [];
  }
  return (data ?? []) as FeaturedCoupon[];
}

/**
 * Returns a map of { [categoryId]: activeCount } for all categories.
 * Two-step: fetch active coupon IDs first, then count their category associations.
 * Keeps the logic in JS to avoid needing a DB view or RPC.
 */
export async function getCategoryCouponCounts(): Promise<Record<string, number>> {
  const supabase = await createClient();

  // Step 1: all active coupon IDs
  const { data: activeCoupons, error: aErr } = await supabase
    .from("coupons")
    .select("id")
    .eq("status", "active");

  if (aErr) {
    console.error("[getCategoryCouponCounts] coupons", aErr);
    return {};
  }

  const activeIds = (activeCoupons ?? []).map((c) => c.id);
  if (activeIds.length === 0) return {};

  // Step 2: all junction rows for those coupons
  const { data: junction, error: jErr } = await supabase
    .from("coupon_categories")
    .select("category_id")
    .in("coupon_id", activeIds);

  if (jErr) {
    console.error("[getCategoryCouponCounts] junction", jErr);
    return {};
  }

  return (junction ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.category_id] = (acc[row.category_id] ?? 0) + 1;
    return acc;
  }, {});
}

export async function getActiveCoupons(): Promise<FeaturedCoupon[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .select(`*, store:stores ( id, slug, name_ar, logo_url )`)
    .eq("status", "active")
    .order("is_featured", { ascending: false })
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[getActiveCoupons]", error);
    return [];
  }
  return (data ?? []) as FeaturedCoupon[];
}
