"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Globe, ChevronDown, Check } from "lucide-react";
import { setPreferredCountry } from "@/app/actions/set-country";
import { readPreferredCountryFromCookie } from "@/lib/utils/country-client";
import { DEFAULT_COUNTRY } from "@/app/actions/country-constants";
import type { ActiveCountry } from "@/lib/queries/countries";

interface Props {
  countries: ActiveCountry[];
  /**
   * Optional initial country code (e.g. when called from a server context
   * that already has the cookie). When omitted, falls back to
   * DEFAULT_COUNTRY for the initial render then reads document.cookie in
   * a useEffect post-mount. The cookie-read pattern is what lets the
   * parent server tree stay static — see country-client.ts.
   */
  currentCode?: string;
}

export function CountrySwitcher({ countries, currentCode }: Props) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  // Initial value: prop if supplied (legacy server-provided), else default.
  // useEffect below upgrades to the real cookie value once mounted.
  const [code, setCode] = React.useState<string>(
    currentCode ?? DEFAULT_COUNTRY,
  );
  const router = useRouter();
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Read the country cookie client-side. Runs once on mount. Server cannot
  // read cookies here without forcing dynamic rendering on the parent —
  // see Bug #4a v3 in the PROJECT_MAP.
  React.useEffect(() => {
    setCode(readPreferredCountryFromCookie());
  }, []);

  const current = countries.find((c) => c.code === code) ?? countries[0];

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

  async function handleSelect(newCode: string) {
    if (newCode === code || pending) return;
    setPending(true);
    setOpen(false);
    await setPreferredCountry(newCode);
    // Update local state immediately so the indicator flips without waiting
    // for the round-trip; router.refresh() then refetches any list pages
    // that filter by country.
    setCode(newCode);
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
              aria-selected={country.code === code}
              type="button"
              onClick={() => handleSelect(country.code)}
              className={`font-body flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                country.code === code
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
              {country.code === code && (
                <Check
                  className="text-brand-red h-3.5 w-3.5 shrink-0"
                  aria-hidden
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
