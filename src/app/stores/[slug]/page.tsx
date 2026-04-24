import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ExternalLink, BadgeCheck, Star, ArrowRight, Tag } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CouponGridWithFilters } from "@/components/coupons/coupon-grid-with-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { StoreLogo } from "@/components/stores/store-logo";
import { toArabicNumerals, pluralizeCoupon } from "@/lib/utils";
import {
  getStoreBySlug,
  getCouponsForStore,
  getAllStoreSlugsBuildTime,
} from "@/lib/queries/detail";

export const revalidate = 300;

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

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL_META}/stores/${slug}`,
    },
    openGraph: {
      title,
      description,
      images: store.og_image ? [{ url: store.og_image }] : undefined,
    },
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

  const storeJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: store.name_ar,
    url: store.website_url,
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

  return (
    <main className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <section className="bg-brand-red py-10 md:py-14">
        <Container size="xl">
          <nav
            aria-label="مسار التنقّل"
            className="font-accent mb-6 flex items-center gap-2 text-xs text-white/60"
          >
            <Link
              href="/"
              className="rounded-sm transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
            >
              الرئيسية
            </Link>
            <span className="text-white/30">›</span>
            <Link
              href="/stores"
              className="rounded-sm transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
            >
              المتاجر
            </Link>
            <span className="text-white/30">›</span>
            <span className="text-white">{store.name_ar}</span>
          </nav>

          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-8">
            <div
              className="bg-white ring-white/30 animate-fade-up flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl ring-2 md:h-28 md:w-28"
              style={{ animationDelay: "0ms" }}
            >
              <StoreLogo
                logoUrl={store.logo_url}
                nameAr={store.name_ar}
                size="lg"
              />
            </div>

            <div className="flex flex-1 flex-col gap-3">
              <div
                className="animate-fade-up flex flex-wrap items-center gap-3"
                style={{ animationDelay: "75ms" }}
              >
                <h1 className="font-display text-white text-3xl font-extrabold md:text-4xl">
                  كوبونات {store.name_ar}
                </h1>
                {store.is_verified && (
                  <Badge variant="inverted">
                    <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                    متجر موثّق
                  </Badge>
                )}
              </div>

              {store.short_description_ar && (
                <p
                  className="font-body text-white/70 animate-fade-up max-w-2xl text-base leading-relaxed"
                  style={{ animationDelay: "150ms" }}
                >
                  {store.short_description_ar}
                </p>
              )}

              <div
                className="font-accent animate-fade-up flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/60"
                style={{ animationDelay: "225ms" }}
              >
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
                      <span className="text-white/50">
                        ({toArabicNumerals(store.review_count)} تقييم)
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>

            <div
              className="animate-fade-up w-full md:w-auto md:shrink-0"
              style={{ animationDelay: "300ms" }}
            >
              <Button asChild variant="gold" size="md" className="w-full md:w-auto">
                <a
                  href={store.website_url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                >
                  زيارة {store.name_ar}
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-16">
        <Container size="xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-charcoal text-3xl font-extrabold md:text-4xl">
              جميع كوبونات {store.name_ar}
            </h2>
            <Button asChild variant="primary" size="sm">
              <Link href="/stores">
                كل المتاجر
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>

          {coupons.length === 0 ? (
            <EmptyState
              message="لا توجد كوبونات نشطة لهذا المتجر حالياً. تابعنا للحصول على أحدث العروض."
              cta={{ href: "/stores", label: "تصفّح المتاجر الأخرى" }}
            />
          ) : (
            <CouponGridWithFilters coupons={coupons} />
          )}
        </Container>
      </section>

      {store.description_ar && (
        <section className="bg-cream-dark py-14">
          <Container size="lg">
            <h2 className="font-display text-charcoal mb-4 text-2xl font-extrabold md:text-3xl">
              عن {store.name_ar}
            </h2>
            <div className="font-body text-warm-brown max-w-3xl whitespace-pre-line text-base leading-relaxed">
              {store.description_ar}
            </div>
          </Container>
        </section>
      )}
    </main>
  );
}
