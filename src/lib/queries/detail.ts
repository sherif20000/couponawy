import { cache } from "react";
import {
  createClient,
  createAdminClient,
  createPublicClient,
} from "@/lib/supabase/server";
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
  const supabase = await createClient();
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
  const supabase = await createClient();
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
