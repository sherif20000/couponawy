import Link from "next/link";
import { StoreLogo } from "@/components/stores/store-logo";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Clock, BadgeCheck, Sparkles, Tag, ArrowLeft, AlertCircle, Flag } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { CouponCard } from "@/components/coupons/coupon-card";
import { CouponRevealHero } from "@/components/coupons/coupon-reveal-hero";
import {
  getCouponBySlug,
  getRelatedCoupons,
  getAllCouponSlugsBuildTime,
} from "@/lib/queries/detail";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllCouponSlugsBuildTime();
  return slugs.map(({ slug }) => ({ slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const coupon = await getCouponBySlug(slug);
  if (!coupon) return { title: "الكوبون غير موجود" };

  const storeName = coupon.store?.name_ar ?? "المتجر";
  const title = `${coupon.title_ar} — ${storeName}`;
  const description =
    coupon.meta_description ??
    coupon.description_ar ??
    `${coupon.title_ar} من ${storeName}. كود خصم مجرّب ومحدّث على كوبوناوي.`;

  const ogImage = coupon.store?.logo_url ?? null;

  const BASE_URL_META =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://couponawy.com";

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL_META}/coupons/${slug}`,
    },
    openGraph: {
      title,
      description,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://couponawy.com";

function buildCouponJsonLd(
  coupon: NonNullable<Awaited<ReturnType<typeof getCouponBySlug>>>
) {
  const storeName = coupon.store?.name_ar ?? "المتجر";
  const storeUrl = coupon.store ? `${BASE_URL}/stores/${coupon.store.slug}` : undefined;

  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Offer",
    name: coupon.title_ar,
    description:
      coupon.description_ar ??
      coupon.meta_description ??
      `${coupon.title_ar} من ${storeName}`,
    url: `${BASE_URL}/coupons/${coupon.slug}`,
    seller: {
      "@type": "Organization",
      name: storeName,
      ...(storeUrl ? { url: storeUrl } : {}),
    },
    inLanguage: "ar",
  };

  if (coupon.expires_at) {
    ld.validThrough = coupon.expires_at;
  }

  if (coupon.code) {
    ld.couponCode = coupon.code;
  }

  if (coupon.discount_type === "percentage" && coupon.discount_value != null) {
    ld.description = `خصم ${coupon.discount_value}٪ ${ld.description}`;
  } else if (coupon.discount_type === "fixed" && coupon.discount_value != null) {
    ld.description = `خصم ${coupon.discount_value} ريال ${ld.description}`;
  }

  return ld;
}

export default async function CouponPage({ params }: PageProps) {
  const { slug } = await params;
  const coupon = await getCouponBySlug(slug);
  if (!coupon) notFound();

  const related = await getRelatedCoupons(coupon.store_id, coupon.id, 4);
  const days = daysUntil(coupon.expires_at);
  const verifiedOn = formatDate(coupon.last_verified_at);
  const hasCode = coupon.discount_type !== "free_shipping";
  const storeName = coupon.store?.name_ar ?? "المتجر";
  const isExpired = coupon.status === "expired" || (coupon.expires_at != null && new Date(coupon.expires_at) < new Date());
  const couponJsonLd = buildCouponJsonLd(coupon);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: BASE_URL },
      ...(coupon.store
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: storeName,
              item: `${BASE_URL}/stores/${coupon.store.slug}`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: coupon.title_ar,
              item: `${BASE_URL}/coupons/${coupon.slug}`,
            },
          ]
        : [
            {
              "@type": "ListItem",
              position: 2,
              name: coupon.title_ar,
              item: `${BASE_URL}/coupons/${coupon.slug}`,
            },
          ]),
    ],
  };

  return (
    <main className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(couponJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <section className="bg-brand-red py-10 md:py-14">
        <Container size="lg">
          <nav
            aria-label="مسار التنقّل"
            className="font-accent mb-6 flex items-center gap-2 text-xs text-white/60"
          >
            <Link href="/" className="hover:text-white transition-colors">
              الرئيسية
            </Link>
            <span className="text-white/30">›</span>
            {coupon.store && (
              <>
                <Link
                  href={`/stores/${coupon.store.slug}`}
                  className="hover:text-white transition-colors"
                >
                  {storeName}
                </Link>
                <span className="text-white/30">›</span>
              </>
            )}
            <span className="text-white line-clamp-1">
              {coupon.title_ar}
            </span>
          </nav>

          <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
            {coupon.store && (
              <Link
                href={`/stores/${coupon.store.slug}`}
                className="bg-white ring-white/30 hover:ring-white/60 flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl ring-2 transition-all md:h-24 md:w-24"
                aria-label={storeName}
              >
                <StoreLogo
                  logoUrl={coupon.store.logo_url}
                  nameAr={storeName}
                  size="lg"
                />
              </Link>
            )}

            <div className="flex flex-1 flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {coupon.store && (
                  <Link
                    href={`/stores/${coupon.store.slug}`}
                    className="font-display text-brand-gold hover:text-brand-gold-light text-sm font-bold transition-colors"
                  >
                    {storeName}
                  </Link>
                )}
                {coupon.is_exclusive && (
                  <Badge variant="exclusive">
                    <Sparkles className="h-3 w-3" aria-hidden />
                    حصري
                  </Badge>
                )}
                {coupon.discount_display && (
                  <Badge variant="inverted">
                    <Tag className="h-3 w-3" aria-hidden />
                    {coupon.discount_display}
                  </Badge>
                )}
              </div>

              <h1 className="font-display text-white text-2xl font-extrabold leading-[1.4] md:text-4xl">
                {coupon.title_ar}
              </h1>

              {coupon.description_ar && (
                <p className="font-body text-white/70 max-w-2xl text-base leading-loose md:text-lg">
                  {coupon.description_ar}
                </p>
              )}

              <div className="font-accent flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/60">
                <span
                  className={`inline-flex items-center gap-1.5 ${
                    days === null
                      ? ""
                      : days === 0 || days <= 7
                        ? "text-brand-gold font-semibold"
                        : days <= 30
                          ? "text-brand-gold/80 font-medium"
                          : ""
                  }`}
                >
                  <Clock className="h-4 w-4" aria-hidden />
                  {days === null
                    ? "لا تنتهي"
                    : days === 0
                      ? "ينتهي اليوم"
                      : days === 1
                        ? "ينتهي غداً"
                        : days <= 7
                          ? `ينتهي خلال ${days} أيام`
                          : days <= 30
                            ? `ينتهي خلال ${days} يوماً`
                            : formatDate(coupon.expires_at) != null
                              ? `ينتهي ${formatDate(coupon.expires_at)}`
                              : ""}
                </span>
                {verifiedOn && (
                  <span className="inline-flex items-center gap-1.5">
                    <BadgeCheck className="text-brand-gold h-4 w-4" aria-hidden />
                    آخر تحقّق: {verifiedOn}
                  </span>
                )}
                {coupon.success_rate != null && (
                  <span className="inline-flex items-center gap-1.5">
                    <BadgeCheck className="text-brand-gold h-4 w-4" aria-hidden />
                    نسبة نجاح {Math.round(coupon.success_rate * 100)}%
                  </span>
                )}
              </div>

              <div className="mt-2">
                {isExpired ? (
                  <div className="flex items-start gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4">
                    <AlertCircle className="text-white mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                    <div>
                      <p className="font-body text-white text-sm font-semibold">
                        انتهت صلاحية هذا الكوبون
                      </p>
                      <p className="font-body text-white/70 mt-0.5 text-xs">
                        {related.length > 0
                          ? `تصفّح كوبونات ${storeName} الأخرى أدناه للعثور على عرض نشط.`
                          : "جرّب البحث عن كوبونات أخرى من نفس المتجر."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <CouponRevealHero
                    couponId={coupon.id}
                    storeId={coupon.store_id}
                    destinationUrl={coupon.destination_url}
                    hasCode={hasCode}
                    storeName={storeName}
                  />
                )}
              </div>

              {/* Secondary actions: WhatsApp share + Report */}
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`وجدت عرضاً رائعاً من ${storeName} على كوبوناوي! ${BASE_URL}/coupons/${coupon.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-white/60 hover:text-white inline-flex items-center gap-1.5 text-xs transition-colors"
                  aria-label="مشاركة على واتساب"
                >
                  {/* WhatsApp icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4 text-[#25D366]"
                    aria-hidden
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  مشاركة على واتساب
                </a>

                <Link
                  href={`/report-coupon?url=${encodeURIComponent(`${BASE_URL}/coupons/${coupon.slug}`)}`}
                  className="font-body text-white/40 hover:text-white/70 inline-flex items-center gap-1.5 text-xs transition-colors"
                >
                  <Flag className="h-3.5 w-3.5" aria-hidden />
                  الإبلاغ عن مشكلة
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container size="lg">
          <div className="grid gap-10 md:grid-cols-[2fr_1fr]">
            <div className="flex flex-col gap-8">
              {!isExpired && <div>
                <h2 className="font-display text-charcoal mb-4 text-xl font-extrabold md:text-2xl">
                  كيف أستخدم الكود؟
                </h2>
                <ol className="font-body text-warm-brown flex flex-col gap-3 text-base leading-relaxed">
                  <li className="flex gap-3">
                    <span className="bg-brand-red/10 text-brand-red font-display flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                      ١
                    </span>
                    <span>
                      اضغط على &quot;إظهار الكود&quot; لعرض كود الخصم ونسخه.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-brand-red/10 text-brand-red font-display flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                      ٢
                    </span>
                    <span>
                      انتقل إلى موقع {storeName} وأضف المنتجات إلى السلة كالمعتاد.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-brand-red/10 text-brand-red font-display flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                      ٣
                    </span>
                    <span>
                      الصق الكود في خانة &quot;كوبون الخصم&quot; عند إتمام الدفع
                      ليتم تطبيق الخصم.
                    </span>
                  </li>
                </ol>
              </div>}

              {!isExpired && coupon.verification_note && (
                <div className="border-brand-gold/30 bg-cream-dark/30 rounded-2xl border p-5">
                  <h3 className="font-display text-charcoal mb-2 text-base font-bold">
                    ملاحظة من فريق التحقق
                  </h3>
                  <p className="font-body text-warm-brown text-sm leading-relaxed">
                    {coupon.verification_note}
                  </p>
                </div>
              )}
            </div>

            <aside className="flex flex-col gap-4">
              <div className="border-brand-gold/30 bg-cream-dark/20 rounded-2xl border p-5">
                <h3 className="font-display text-charcoal mb-4 text-base font-bold">
                  تفاصيل الكوبون
                </h3>
                <dl className="font-body text-sm">
                  {coupon.min_order != null && (
                    <div className="border-brand-gold/20 flex justify-between border-b py-2">
                      <dt className="text-warm-brown-light">الحد الأدنى</dt>
                      <dd className="text-charcoal font-semibold">
                        {coupon.min_order} ريال
                      </dd>
                    </div>
                  )}
                  {coupon.max_discount != null && (
                    <div className="border-brand-gold/20 flex justify-between border-b py-2">
                      <dt className="text-warm-brown-light">أقصى خصم</dt>
                      <dd className="text-charcoal font-semibold">
                        {coupon.max_discount} ريال
                      </dd>
                    </div>
                  )}
                  {coupon.expires_at && (
                    <div className="border-brand-gold/20 flex justify-between border-b py-2">
                      <dt className="text-warm-brown-light">ينتهي في</dt>
                      <dd className="text-charcoal font-semibold">
                        {formatDate(coupon.expires_at)}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between py-2">
                    <dt className="text-warm-brown-light">عدد الاستخدامات</dt>
                    <dd className="text-charcoal font-semibold">
                      {coupon.reveal_count}
                    </dd>
                  </div>
                </dl>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {related.length > 0 && (
        <section className="bg-cream-dark/30 py-12 md:py-16">
          <Container size="xl">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-charcoal text-2xl font-extrabold md:text-3xl">
                كوبونات أخرى من {storeName}
              </h2>
              {coupon.store && (
                <Link
                  href={`/stores/${coupon.store.slug}`}
                  className="font-body text-brand-red hover:text-brand-red-dark inline-flex items-center gap-1 text-sm font-semibold"
                >
                  كل كوبونات {storeName}
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                </Link>
              )}
            </div>
            <div className="stagger-children grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {related.map((c) => (
                <CouponCard key={c.id} coupon={c} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </main>
  );
}
