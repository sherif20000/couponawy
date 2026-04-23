"use server";

import { createClient } from "@/lib/supabase/server";

export type ContactResult =
  | { success: true }
  | { success: false; error: string };

export async function submitContactMessage(
  formData: FormData
): Promise<ContactResult> {
  const name = (formData.get("name") as string).trim() || null;
  const subject = (formData.get("subject") as string).trim();
  const message = (formData.get("message") as string).trim();

  if (!subject) {
    return { success: false, error: "يرجى كتابة موضوع الرسالة." };
  }
  if (!message) {
    return { success: false, error: "يرجى كتابة رسالتك." };
  }
  if (message.length > 2000) {
    return { success: false, error: "الرسالة طويلة جداً (الحد الأقصى ٢٠٠٠ حرف)." };
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("contact_messages").insert({
    name,
    subject,
    message,
  });

  if (error) {
    console.error("[submitContactMessage]", error);
    return { success: false, error: "حدث خطأ أثناء الإرسال. حاول مرة أخرى." };
  }

  return { success: true };
}
