import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Store = Database["public"]["Tables"]["stores"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type Coupon = Database["public"]["Tables"]["coupons"]["Row"];

export type FeaturedCoupon = Coupon & {
  store: Pick<Store, "id" | "slug" | "name_ar" | "logo_url"> | null;
};

export async function getFeaturedCoupons(limit = 8): Promise<FeaturedCoupon[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .select(
      `*, store:stores ( id, slug, name_ar, logo_url )`
    )
    .eq("status", "active")
    .eq("is_featured", true)
    .order("display_order", { ascending: true })
    .limit(limit);

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
