"use server";

import { createClient } from "@/lib/supabase/server";

export type ReportResult =
  | { success: true }
  | { success: false; error: string };

export async function submitCouponReport(
  formData: FormData
): Promise<ReportResult> {
  const issue_type = formData.get("issue_type") as string;
  const coupon_url = (formData.get("coupon_url") as string).trim() || null;
  const note = (formData.get("note") as string).trim() || null;

  if (!issue_type) {
    return { success: false, error: "يرجى تحديد نوع المشكلة." };
  }

  const validTypes = ["expired", "not_working", "incorrect", "other"];
  if (!validTypes.includes(issue_type)) {
    return { success: false, error: "نوع المشكلة غير صالح." };
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

  return { success: true };
}
