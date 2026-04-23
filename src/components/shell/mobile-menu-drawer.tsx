"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search, Globe, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { setPreferredCountry } from "@/app/actions/set-country";
import type { ActiveCountry } from "@/lib/queries/countries";

const NAV_LINKS = [
  { href: "/stores", label: "المتاجر" },
  { href: "/categories", label: "الأقسام" },
  { href: "/coupons", label: "الكوبونات" },
];

interface Props {
  countries?: ActiveCountry[];
  currentCode?: string;
}

export function MobileMenuDrawer({ countries = [], currentCode = "SA" }: Props) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [countryPending, setCountryPending] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = React.useRef<HTMLInputElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const wasOpenRef = React.useRef(false);

  // Close on route change
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock scroll when open; focus search input on open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const t = setTimeout(() => searchRef.current?.focus(), 150);
      return () => {
        clearTimeout(t);
        document.body.style.overflow = "";
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  // Return focus to trigger when drawer closes
  React.useEffect(() => {
    if (!open && wasOpenRef.current) {
      const t = setTimeout(() => triggerRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    wasOpenRef.current = open;
  }, [open]);

  // Close on Escape + focus trap inside drawer
  React.useEffect(() => {
    if (!open) return;

    const FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';
    function getFocusable() {
      const drawer = document.getElementById("mobile-nav");
      return drawer ? Array.from(drawer.querySelectorAll<HTMLElement>(FOCUSABLE)) : [];
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key === "Tab") {
        const focusable = getFocusable();
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchValue.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setOpen(false);
  }

  async function handleCountrySelect(code: string) {
    if (code === currentCode || countryPending) return;
    setCountryPending(true);
    await setPreferredCountry(code);
    router.refresh();
    setCountryPending(false);
  }

  return (
    <>
      {/* Hamburger trigger — only visible on mobile */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="border-brand-gold/30 bg-cream-dark/40 text-charcoal hover:border-brand-red/40 inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors md:hidden"
        aria-label="فتح القائمة"
        aria-expanded={open}
        aria-controls="mobile-nav"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden
      />

      {/* Drawer panel — slides in from the right (RTL start side) */}
      <div
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="قائمة التنقّل"
        className={`fixed top-0 right-0 z-50 flex h-full w-80 max-w-[85vw] flex-col bg-cream shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="border-brand-gold/20 flex items-center justify-between border-b px-5 py-4">
          <Link href="/" onClick={() => setOpen(false)}>
            <Logo className="text-xl" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-warm-brown hover:text-charcoal inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors"
            aria-label="إغلاق القائمة"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* Search inside drawer */}
        <div className="border-brand-gold/20 border-b px-5 py-4">
          <form onSubmit={handleSearch} role="search">
            <div className="border-brand-gold/30 bg-cream-dark/60 focus-within:border-brand-red/50 focus-within:bg-cream flex items-center gap-2.5 rounded-xl border px-4 py-2.5 transition-colors">
              <Search className="text-warm-brown-light h-4 w-4 shrink-0" aria-hidden />
              <input
                ref={searchRef}
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="ابحث عن متجر أو كوبون..."
                className="font-body text-charcoal placeholder:text-warm-brown-light w-full bg-transparent text-sm outline-none"
                aria-label="بحث"
              />
            </div>
          </form>
        </div>

        {/* Nav links */}
        <nav aria-label="التنقّل الرئيسي" className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`font-body rounded-xl px-4 py-3.5 text-base font-semibold transition-colors ${
                pathname === link.href
                  ? "bg-brand-red/10 text-brand-red"
                  : "text-warm-brown hover:bg-cream-dark/60 hover:text-charcoal"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Country switcher */}
        {countries.length > 0 && (
          <div className="border-brand-gold/20 border-t px-3 py-3">
            <p className="font-body text-warm-brown-light mb-2 px-2 text-xs font-medium">
              اختيار الدولة
            </p>
            <div className="flex flex-wrap gap-2 px-1">
              {countries.map((country) => {
                const isSelected = country.code === currentCode;
                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country.code)}
                    disabled={countryPending}
                    aria-pressed={isSelected}
                    className={`font-body inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors disabled:opacity-60 ${
                      isSelected
                        ? "border-brand-red/30 bg-brand-red/8 text-brand-red font-semibold"
                        : "border-brand-gold/30 bg-cream-dark/40 text-charcoal hover:border-brand-red/40"
                    }`}
                  >
                    {country.flag_emoji ? (
                      <span aria-hidden className="leading-none">
                        {country.flag_emoji}
                      </span>
                    ) : (
                      <Globe className="h-3.5 w-3.5" aria-hidden />
                    )}
                    <span>{country.name_ar}</span>
                    {isSelected && (
                      <Check className="text-brand-red h-3 w-3 shrink-0" aria-hidden />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer hint */}
        <div className="border-brand-gold/20 border-t px-5 py-4">
          <p className="font-body text-warm-brown-light text-center text-xs">
            جميع الكوبونات مجرّبة بواسطة الأستاذ أبو عبدالله
          </p>
        </div>
      </div>
    </>
  );
}
