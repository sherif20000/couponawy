"use client";

import { useState, useMemo, useEffect, useRef } from "react";

/**
 * Annual Coupon Savings Calculator — Bold Bazaar premium widget.
 * Model: التوفير السنوي = الإنفاق السنوي × متوسط نسبة الخصم × معدل التفعيل
 * Adds: sliding period capsule, family-preset chips, sliders, count-up hero,
 * and a "what-if" projection bar for the activation gap.
 */

// Latin digits via ar-SA-u-nu-latn — convention across the site.
function fmt(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "—";
  return n.toLocaleString("ar-SA-u-nu-latn", { maximumFractionDigits: 0 });
}

// rAF-driven count-up from previous value → target. Honors reduced-motion.
function useCountUp(target: number, duration = 500): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      fromRef.current = target;
      setValue(target);
      return;
    }
    const from = fromRef.current;
    const start = performance.now();
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      setValue(from + (target - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);
  return value;
}

const PRESETS: { id: string; label: string; value: number }[] = [
  { id: "single", label: "عازب", value: 1500 },
  { id: "couple", label: "زوجان", value: 2500 },
  { id: "family4", label: "عائلة من ٤", value: 4000 },
  { id: "family6", label: "عائلة من ٦+", value: 5500 },
];

export function SavingsCalculator() {
  const [periodMonthly, setPeriodMonthly] = useState(true);
  const [spend, setSpend] = useState<string>("3000");
  const [discount, setDiscount] = useState<string>("15");
  const [activation, setActivation] = useState<string>("60");

  const result = useMemo(() => {
    const s = parseFloat(spend);
    const d = parseFloat(discount);
    const a = parseFloat(activation);
    const valid =
      Number.isFinite(s) && Number.isFinite(d) && Number.isFinite(a) &&
      s > 0 && d >= 0 && d <= 100 && a >= 0 && a <= 100;
    if (!valid) return null;
    const annualSpend = periodMonthly ? s * 12 : s;
    const savings = annualSpend * (d / 100) * (a / 100);
    const weeklyBudget = annualSpend / 52;
    const equivWeeks = weeklyBudget > 0 ? savings / weeklyBudget : 0;
    const maxPossible = annualSpend * (d / 100);
    return { annualSpend, savings, equivWeeks, leftOnTable: maxPossible - savings, maxPossible };
  }, [spend, discount, activation, periodMonthly]);

  const savingsAnimated = useCountUp(result ? result.savings : 0);
  const weeksAnimated = useCountUp(result ? result.equivWeeks : 0);
  const leftOnTableAnimated = useCountUp(result ? result.leftOnTable : 0);
  const maxPossibleAnimated = useCountUp(result ? result.maxPossible : 0);

  const activationNum = parseFloat(activation);
  const activationPct = Number.isFinite(activationNum)
    ? Math.max(0, Math.min(100, activationNum))
    : 0;

  const presetActive = periodMonthly
    ? PRESETS.find((p) => p.value === parseFloat(spend))?.id ?? null
    : null;

  return (
    <div className="relative bg-cream border border-charcoal/10 rounded-3xl p-6 md:p-10 my-8 shadow-sm overflow-hidden">
      {/* Top gradient accent bar — visual signature of the Bold Bazaar theme */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-l from-brand-red to-brand-gold"
      />

      <div className="flex flex-col gap-6">
        {/* Period segmented control */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-display text-sm font-semibold text-charcoal">
            الإنفاق محسوب على:
          </span>
          <PeriodControl
            monthly={periodMonthly}
            onChange={setPeriodMonthly}
          />
        </div>

        {/* Family-size preset chips */}
        <div className="flex flex-col gap-2.5">
          <span className="font-body text-warm-brown text-xs">
            أو اختر ملف الأسرة بسرعة
          </span>
          <div className="flex flex-wrap gap-2" role="group" aria-label="ملفات الأسرة الجاهزة">
            {PRESETS.map((p) => {
              const active = presetActive === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setPeriodMonthly(true);
                    setSpend(String(p.value));
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-display font-semibold border transition-colors active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40 ${
                    active
                      ? "bg-brand-red text-white border-brand-red"
                      : "bg-cream-dark border-charcoal/10 text-charcoal/80 hover:text-charcoal hover:border-charcoal/25"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <RiyalField
            label={`الإنفاق ${periodMonthly ? "الشهري" : "السنوي"} (ريال)`}
            value={spend}
            onChange={setSpend}
            placeholder="3000"
            hint={
              periodMonthly
                ? "متوسط ما تنفقه على البقالة والخدمات شهرياً"
                : "إجمالي إنفاقك السنوي على المشتريات القابلة للتخفيض"
            }
          />
          <SliderField
            label="متوسط نسبة الخصم"
            value={discount}
            onChange={setDiscount}
            hint="افتراضي ١٥٪ للسوق السعودي"
          />
          <SliderField
            label="معدّل تفعيل الكوبون"
            value={activation}
            onChange={setActivation}
            hint="كم مرّة فعلياً تستخدم كوبون من مشترياتك"
          />
        </div>

        {/* Result hero */}
        <div
          className="relative bg-gradient-to-br from-brand-red/5 to-brand-gold/5 border border-brand-red/15 rounded-2xl p-6 md:p-8"
          aria-live="polite"
        >
          {result ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <span className="font-accent bg-brand-gold/20 text-charcoal text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md inline-block w-fit">
                  توفيرك السنوي المتوقّع
                </span>
                <div
                  className="font-display text-5xl md:text-7xl font-black text-brand-red tabular-nums leading-[1.05]"
                  dir="ltr"
                >
                  {fmt(savingsAnimated)}
                  <span className="text-3xl md:text-5xl font-extrabold align-baseline ms-2 text-brand-red/85">
                    ريال
                  </span>
                </div>
                <p className="font-body text-warm-brown text-sm md:text-base">
                  أي ما يعادل{" "}
                  <span
                    className="font-display text-charcoal font-bold tabular-nums"
                    dir="ltr"
                  >
                    {fmt(weeksAnimated)}
                  </span>{" "}
                  أسبوع من ميزانيتك
                </p>
              </div>

              {/* What-if projection card */}
              {result.leftOnTable > 50 && (
                <div className="bg-brand-gold/15 border border-brand-gold/40 rounded-xl p-4 md:p-5 flex flex-col gap-3">
                  <p className="font-display text-sm md:text-base text-charcoal leading-relaxed">
                    تكسب{" "}
                    <strong
                      className="font-display text-brand-red font-black tabular-nums"
                      dir="ltr"
                    >
                      {fmt(leftOnTableAnimated)} ريال
                    </strong>{" "}
                    إضافية لو رفعت تفعيلك لـ١٠٠٪
                  </p>
                  <div
                    className="relative h-2.5 w-full bg-cream-dark rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(activationPct)}
                    aria-label="معدّل التفعيل الحالي مقابل الحد الأقصى"
                  >
                    <div
                      className="absolute inset-y-0 end-0 bg-brand-gold transition-[width] duration-500 ease-out"
                      style={{ width: `${activationPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between font-body text-xs text-warm-brown">
                    <span dir="ltr">
                      الحد الأقصى: {fmt(maxPossibleAnimated)} ريال
                    </span>
                    <span dir="ltr">حالياً: {fmt(activationPct)}٪</span>
                  </div>
                </div>
              )}

              <p className="font-body text-warm-brown text-xs" dir="ltr">
                من إنفاق سنوي {fmt(result.annualSpend)} ريال
              </p>
            </div>
          ) : (
            <p className="font-body text-warm-brown text-sm">
              عبّئ الأرقام لمعرفة توفيرك السنوي.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Period segmented capsule with a sliding red indicator (CSS transform, no deps).
// RTL: monthly is the right slot, annually shifts left via translateX(-100%).
function PeriodControl({
  monthly,
  onChange,
}: {
  monthly: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="الفترة"
      className="relative inline-flex p-1 bg-cream-dark rounded-full border border-charcoal/10"
    >
      <span
        aria-hidden
        className="absolute top-1 bottom-1 right-1 w-[calc(50%-0.25rem)] rounded-full bg-brand-red shadow-sm transition-transform duration-300 ease-out"
        style={{ transform: monthly ? "translateX(0)" : "translateX(-100%)" }}
      />
      {[
        { id: true, label: "شهرياً" },
        { id: false, label: "سنوياً" },
      ].map((opt) => {
        const selected = monthly === opt.id;
        return (
          <button
            key={String(opt.id)}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(opt.id)}
            className={`relative z-10 px-5 py-1.5 rounded-full text-sm font-display font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40 ${
              selected ? "text-white" : "text-charcoal/70 hover:text-charcoal"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// Large plain number input for riyal amounts.
function RiyalField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-display text-sm font-semibold text-charcoal">
        {label}
      </label>
      <input
        type="number"
        inputMode="decimal"
        step="any"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir="ltr"
        className="w-full h-12 px-3 rounded-xl border border-charcoal/15 bg-white font-display text-lg font-bold text-charcoal tabular-nums placeholder:text-warm-brown-light placeholder:font-normal focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40 focus:border-brand-red transition-colors"
      />
      {hint && (
        <span className="font-body text-warm-brown text-xs leading-relaxed">
          {hint}
        </span>
      )}
    </div>
  );
}

// Paired number input + range slider, 0-100%. Both controls sync via `value`.
function SliderField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  const numeric = parseFloat(value);
  const safe = Number.isFinite(numeric)
    ? Math.max(0, Math.min(100, numeric))
    : 0;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <label className="font-display text-sm font-semibold text-charcoal">
          {label}
        </label>
        <div className="flex items-baseline gap-1">
          <input
            type="number"
            inputMode="decimal"
            step="1"
            min={0}
            max={100}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            dir="ltr"
            aria-label={`${label} - رقم`}
            className="w-16 h-9 px-2 text-end rounded-lg border border-charcoal/15 bg-white font-display text-base font-bold text-charcoal tabular-nums focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40 focus:border-brand-red transition-colors"
          />
          <span className="font-display text-base font-bold text-charcoal">
            %
          </span>
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={safe}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        dir="ltr"
        className="w-full h-2 bg-cream-dark rounded-full appearance-none cursor-pointer accent-brand-red focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-red [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand-red [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-grab"
      />
      {hint && (
        <span className="font-body text-warm-brown text-xs leading-relaxed">
          {hint}
        </span>
      )}
    </div>
  );
}
