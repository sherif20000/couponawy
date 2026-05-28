import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/shell/section";
import { PageHero } from "@/components/shell/page-hero";
import { PostBody } from "@/components/blog/post-body";
import { SavingsCalculator } from "@/components/tools/savings-calculator";
import { ArticleToc } from "@/components/content/article-toc";
import { RelatedCoupons } from "@/components/content/related-coupons";
import { extractToc } from "@/lib/content/toc";
import { getFeaturedCoupons } from "@/lib/queries/homepage";
import { ArrowLeft } from "lucide-react";
import { BASE_URL } from "@/lib/utils/site";
import { body } from "./body";

export const revalidate = 86400;

const TITLE = "حاسبة التوفير السنوي من الكوبونات";
const DESCRIPTION =
  "احسب كم تكسب فعلياً من استخدام الكوبونات سنوياً حسب إنفاقك ومعدّل تفعيلك. مع جداول مرجعية للأسرة السعودية وشرح المنهجية.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${BASE_URL}/tools/savings-calculator` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "article",
    images: [
      {
        url: `${BASE_URL}/api/og?title=${encodeURIComponent("حاسبة التوفير السنوي")}&type=guide`,
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
};

export default async function SavingsCalculatorPage() {
  const toc = extractToc(body);
  const relatedCoupons = await getFeaturedCoupons(8);

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
      "@id": `${BASE_URL}/tools/savings-calculator`,
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
        name: "حاسبة التوفير السنوي",
        item: `${BASE_URL}/tools/savings-calculator`,
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
          { label: "حاسبة التوفير السنوي" },
        ]}
        title="حاسبة التوفير السنوي"
        subtitle="كم تكسب فعلياً سنوياً من استخدام الكوبونات. ادخل إنفاقك واطّلع على المنهجية + جداول مرجعية للأسرة السعودية."
      />

      <Section size="md" spacing="lg">
        <SavingsCalculator />

        <div className="mt-12 lg:grid lg:grid-cols-[240px_1fr] lg:items-start lg:gap-12">
          <ArticleToc items={toc} />
          <article className="min-w-0">
            <PostBody body={body} headings={toc} />
          </article>
        </div>
      </Section>

      <RelatedCoupons
        coupons={relatedCoupons}
        title="كوبونات مختارة لتوفير أكبر"
        subtitle="حوّل التوفير المتوقّع إلى توفير حقيقي بأحد هذه الكوبونات المجرّبة."
        cta={{ href: "/coupons", label: "كل الكوبونات" }}
      />

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
