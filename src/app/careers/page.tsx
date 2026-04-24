import Link from "next/link";
import { Briefcase } from "lucide-react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "الوظائف",
  description:
    "انضم إلى فريق كوبوناوي — وظائف مفتوحة ومستقبل رائع في مجال التقنية والتجارة.",
};

export default function CareersPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="from-cream-dark/60 to-cream border-brand-gold/20 border-b bg-gradient-to-b">
        <Container size="md" className="py-10 md:py-14">
          <nav
            aria-label="مسار التنقّل"
            className="text-warm-brown-light font-accent mb-4 flex items-center gap-2 text-xs"
          >
            <Link href="/" className="hover:text-brand-red transition-colors">
              الرئيسية
            </Link>
            <span>›</span>
            <span className="text-charcoal">الوظائف</span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="bg-brand-red/10 text-brand-red flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <Briefcase className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            </span>
            <div>
              <h1 className="font-display text-charcoal text-3xl font-extrabold md:text-4xl">
                الوظائف
              </h1>
              <p className="font-body text-warm-brown mt-1 text-base">
                انضم إلى فريق كوبوناوي
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container size="md">
          <div className="font-body text-warm-brown space-y-6 text-sm leading-relaxed max-w-xl">
            <p>
              نحن نبني كوبوناوي بشغف — وإذا كنت تؤمن بفكرة توفير المال للناس
              وتريد أن تكون جزءاً من الرحلة، فنحن نودّ التعرف عليك.
            </p>

            <div className="bg-cream border-brand-gold/25 rounded-2xl border p-6 text-center">
              <p className="font-display text-charcoal font-bold text-base mb-1">
                لا توجد وظائف مفتوحة حالياً
              </p>
              <p className="text-warm-brown/70 text-sm">
                تابعنا للاطلاع على الفرص القادمة، أو تواصل معنا مباشرةً إذا
                كنت تعتقد أنك ستُضيف قيمة للفريق.
              </p>
            </div>

            <div className="pt-2 text-center">
              <Link
                href="/contact"
                className="bg-brand-red hover:bg-brand-red-dark font-body inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold text-cream transition-colors"
              >
                تواصل معنا
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
