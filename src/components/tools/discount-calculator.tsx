"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calculator } from "lucide-react";

// Discount Calculator — Bold Bazaar redesign.
// Three modes: percent (original+p→new), newPrice (original+new→p),
// original (new+p→original — reveals fake-anchor prices). Percent inputs are
// paired with a 0-100 range slider; preset chips above jump the percent in one
// tap. Result hero shows ONE big mode-dependent number with a count-up
// animation, a secondary caption, and a savings progress bar. Latin-digit
// display via toLocaleString(...-nu-latn) per site convention. No new deps.

type Mode = "percent" | "newPrice" | "original";
type Result = {
  newPrice: number;
  original: number;
  savings: number;
  percent: number;
};

const MODES: { id: Mode; label: string }[] = [
  { id: "percent", label: "احسب السعر بعد الخصم" },
  { id: "newPrice", label: "احسب نسبة الخصم" },
  { id: "original", label: "اكشف السعر الأصلي" },
];

const PRESETS = [10, 15, 20, 25, 30, 50, 70];
const PRESET_LABELS: Record<number, string> = {
  10: "١٠٪",
  15: "١٥٪",
  20: "٢٠٪",
  25: "٢٥٪",
  30: "٣٠٪",
  50: "٥٠٪",
  70: "٧٠٪",
};

function fmt(n: number | null, fractionDigits = 2): string {
  if (n === null || !Number.isFinite(n)) return "—";
  return n.toLocaleString("ar-SA-u-nu-latn", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: n % 1 === 0 ? 0 : Math.min(2, fractionDigits),
  });
}

