import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";

const FOOTER_SECTIONS = [
  {
    title: "روابط سريعة",
    links: [
      { href: "/stores", label: "جميع المتاجر" },
      { href: "/categories", label: "الأقسام" },
      { href: "/deals/today", label: "عروض اليوم" },
      { href: "/exclusive", label: "العروض الحصرية" },
    ],
  },
  {
    title: "عن كوبوناوي",
    links: [
      { href: "/about", label: "من نحن" },
      { href: "/how-it-works", label: "كيف نعمل" },
      { href: "/contact", label: "تواصل معنا" },
      { href: "/careers", label: "الوظائف" },
    ],
  },
  {
    title: "الدعم",
    links: [
      { href: "/faq", label: "الأسئلة الشائعة" },
      { href: "/report-coupon", label: "الإبلاغ عن كوبون" },
      { href: "/privacy", label: "سياسة الخصوصية" },
      { href: "/terms", label: "الشروط والأحكام" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-brand-red-dark text-cream mt-16">
      <Container size="xl" className="py-12">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <Logo className="text-2xl" inverted />
            <p className="font-body text-cream/80 max-w-xs text-sm leading-relaxed">
              كوبونات خصم وعروض موثوقة من متاجر السعودية والخليج، مختارة بعناية
              من الأستاذ أبو عبدالله.
            </p>
          </div>
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title} className="flex flex-col gap-3">
              <h4 className="font-display text-brand-gold-light text-sm font-bold">
                {section.title}
              </h4>
              <ul className="flex flex-col gap-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-body text-cream/70 hover:text-cream text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-cream/10 mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 md:flex-row">
          <p className="font-accent text-cream/60 text-xs">
            © {year} كوبوناوي. جميع الحقوق محفوظة.
          </p>
          <p className="font-accent text-cream/60 text-xs">
            صُنع بشغف في المملكة العربية السعودية
          </p>
        </div>
      </Container>
    </footer>
  );
}
