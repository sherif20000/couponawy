"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Database } from "@/types/database";

type CountryStatus = Database["public"]["Enums"]["country_status"];

export async function toggleCountryStatus(code: string, currentStatus: CountryStatus) {
  const supabase = createAdminClient();

  // Cycle: active → coming_soon → disabled → active
  const next: Record<CountryStatus, CountryStatus> = {
    active: "coming_soon",
    coming_soon: "disabled",
    disabled: "active",
  };

  const newStatus = next[currentStatus] ?? "active";

  const { error } = await supabase
    .from("countries")
    .update({ status: newStatus })
    .eq("code", code);

  if (error) console.error("[toggleCountryStatus]", error);
  revalidatePath("/admin/countries");
  revalidatePath("/");
}

export async function updateCountry(code: string, formData: FormData) {
  const supabase = createAdminClient();

  const name_ar = formData.get("name_ar") as string;
  const name_en = (formData.get("name_en") as string) || name_ar;
  const hreflang = (formData.get("hreflang") as string) || code.toLowerCase();
  const flag_emoji = (formData.get("flag_emoji") as string) || null;
  const currency = formData.get("currency") as string;
  const currency_symbol = formData.get("currency_symbol") as string;
  const status = ((formData.get("status") as string) || "coming_soon") as CountryStatus;
  const display_order = parseInt(formData.get("display_order") as string) || 0;

  const { error } = await supabase
    .from("countries")
    .update({ name_ar, name_en, hreflang, flag_emoji, currency, currency_symbol, status, display_order })
    .eq("code", code);

  if (error) {
    console.error("[updateCountry]", error);
    redirect(`/admin/countries/${code}/edit?error=1`);
  }
  revalidatePath("/admin/countries");
  revalidatePath("/");
  redirect("/admin/countries");
}

export async function deleteCountry(code: string) {
  const supabase = createAdminClient();

  const { error } = await supabase.from("countries").delete().eq("code", code);
  if (error) console.error("[deleteCountry]", error);

  revalidatePath("/admin/countries");
  revalidatePath("/");
}

export async function createCountry(formData: FormData) {
  const supabase = createAdminClient();

  const name_ar = formData.get("name_ar") as string;
  const name_en = (formData.get("name_en") as string) || name_ar;
  const code = formData.get("code") as string;
  const hreflang = (formData.get("hreflang") as string) || code.toLowerCase();
  const flag_emoji = (formData.get("flag_emoji") as string) || null;
  const currency = (formData.get("currency") as string) || "USD";
  const currency_symbol = (formData.get("currency_symbol") as string) || "$";
  const status = ((formData.get("status") as string) || "coming_soon") as CountryStatus;
  const display_order = parseInt(formData.get("display_order") as string) || 0;

  const { error } = await supabase.from("countries").insert({
    name_ar,
    name_en,
    code,
    hreflang,
    flag_emoji,
    currency,
    currency_symbol,
    status,
    display_order,
  });

  if (error) console.error("[createCountry]", error);
  revalidatePath("/admin/countries");
}
