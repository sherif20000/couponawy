import { createPublicClient } from "@/lib/supabase/server";
import type { FeaturedCoupon } from "@/lib/queries/homepage";
import type { Database } from "@/types/database";

type Store = Database["public"]["Tables"]["stores"]["Row"];

export type SearchResults = {
  coupons: FeaturedCoupon[];
  stores: Store[];
};

export async function searchCoupons(query: string): Promise<FeaturedCoupon[]> {
  if (!query.trim()) return [];
  const supabase = createPublicClient();

  // Escape PostgREST reserved chars (,) and LIKE wildcards (%, _) so user
  // input is always treated as a literal string — same pattern as detail.ts /
  // admin.ts (getStaleCoupons / getActiveStoresPaginated).
  const escaped = query.trim().replace(/[,%_]/g, (c) => `\\${c}`);
  const pattern = `%${escaped}%`;

  const { data, error } = await supabase
    .from("coupons")
    .select(`*, store:stores ( id, slug, name_ar, logo_url )`)
    .eq("status", "active")
    .or(`title_ar.ilike.${pattern},description_ar.ilike.${pattern}`)
    .order("is_featured", { ascending: false })
    .order("display_order", { ascending: true })
    .limit(24);

  if (error) {
    console.error("[searchCoupons]", error);
    return [];
  }
  return (data ?? []) as FeaturedCoupon[];
}

export async function searchStores(query: string): Promise<Store[]> {
  if (!query.trim()) return [];
  const supabase = createPublicClient();

  // Escape PostgREST reserved chars (,) and LIKE wildcards (%, _) — same
  // pattern as getActiveStoresPaginated in detail.ts.
  const escaped = query.trim().replace(/[,%_]/g, (c) => `\\${c}`);
  const pattern = `%${escaped}%`;

  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("status", "active")
    .or(`name_ar.ilike.${pattern},name_en.ilike.${pattern}`)
    .order("is_featured", { ascending: false })
    .order("name_ar", { ascending: true })
    .limit(8);

  if (error) {
    console.error("[searchStores]", error);
    return [];
  }
  return data ?? [];
}
