import { cache } from "react";
import { createAdminClient, createPublicClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { FeaturedCoupon } from "@/lib/queries/homepage";

type Store = Database["public"]["Tables"]["stores"]["Row"];
type Coupon = Database["public"]["Tables"]["coupons"]["Row"];

export type CouponWithStore = Coupon & {
  store: Pick<
    Store,
    "id" | "slug" | "name_ar" | "name_en" | "logo_url" | "website_url"
  > | null;
};

export type StoreListItem = Pick<
  Store,
  "id" | "slug" | "name_ar" | "name_en" | "logo_url" | "is_verified" | "is_featured"
>;

// Used by generateStaticParams() AND sitemap.ts.
//
// `updated_at` is included so the sitemap can emit per-row `<lastmod>` — a real
// freshness signal for Google instead of the previous "always now()" stamp.
// generateStaticParams only reads `slug`, so the extra field is harmless there.
export async function getAllStoreSlugsBuildTime(): Promise<
  { slug: string; updated_at: string | null }[]
> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("stores")
    .select("slug, updated_at")
    .eq("status", "active");

  if (error) {
    console.error("[getAllStoreSlugsBuildTime]", error);
    return [];
  }
  return data ?? [];
}

export async function getAllCouponSlugsBuildTime(): Promise<
  { slug: string; updated_at: string | null }[]
> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("slug, updated_at")
    .eq("status", "active");

  if (error) {
    console.error("[getAllCouponSlugsBuildTime]", error);
    return [];
  }
  return data ?? [];
}

export async function getActiveStores(
  countryCode?: string
): Promise<StoreListItem[]> {
  const supabase = createPublicClient();
  let query = supabase
    .from("stores")
    .select("id, slug, name_ar, name_en, logo_url, is_verified, is_featured")
    .eq("status", "active")
    .order("is_featured", { ascending: false })
    .order("name_ar", { ascending: true });

  // When a country is specified, show stores explicitly tagged for that country
  // OR stores with no country assignment (global stores).
  if (countryCode) {
    query = query.or(`country_code.eq.${countryCode},country_code.is.null`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[getActiveStores]", error);
    return [];
  }
  return data ?? [];
}

export async function getActiveStoresPaginated(
  page = 1,
  perPage = 24,
  countryCode?: string,
  searchQuery?: string
): Promise<{ stores: StoreListItem[]; total: number }> {
  const supabase = createPublicClient();
  const from = (page - 1) * perPage;

  let query = supabase
    .from("stores")
    .select("id, slug, name_ar, name_en, logo_url, is_verified, is_featured", { count: "exact" })
    .eq("status", "active")
    .order("is_featured", { ascending: false })
    .order("name_ar", { ascending: true });

  if (countryCode) {
    query = query.or(`country_code.eq.${countryCode},country_code.is.null`);
  }

  // Server-side search across Arabic name, English name, and slug.
  // Escape PostgREST reserved chars (,) and wildcard chars (%, _) in user input,
  // then use ilike for case-insensitive partial match.
  const trimmed = searchQuery?.trim();
  if (trimmed) {
    const escaped = trimmed.replace(/[,%_]/g, (c) => `\\${c}`);
    const pattern = `%${escaped}%`;
    query = query.or(
      `name_ar.ilike.${pattern},name_en.ilike.${pattern},slug.ilike.${pattern}`
    );
  }

  const { data, count, error } = await query.range(from, from + perPage - 1);
  if (error) {
    console.error("[getActiveStoresPaginated]", error);
    return { stores: [], total: 0 };
  }
  return { stores: data ?? [], total: count ?? 0 };
}

// React `cache()` dedupes within a single request. Detail pages call this
// twice — once in `generateMetadata`, once in the page body — and each call
// previously hit Supabase. With cache(), the second call resolves from the
// per-request memo. Same for getCouponBySlug below.
//
// Uses createPublicClient (not createClient) so the detail route can be
// statically generated. See server.ts for why this matters.
export const getStoreBySlug = cache(async (slug: string): Promise<Store | null> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    console.error("[getStoreBySlug]", error);
    return null;
  }
  return data;
});

export async function getCouponsForStore(
  storeId: string
): Promise<FeaturedCoupon[]> {
  // createPublicClient — keeps the /stores/[slug] route statically generable.
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("coupons")
    .select(`*, store:stores ( id, slug, name_ar, logo_url )`)
    .eq("store_id", storeId)
    .eq("status", "active")
    .order("is_featured", { ascending: false })
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[getCouponsForStore]", error);
    return [];
  }
  return (data ?? []) as FeaturedCoupon[];
}

export const getCouponBySlug = cache(
  async (slug: string): Promise<CouponWithStore | null> => {
    // createPublicClient — keeps the /coupons/[slug] route statically generable.
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("coupons")
      .select(
        `*, store:stores ( id, slug, name_ar, name_en, logo_url, website_url )`
      )
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      console.error("[getCouponBySlug]", error);
      return null;
    }
    return data as CouponWithStore | null;
  }
);

/**
 * Returns the categories a given coupon is tagged under. Used by the coupon
 * detail page to render "تصفّح المزيد في {category}" cross-links — internal
 * link equity flows back into category landing pages instead of dead-ending
 * on the leaf coupon URL.
 *
 * Wrapped in `cache()` so calling from both `generateMetadata` and the page
 * body only hits Supabase once.
 */
