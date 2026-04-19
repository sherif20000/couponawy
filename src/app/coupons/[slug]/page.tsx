import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Clock, BadgeCheck, Sparkles, Tag, ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { CouponCard } from "@/components/coupons/coupon-card";
import { CouponRevealHero } from "@/components/coupons/coupon-reveal-hero";
import {
  getCouponBySlug,
  getRelatedCoupons,
} from "@/lib/queries/detail";

export const revalidate = 300;

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
  const title = `${coupon.title_ar} — ${storeName} | كوبوناوي`;
  const description =
    coupon.meta_description ??
    coupon.description_ar ??
    `${coupon.title_ar} من ${storeName}. كود خصم مجرّب ومحدّث على كوبوناوي.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
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

  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-gradient-to-b from-cream-dark/60 to-cream border-brand-gold/20 border-b">
        <Container size="lg" className="py-10 md:py-14">
          <nav
            aria-label="مسار التنقّل"
            className="text-warm-brown-light font-accent mb-6 flex items-center gap-2 text-xs"
          >
            <Link href="/" className="hover:text-brand-green">
              الرئيسية
            </Link>
            <span>›</span>
            {coupon.store && (
              <>
                <Link
                  href={`/stores/${coupon.store.slug}`}
                  className="hover:text-brand-green"
                >
                  {storeName}
                </Link>
                <span>›</span>
              </>
            )}
            <span className="text-charcoal line-clamp-1">
              {coupon.title_ar}
            </span>
          </nav>

          <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
            {coupon.store && (
              <Link
                href={`/stores/${coupon.store.slug}`}
                className="bg-cream ring-brand-gold/40 hover:ring-brand-green/50 flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl ring-2 transition-all md:h-24 md:w-24"
                aria-label={storeName}
              >
                {coupon.store.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coupon.store.logo_url}
                    alt={storeName}
                    className="h-16 w-16 rounded-xl object-contain md:h-20 md:w-20"
                  />
                ) : (
                  <span className="font-display text-brand-green text-2xl font-extrabold">
                    {storeName.slice(0, 2)}
                  </span>
                )}
              </Link>
            )}

            <div className="flex flex-1 flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {coupon.store && (
                  <Link
                    href={`/stores/${coupon.store.slug}`}
                    className="font-display text-brand-green hover:text-brand-green-dark text-sm font-bold"
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
                  <Badge variant="outline">
                    <Tag className="h-3 w-3" aria-hidden />
                    {coupon.discount_display}
                  </Badge>
                )}
              </div>

              <h1 className="font-display text-charcoal text-2xl font-extrabold leading-tight md:text-4xl">
                {coupon.title_ar}
              </h1>

              {coupon.description_ar && (
                <p className="font-body text-warm-brown max-w-2xl text-base leading-loose md:text-lg">
                  {coupon.description_ar}
                </p>
              )}

              <div className="text-warm-brown-light font-accent flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                {days !== null && days <= 30 && (
                  <span
                    className={`inline-flex items-center gap-1.5 ${days <= 7 ? "text-danger font-semibold" : ""}`}
                  >
                    <Clock className="h-4 w-4" aria-hidden />
                    {days === 0
                      ? "ينتهي اليوم"
                      : days === 1
                        ? "ينتهي غداً"
                        : `ينتهي خلال ${days} يوماً`}
                  </span>
                )}
                {verifiedOn && (
                  <span className="inline-flex items-center gap-1.5">
                    <BadgeCheck className="text-brand-green h-4 w-4" aria-hidden />
                    آخر تحقّق: {verifiedOn}
                  </span>
                )}
                {coupon.success_rate != null && (
                  <span className="inline-flex items-center gap-1.5">
                    <BadgeCheck className="text-brand-green h-4 w-4" aria-hidden />
                    نسبة نجاح {Math.round(coupon.success_rate * 100)}%
                  </span>
                )}
              </div>

              <div className="mt-2">
                <CouponRevealHero
                  couponId={coupon.id}
                  destinationUrl={coupon.destination_url}
                  hasCode={hasCode}
                  storeName={storeName}
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container size="lg">
          <div className="grid gap-10 md:grid-cols-[2fr_1fr]">
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="font-display text-charcoal mb-4 text-xl font-extrabold md:text-2xl">
                  كيف أستخدم الكود؟
                </h2>
                <ol className="font-body text-warm-brown flex flex-col gap-3 text-base leading-relaxed">
                  <li className="flex gap-3">
                    <span className="bg-brand-green/10 text-brand-green font-display flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                      ١
                    </span>
                    <span>
                      اضغط على &quot;إظهار الكود&quot; لعرض كود الخصم ونسخه.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-brand-green/10 text-brand-green font-display flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                      ٢
                    </span>
                    <span>
                      انتقل إلى موقع {storeName} وأضف المنتجات إلى السلة كالمعتاد.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-brand-green/10 text-brand-green font-display flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                      ٣
                    </span>
                    <span>
                      الصق الكود في خانة &quot;كوبون الخصم&quot; عند إتمام الدفع
                      ليتم تطبيق الخصم.
                    </span>
                  </li>
                </ol>
              </div>

              {coupon.verification_note && (
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
                  className="font-body text-brand-green hover:text-brand-green-dark inline-flex items-center gap-1 text-sm font-semibold"
                >
                  كل كوبونات {storeName}
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                </Link>
              )}
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
