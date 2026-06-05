import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";
import { SearchInput } from "@/components/shell/search-input";
import { MobileMenuDrawer } from "@/components/shell/mobile-menu-drawer";
import { CountrySwitcher } from "@/components/shell/country-switcher";
import { getActiveCountries } from "@/lib/queries/countries";
import { getTickerCoupons } from "@/lib/queries/homepage";

// NOTE: getPreferredCountry() removed from this server component on purpose.
// Reading cookies here forced the entire app into dynamic rendering — every
// page that included <Header> via the root layout became per-request rendered,
// which made `dynamicParams = false` a no-op and produced soft-404s for unknown
// slugs. CountrySwitcher + MobileMenuDrawer now read the cookie client-side
// (see country-client.ts) so the Header stays cookie-free and detail routes
// can be statically generated.

const NAV_LINKS = [
  { href: "/stores", label: "المتاجر" },
  { href: "/categories", label: "الأقسام" },
  { href: "/coupons", label: "الكوبونات" },
  { href: "/blog", label: "المدونة" },
  { href: "/guides", label: "الدلائل" },
  { href: "/tools", label: "أدوات" },
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
  // No cookie reads here — both getActiveCountries() and getTickerCoupons()
  // use cookie-free Supabase clients. The country preference is read on the
  // client by CountrySwitcher + MobileMenuDrawer (via document.cookie). The
  // initial render of the country pill briefly shows DEFAULT_COUNTRY before
  // the useEffect upgrades to the cookie value — minor flash that's vastly
  // outweighed by the static-rendering perf + SEO win.
  const [countries, tickerCoupons] = await Promise.all([
    getActiveCountries(),
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
    <div className="sticky top-0 z-50 w-full">
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
          <span className="bg-brand-red text-cream font-accent shrink-0 rounded-md px-2.5 py-1 text-[10px] font-bold">
            مباشر
          </span>
          {/* Scrolling deals */}
          <div className="flex-1 overflow-hidden">
            <div className="animate-ticker-rtl inline-flex whitespace-nowrap">
              {[0, 1].map((copy) => (
                <span
                  key={copy}
                  className="inline-flex items-center"
                  aria-hidden={copy === 1}
                >
                  {tickerItems.map((item, i) => {
                    const inner = (
                      <span className="inline-flex items-center gap-2.5 px-5">
                        <span className="bg-brand-gold/20 text-brand-gold rounded-md px-1.5 py-0.5 text-[10px] font-bold">
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
                        <span className="text-brand-gold/30 select-none">
                          ·
                        </span>
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
                      <span
                        key={`${copy}-${i}`}
                        className="inline-flex items-center"
                      >
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
        <Container
          size="xl"
          className="flex h-16 items-center justify-between gap-4"
        >
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
                  className="font-body text-white hover:text-cream text-sm font-semibold transition-colors duration-150"
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

            {countries.length > 0 && <CountrySwitcher countries={countries} />}

            <MobileMenuDrawer countries={countries} />
          </div>
        </Container>
      </header>
    </div>
  );
}
