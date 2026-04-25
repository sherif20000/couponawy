import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";
import { SearchInput } from "@/components/shell/search-input";
import { MobileMenuDrawer } from "@/components/shell/mobile-menu-drawer";
import { CountrySwitcher } from "@/components/shell/country-switcher";
import { getActiveCountries } from "@/lib/queries/countries";
import { getPreferredCountry } from "@/lib/utils/country";

const NAV_LINKS = [
  { href: "/stores", label: "المتاجر" },
  { href: "/categories", label: "الأقسام" },
  { href: "/coupons", label: "الكوبونات" },
  { href: "/blog", label: "المدونة" },
  { href: "/guides", label: "الدلائل" },
];

export async function Header() {
  const [countries, currentCode] = await Promise.all([
    getActiveCountries(),
    getPreferredCountry(),
  ]);

  const tickerItems = [
    { icon: "🔥", text: "عروض تصل لـ ٧٠٪" },
    { icon: "⚡", text: "كوبونات جديدة كل يوم" },
    { icon: "✅", text: "أكثر من ٢٤٠٠ كوبون فعّال" },
    { icon: "🏪", text: "١٢٠+ متجر موثّق" },
    { icon: "💰", text: "وفّر على كل طلب" },
  ];

  return (
    <div className="sticky top-0 z-40 w-full">
      {/* Ticker strip — slim, urgent, near-black bg so the brand-red main bar pops below it */}
      <div
        className="overflow-hidden py-1"
        style={{ background: "oklch(8% 0.005 26)" }}
        aria-hidden
      >
        {/* Two identical copies side-by-side; animation shifts left by 50% = seamless loop */}
        <div className="animate-ticker-rtl inline-flex whitespace-nowrap">
          {[0, 1].map((copy) => (
            <span key={copy} className="inline-flex items-center gap-0">
              {tickerItems.map((item, i) => (
                <span key={i} className="inline-flex items-center">
                  <span className="font-body text-brand-gold px-5 text-[13px] font-bold tracking-wide">
                    {item.icon}&nbsp;{item.text}
                  </span>
                  <span className="text-brand-gold/30 select-none text-xs">·</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* Main nav — solid brand red */}
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
