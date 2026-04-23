import { createAdminClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type ActiveCountry = Pick<
  Database["public"]["Tables"]["countries"]["Row"],
  "code" | "name_ar" | "flag_emoji" | "display_order"
>;

export async function getActiveCountries(): Promise<ActiveCountry[]> {
  // Uses admin client so this works in server components and layouts
  // without needing a request-scoped cookie-based client.
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("countries")
    .select("code, name_ar, flag_emoji, display_order")
    .eq("status", "active")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[getActiveCountries]", error);
    return [];
  }
  return data ?? [];
}
