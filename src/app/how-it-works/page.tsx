import Link from "next/link";
import { Search, Tag, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "كيف نعمل | كوبوناوي",
  description:
    "كيف تستخدم كوبوناوي للحصول على أفضل خصومات التسوق في ثلاث خطوات بسيطة.",
};

const STEPS = [
  {
    icon: Search,
    title: "ابحث عن متجرك",
    body: "ابحث عن اسم المتجر أو تصفّح الأقسام للعثور على الكوبون المناسب.",
  },
  {
    icon: Tag,
    title: "اظهر الكود",
    body: "اضغط على زر «إظهار الكود» — سيظهر لك الكود مباشرة على الشاشة.",
  },
  {
    icon: ExternalLink,
    title: "انسخ واذهب للمتجر",
    body: "انسخ الكود، ثم توجّه للمتجر وطبّقه عند الدفع لتحصل على خصمك.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="from-cream-dark/60 to-cream border-brand-gold/20 border-b bg-gradient-to-b">
        <Container size="lg" className="py-10 md:py-14">
          <nav
            aria-label="مسار التنقّل"
            className="text-warm-brown-light font-accent mb-4 flex items-center gap-2 text-xs"
          >
            <Link href="/" className="hover:text-brand-red transition-colors">
              الرئيسية
            </Link>
            <span>›</span>
            <span className="text-charcoal">كيف نعمل</span>
          </nav>
          <h1 className="font-display text-charcoal text-3xl font-extrabold md:text-4xl">
            كيف نعمل؟
          </h1>
          <p className="font-body text-warm-brown mt-2 text-base">
            ثلاث خطوات وتوفّر على كل طلب
          </p>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container size="lg">
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="bg-cream border-brand-gold/25 flex flex-col items-center gap-4 rounded-2xl border p-6 text-center"
                >
                  <div className="bg-brand-red text-cream font-display flex h-11 w-11 items-center justify-center rounded-full text-base font-extrabold">
                    {i + 1}
                  </div>
                  <Icon
                    className="text-brand-red h-7 w-7"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <h2 className="font-display text-charcoal text-base font-bold">
                    {step.title}
                  </h2>
                  <p className="text-warm-brown font-body text-sm leading-relaxed">
                    {step.body}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/coupons"
              className="bg-brand-red hover:bg-brand-red-dark font-body inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold text-cream transition-colors"
            >
              تصفّح الكوبونات الآن
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
