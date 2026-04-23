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
];

export async function Header() {
  const [countries, currentCode] = await Promise.all([
    getActiveCountries(),
    getPreferredCountry(),
  ]);

  return (
    <header className="bg-cream/95 border-brand-gold/20 sticky top-0 z-40 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-cream/80">
      <Container size="xl" className="flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="كوبوناوي">
            <Logo className="text-2xl" />
          </Link>
          <nav
            aria-label="التنقّل الأساسي"
            className="hidden items-center gap-6 md:flex"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-body text-warm-brown hover:text-brand-red text-sm font-semibold transition-colors"
              >
                {link.label}
              </Link>
            ))}
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
  );
}
