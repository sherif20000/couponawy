import type { Metadata } from "next";
import { Section } from "@/components/shell/section";
import { PageHero } from "@/components/shell/page-hero";
import { EmptyState } from "@/components/ui/empty-state";
import { PostCard } from "@/components/blog/post-card";
import { getPublishedArticles } from "@/lib/queries/posts";

// Articles page is partially static — published posts don't change every minute.
// Revalidate every 30 minutes so newly published posts surface quickly.
export const revalidate = 1800;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://couponawy.com";

export const metadata: Metadata = {
  title: "المدونة — نصائح ومقالات للتسوّق الذكي",
  description:
    "دلائل ومقارنات ونصائح من فريق كوبوناوي — لتشتري بثقة وتوفّر على كل طلب.",
  alternates: {
    canonical: `${BASE_URL}/blog`,
  },
  openGraph: {
    title: "المدونة — كوبوناوي",
    description:
      "دلائل ومقارنات ونصائح من فريق كوبوناوي — لتشتري بثقة وتوفّر على كل طلب.",
  },
};

export default async function BlogIndexPage() {
  const articles = await getPublishedArticles(24);

  // Blog listing JSON-LD — Blog type pointing at the latest articles.
  // Helps Google build a "Top stories" carousel for couponawy → blog queries.
  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "مدونة كوبوناوي",
    url: `${BASE_URL}/blog`,
    inLanguage: "ar",
    blogPost: articles.slice(0, 10).map((a) => ({
      "@type": "BlogPosting",
      headline: a.title_ar,
      url: `${BASE_URL}/blog/${a.slug}`,
      datePublished: a.published_at,
      ...(a.featured_image_url ? { image: a.featured_image_url } : {}),
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "المدونة", item: `${BASE_URL}/blog` },
    ],
  };

  return (
    <main className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PageHero
        variant="subtle"
        breadcrumbs={[
          { href: "/", label: "الرئيسية" },
          { label: "المدونة" },
        ]}
        title="المدونة"
        subtitle={
          articles.length > 0
            ? `${articles.length} مقالاً ونصيحة — محدّثة يومياً لمساعدتك على التوفير`
            : "نصائح ومقالات قريباً"
        }
      />

      <Section spacing="lg">
        {articles.length === 0 ? (
          <EmptyState
            message="لا توجد مقالات منشورة حالياً — تحقّق لاحقاً."
            cta={{ href: "/coupons", label: "تصفّح الكوبونات" }}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <PostCard
                key={article.id}
                post={article}
                basePath="/blog"
                tag="نصيحة"
              />
            ))}
          </div>
        )}
      </Section>
    </main>
  );
}
