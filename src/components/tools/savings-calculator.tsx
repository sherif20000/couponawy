"use client";

import { useState, useMemo } from "react";

/**
 * Annual Coupon Savings Calculator — interactive widget for
 * /tools/savings-calculator.
 *
 * Models: التوفير السنوي = الإنفاق السنوي × متوسط نسبة الخصم × معدل تفعيل الكوبون
 *
 * Inputs:
 *   - الإنفاق الشهري (or السنوي via toggle)
 *   - متوسط نسبة الخصم (default 15%)
 *   - معدل تفعيل الكوبون (default 60%)
 *
 * Outputs:
 *   - التوفير السنوي بالريال
 *   - عدد الشهور المكافئة من الميزانية
 *   - مقارنة بسيناريو "بدون كوبون" (يعرض كم تخسر سنوياً)
 */

function fmt(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "—";
  return n.toLocaleString("ar-SA-u-nu-latn", {
    maximumFractionDigits: 0,
  });
}

export function SavingsCalculator() {
  const [periodMonthly, setPeriodMonthly] = useState(true);
  const [spend, setSpend] = useState<string>("3000"); // monthly default
  const [discount, setDiscount] = useState<string>("15");
  const [activation, setActivation] = useState<string>("60");

  const result = useMemo(() => {
    const s = parseFloat(spend);
    const d = parseFloat(discount);
    const a = parseFloat(activation);
    if (
      !Number.isFinite(s) ||
      !Number.isFinite(d) ||
      !Number.isFinite(a) ||
      s <= 0 ||
      d < 0 ||
      d > 100 ||
      a < 0 ||
      a > 100
    ) {
      return null;
    }
    const annualSpend = periodMonthly ? s * 12 : s;
    const savings = annualSpend * (d / 100) * (a / 100);
    // Equivalent months: how many months of spend the annual saving covers.
    const monthlySpend = annualSpend / 12;
    const equivMonths = monthlySpend > 0 ? savings / monthlySpend : 0;
    // Lost-without-coupons scenario: same discount × 100% activation (= full possible savings)
    const maxPossible = annualSpend * (d / 100);
    const leftOnTable = maxPossible - savings;
    return { annualSpend, savings, equivMonths, leftOnTable, maxPossible };
  }, [spend, discount, activation, periodMonthly]);

  return (
    <div className="bg-cream/40 border border-brand-gold/30 rounded-2xl p-6 md:p-8 space-y-6 my-8">
      {/* Period toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-charcoal">
          الإنفاق محسوب على:
        </span>
        <div
          className="flex gap-1 p-1 bg-charcoal/5 rounded-lg"
          role="tablist"
          aria-label="الفترة"
        >
          {(
            [
              { id: true, label: "شهرياً" },
              { id: false, label: "سنوياً" },
            ] as { id: boolean; label: string }[]
          ).map((opt) => (
            <button
              key={String(opt.id)}
              type="button"
              role="tab"
              aria-selected={periodMonthly === opt.id}
              onClick={() => setPeriodMonthly(opt.id)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                periodMonthly === opt.id
                  ? "bg-white text-charcoal shadow-sm"
                  : "text-warm-brown hover:text-charcoal"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field
          label={`الإنفاق ${periodMonthly ? "الشهري" : "السنوي"} (ريال)`}
          value={spend}
          onChange={setSpend}
          placeholder="3000"
        />
        <Field
          label="متوسط نسبة الخصم (%)"
          value={discount}
          onChange={setDiscount}
          placeholder="15"
          suffix="%"
          hint="افتراضي ١٥٪ للسوق السعودي"
        />
        <Field
          label="معدل تفعيل الكوبون (%)"
          value={activation}
          onChange={setActivation}
          placeholder="60"
          suffix="%"
          hint="كم مرّة فعلياً تستخدم كوبون من إجمالي مشترياتك"
        />
      </div>

      {/* Result */}
      <div className="bg-white border border-charcoal/10 rounded-xl p-5 space-y-4">
        <p className="text-xs font-medium text-warm-brown uppercase tracking-wide">
          توقّع التوفير السنوي
        </p>

        {result ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ResultStat
                label="التوفير السنوي"
                value={`${fmt(result.savings)} ريال`}
                emphasis="brand"
                size="lg"
              />
              <ResultStat
                label="ما يعادل من الميزانية"
                value={`${fmt(result.equivMonths * 4.3)} أسبوع`}
                helper={`(${fmt(result.equivMonths)} شهر)`}
              />
              <ResultStat
                label="إنفاقك السنوي"
                value={`${fmt(result.annualSpend)} ريال`}
              />
            </div>

            {result.leftOnTable > 50 && (
              <div className="border-t border-charcoal/10 pt-3 text-sm text-warm-brown">
                <p className="leading-relaxed">
                  لو رفعت معدّل تفعيل الكوبون إلى ١٠٠٪، تكسب{" "}
                  <strong className="text-charcoal" dir="ltr">
                    {fmt(result.leftOnTable)} ريال
                  </strong>{" "}
                  إضافية سنوياً (الحد الأقصى الممكن{" "}
                  <span dir="ltr">{fmt(result.maxPossible)}</span> ريال).
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-warm-brown/60">
            عبّئ الأرقام لمعرفة توفيرك السنوي.
          </p>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  suffix,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-charcoal mb-1.5">
        {label}
      </span>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          step="any"
          min={0}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-11 px-3 rounded-lg border border-charcoal/15 bg-white text-base font-medium text-charcoal placeholder:text-warm-brown/40 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
          dir="ltr"
        />
        {suffix && (
          <span className="absolute end-3 top-1/2 -translate-y-1/2 text-warm-brown text-sm pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {hint && <span className="block text-xs text-warm-brown/60 mt-1">{hint}</span>}
    </label>
  );
}

function ResultStat({
  label,
  value,
  helper,
  emphasis,
  size,
}: {
  label: string;
  value: string;
  helper?: string;
  emphasis?: "brand";
  size?: "lg";
}) {
  return (
    <div>
      <p className="text-xs text-warm-brown mb-0.5">{label}</p>
      <p
        className={`font-display font-semibold ${
          size === "lg" ? "text-2xl" : "text-lg"
        } ${emphasis === "brand" ? "text-brand-red" : "text-charcoal"}`}
        dir="ltr"
      >
        {value}
      </p>
      {helper && (
        <p className="text-xs text-warm-brown/70 mt-0.5" dir="ltr">
          {helper}
        </p>
      )}
    </div>
  );
}
