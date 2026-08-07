"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export type ContactResult =
  | { success: true }
  | { success: false; error: string };

// Cookie-based best-effort throttle.
// A determined attacker can clear cookies to bypass this — it deters casual
// spam only.  For stronger protection, replace with Cloudflare Turnstile /
// hCaptcha or per-IP edge rate limiting.
const THROTTLE_COOKIE = "cr_contact_ts";
const THROTTLE_WINDOW_MS = 30_000; // 30 seconds

export async function submitContactMessage(
  formData: FormData
): Promise<ContactResult> {
  const name = (formData.get("name") as string).trim() || null;
  const subject = (formData.get("subject") as string).trim();
  const message = (formData.get("message") as string).trim();

  // --- Throttle check ---
  const cookieStore = await cookies();
  const lastTs = cookieStore.get(THROTTLE_COOKIE)?.value;
  if (lastTs) {
    const elapsed = Date.now() - parseInt(lastTs, 10);
    if (elapsed < THROTTLE_WINDOW_MS) {
      return { success: false, error: "يرجى الانتظار لحظة قبل الإرسال مجددًا." };
    }
  }

  // --- Validation ---
  if (name !== null && name.length > 120) {
    return { success: false, error: "الاسم طويل جدًا (الحد الأقصى 120 حرفًا)." };
  }

  if (!subject) {
    return { success: false, error: "يرجى كتابة موضوع الرسالة." };
  }
  if (subject.length > 200) {
    return { success: false, error: "موضوع الرسالة طويل جدًا (الحد الأقصى 200 حرف)." };
  }

  if (!message) {
    return { success: false, error: "يرجى كتابة رسالتك." };
  }
  if (message.length > 5000) {
    return { success: false, error: "الرسالة طويلة جدًا (الحد الأقصى 5000 حرف)." };
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

  // Set throttle cookie after successful insert.
  cookieStore.set(THROTTLE_COOKIE, String(Date.now()), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60,
  });

  return { success: true };
}
