import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { getVisibleCouponIds } from "@/lib/queries/categories";

type Store = Database["public"]["Tables"]["stores"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type Coupon = Database["public"]["Tables"]["coupons"]["Row"];

export type FeaturedCoupon = Coupon & {
  store: Pick<Store, "id" | "slug" | "name_ar" | "logo_url"> | null;
};

export async function getFeaturedCoupons(limit = 8, countryCode?: string): Promise<FeaturedCoupon[]> {
  const supabase = await createClient();

  let baseQuery = supabase
    .from("coupons")
    .select(`*, store:stores ( id, slug, name_ar, logo_url )`)
    .eq("status", "active")
    .eq("is_featured", true)
    .order("display_order", { ascending: true })
    .limit(limit);

  if (countryCode) {
    const visibleIds = await getVisibleCouponIds(countryCode);
    if (visibleIds !== null) {
      if (visibleIds.length === 0) return [];
      baseQuery = baseQuery.in("id", visibleIds);
    }
  }

  const { data, error } = await baseQuery;
  if (error) {
    console.error("[getFeaturedCoupons]", error);
    return [];
  }
  return (data ?? []) as FeaturedCoupon[];
}

export async function getFeaturedStores(limit = 8): Promise<Store[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("status", "active")
    .eq("is_featured", true)
    .order("display_order", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[getFeaturedStores]", error);
    return [];
  }
  return data ?? [];
}

export async function getExpiringSoonCoupons(limit = 8, countryCode?: string): Promise<FeaturedCoupon[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  let baseQuery = supabase
    .from("coupons")
    .select(`*, store:stores ( id, slug, name_ar, logo_url )`)
    .eq("status", "active")
    .gte("expires_at", now)
    .lte("expires_at", sevenDays)
    .order("expires_at", { ascending: true })
    .limit(limit);

  if (countryCode) {
    const visibleIds = await getVisibleCouponIds(countryCode);
    if (visibleIds !== null) {
      if (visibleIds.length === 0) return [];
      baseQuery = baseQuery.in("id", visibleIds);
    }
  }

  const { data, error } = await baseQuery;
  if (error) {
    console.error("[getExpiringSoonCoupons]", error);
    return [];
  }
  return (data ?? []) as FeaturedCoupon[];
}

export async function getExclusiveCoupons(limit = 50): Promise<FeaturedCoupon[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .select(`*, store:stores ( id, slug, name_ar, logo_url )`)
    .eq("status", "active")
    .eq("is_exclusive", true)
    .order("is_featured", { ascending: false })
    .order("display_order", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[getExclusiveCoupons]", error);
    return [];
  }
  return (data ?? []) as FeaturedCoupon[];
}

export async function getDealsOfTheDay(limit = 50): Promise<FeaturedCoupon[]> {
  const supabase = await createClient();

  // KSA is UTC+3. Start of today in KSA = start of today UTC+3, expressed as UTC.
  const now = new Date();
  const ksaOffset = 3 * 60; // minutes
  const ksaNow = new Date(now.getTime() + ksaOffset * 60 * 1000);
  // Midnight KSA today
  const ksaMidnight = new Date(
    Date.UTC(ksaNow.getUTCFullYear(), ksaNow.getUTCMonth(), ksaNow.getUTCDate())
  );
  // Convert back to UTC for the DB query
  const startOfDayUTC = new Date(ksaMidnight.getTime() - ksaOffset * 60 * 1000);

  const { data, error } = await supabase
    .from("coupons")
    .select(`*, store:stores ( id, slug, name_ar, logo_url )`)
    .eq("status", "active")
    .gte("created_at", startOfDayUTC.toISOString())
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getDealsOfTheDay]", error);
    return [];
  }
  return (data ?? []) as FeaturedCoupon[];
}

export async function getTrendingCoupons(limit = 8, countryCode?: string): Promise<FeaturedCoupon[]> {
  const supabase = await createClient();

  let baseQuery = supabase
    .from("coupons")
    .select(`*, store:stores ( id, slug, name_ar, logo_url )`)
    .eq("status", "active")
    .gt("reveal_count", 0)
    .order("reveal_count", { ascending: false })
    .limit(limit);

  if (countryCode) {
    const visibleIds = await getVisibleCouponIds(countryCode);
    if (visibleIds !== null) {
      if (visibleIds.length === 0) return [];
      baseQuery = baseQuery.in("id", visibleIds);
    }
  }

  const { data, error } = await baseQuery;
  if (error) {
    console.error("[getTrendingCoupons]", error);
    return [];
  }
  return (data ?? []) as FeaturedCoupon[];
}

export async function getFeaturedCategories(limit = 10): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_featured", true)
    .order("display_order", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[getFeaturedCategories]", error);
    return [];
  }
  return data ?? [];
}
