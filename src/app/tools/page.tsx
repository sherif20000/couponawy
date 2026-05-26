import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/shell/section";
import { PageHero } from "@/components/shell/page-hero";
import { Calculator, TrendingUp, ArrowLeft } from "lucide-react";
import { BASE_URL } from "@/lib/utils/site";

// Static; the index changes only when we add/remove a tool. No DB calls.
// Long revalidate so CDN cache stays warm.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "أدوات وحاسبات التوفير",
  description:
    "حاسبات مجانية تساعدك تشتري بذكاء — احسب نسبة الخصم، توقّع توفيرك السنوي مع الكوبونات، اكشف السعر الأصلي المضخّم.",
  alternates: { canonical: `${BASE_URL}/tools` },
  openGraph: {
    title: "أدوات وحاسبات التوفير — كوبوناوي",
    description:
      "حاسبات مجانية تساعدك تشتري بذكاء — احسب نسبة الخصم، توقّع توفيرك السنوي مع الكوبونات.",
    type: "website",
  },
};

const tools = [
  {
    slug: "discount-calculator",
    title: "حاسبة الخصم",
    description:
      "احسب السعر بعد الخصم، نسبة الخصم، أو السعر الأصلي قبل التضخيم — في ثوانٍ.",
    icon: Calculator,
    accent: "bg-brand-red/8 text-brand-red",
  },
  {
    slug: "savings-calculator",
    title: "حاسبة التوفير السنوي",
    description:
      "كم تكسب فعلياً من استخدام الكوبونات سنوياً — حسب إنفاقك ومعدّل تفعيلك.",
    icon: TrendingUp,
    accent: "bg-brand-gold/10 text-brand-gold",
  },
] as const;

export default function ToolsIndexPage() {
  // Static ItemList schema for the tools collection — helps Google understand
  // this is a directory of utilities, not a single article.
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: tools.map((tool, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: tool.title,
      url: `${BASE_URL}/tools/${tool.slug}`,
    })),
  };

  return (
    <main className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <PageHero
        variant="subtle"
        breadcrumbs={[{ href: "/", label: "الرئيسية" }, { label: "أدوات" }]}
        title="أدوات وحاسبات التوفير"
        subtitle="حاسبات مجانية تحوّل التسوّق من تخمين إلى رياضيات بسيطة. ادخل الأرقام، اخرج بقرار أوضح."
      />

      <Section size="md" spacing="lg">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map(({ slug, title, description, icon: Icon, accent }) => (
            <li key={slug}>
              <Link
                href={`/tools/${slug}`}
                className="group block h-full rounded-2xl border border-charcoal/10 bg-white p-6 transition-all hover:border-brand-red/30 hover:shadow-md"
              >
                <div
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <h2 className="mt-4 font-display text-xl font-semibold text-charcoal">
                  {title}
                </h2>
                <p className="mt-2 text-warm-brown text-sm leading-relaxed">
                  {description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-red transition-transform group-hover:-translate-x-1">
                  افتح الحاسبة
                  <ArrowLeft className="h-3.5 w-3.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}
