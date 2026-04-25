import type { Metadata } from "next";
import { Section } from "@/components/shell/section";
import { PageHero } from "@/components/shell/page-hero";
import { EmptyState } from "@/components/ui/empty-state";
import { PostCard } from "@/components/blog/post-card";
import { getPublishedGuides } from "@/lib/queries/posts";

export const revalidate = 1800;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://couponawy.com";

export const metadata: Metadata = {
  title: "دلائل الشراء الذكي",
  description:
    "دلائل عملية تعلّمك الشراء الصحيح: ماذا تختار، متى تشتري، وكيف توفّر — لكل فئة من فئات التسوّق.",
  alternates: {
    canonical: `${BASE_URL}/guides`,
  },
};

export default async function GuidesIndexPage() {
  const guides = await getPublishedGuides(24);

  // Guides listing — ItemList JSON-LD pointing at guide URLs.
  // (HowTo schema lives on each individual guide page.)
  const itemListJsonLd =
    guides.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "دلائل الشراء الذكي",
          url: `${BASE_URL}/guides`,
          itemListElement: guides.slice(0, 10).map((g, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${BASE_URL}/guides/${g.slug}`,
            name: g.title_ar,
          })),
        }
      : null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "الدلائل", item: `${BASE_URL}/guides` },
    ],
  };

  return (
    <main className="flex flex-1 flex-col">
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PageHero
        variant="subtle"
        breadcrumbs={[
          { href: "/", label: "الرئيسية" },
          { label: "الدلائل" },
        ]}
        title="دلائل الشراء الذكي"
        subtitle={
          guides.length > 0
            ? `${guides.length} دليل عملي يساعدك على اتخاذ القرار الصحيح قبل الشراء`
            : "دلائل قريباً"
        }
      />

      <Section spacing="lg">
        {guides.length === 0 ? (
          <EmptyState
            message="لا توجد دلائل منشورة حالياً — تحقّق لاحقاً."
            cta={{ href: "/blog", label: "تصفّح المدونة" }}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <PostCard
                key={guide.id}
                post={guide}
                basePath="/guides"
                tag="دليل"
              />
            ))}
          </div>
        )}
      </Section>
    </main>
  );
}
