"use client";

import { useState, useMemo } from "react";

/**
 * Discount Calculator — the interactive widget that sits above the editorial
 * explainer on /tools/discount-calculator.
 *
 * Three input modes:
 *   - السعر الأصلي + نسبة الخصم   → السعر بعد الخصم + قيمة التوفير
 *   - السعر الأصلي + السعر بعد الخصم → نسبة الخصم
 *   - السعر بعد الخصم + نسبة الخصم → السعر الأصلي (لكشف التضخيم في السعر "الأصلي")
 *
 * All inputs are clamped to safe positive numbers. Empty inputs render
 * placeholder dashes (not zeros) so the user knows the calc hasn't run yet.
 *
 * No external state — pure client component, instant client-side compute.
 * Listed last in `revalidate = false` static page so the calculator hydrates
 * fast without server roundtrip.
 */

type Mode = "percent" | "newPrice" | "original";

function fmt(n: number | null): string {
  if (n === null || !Number.isFinite(n)) return "—";
  return n.toLocaleString("ar-SA-u-nu-latn", {
    maximumFractionDigits: 2,
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
  });
}

export function DiscountCalculator() {
  const [mode, setMode] = useState<Mode>("percent");
  const [original, setOriginal] = useState<string>("");
  const [percent, setPercent] = useState<string>("");
  const [newPrice, setNewPrice] = useState<string>("");

  const result = useMemo(() => {
    const o = parseFloat(original);
    const p = parseFloat(percent);
    const n = parseFloat(newPrice);

    if (mode === "percent") {
      // Need o + p → compute newPrice + savings
      if (Number.isFinite(o) && Number.isFinite(p) && o > 0 && p >= 0 && p <= 100) {
        const newP = o * (1 - p / 100);
        const savings = o - newP;
        return { newPrice: newP, savings, percent: p, original: o };
      }
    } else if (mode === "newPrice") {
      // Need o + n → compute percent
      if (Number.isFinite(o) && Number.isFinite(n) && o > 0 && n >= 0 && n <= o) {
        const savings = o - n;
        const pct = (savings / o) * 100;
        return { newPrice: n, savings, percent: pct, original: o };
      }
    } else if (mode === "original") {
      // Need n + p → compute original
      if (Number.isFinite(n) && Number.isFinite(p) && n > 0 && p > 0 && p < 100) {
        const o2 = n / (1 - p / 100);
        const savings = o2 - n;
        return { newPrice: n, savings, percent: p, original: o2 };
      }
    }
    return null;
  }, [mode, original, percent, newPrice]);

  return (
    <div className="bg-cream/40 border border-brand-gold/30 rounded-2xl p-6 md:p-8 space-y-6 my-8">
      {/* Mode tabs */}
      <div
        className="flex flex-wrap gap-1.5 p-1 bg-charcoal/5 rounded-lg"
        role="tablist"
        aria-label="نوع الحساب"
      >
        {(
          [
            { id: "percent", label: "احسب السعر بعد الخصم" },
            { id: "newPrice", label: "احسب نسبة الخصم" },
            { id: "original", label: "اكشف السعر الأصلي" },
          ] as { id: Mode; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={mode === tab.id}
            onClick={() => setMode(tab.id)}
            className={`flex-1 min-w-[160px] px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === tab.id
                ? "bg-white text-charcoal shadow-sm"
                : "text-warm-brown hover:text-charcoal"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(mode === "percent" || mode === "newPrice") && (
          <Field
            label="السعر الأصلي (ريال)"
            value={original}
            onChange={setOriginal}
            placeholder="مثال: 250"
          />
        )}
        {(mode === "percent" || mode === "original") && (
          <Field
            label="نسبة الخصم (%)"
            value={percent}
            onChange={setPercent}
            placeholder="مثال: 25"
            suffix="%"
          />
        )}
        {(mode === "newPrice" || mode === "original") && (
          <Field
            label="السعر بعد الخصم (ريال)"
            value={newPrice}
            onChange={setNewPrice}
            placeholder="مثال: 187.5"
          />
        )}
      </div>

      {/* Result */}
      <div className="bg-white border border-charcoal/10 rounded-xl p-5 space-y-3">
        <p className="text-xs font-medium text-warm-brown uppercase tracking-wide">
          النتيجة
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ResultStat
            label="السعر الأصلي"
            value={result ? `${fmt(result.original)} ريال` : "—"}
          />
          <ResultStat
            label="السعر بعد الخصم"
            value={result ? `${fmt(result.newPrice)} ريال` : "—"}
            emphasis="brand"
          />
          <ResultStat
            label="قيمة التوفير"
            value={
              result
                ? `${fmt(result.savings)} ريال (${fmt(result.percent)}%)`
                : "—"
            }
          />
        </div>
        {!result && (
          <p className="text-xs text-warm-brown/60 pt-1">
            أدخل القيم لرؤية النتيجة فوراً.
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: string;
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
    </label>
  );
}

function ResultStat({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: "brand";
}) {
  return (
    <div>
      <p className="text-xs text-warm-brown mb-0.5">{label}</p>
      <p
        className={`text-lg font-display font-semibold ${
          emphasis === "brand" ? "text-brand-red" : "text-charcoal"
        }`}
        dir="ltr"
      >
        {value}
      </p>
    </div>
  );
}
