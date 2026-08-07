"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export type ReportResult =
  | { success: true }
  | { success: false; error: string };

// Cookie-based best-effort throttle.
// A determined attacker can clear cookies to bypass this — it deters casual
// spam only.  For stronger protection, replace with Cloudflare Turnstile /
// hCaptcha or per-IP edge rate limiting.
const THROTTLE_COOKIE = "cr_report_ts";
const THROTTLE_WINDOW_MS = 30_000; // 30 seconds

export async function submitCouponReport(
  formData: FormData
): Promise<ReportResult> {
  const issue_type = formData.get("issue_type") as string;
  const coupon_url = (formData.get("coupon_url") as string).trim() || null;
  const note = (formData.get("note") as string).trim() || null;

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
  if (!issue_type) {
    return { success: false, error: "يرجى تحديد نوع المشكلة." };
  }

  const validTypes = ["expired", "not_working", "incorrect", "other"];
  if (!validTypes.includes(issue_type)) {
    return { success: false, error: "نوع المشكلة غير صالح." };
  }

  if (coupon_url !== null) {
    if (coupon_url.length > 500) {
      return { success: false, error: "رابط الكوبون طويل جدًا (الحد الأقصى 500 حرف)." };
    }
    if (!coupon_url.startsWith("http://") && !coupon_url.startsWith("https://")) {
      return { success: false, error: "يجب أن يبدأ رابط الكوبون بـ http:// أو https://" };
    }
  }

  if (note !== null && note.length > 2000) {
    return { success: false, error: "الملاحظة طويلة جدًا (الحد الأقصى 2000 حرف)." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("coupon_reports").insert({
    issue_type,
    coupon_url,
    note,
  });

  if (error) {
    console.error("[submitCouponReport]", error);
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
