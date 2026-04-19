import Link from "next/link";
import { Search, Globe, Menu } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/stores", label: "المتاجر" },
  { href: "/categories", label: "الأقسام" },
  { href: "/guides", label: "المقالات" },
  { href: "/blog", label: "المدوّنة" },
];

export function Header() {
  return (
    <header className="bg-cream/95 border-brand-gold/20 sticky top-0 z-40 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-cream/80">
      <Container size="xl" className="flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="الكوبوناوي">
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
                className="font-body text-warm-brown hover:text-brand-green text-sm font-semibold transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="border-brand-gold/30 bg-cream-dark/40 hidden items-center gap-2 rounded-full border px-4 py-2 md:flex">
            <Search className="text-warm-brown-light h-4 w-4" aria-hidden />
            <input
              type="search"
              placeholder="ابحث عن متجر أو كوبون..."
              className="font-body text-charcoal placeholder:text-warm-brown-light w-56 bg-transparent text-sm outline-none"
              aria-label="بحث"
            />
          </div>

          <button
            type="button"
            className="border-brand-gold/30 bg-cream-dark/40 text-charcoal hover:border-brand-green/40 hidden items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-colors md:inline-flex"
            aria-label="اختيار الدولة"
          >
            <Globe className="h-4 w-4" aria-hidden />
            <span className="font-accent">السعودية</span>
          </button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="فتح القائمة"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </Button>
        </div>
      </Container>
    </header>
  );
}
