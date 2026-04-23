import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ExternalLink, BadgeCheck, Star, ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CouponGridWithFilters } from "@/components/coupons/coupon-grid-with-filters";
import { EmptyState } from "@/components/ui/empty-state";
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
    store.meta_title ?? `كوبونات ${store.name_ar} وعروض الخصم | كوبوناوي`;
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

  return (
    <main className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
      />
      <section className="bg-gradient-to-b from-cream-dark/60 to-cream border-brand-gold/20 border-b">
        <Container size="xl" className="py-10 md:py-14">
          <nav
            aria-label="مسار التنقّل"
            className="text-warm-brown-light font-accent mb-6 flex items-center gap-2 text-xs"
          >
            <Link href="/" className="hover:text-brand-red">
              الرئيسية
            </Link>
            <span>›</span>
            <Link href="/stores" className="hover:text-brand-red">
              المتاجر
            </Link>
            <span>›</span>
            <span className="text-charcoal">{store.name_ar}</span>
          </nav>

          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-8">
            <div className="bg-cream ring-brand-gold/40 flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl ring-2 md:h-28 md:w-28">
              {store.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={store.logo_url}
                  alt={store.name_ar}
                  className="h-20 w-20 rounded-xl object-contain md:h-24 md:w-24"
                />
              ) : (
                <span className="font-display text-brand-red text-3xl font-extrabold">
                  {store.name_ar.slice(0, 2)}
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-charcoal text-3xl font-extrabold md:text-4xl">
                  كوبونات {store.name_ar}
                </h1>
                {store.is_verified && (
                  <Badge variant="outline" className="!text-xs">
                    <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                    متجر موثّق
                  </Badge>
                )}
              </div>

              {store.short_description_ar && (
                <p className="font-body text-warm-brown max-w-2xl text-base leading-relaxed">
                  {store.short_description_ar}
                </p>
              )}

              <div className="text-warm-brown-light font-accent flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <span className="inline-flex items-center gap-2">
                  <BadgeCheck className="text-brand-red h-4 w-4" aria-hidden />
                  {activeCount} كوبون نشط
                </span>
                {store.rating != null && (
                  <span className="inline-flex items-center gap-2">
                    <Star
                      className="text-brand-gold-dark h-4 w-4"
                      aria-hidden
                    />
                    {store.rating.toFixed(1)}
                    {store.review_count != null && (
                      <span className="text-warm-brown-light">
                        ({store.review_count} تقييم)
                      </span>
                    )}
                  </span>
                )}
              </div>

              <div className="mt-2">
                <Button asChild variant="primary" size="md">
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
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container size="xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-charcoal text-2xl font-extrabold md:text-3xl">
              جميع كوبونات {store.name_ar}
            </h2>
            <Link
              href="/stores"
              className="font-body text-brand-red hover:text-brand-red-dark inline-flex items-center gap-1 text-sm font-semibold"
            >
              كل المتاجر
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </Link>
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
        <section className="bg-cream-dark/30 py-12">
          <Container size="lg">
            <h2 className="font-display text-charcoal mb-4 text-xl font-extrabold md:text-2xl">
              عن {store.name_ar}
            </h2>
            <div className="font-body text-warm-brown max-w-3xl whitespace-pre-line text-base leading-loose">
              {store.description_ar}
            </div>
          </Container>
        </section>
      )}
    </main>
  );
}
