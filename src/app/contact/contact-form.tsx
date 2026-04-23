"use client";

import { useState, useRef } from "react";
import { submitContactMessage } from "./actions";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function ContactForm() {
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
    const result = await submitContactMessage(formData);

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
          وصلتنا رسالتك!
        </p>
        <p className="font-body text-warm-brown text-sm">
          شكراً للتواصل — سنرد عليك في أقرب وقت ممكن.
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="font-body text-brand-red hover:text-brand-red-dark mt-2 text-sm font-semibold transition-colors"
        >
          إرسال رسالة أخرى
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-5"
      noValidate
    >
      {/* Name (optional) */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="name"
          className="font-display text-charcoal text-sm font-bold"
        >
          الاسم{" "}
          <span className="font-body text-warm-brown font-normal">(اختياري)</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="اسمك"
          className="border-brand-gold/30 bg-cream font-body text-charcoal placeholder:text-warm-brown/50 focus:border-brand-red focus:ring-brand-red/20 rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2"
        />
      </div>

      {/* Subject */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="subject"
          className="font-display text-charcoal text-sm font-bold"
        >
          الموضوع <span className="text-brand-red">*</span>
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          placeholder="موضوع رسالتك"
          className="border-brand-gold/30 bg-cream font-body text-charcoal placeholder:text-warm-brown/50 focus:border-brand-red focus:ring-brand-red/20 rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2"
        />
      </div>

      {/* Message */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="message"
          className="font-display text-charcoal text-sm font-bold"
        >
          الرسالة <span className="text-brand-red">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder="اكتب رسالتك هنا..."
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
        {state === "loading" ? "جاري الإرسال..." : "إرسال الرسالة"}
      </button>
    </form>
  );
}
