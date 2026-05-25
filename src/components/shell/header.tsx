import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";
import { SearchInput } from "@/components/shell/search-input";
import { MobileMenuDrawer } from "@/components/shell/mobile-menu-drawer";
import { CountrySwitcher } from "@/components/shell/country-switcher";
import { getActiveCountries } from "@/lib/queries/countries";
import { getTickerCoupons } from "@/lib/queries/homepage";
import { getPreferredCountry } from "@/lib/utils/country";

const NAV_LINKS = [
  { href: "/stores", label: "المتاجر" },
  { href: "/categories", label: "الأقسام" },
  { href: "/coupons", label: "الكوبونات" },
  { href: "/blog", label: "المدونة" },
  { href: "/guides", label: "الدلائل" },
];

// Fallback ticker items shown only if the DB returns zero active coupons.
// Keeps the strip visible (and the layout stable) during cold-start / empty states.
const FALLBACK_TICKER = [
  { store: "كوبوناوي", disc: "محدّث يومياً", code: "ACTIVE" },
  { store: "نون", disc: "خصومات", code: "NOON" },
  { store: "شي إن", disc: "أحدث الأكواد", code: "SHEIN" },
  { store: "أمازون", disc: "عروض حصرية", code: "AMAZON" },
];

export async function Header() {
  const [countries, currentCode, tickerCoupons] = await Promise.all([
    getActiveCountries(),
    getPreferredCountry(),
    getTickerCoupons(5),
  ]);

  // Map DB rows to the visual shape the ticker needs. Falls back to the
  // evergreen list if DB returns nothing, so the header is never empty.
  const tickerItems =
    tickerCoupons.length > 0
      ? tickerCoupons.map((c) => ({
          store: c.store?.name_ar ?? "متجر",
          disc: c.discount_display ?? "خصم",
          code: c.code ?? "—",
          slug: c.slug,
        }))
      : FALLBACK_TICKER.map((f) => ({ ...f, slug: undefined }));

  return (
    <div className="sticky top-0 z-40 w-full">
      {/* ── Ticker V2 — live-deals strip ────────────────────────────
          Each item = real coupon: store · discount · code.
          Static "مباشر" anchor on the right (RTL = start side) gives users
          a one-glance signal that what scrolls past is live, not marketing.
          Near-black bg keeps the brand-red main bar below visually loud. */}
      <div
        className="overflow-hidden py-2"
        style={{ background: "oklch(8% 0.005 26)" }}
        aria-label="أحدث الكوبونات النشطة"
      >
        <div className="flex items-center gap-2">
          {/* "LIVE" anchor — never moves, RTL start (right) */}
          <span className="bg-brand-red text-cream font-accent shrink-0 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest">
            مباشر
          </span>
          {/* Scrolling deals */}
          <div className="flex-1 overflow-hidden">
            <div className="animate-ticker-rtl inline-flex whitespace-nowrap">
              {[0, 1].map((copy) => (
                <span key={copy} className="inline-flex items-center" aria-hidden={copy === 1}>
                  {tickerItems.map((item, i) => {
                    const inner = (
                      <span className="inline-flex items-center gap-2.5 px-5">
                        <span className="bg-brand-gold/20 text-brand-gold rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          خصم
                        </span>
                        <span className="font-display text-brand-gold text-[13px] font-bold">
                          {item.store}
                        </span>
                        <span className="text-cream font-display text-sm font-extrabold">
                          {item.disc}
                        </span>
                        <span className="font-mono text-brand-gold/60 text-[11px] uppercase tracking-wider">
                          {item.code}
                        </span>
                        <span className="text-brand-gold/30 select-none">·</span>
                      </span>
                    );
                    return item.slug ? (
                      <Link
                        key={`${copy}-${i}`}
                        href={`/coupons/${item.slug}`}
                        className="hover:bg-white/5 inline-flex items-center transition-colors"
                      >
                        {inner}
                      </Link>
                    ) : (
                      <span key={`${copy}-${i}`} className="inline-flex items-center">
                        {inner}
                      </span>
                    );
                  })}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main nav — solid brand red ─────────────────────────── */}
      <header className="bg-brand-red w-full shadow-brand">
        <Container size="xl" className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link href="/" aria-label="كوبوناوي">
              <Logo className="text-2xl" inverted />
            </Link>
            <nav
              aria-label="التنقّل الأساسي"
              className="hidden items-center gap-6 md:flex"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-body text-white/85 hover:text-white text-sm font-semibold transition-colors duration-150"
                >
                  {link.label}
                </Link>
              ))}
              {/* Primary CTA — solid white pill, distinct from glass utility controls */}
              <Link
                href="/coupons"
                className="font-display bg-white text-brand-red rounded-full px-4 py-1.5 text-sm font-bold transition-colors hover:bg-cream"
              >
                جميع الكوبونات
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <SearchInput />

            {countries.length > 0 && (
              <CountrySwitcher countries={countries} currentCode={currentCode} />
            )}

            <MobileMenuDrawer countries={countries} currentCode={currentCode} />
          </div>
        </Container>
      </header>
    </div>
  );
}
