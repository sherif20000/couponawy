import { createClient, createAdminClient } from "@/lib/supabase/server";
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

// Used only in generateStaticParams — runs at build time without a request context,
// so we use the admin client (no cookies dependency) instead of the server client.
export async function getAllStoreSlugsBuildTime(): Promise<{ slug: string }[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("stores")
    .select("slug")
    .eq("status", "active");

  if (error) {
    console.error("[getAllStoreSlugsBuildTime]", error);
    return [];
  }
  return data ?? [];
}

export async function getAllCouponSlugsBuildTime(): Promise<{ slug: string }[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("slug")
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
  countryCode?: string
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

  const { data, count, error } = await query.range(from, from + perPage - 1);
  if (error) {
    console.error("[getActiveStoresPaginated]", error);
    return { stores: [], total: 0 };
  }
  return { stores: data ?? [], total: count ?? 0 };
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  const supabase = await createClient();
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
}

export async function getCouponsForStore(
  storeId: string
): Promise<FeaturedCoupon[]> {
  const supabase = await createClient();
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

export async function getCouponBySlug(
  slug: string
): Promise<CouponWithStore | null> {
  const supabase = await createClient();
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

export async function getRelatedCoupons(
  storeId: string,
  excludeCouponId: string,
  limit = 4
): Promise<FeaturedCoupon[]> {
  const supabase = await createClient();
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
