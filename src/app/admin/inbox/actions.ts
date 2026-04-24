"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteMessage(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("contact_messages")
    .delete()
    .eq("id", id);
  if (error) console.error("[deleteMessage]", error);
  revalidatePath("/admin/inbox");
}