// Animates a number from its previous value → target over `duration` ms using
// ease-out-quart. Honors prefers-reduced-motion by snapping straight to target.
function useCountUp(target: number | null, duration = 400): number | null {
  const [display, setDisplay] = useState<number | null>(target);
  const fromRef = useRef<number | null>(target);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (target === null || !Number.isFinite(target)) {
      setDisplay(null);
      fromRef.current = null;
      return;
    }
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const from = fromRef.current ?? target;
    if (reduced || from === target) {
      setDisplay(target);
      fromRef.current = target;
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      setDisplay(from + (target - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);
  return display;
}

export function DiscountCalculator() {
  const [mode, setMode] = useState<Mode>("percent");
  const [original, setOriginal] = useState("");
  const [percent, setPercent] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const result = useMemo<Result | null>(() => {
    const o = parseFloat(original),
      p = parseFloat(percent),
      n = parseFloat(newPrice);
    if (
      mode === "percent" &&
      Number.isFinite(o) &&
      Number.isFinite(p) &&
      o > 0 &&
      p >= 0 &&
      p <= 100
    ) {
      const newP = o * (1 - p / 100);
      return { newPrice: newP, savings: o - newP, percent: p, original: o };
    }
    if (
      mode === "newPrice" &&
      Number.isFinite(o) &&
      Number.isFinite(n) &&
      o > 0 &&
      n >= 0 &&
      n <= o
    ) {
      const s = o - n;
      return { newPrice: n, savings: s, percent: (s / o) * 100, original: o };
    }
    if (
      mode === "original" &&
      Number.isFinite(n) &&
      Number.isFinite(p) &&
      n > 0 &&
      p > 0 &&
      p < 100
    ) {
      const o2 = n / (1 - p / 100);
      return { newPrice: n, savings: o2 - n, percent: p, original: o2 };
    }
    return null;
  }, [mode, original, percent, newPrice]);

  const heroTarget = !result
    ? null
    : mode === "percent"
      ? result.newPrice
      : mode === "newPrice"
        ? result.percent
        : result.original;
  const animated = useCountUp(heroTarget);
  const savingsPct = result ? Math.min(100, Math.max(0, result.percent)) : 0;
  const modeIndex = MODES.findIndex((m) => m.id === mode);
  const percentNum = parseFloat(percent);
  const showPresets = mode === "percent" || mode === "original";
  const heroIsPct = mode === "newPrice";
  const heroDisplay = animated !== null ? fmt(animated, heroIsPct ? 1 : 2) : "";
  const heroSuffix = heroIsPct ? "٪" : "ريال";

  return (
    <div className="relative bg-cream border border-charcoal/10 rounded-3xl p-6 md:p-10 my-8 shadow-sm overflow-hidden">
      {/* Top accent: 1px gradient from brand-red to brand-gold */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-brand-red via-brand-red to-brand-gold"
      />

      <div className="flex flex-col gap-6">
        {/* Segmented mode control */}
        <div
          role="tablist"
          aria-label="نوع الحساب"
          className="relative flex w-full rounded-full bg-cream-dark border border-charcoal/10 p-1"
        >
          <div
            aria-hidden
            className="absolute top-1 bottom-1 rounded-full bg-brand-red shadow-sm transition-transform duration-300 ease-out"
            style={{
              width: "calc((100% - 0.5rem) / 3)",
              right: "0.25rem",
              transform: `translateX(${-modeIndex * 100}%)`,
            }}
          />
          {MODES.map((tab) => {
            const active = mode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls="discount-calc-result"
                onClick={() => setMode(tab.id)}
                className={`relative z-10 flex-1 min-w-0 px-2 sm:px-3 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40 ${active ? "text-white" : "text-charcoal/70 hover:text-charcoal"}`}
              >
                <span className="block truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Preset chip row — only when percent input is in scope */}
        {showPresets && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-body text-xs text-warm-brown ms-1">
              نسب شائعة:
            </span>
            {PRESETS.map((p) => {
              const active = Number.isFinite(percentNum) && percentNum === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPercent(String(p))}
                  aria-pressed={active}
                  className={`font-display rounded-full px-3 py-1 text-sm font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40 ${active ? "bg-brand-gold text-charcoal border border-brand-gold" : "bg-cream border border-charcoal/10 text-charcoal/80 hover:border-brand-red/30 hover:text-brand-red"}`}
                >
                  {PRESET_LABELS[p]}
                </button>
              );
            })}
          </div>
        )}

        {/* Inputs grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(mode === "percent" || mode === "newPrice") && (
            <RiyalField
              label="السعر الأصلي"
              hint="السعر قبل أي خصم"
              value={original}
              onChange={setOriginal}
              placeholder="٢٥٠"
            />
          )}
          {(mode === "newPrice" || mode === "original") && (
            <RiyalField
              label="السعر بعد الخصم"
              hint="السعر النهائي الذي ستدفعه"
              value={newPrice}
              onChange={setNewPrice}
              placeholder="١٨٧.٥"
            />
          )}
          {(mode === "percent" || mode === "original") && (
            <PercentField
              label="نسبة الخصم"
              hint="من ٠ إلى ١٠٠"
              value={percent}
              onChange={setPercent}
            />
          )}
        </div>

        {/* Result hero */}
        <div
          id="discount-calc-result"
          role="region"
          aria-live="polite"
          className="rounded-2xl border border-brand-red/15 bg-gradient-to-br from-brand-red/5 to-brand-gold/5 p-6 md:p-8"
        >
          {result && animated !== null ? (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <p className="font-accent text-eyebrow text-warm-brown">
                  النتيجة
                </p>
                <p
                  className="font-display font-black text-brand-red text-5xl md:text-6xl leading-tight tabular-nums"
                  dir="rtl"
                >
                  <span>{heroDisplay}</span>
                  <span className="text-3xl md:text-4xl font-extrabold text-brand-red/80 ms-2">
                    {heroSuffix}
                  </span>
                  <span className="sr-only">
                    {mode === "percent" &&
                      `السعر بعد الخصم ${heroDisplay} ريال، بنسبة خصم ${fmt(result.percent, 1)}٪`}
                    {mode === "newPrice" && `نسبة الخصم ${heroDisplay} بالمئة`}
                    {mode === "original" && `السعر الأصلي ${heroDisplay} ريال`}
                  </span>
                </p>
                <p className="font-body text-sm md:text-base text-charcoal/80 leading-relaxed">
                  {mode === "percent" && (
                    <>
                      وفّرت{" "}
                      <span className="font-display font-bold text-brand-red">
                        {fmt(result.savings)} ريال
                      </span>{" "}
                      <span className="text-warm-brown">
                        ({fmt(result.percent, 1)}٪)
                      </span>
                    </>
                  )}
                  {mode === "newPrice" && (
                    <>
                      أنت توفّر{" "}
                      <span className="font-display font-bold text-brand-red">
                        {fmt(result.savings)} ريال
                      </span>{" "}
                      على{" "}
                      <span className="font-display font-bold text-charcoal">
                        {fmt(result.original)} ريال
                      </span>
                    </>
                  )}
                  {mode === "original" && (
                    <>
                      السعر الأصلي قبل الخصم — قارنه مع{" "}
                      <span className="font-display font-bold text-brand-red">
                        {fmt(result.newPrice)} ريال
                      </span>
                    </>
                  )}
                </p>
              </div>

              {/* Savings progress bar */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-body text-warm-brown">
                  <span>نسبة التوفير من السعر الأصلي</span>
                  <span className="font-display font-bold text-charcoal tabular-nums">
                    {fmt(result.percent, 1)}٪
                  </span>
                </div>
                <div
                  className="h-2.5 w-full rounded-full bg-cream-dark overflow-hidden"
                  role="progressbar"
                  aria-valuenow={Math.round(savingsPct)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="نسبة التوفير"
                >
                  <div
                    className="h-full rounded-full bg-brand-red transition-[width] duration-500 ease-out"
                    style={{ width: `${savingsPct}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-red/10 text-brand-red">
                <Calculator className="h-6 w-6" aria-hidden />
              </div>
              <p className="font-body text-sm text-warm-brown">
                أدخل القيم لرؤية النتيجة
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Range slider styling — scoped via .dc-slider class on the inputs */}
      <style>{`
        .dc-slider{-webkit-appearance:none;appearance:none;background:transparent;width:100%}
        .dc-slider::-webkit-slider-runnable-track{height:6px;border-radius:9999px;background:var(--color-cream-dark);border:1px solid color-mix(in oklch,var(--color-charcoal) 8%,transparent)}
        .dc-slider::-moz-range-track{height:6px;border-radius:9999px;background:var(--color-cream-dark);border:1px solid color-mix(in oklch,var(--color-charcoal) 8%,transparent)}
        .dc-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;height:20px;width:20px;border-radius:9999px;background:var(--color-brand-red);border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.18);margin-top:-8px;cursor:pointer;transition:transform 150ms ease-out}
        .dc-slider::-moz-range-thumb{height:20px;width:20px;border-radius:9999px;background:var(--color-brand-red);border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.18);cursor:pointer}
        .dc-slider:focus-visible::-webkit-slider-thumb{outline:2px solid color-mix(in oklch,var(--color-brand-red) 40%,transparent);outline-offset:2px}
        .dc-slider:active::-webkit-slider-thumb{transform:scale(.95)}
      `}</style>
    </div>
  );
}

function RiyalField({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-body text-sm font-semibold text-charcoal">
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
          dir="ltr"
          className="font-display w-full h-12 ps-3 pe-16 rounded-xl border border-charcoal/15 bg-white text-lg font-bold text-charcoal tabular-nums placeholder:text-warm-brown-light placeholder:font-normal focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40 focus:border-brand-red transition-colors"
        />
        <span className="absolute end-3 top-1/2 -translate-y-1/2 font-body text-sm font-semibold text-warm-brown pointer-events-none">
          ريال
        </span>
      </div>
      {hint && (
        <span className="font-body text-xs text-warm-brown">{hint}</span>
      )}
    </label>
  );
}

function PercentField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const parsed = parseFloat(value);
  const sliderValue = Number.isFinite(parsed)
    ? Math.min(100, Math.max(0, parsed))
    : 0;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-body text-sm font-semibold text-charcoal">
          {label}
        </span>
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            step="any"
            min={0}
            max={100}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="٢٥"
            dir="ltr"
            aria-label={label}
            className="font-display w-28 h-12 ps-3 pe-9 rounded-xl border border-charcoal/15 bg-white text-lg font-bold text-charcoal tabular-nums text-end placeholder:text-warm-brown-light placeholder:font-normal focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40 focus:border-brand-red transition-colors"
          />
          <span className="absolute end-3 top-1/2 -translate-y-1/2 font-body text-sm font-semibold text-warm-brown pointer-events-none">
            ٪
          </span>
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={sliderValue}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="dc-slider focus-visible:outline-none"
      />
      {hint && (
        <span className="font-body text-xs text-warm-brown">{hint}</span>
      )}
    </div>
  );
}
