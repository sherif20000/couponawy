import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Calendar, ArrowLeft } from "lucide-react";
import { Section } from "@/components/shell/section";
import { PageHero } from "@/components/shell/page-hero";
import { PostBody } from "@/components/blog/post-body";
import {
  getGuideBySlug,
  getAllGuideSlugsBuildTime,
} from "@/lib/queries/posts";

export const revalidate = 1800;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://couponawy.com";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllGuideSlugsBuildTime();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return { title: "الدليل غير موجود" };

  const title = guide.meta_title ?? guide.title_ar;
  const description =
    guide.meta_description ?? guide.excerpt_ar ?? guide.title_ar;

  const ogImage =
    guide.og_image ??
    guide.featured_image_url ??
    `${BASE_URL}/api/og?title=${encodeURIComponent(guide.title_ar)}&type=guide`;

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/guides/${slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      publishedTime: guide.published_at ?? undefined,
      modifiedTime: guide.updated_at,
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

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();

  // HowTo schema is more specific than Article — Google may surface guides as
  // step-by-step rich results when the body parses cleanly. We use Article as
  // a fallback wrapper since extracting steps from arbitrary markdown is fragile.
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title_ar,
    description: guide.excerpt_ar ?? guide.title_ar,
    image: guide.featured_image_url ?? undefined,
    datePublished: guide.published_at,
    dateModified: guide.updated_at,
    author: {
      "@type": "Organization",
      name: "كوبوناوي",
    },
    publisher: {
      "@type": "Organization",
      name: "كوبوناوي",
      logo: { "@type": "ImageObject", url: `${BASE_URL}/icon.png` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/guides/${slug}`,
    },
    inLanguage: "ar",
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "الدلائل", item: `${BASE_URL}/guides` },
      {
        "@type": "ListItem",
        position: 3,
        name: guide.title_ar,
        item: `${BASE_URL}/guides/${slug}`,
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
          { href: "/guides", label: "الدلائل" },
          { label: guide.title_ar },
        ]}
        title={guide.title_ar}
        subtitle={guide.excerpt_ar ?? undefined}
      >
        {guide.published_at && (
          <div className="font-accent text-white/70 text-sm">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" aria-hidden />
              {formatPublishedDate(guide.published_at)}
            </span>
          </div>
        )}
      </PageHero>

      {guide.featured_image_url && (
        <div className="bg-cream-dark/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={guide.featured_image_url}
            alt={guide.title_ar}
            className="mx-auto block aspect-[16/8] w-full max-w-5xl object-cover"
          />
        </div>
      )}

      <Section size="md" spacing="lg">
        <article>
          <PostBody body={guide.body_ar} />
        </article>
      </Section>

      <Section spacing="md" size="md">
        <div className="text-center">
          <Link
            href="/guides"
            className="font-body text-brand-red hover:text-brand-red-dark inline-flex items-center gap-1 text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            العودة إلى الدلائل
          </Link>
        </div>
      </Section>
    </main>
  );
}
