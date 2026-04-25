import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { Section } from "@/components/shell/section";
import { SectionHeader } from "@/components/shell/section-header";
import { PageHero } from "@/components/shell/page-hero";
import { PostBody } from "@/components/blog/post-body";
import { PostCard } from "@/components/blog/post-card";
import {
  getArticleBySlug,
  getRelatedArticles,
  getAllArticleSlugsBuildTime,
} from "@/lib/queries/posts";
import { toArabicNumerals } from "@/lib/utils";

export const revalidate = 1800;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://couponawy.com";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllArticleSlugsBuildTime();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "المقال غير موجود" };

  const title = article.meta_title ?? article.title_ar;
  const description =
    article.meta_description ?? article.excerpt_ar ?? article.title_ar;

  // OG card: prefer admin-uploaded og_image, then featured_image, then dynamic /api/og.
  const ogImage =
    article.og_image ??
    article.featured_image_url ??
    `${BASE_URL}/api/og?title=${encodeURIComponent(article.title_ar)}&type=blog`;

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/blog/${slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      publishedTime: article.published_at ?? undefined,
      modifiedTime: article.updated_at,
      authors: article.author_name ? [article.author_name] : undefined,
    },
    twitter: { card: "summary_large_image", images: [ogImage] },
  };
}

function formatPublishedDate(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("ar-SA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const related = await getRelatedArticles(article.id, article.tags, 3);

  // BlogPosting JSON-LD — full schema so the article can appear in Google's
  // article carousel + Discover. Author + publisher + dates required.
  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title_ar,
    description: article.excerpt_ar ?? article.meta_description ?? article.title_ar,
    image: article.featured_image_url ?? undefined,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: {
      "@type": "Person",
      name: article.author_name ?? "كوبوناوي",
    },
    publisher: {
      "@type": "Organization",
      name: "كوبوناوي",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/icon.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/blog/${slug}`,
    },
    inLanguage: "ar",
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "المدونة", item: `${BASE_URL}/blog` },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title_ar,
        item: `${BASE_URL}/blog/${slug}`,
      },
    ],
  };

  return (
    <main className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <PageHero
        variant="subtle"
        breadcrumbs={[
          { href: "/", label: "الرئيسية" },
          { href: "/blog", label: "المدونة" },
          { label: article.title_ar },
        ]}
        title={article.title_ar}
        subtitle={article.excerpt_ar ?? undefined}
      >
        <div className="font-accent flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/70">
          {article.author_name && (
            <span>بقلم {article.author_name}</span>
          )}
          {article.published_at && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" aria-hidden />
              {formatPublishedDate(article.published_at)}
            </span>
          )}
          {article.read_time_minutes != null && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {toArabicNumerals(article.read_time_minutes)} دقائق قراءة
            </span>
          )}
        </div>
      </PageHero>

      {/* Featured image — cover. Sits between hero and body so the page reads
          like a magazine article, not a wall of text. */}
      {article.featured_image_url && (
        <div className="bg-cream-dark/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.featured_image_url}
            alt={article.title_ar}
            className="mx-auto block aspect-[16/8] w-full max-w-5xl object-cover"
          />
        </div>
      )}

      <Section size="md" spacing="lg">
        <article>
          <PostBody body={article.body_ar} />
        </article>
      </Section>

      {related.length > 0 && (
        <Section tone="muted" spacing="lg">
          <SectionHeader
            title="مقالات قد تعجبك"
            cta={{ href: "/blog", label: "كل المقالات" }}
            as="h2"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((post) => (
              <PostCard key={post.id} post={post} basePath="/blog" tag="نصيحة" />
            ))}
          </div>
        </Section>
      )}

      {/* Bottom navigation back to /blog */}
      <Section spacing="md" size="md">
        <div className="text-center">
          <Link
            href="/blog"
            className="font-body text-brand-red hover:text-brand-red-dark inline-flex items-center gap-1 text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            العودة إلى المدونة
          </Link>
        </div>
      </Section>
    </main>
  );
}
