"use client";

import { useState, useRef } from "react";
import { submitCouponReport } from "./actions";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const ISSUE_TYPES = [
  { value: "expired", label: "الكوبون منتهي الصلاحية" },
  { value: "not_working", label: "الكوبون لا يعمل" },
  { value: "incorrect", label: "معلومات غير صحيحة" },
  { value: "other", label: "مشكلة أخرى" },
];

export function ReportForm({ defaultUrl }: { defaultUrl?: string }) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const result = await submitCouponReport(formData);

    if (result.success) {
      setState("success");
      formRef.current?.reset();
    } else {
      setState("error");
      setErrorMessage(result.error);
    }
  }

  if (state === "success") {
    return (
      <div className="border-success/20 bg-success/5 flex flex-col items-center gap-3 rounded-2xl border p-8 text-center">
        <CheckCircle2 className="text-success h-10 w-10" strokeWidth={1.5} />
        <p className="font-display text-charcoal text-lg font-bold">
          شكراً لمساهمتك!
        </p>
        <p className="font-body text-warm-brown text-sm">
          تم إرسال تقريرك. سنتحقق من الكوبون ونصلح المشكلة في أقرب وقت.
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="font-body text-brand-red hover:text-brand-red-dark mt-2 text-sm font-semibold transition-colors"
        >
          الإبلاغ عن كوبون آخر
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
      noValidate
    >
      {/* Issue type */}
      <fieldset>
        <legend className="font-display text-charcoal mb-3 text-sm font-bold">
          ما المشكلة؟ <span className="text-brand-red">*</span>
        </legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ISSUE_TYPES.map(({ value, label }) => (
            <label
              key={value}
              className="border-brand-gold/25 bg-cream has-[:checked]:border-brand-red has-[:checked]:bg-brand-red/5 flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all"
            >
              <input
                type="radio"
                name="issue_type"
                value={value}
                required
                className="accent-brand-red h-4 w-4 shrink-0"
              />
              <span className="font-body text-charcoal text-sm">{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Coupon URL (optional) */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="coupon_url"
          className="font-display text-charcoal text-sm font-bold"
        >
          رابط الكوبون أو كوده{" "}
          <span className="font-body text-warm-brown font-normal">
            (اختياري)
          </span>
        </label>
        <input
          id="coupon_url"
          name="coupon_url"
          type="text"
          dir="ltr"
          defaultValue={defaultUrl ?? ""}
          placeholder="https://couponawy.com/... أو كود الخصم"
          className="border-brand-gold/30 bg-cream font-body text-charcoal placeholder:text-warm-brown/50 focus:border-brand-red focus:ring-brand-red/20 rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2"
        />
      </div>

      {/* Note (optional) */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="note"
          className="font-display text-charcoal text-sm font-bold"
        >
          ملاحظة إضافية{" "}
          <span className="font-body text-warm-brown font-normal">
            (اختياري)
          </span>
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          placeholder="أي تفاصيل تساعدنا في التحقق من المشكلة..."
          className="border-brand-gold/30 bg-cream font-body text-charcoal placeholder:text-warm-brown/50 focus:border-brand-red focus:ring-brand-red/20 resize-none rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2"
        />
      </div>

      {/* Error banner */}
      {state === "error" && errorMessage && (
        <div className="border-danger/20 bg-danger/5 text-danger flex items-center gap-2 rounded-xl border px-4 py-3 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          {errorMessage}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={state === "loading"}
        className="bg-brand-red hover:bg-brand-red-dark active:scale-[0.98] font-body inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-sm font-semibold text-cream transition-all disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === "loading" && (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        )}
        {state === "loading" ? "جاري الإرسال..." : "إرسال التقرير"}
      </button>
    </form>
  );
}
