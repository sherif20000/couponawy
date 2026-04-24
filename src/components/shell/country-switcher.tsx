"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Globe, ChevronDown, Check } from "lucide-react";
import { setPreferredCountry } from "@/app/actions/set-country";
import type { ActiveCountry } from "@/lib/queries/countries";

interface Props {
  countries: ActiveCountry[];
  currentCode: string;
}

export function CountrySwitcher({ countries, currentCode }: Props) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const router = useRouter();
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const current = countries.find((c) => c.code === currentCode) ?? countries[0];

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !menuRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function handleSelect(code: string) {
    if (code === currentCode || pending) return;
    setPending(true);
    setOpen(false);
    await setPreferredCountry(code);
    router.refresh();
    setPending(false);
  }

  if (!current) return null;

  return (
    <div className="relative hidden md:block">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="اختيار الدولة"
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-2 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/22 disabled:opacity-60"
      >
        {current.flag_emoji ? (
          <span aria-hidden className="text-base leading-none">
            {current.flag_emoji}
          </span>
        ) : (
          <Globe className="h-4 w-4" aria-hidden />
        )}
        <span className="font-accent">{current.name_ar}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "-rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="listbox"
          aria-label="اختيار الدولة"
          className="border-brand-gold/20 absolute top-full mt-2 min-w-[10rem] overflow-hidden rounded-xl border bg-cream shadow-lg"
          style={{ insetInlineEnd: 0 }}
        >
          {countries.map((country) => (
            <button
              key={country.code}
              role="option"
              aria-selected={country.code === currentCode}
              type="button"
              onClick={() => handleSelect(country.code)}
              className={`font-body flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                country.code === currentCode
                  ? "bg-brand-red/5 text-brand-red font-semibold"
                  : "text-charcoal hover:bg-cream-dark/60"
              }`}
            >
              {country.flag_emoji && (
                <span aria-hidden className="text-base leading-none">
                  {country.flag_emoji}
                </span>
              )}
              <span className="flex-1 text-right">{country.name_ar}</span>
              {country.code === currentCode && (
                <Check className="text-brand-red h-3.5 w-3.5 shrink-0" aria-hidden />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
