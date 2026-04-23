import { createAdminClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type CouponStatus = Database["public"]["Enums"]["coupon_status"];

export async function getAdminStats() {
  const supabase = createAdminClient();
  const [
    coupons,
    stores,
    categories,
    reveals,
    activeCoupons,
    activeStores,
    reports,
    messages,
  ] = await Promise.all([
    supabase.from("coupons").select("id", { count: "exact", head: true }),
    supabase.from("stores").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("reveals").select("id", { count: "exact", head: true }),
    supabase
      .from("coupons")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("stores")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("coupon_reports")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true }),
  ]);

  return {
    totalCoupons: coupons.count ?? 0,
    totalStores: stores.count ?? 0,
    totalCategories: categories.count ?? 0,
    totalReveals: reveals.count ?? 0,
    activeCoupons: activeCoupons.count ?? 0,
    activeStores: activeStores.count ?? 0,
    totalReports: reports.count ?? 0,
    totalMessages: messages.count ?? 0,
  };
}

export async function getAdminStores(page = 1, search = "") {
  const supabase = createAdminClient();
  const perPage = 20;
  const from = (page - 1) * perPage;

  let query = supabase
    .from("stores")
    .select("id, slug, name_ar, name_en, status, is_featured, logo_url, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);

  if (search) {
    query = query.or(`name_ar.ilike.%${search}%,name_en.ilike.%${search}%`);
  }

  const { data, count, error } = await query;
  if (error) console.error("[getAdminStores]", error);
  return { stores: data ?? [], total: count ?? 0, page, perPage };
}

export async function getAdminCoupons(
  page = 1,
  search = "",
  storeId = "",
  status = ""
) {
  const supabase = createAdminClient();
  const perPage = 20;
  const from = (page - 1) * perPage;

  let query = supabase
    .from("coupons")
    .select(
      "id, slug, title_ar, discount_display, status, expires_at, reveal_count, is_featured, store:stores(id, name_ar)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);

  if (search) {
    query = query.ilike("title_ar", `%${search}%`);
  }
  if (storeId) {
    query = query.eq("store_id", storeId);
  }
  if (status) {
    query = query.eq("status", status as CouponStatus);
  }

  const { data, count, error } = await query;
  if (error) console.error("[getAdminCoupons]", error);
  return { coupons: data ?? [], total: count ?? 0, page, perPage };
}

export async function getAdminCategories() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) console.error("[getAdminCategories]", error);
  return data ?? [];
}

export async function getAdminCountries() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("countries")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) console.error("[getAdminCountries]", error);
  return data ?? [];
}

export async function getStoreById(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("id", id)
    .single();
  if (error) console.error("[getStoreById]", error);
  return data;
}

export async function getCouponById(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("id", id)
    .single();
  if (error) console.error("[getCouponById]", error);
  return data;
}

export async function getStoresForSelect() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("stores")
    .select("id, name_ar")
    .eq("status", "active")
    .order("name_ar", { ascending: true });
  if (error) console.error("[getStoresForSelect]", error);
  return data ?? [];
}

export async function getRecentCoupons(limit = 5) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("coupons")
    .select("id, title_ar, status, created_at, store:stores(name_ar)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getTopStores(limit = 5) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("stores")
    .select("id, name_ar, logo_url, status")
    .eq("status", "active")
    .order("display_order", { ascending: true })
    .limit(limit);
  return data ?? [];
}

export async function getCategoryById(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();
  if (error) console.error("[getCategoryById]", error);
  return data;
}

export async function getCountryByCode(code: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("countries")
    .select("*")
    .eq("code", code)
    .single();
  if (error) console.error("[getCountryByCode]", error);
  return data;
}

export type CouponReport = {
  id: string;
  issue_type: string;
  coupon_url: string | null;
  note: string | null;
  created_at: string;
};

export async function getCouponReports(page = 1): Promise<{
  reports: CouponReport[];
  total: number;
  page: number;
  perPage: number;
}> {
  const supabase = createAdminClient();
  const perPage = 30;
  const from = (page - 1) * perPage;

  const { data, count, error } = await supabase
    .from("coupon_reports")
    .select("id, issue_type, coupon_url, note, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);

  if (error) console.error("[getCouponReports]", error);
  return { reports: data ?? [], total: count ?? 0, page, perPage };
}

export type ContactMessage = {
  id: string;
  name: string | null;
  subject: string | null;
  message: string;
  created_at: string;
};

export async function getContactMessages(page = 1): Promise<{
  messages: ContactMessage[];
  total: number;
  page: number;
  perPage: number;
}> {
  const supabase = createAdminClient();
  const perPage = 30;
  const from = (page - 1) * perPage;

  const { data, count, error } = await supabase
    .from("contact_messages")
    .select("id, name, subject, message, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);

  if (error) console.error("[getContactMessages]", error);
  return { messages: data ?? [], total: count ?? 0, page, perPage };
}
