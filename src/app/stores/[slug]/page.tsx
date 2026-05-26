import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ExternalLink, BadgeCheck, Star, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/shell/section";
import { PageHero } from "@/components/shell/page-hero";
import { SectionHeader } from "@/components/shell/section-header";
import { StoreLongCopy } from "@/components/seo/store-long-copy";
import { StoreFaq, buildFaqJsonLd } from "@/components/seo/store-faq";
import { CouponGridWithFilters } from "@/components/coupons/coupon-grid-with-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { StoreLogo } from "@/components/stores/store-logo";
import { storeFaq } from "@/lib/content/store-templates";
import { buildOutboundUrl } from "@/lib/utils/outbound-url";
import { toArabicNumerals, pluralizeCoupon } from "@/lib/utils";
import {
  getStoreBySlug,
  getCouponsForStore,
  getAllStoreSlugsBuildTime,
} from "@/lib/queries/detail";

export const revalidate = 300;

// See comment in src/app/coupons/[slug]/page.tsx — Next.js 16 + Vercel ISR
// soft-404s unknown slugs (renders not-found body but with HTTP 200).
// dynamicParams=false forces a hard 404 at the routing layer for any
// store slug not pre-rendered by generateStaticParams.
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getAllStoreSlugsBuildTime();
  return slugs.map(({ slug }) => ({ slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) return { title: "المتجر غير موجود" };

  const title =
    store.meta_title ?? `كوبونات ${store.name_ar} وعروض الخصم`;
  const description =
    store.meta_description ??
    store.short_description_ar ??
    `أحدث كوبونات ${store.name_ar} وأكواد خصم مجرّبة ومحدّثة يومياً من كوبوناوي.`;

  const BASE_URL_META =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://couponawy.com";

  // If admin uploaded a custom og_image we use it. Otherwise generate one on the
  // edge via /api/og?title=…&store=…&type=store.
  const ogImage =
    store.og_image ??
    `${BASE_URL_META}/api/og?title=${encodeURIComponent(`كوبونات ${store.name_ar}`)}&subtitle=${encodeURIComponent(store.short_description_ar ?? "كوبونات وعروض مجرّبة")}&type=store`;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL_META}/stores/${slug}`,
    },
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", images: [ogImage] },
  };
}

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://couponawy.com";

export default async function StorePage({ params }: PageProps) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) notFound();

  const coupons = await getCouponsForStore(store.id);
  const activeCount = coupons.length;

  // Build the same template input twice — used by both the long-copy + FAQ
  // components and by the FAQPage JSON-LD blob below.
  //
  // The 3 *Override fields read directly from the store row. When admin has
  // authored long-form Arabic copy for any block, the template function
  // returns the override verbatim; otherwise it falls back to programmatic
  // template output. This lets us ship template baseline for all 612 stores
  // and progressively upgrade the top 50 with editorial content.
  const templateInput = {
    nameAr: store.name_ar,
    shortDescription: store.short_description_ar,
    countryCode: store.country_code,
    activeCouponCount: activeCount,
    editorialIntroOverride: store.editorial_intro_ar,
    seasonalCalendarOverride: store.seasonal_calendar_ar,
    shippingInfoOverride: store.shipping_info_ar,
  } as const;

  const faqItems = storeFaq(templateInput);

  // Switched from `Organization` → `Store` (more specific, ranks better for
  // KSA "كوبونات {store}" queries). areaServed + currenciesAccepted +
  // paymentAccepted give Google enough to power local-intent rich results.
  // `inLanguage` ties this entity to the Arabic site for hreflang sanity.
  const storeJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: store.name_ar,
    url: store.website_url,
    inLanguage: "ar-SA",
    areaServed: ["SA", "AE", "KW", "BH", "OM", "QA"],
    currenciesAccepted: ["SAR", "AED", "KWD", "BHD", "OMR", "QAR"],
    paymentAccepted: "Credit Card, Debit Card, Apple Pay, Mada, Tabby, Tamara, Cash on Delivery",
    ...(store.logo_url ? { logo: store.logo_url } : {}),
    ...(store.short_description_ar
      ? { description: store.short_description_ar }
      : {}),
    ...(store.rating != null
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: store.rating,
            ...(store.review_count != null
              ? { reviewCount: store.review_count }
              : { reviewCount: 1 }),
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    sameAs: [`${BASE_URL}/stores/${store.slug}`],
  };

  // ItemList of the store's active coupons — same pattern category pages use.
  // Cap at 30 so the JSON-LD stays a reasonable size; Google reads enough to
  // understand "this page lists N offers" without us shipping the full set.
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: coupons.slice(0, 30).map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE_URL}/coupons/${c.slug}`,
      name: c.title_ar,
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "المتاجر", item: `${BASE_URL}/stores` },
      {
        "@type": "ListItem",
        position: 3,
        name: store.name_ar,
        item: `${BASE_URL}/stores/${store.slug}`,
      },
    ],
  };

  const faqJsonLd = buildFaqJsonLd(faqItems);

  return (
    <main className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PageHero
        variant="subtle"
        breadcrumbs={[
          { href: "/", label: "الرئيسية" },
          { href: "/stores", label: "المتاجر" },
          { label: store.name_ar },
        ]}
        title={
          <span className="inline-flex flex-wrap items-center gap-3">
            كوبونات {store.name_ar}
            {store.is_verified && (
              <Badge variant="inverted">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                متجر موثّق
              </Badge>
            )}
          </span>
        }
        subtitle={store.short_description_ar ?? undefined}
        aside={
          // Logo lives in the hero aside slot — same container as before, just
          // managed by the shared PageHero so spacing/border-radius stays in sync.
          <div className="bg-white ring-white/30 flex h-24 w-24 items-center justify-center rounded-2xl ring-2 md:h-28 md:w-28">
            <StoreLogo
              logoUrl={store.logo_url}
              nameAr={store.name_ar}
              size="lg"
            />
          </div>
        }
      >
        <div className="font-accent flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/65">
          <span className="inline-flex items-center gap-2">
            <Tag className="text-brand-gold h-4 w-4" aria-hidden />
            <span className="text-brand-gold font-black">
              {toArabicNumerals(activeCount)}
            </span>{" "}
            {pluralizeCoupon(activeCount)}
          </span>
          {store.rating != null && (
            <span className="inline-flex items-center gap-2">
              <Star className="text-brand-gold h-4 w-4" aria-hidden />
              <span className="text-brand-gold font-black">
                {toArabicNumerals(store.rating.toFixed(1))}
              </span>
              {store.review_count != null && (
                <span className="text-white/55">
                  ({toArabicNumerals(store.review_count)} تقييم)
                </span>
              )}
            </span>
          )}
        </div>
        <div className="pt-2">
          <Button asChild variant="gold" size="md">
            <a
              href={buildOutboundUrl(store.website_url, {
                surface: "store_hero",
                storeSlug: store.slug,
              })}
              target="_blank"
              rel="noopener noreferrer sponsored"
            >
              زيارة {store.name_ar}
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          </Button>
        </div>
      </PageHero>

      <Section spacing="lg">
        <SectionHeader
          title={`جميع كوبونات ${store.name_ar}`}
          cta={{ href: "/stores", label: "كل المتاجر" }}
        />

        {coupons.length === 0 ? (
          <EmptyState
            message="لا توجد كوبونات نشطة لهذا المتجر حالياً. تابعنا للحصول على أحدث العروض."
            cta={{ href: "/stores", label: "تصفّح المتاجر الأخرى" }}
          />
        ) : (
          <CouponGridWithFilters coupons={coupons} />
        )}
      </Section>

      {/* SEO long-copy + FAQ. Drives organic search traffic and gives readers
          context they actually need (how to use the code, what to expect). */}
      {store.description_ar ? (
        // Admin wrote a custom description — render it as the "about" block,
        // then add the standard how-to-use-steps from the template.
        <>
          <Section spacing="lg">
            <SectionHeader title={`عن ${store.name_ar}`} as="h2" />
            <div className="font-body text-warm-brown max-w-3xl space-y-4 whitespace-pre-line text-base leading-relaxed">
              {store.description_ar}
            </div>
          </Section>
          <StoreLongCopy {...templateInput} variant="steps-only" />
        </>
      ) : (
        // No admin description — generate both about + steps from templates.
        <StoreLongCopy {...templateInput} />
      )}

      <StoreFaq
        title={`الأسئلة الشائعة عن ${store.name_ar}`}
        items={faqItems}
        tone="default"
      />
    </main>
  );
}
