import Link from "next/link";
import type { Metadata } from "next";
import { Section } from "@/components/shell/section";
import { PageHero } from "@/components/shell/page-hero";

export const metadata: Metadata = {
  title: "من نحن",
  description:
    "تعرّف على كوبوناوي — المنصة الأمينة لكوبونات الخصم في السعودية والخليج.",
};

export default function AboutPage() {
  return (
    <main className="flex flex-1 flex-col">
      <PageHero
        variant="subtle"
        breadcrumbs={[
          { href: "/", label: "الرئيسية" },
          { label: "من نحن" },
        ]}
        title="من نحن"
        subtitle="المنصة الأمينة لكوبونات الخصم في السعودية والخليج"
      />

      <Section size="md" spacing="lg">
        <div className="font-body text-warm-brown space-y-12 text-base leading-relaxed">
          {/* Mission */}
          <div>
            <h2 className="font-display text-charcoal mb-3 text-xl font-bold md:text-2xl">
              رسالتنا
            </h2>
            <p>
              كوبوناوي منصة سعودية متخصصة في جمع ونشر كوبونات الخصم والعروض
              الحصرية من أبرز المتاجر في المملكة العربية السعودية والخليج
              العربي. نؤمن بأن كل متسوّق يستحق أن يحصل على أفضل سعر — دون
              عناء البحث في عشرات المواقع.
            </p>
          </div>

          {/* How it works */}
          <div>
            <h2 className="font-display text-charcoal mb-4 text-xl font-bold md:text-2xl">
              كيف تعمل المنصة؟
            </h2>
            <ol className="list-none space-y-4">
              {[
                {
                  n: "١",
                  title: "نجمع الكوبونات",
                  body: "نتابع باستمرار المتاجر والعلامات التجارية الكبرى ونجمع كوبوناتها وعروضها الحصرية في مكان واحد.",
                },
                {
                  n: "٢",
                  title: "نتحقق من صحتها",
                  body: "كل كوبون يمر بمراجعة قبل نشره — نتأكد من أنه فعّال وغير منتهٍ قبل أن يصلك.",
                },
                {
                  n: "٣",
                  title: "تتسوق بذكاء",
                  body: "تختار متجرك، تكشف الكوبون، وتستخدمه مباشرةً عند الدفع. توفير فوري بلا تعقيد.",
                },
              ].map(({ n, title, body }) => (
                <li key={n} className="flex gap-4">
                  <span className="bg-brand-red/10 text-brand-red font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base font-extrabold">
                    {n}
                  </span>
                  <div>
                    <p className="font-display text-charcoal mb-1 font-bold">
                      {title}
                    </p>
                    <p>{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Values */}
          <div>
            <h2 className="font-display text-charcoal mb-4 text-xl font-bold md:text-2xl">
              قيمنا
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                {
                  title: "الأمانة",
                  body: "نعرض فقط الكوبونات التي نثق بها. إذا انتهت صلاحية كوبون نزيله فوراً.",
                },
                {
                  title: "البساطة",
                  body: "تجربة نظيفة وسريعة — بلا إعلانات مزعجة، بلا تشتيت، فقط الكوبون الذي تحتاجه.",
                },
                {
                  title: "المجتمع",
                  body: "مساهمات المستخدمين تُحسّن المنصة — كل إبلاغ عن كوبون معطوب يساعد آلاف المتسوّقين.",
                },
              ].map(({ title, body }) => (
                <div
                  key={title}
                  className="bg-cream border-brand-gold/20 rounded-2xl border p-5"
                >
                  <p className="font-display text-charcoal mb-2 font-bold">
                    {title}
                  </p>
                  <p className="text-sm">{body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact CTA */}
          <div className="bg-brand-red/5 border-brand-red/10 rounded-2xl border p-6">
            <p className="font-display text-charcoal mb-1 font-bold">
              هل لديك سؤال أو اقتراح؟
            </p>
            <p className="text-sm">
              نرحّب بك دائماً —{" "}
              <Link
                href="/contact"
                className="text-brand-red hover:text-brand-red-dark font-semibold transition-colors"
              >
                تواصل معنا
              </Link>{" "}
              أو راسلنا على{" "}
              <a
                href="mailto:hello@couponawy.com"
                className="text-brand-red hover:text-brand-red-dark font-semibold transition-colors"
              >
                hello@couponawy.com
              </a>
            </p>
          </div>
        </div>
      </Section>
    </main>
  );
}
