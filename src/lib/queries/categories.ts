import { cache } from "react";
import { createAdminClient, createPublicClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { FeaturedCoupon } from "@/lib/queries/homepage";

type Category = Database["public"]["Tables"]["categories"]["Row"];

export type { Category };

// Used by generateStaticParams() AND sitemap.ts. `updated_at` lets the sitemap
// emit per-row <lastmod>; generateStaticParams ignores the extra field.
export async function getAllCategorySlugsBuildTime(): Promise<
  { slug: string; updated_at: string | null }[]
> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("slug, updated_at")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[getAllCategorySlugsBuildTime]", error);
    return [];
  }
  return data ?? [];
}

export async function getAllCategories(): Promise<Category[]> {
  const supabase = createPublicClient();
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

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  // createPublicClient — keeps the /categories/[slug] route statically generable.
  const supabase = createPublicClient();
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
  categoryId: string,
): Promise<FeaturedCoupon[]> {
  // createPublicClient — keeps the /categories/[slug] route statically generable.
  const supabase = createPublicClient();

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
 *
 * Previously did this in two JS steps: fetch ~600 active coupon IDs, then call
 * .in('coupon_id', [...600 ids]) on coupon_categories. That produced a Supabase
 * REST URL > 16KB which Node's undici HTTP client rejects with HeadersOverflowError
 * (500 on Vercel, silent empty data locally).
 *
 * Now delegates the JOIN + GROUP BY to a stable Postgres function so the wire
 * payload is tiny (one row per category).
 */
export async function getCategoryCouponCounts(): Promise<
  Record<string, number>
> {
  const supabase = createPublicClient();

  const { data, error } = await supabase.rpc("get_category_coupon_counts");

  if (error) {
    console.error("[getCategoryCouponCounts]", error);
    return {};
  }

  // RPC returns `{ category_id: string; count: number }[]`. Coerce the `count`
  // because Postgres `bigint` arrives as `string | number` depending on the driver.
  return (data ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.category_id] = Number(row.count);
    return acc;
  }, {});
}

export async function getActiveCoupons(): Promise<FeaturedCoupon[]> {
  const supabase = createPublicClient();
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
 * Visibility logic (unchanged from before):
 *   - Coupons with NO entries in coupon_countries → global, visible everywhere.
 *   - Coupons with entries in coupon_countries → visible only in those countries.
 *
 * Previously fetched ~600 active IDs, then ran .in('coupon_id', [...]) on
 * coupon_countries — the resulting REST URL was > 16KB and undici rejected it.
 * Now delegated to a stable Postgres function that returns the filtered uuid[]
 * directly, so the wire payload stays small.
 *
 * Returns `null` on RPC error (caller treats this as "show all, don't filter").
 */
// React `cache()` so the homepage and shell, which each call this with the
// same country code, only hit Supabase once per request. Without cache() the
// homepage was calling getVisibleCouponIds 3 separate times per render.
export const getVisibleCouponIds = cache(
  async (countryCode: string): Promise<string[] | null> => {
    const supabase = createPublicClient();

    const { data, error } = await supabase.rpc("get_visible_coupon_ids", {
      p_country_code: countryCode,
    });

    if (error) {
      console.error("[getVisibleCouponIds]", error);
      return null;
    }

    // RPC returns `uuid[]` which arrives as `string[]`. Coalesce to [] so
    // downstream `.in()` calls treat empty as "no matches", not null.
    return (data as string[] | null) ?? [];
  },
);

export async function getActiveCouponsPaginated(
  page = 1,
  perPage = 24,
  countryCode?: string,
): Promise<{ coupons: FeaturedCoupon[]; total: number }> {
  const supabase = createPublicClient();
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
        .select(`*, store:stores ( id, slug, name_ar, logo_url )`, {
          count: "exact",
        })
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
    .select(`*, store:stores ( id, slug, name_ar, logo_url )`, {
      count: "exact",
    })
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