export const getCategoriesForCoupon = cache(
  async (
    couponId: string
  ): Promise<{ id: string; slug: string; name_ar: string }[]> => {
    // createPublicClient — keeps the /coupons/[slug] route statically generable.
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("coupon_categories")
      .select("category:categories ( id, slug, name_ar )")
      .eq("coupon_id", couponId);

    if (error) {
      console.error("[getCategoriesForCoupon]", error);
      return [];
    }
    // Supabase returns the joined row as `category` (may be array or object
    // depending on the cardinality the planner inferred). Normalize to an
    // array of category objects.
    return (data ?? [])
      .flatMap((row) =>
        Array.isArray(row.category) ? row.category : row.category ? [row.category] : []
      )
      .filter((c): c is { id: string; slug: string; name_ar: string } => !!c?.slug);
  }
);

export async function getRelatedCoupons(
  storeId: string,
  excludeCouponId: string,
  limit = 4
): Promise<FeaturedCoupon[]> {
  // createPublicClient — keeps the /coupons/[slug] route statically generable.
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("coupons")
    .select(`*, store:stores ( id, slug, name_ar, logo_url )`)
    .eq("store_id", storeId)
    .eq("status", "active")
    .neq("id", excludeCouponId)
    .order("display_order", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[getRelatedCoupons]", error);
    return [];
  }
  return (data ?? []) as FeaturedCoupon[];
}

/**
 * Related stores for the store + coupon detail pages — surfaces OTHER active
 * stores that share a category with the anchor store (same shopping intent),
 * preferring the same country. Restores internal-link equity that otherwise
 * dead-ends on a leaf detail page.
 *
 * Strategy: 1) find the store's categories, 2) find peer stores tagged in any
 * of those categories, 3) fetch those stores (featured first). Falls back to
 * same-country active stores when the store has no category peers.
 *
 * createPublicClient — keeps /stores/[slug] + /coupons/[slug] statically
 * generable (no cookies → no forced dynamic rendering).
 */
export async function getRelatedStores(
  storeId: string,
  countryCode?: string | null,
  limit = 6
): Promise<Store[]> {
  const supabase = createPublicClient();

  async function fetchStores(restrictIds?: string[]): Promise<Store[]> {
    let q = supabase
      .from("stores")
      .select("*")
      .eq("status", "active")
      .neq("id", storeId)
      .order("is_featured", { ascending: false })
      .order("name_ar", { ascending: true })
      .limit(limit);
    if (restrictIds && restrictIds.length > 0) q = q.in("id", restrictIds);
    // Same country OR global (null country) stores only.
    if (countryCode) q = q.or(`country_code.eq.${countryCode},country_code.is.null`);

    const { data, error } = await q;
    if (error) {
      console.error("[getRelatedStores]", error);
      return [];
    }
    return (data ?? []) as Store[];
  }

  // 1. Categories this store is tagged in.
  const { data: cats } = await supabase
    .from("store_categories")
    .select("category_id")
    .eq("store_id", storeId);
  const categoryIds = [...new Set((cats ?? []).map((r) => r.category_id))];

  // 2. Peer stores sharing any of those categories.
  if (categoryIds.length > 0) {
    const { data: peers } = await supabase
      .from("store_categories")
      .select("store_id")
      .in("category_id", categoryIds)
      .neq("store_id", storeId);
    // Cap the id list so the .in() filter never blows past the ~16KB URL limit
    // (the same class of bug fixed in getCategoryCouponCounts). 150 UUIDs is
    // well under the limit and far more than the `limit` we render.
    const candidateIds = [...new Set((peers ?? []).map((r) => r.store_id))].slice(0, 150);
    if (candidateIds.length > 0) {
      const byCategory = await fetchStores(candidateIds);
      if (byCategory.length > 0) return byCategory;
    }
  }

  // 3. Fallback — same-country (or global) active stores, excluding self.
  return fetchStores();
}

/**
 * Top categories a store is tagged in — drives the category chips in the store
 * hero (doubles category interlinking per store page). Ordered by the
 * category's own display_order so the most prominent categories surface first.
 *
 * Wrapped in cache() — the store page may read it from multiple spots in one
 * request.
 */
export const getTopCategoriesForStore = cache(
  async (
    storeId: string,
    limit = 4
  ): Promise<{ id: string; slug: string; name_ar: string }[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("store_categories")
      .select("category:categories ( id, slug, name_ar, display_order )")
      .eq("store_id", storeId);

    if (error) {
      console.error("[getTopCategoriesForStore]", error);
      return [];
    }

    type CatRow = { id: string; slug: string; name_ar: string; display_order: number | null };
    const cats = (data ?? [])
      .flatMap((row) =>
        Array.isArray(row.category) ? row.category : row.category ? [row.category] : []
      )
      .filter((c): c is CatRow => !!c?.slug);

    cats.sort(
      (a, b) => (a.display_order ?? 9999) - (b.display_order ?? 9999)
    );

    return cats.slice(0, limit).map(({ id, slug, name_ar }) => ({ id, slug, name_ar }));
  }
);
