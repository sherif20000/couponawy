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

/**
 * Resolves the set of active coupon IDs that should be visible for a given country.
 *
 * Logic:
 *   - Coupons with NO entries in coupon_countries → global, visible everywhere.
 *   - Coupons with entries in coupon_countries → visible only in those countries.
 *
 * Returns `null` when no countryCode is supplied (caller should show all coupons).
 */
export async function getVisibleCouponIds(
  countryCode: string
): Promise<string[] | null> {
  const supabase = await createClient();

  // Fetch all active coupon IDs
  const { data: activeCoupons, error: aErr } = await supabase
    .from("coupons")
    .select("id")
    .eq("status", "active");

  if (aErr) {
    console.error("[getVisibleCouponIds] coupons", aErr);
    return null;
  }

  const allActiveIds = (activeCoupons ?? []).map((c) => c.id);
  if (allActiveIds.length === 0) return [];

  // Fetch all coupon_countries rows for those coupons
  const { data: rows, error: rErr } = await supabase
    .from("coupon_countries")
    .select("coupon_id, country_code")
    .in("coupon_id", allActiveIds);

  if (rErr) {
    console.error("[getVisibleCouponIds] coupon_countries", rErr);
    return null;
  }

  // Build a set: coupon_ids that have ANY country restriction
  const restrictedIds = new Set((rows ?? []).map((r) => r.coupon_id));
  // Build a set: coupon_ids restricted specifically for the requested country
  const countryIds = new Set(
    (rows ?? [])
      .filter((r) => r.country_code === countryCode)
      .map((r) => r.coupon_id)
  );

  // Keep coupons that are either: unrestricted (global) OR restricted for this country
  return allActiveIds.filter(
    (id) => !restrictedIds.has(id) || countryIds.has(id)
  );
}

export async function getActiveCouponsPaginated(
  page = 1,
  perPage = 24,
  countryCode?: string
): Promise<{ coupons: FeaturedCoupon[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * perPage;

  // When a country filter is active, resolve the visible IDs first.
  if (countryCode) {
    const visibleIds = await getVisibleCouponIds(countryCode);
    // If the helper errored out, fall through to the unfiltered query so the
    // page doesn't break. An error was already logged inside the helper.
    if (visibleIds !== null) {
      if (visibleIds.length === 0) return { coupons: [], total: 0 };

      const { data, count, error } = await supabase
        .from("coupons")
        .select(`*, store:stores ( id, slug, name_ar, logo_url )`, { count: "exact" })
        .eq("status", "active")
        .in("id", visibleIds)
        .order("is_featured", { ascending: false })
        .order("display_order", { ascending: true })
        .range(from, from + perPage - 1);

      if (error) {
        console.error("[getActiveCouponsPaginated] filtered", error);
        return { coupons: [], total: 0 };
      }
      return { coupons: (data ?? []) as FeaturedCoupon[], total: count ?? 0 };
    }
  }

  // Unfiltered (no country or helper error)
  const { data, count, error } = await supabase
    .from("coupons")
    .select(`*, store:stores ( id, slug, name_ar, logo_url )`, { count: "exact" })
    .eq("status", "active")
    .order("is_featured", { ascending: false })
    .order("display_order", { ascending: true })
    .range(from, from + perPage - 1);

  if (error) {
    console.error("[getActiveCouponsPaginated]", error);
    return { coupons: [], total: 0 };
  }
  return { coupons: (data ?? []) as FeaturedCoupon[], total: count ?? 0 };
}
