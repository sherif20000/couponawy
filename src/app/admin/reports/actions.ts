"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteReport(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("coupon_reports")
    .delete()
    .eq("id", id);
  if (error) console.error("[deleteReport]", error);
  revalidatePath("/admin/reports");
}
