import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/shell/section";
import { PageHero } from "@/components/shell/page-hero";
import { PostBody } from "@/components/blog/post-body";
import { DiscountCalculator } from "@/components/tools/discount-calculator";
import { ArrowLeft } from "lucide-react";
import { BASE_URL } from "@/lib/utils/site";
import { body } from "./body";

// 1-day revalidate — the body changes rarely and the calculator is pure client.
export const revalidate = 86400;

const TITLE = "حاسبة الخصم — احسب السعر بعد الخصم والتوفير الفعلي";
const DESCRIPTION =
  "حاسبة مجانية تحسب السعر بعد الخصم، نسبة الخصم، أو السعر الأصلي. مع شرح موسّع لمعادلات الخصم والأخطاء الشائعة في السوق السعودي.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${BASE_URL}/tools/discount-calculator` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "article",
    images: [
      {
        url: `${BASE_URL}/api/og?title=${encodeURIComponent("حاسبة الخصم")}&type=guide`,
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
};

export default function DiscountCalculatorPage() {
  // Article + Breadcrumb schema. Article keeps us in Google's "in-depth" rich
  // results pool; Breadcrumb gives us the nav row in SERP.
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: TITLE,
    description: DESCRIPTION,
    // Article schema requires `image` — point at the dynamic OG card (Sprint 0).
    image: `${BASE_URL}/api/og?title=${encodeURIComponent(TITLE)}&type=guide`,
    datePublished: "2026-05-26",
    dateModified: "2026-05-26",
    author: { "@type": "Organization", name: "كوبوناوي" },
    publisher: {
      "@type": "Organization",
      name: "كوبوناوي",
      logo: { "@type": "ImageObject", url: `${BASE_URL}/logo.png` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/tools/discount-calculator`,
    },
    inLanguage: "ar",
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "أدوات", item: `${BASE_URL}/tools` },
      {
        "@type": "ListItem",
        position: 3,
        name: "حاسبة الخصم",
        item: `${BASE_URL}/tools/discount-calculator`,
      },
    ],
  };

  return (
    <main className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <PageHero
        variant="subtle"
        breadcrumbs={[
          { href: "/", label: "الرئيسية" },
          { href: "/tools", label: "أدوات" },
          { label: "حاسبة الخصم" },
        ]}
        title="حاسبة الخصم"
        subtitle="ادخل الأرقام، اعرف السعر بعد الخصم خلال ثوانٍ. تحت الحاسبة شرح موسّع للمعادلات + ١٢ سؤال شائع."
      />

      <Section size="md" spacing="lg">
        <DiscountCalculator />

        <article>
          <PostBody body={body} />
        </article>
      </Section>

      <Section spacing="md" size="md">
        <div className="text-center">
          <Link
            href="/tools"
            className="font-body text-brand-red hover:text-brand-red-dark inline-flex items-center gap-1 text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            العودة إلى كل الأدوات
          </Link>
        </div>
      </Section>
    </main>
  );
}
