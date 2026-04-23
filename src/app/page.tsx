import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Sparkles,
  Flame,
  TrendingUp,
  ShoppingBag,
  Shirt,
  UtensilsCrossed,
  HeartPulse,
  House,
  Baby,
  Plane,
  ShoppingCart,
  Briefcase,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/brand/logo";
import { Mascot } from "@/components/brand/mascot";
import { CouponCard } from "@/components/coupons/coupon-card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import {
  getFeaturedCoupons,
  getFeaturedStores,
  getFeaturedCategories,
  getExpiringSoonCoupons,
  getTrendingCoupons,
} from "@/lib/queries/homepage";
import { getCategoryCouponCounts } from "@/lib/queries/categories";
import { getPreferredCountry } from "@/lib/utils/country";

// force-dynamic so the country cookie is read per-request for personalised results
export const dynamic = "force-dynamic";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://couponawy.com";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "كوبوناوي",
  url: BASE_URL,
  inLanguage: "ar",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default async function Home() {
  const countryCode = await getPreferredCountry();

  const [coupons, expiringSoon, trending, stores, categories, categoryCounts] = await Promise.all([
    getFeaturedCoupons(8, countryCode),
    getExpiringSoonCoupons(4, countryCode),
    getTrendingCoupons(8, countryCode),
    getFeaturedStores(10),
    getFeaturedCategories(10),
    getCategoryCouponCounts(),
  ]);

  // Filter out coupons already shown in the featured section to avoid duplicates
  const featuredIds = new Set(coupons.map((c) => c.id));
  const trendingFiltered = trending.filter((c) => !featuredIds.has(c.id));

  return (
    <main className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <HeroSection couponCount={coupons.length} storeCount={stores.length} />
      <FeaturedCouponsSection coupons={coupons} />
      {expiringSoon.length > 0 && <ExpiringSoonSection coupons={expiringSoon} />}
      {trendingFiltered.length > 0 && <TrendingCouponsSection coupons={trendingFiltered} />}
      <StoresSection stores={stores} />
      <CategoriesSection categories={categories} categoryCounts={categoryCounts} />
    </main>
  );
}

function HeroSection({
  couponCount,
  storeCount,
}: {
  couponCount: number;
  storeCount: number;
}) {
  return (
    <section className="bg-gradient-to-b from-cream-dark/60 to-cream relative overflow-hidden py-16 md:py-24">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 10%, var(--color-brand-red) 0, transparent 40%), radial-gradient(circle at 80% 80%, var(--color-brand-gold) 0, transparent 40%)",
        }}
      />
      <Container size="lg" className="relative z-10">
        <div className="flex flex-col items-center gap-8 text-center">
          <Badge variant="outline" className="!text-sm animate-fade-up" style={{ animationDelay: "0ms" }}>
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            جربها قبلك الأستاذ أبو عبدالله
          </Badge>

          {/* Value proposition leads — mascot/logo follow as brand decoration */}
          <h1
            className="font-display text-charcoal max-w-3xl text-3xl font-extrabold leading-[1.4] md:text-5xl animate-fade-up"
            style={{ animationDelay: "75ms" }}
          >
            كوبونات خصم <span className="text-brand-red">موثوقة</span> من
            أفضل المتاجر في السعودية
          </h1>

          <p
            className="font-body text-warm-brown max-w-2xl text-lg leading-loose animate-fade-up"
            style={{ animationDelay: "150ms" }}
          >
            وفّر على كل طلب مع أكواد خصم مجرّبة ومحدّثة يومياً من نون، شي إن،
            أمازون، نهدي، جاهز والمزيد.
          </p>

          <div
            className="flex flex-col items-center gap-3 sm:flex-row animate-fade-up"
            style={{ animationDelay: "225ms" }}
          >
            <Button asChild variant="primary" size="lg">
              <Link href="#featured-coupons">
                تصفح العروض
                <ArrowLeft className="h-5 w-5" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/stores">جميع المتاجر</Link>
            </Button>
          </div>

          {/* Brand mark — decorative, below the CTA */}
          <div
            className="flex flex-col items-center gap-3 pt-2 animate-fade-up"
            style={{ animationDelay: "300ms" }}
          >
            <Mascot size="md" />
            <Logo className="text-3xl md:text-4xl" />
          </div>

          <div
            className="text-warm-brown-light font-accent flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm animate-fade-up"
            style={{ animationDelay: "375ms" }}
          >
            <span className="inline-flex items-center gap-2">
              <BadgeCheck className="text-brand-red h-4 w-4" aria-hidden />
              {couponCount}+ كوبون نشط
            </span>
            <span className="inline-flex items-center gap-2">
              <BadgeCheck className="text-brand-red h-4 w-4" aria-hidden />
              {storeCount}+ متجر موثّق
            </span>
            <span className="inline-flex items-center gap-2">
              <BadgeCheck className="text-brand-red h-4 w-4" aria-hidden />
              تحقّق يومي من الصلاحية
            </span>
          </div>

          {/* Freshness signal */}
          <div
            className="font-accent text-warm-brown-light inline-flex items-center gap-2 text-xs animate-fade-up"
            style={{ animationDelay: "450ms" }}
          >
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="bg-success absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />
              <span className="bg-success relative inline-flex h-2 w-2 rounded-full" />
            </span>
            يُحدَّث كل 5 دقائق
          </div>
        </div>
      </Container>
    </section>
  );
}

function SectionHeader({
  title,
  subtitle,
  cta,
}: {
  title: string;
  subtitle?: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-charcoal text-2xl font-extrabold md:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="font-body text-warm-brown text-sm md:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {cta && (
        <Link
          href={cta.href}
          className="font-body text-brand-red hover:text-brand-red-dark inline-flex items-center gap-1 text-sm font-semibold transition-colors"
        >
          {cta.label}
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}

function FeaturedCouponsSection({
  coupons,
}: {
  coupons: Awaited<ReturnType<typeof getFeaturedCoupons>>;
}) {
  return (
    <section id="featured-coupons" className="py-16">
      <Container size="xl">
        <SectionHeader
          title="أفضل الكوبونات هذا الأسبوع"
          subtitle="عروض مختارة بعناية، مجرّبة وجاهزة للاستخدام"
          cta={{ href: "/coupons", label: "كل الكوبونات" }}
        />
        {coupons.length === 0 ? (
          <EmptyState message="لا توجد كوبونات مميّزة حالياً" cta={{ href: "/coupons", label: "تصفح جميع الكوبونات" }} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 stagger-children">
            {coupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} className="animate-fade-up" />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

function StoresSection({
  stores,
}: {
  stores: Awaited<ReturnType<typeof getFeaturedStores>>;
}) {
  return (
    <section className="bg-cream-dark/30 py-14">
      <Container size="xl">
        <SectionHeader
          title="متاجر نثق بها"
          subtitle="أكثر المتاجر شعبية في السعودية والخليج"
          cta={{ href: "/stores", label: "كل المتاجر" }}
        />
        {stores.length === 0 ? (
          <EmptyState message="لا توجد متاجر بعد" />
        ) : (
          // Logo strip — horizontal scroll on mobile, wrap on desktop
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {stores.map((store) => (
              <Link
                key={store.id}
                href={`/stores/${store.slug}`}
                className="group flex flex-col items-center gap-2"
                title={store.name_ar}
              >
                <div className="bg-cream ring-brand-gold/20 group-hover:ring-brand-red/40 flex h-14 w-14 shrink-0 items-center justify-center rounded-full ring-2 shadow-sm transition-all duration-200 group-hover:shadow-md md:h-16 md:w-16">
                  {store.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={store.logo_url}
                      alt={store.name_ar}
                      className="h-10 w-10 rounded-full object-contain md:h-12 md:w-12"
                    />
                  ) : (
                    <span className="font-display text-brand-red text-sm font-extrabold">
                      {store.name_ar.slice(0, 2)}
                    </span>
                  )}
                </div>
                <span className="font-body text-warm-brown group-hover:text-brand-red w-16 truncate text-center text-[11px] transition-colors">
                  {store.name_ar}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  electronics: ShoppingBag,
  fashion: Shirt,
  beauty: Sparkles,
  food: UtensilsCrossed,
  pharmacy: HeartPulse,
  home: House,
  kids: Baby,
  travel: Plane,
  grocery: ShoppingCart,
  services: Briefcase,
};

function CategoriesSection({
  categories,
  categoryCounts,
}: {
  categories: Awaited<ReturnType<typeof getFeaturedCategories>>;
  categoryCounts: Record<string, number>;
}) {
  return (
    <section className="py-14">
      <Container size="xl">
        <SectionHeader
          title="تسوّق حسب القسم"
          subtitle="اعثر على العرض المناسب لاحتياجك"
        />
        {categories.length === 0 ? (
          <EmptyState message="لا توجد أقسام بعد" />
        ) : (
          // Pill/chip layout — compact, scannable, distinct from coupon cards
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
              const Icon = CATEGORY_ICONS[category.slug] ?? Tag;
              const count = categoryCounts[category.id];
              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className={cn(
                    "group inline-flex items-center gap-2 rounded-full border px-4 py-2.5 transition-all duration-200",
                    "bg-cream border-brand-gold/25 hover:bg-brand-red hover:border-brand-red hover:text-cream"
                  )}
                >
                  <Icon className="text-brand-red group-hover:text-cream group-hover:animate-icon-bounce h-4 w-4 shrink-0 transition-colors" strokeWidth={1.75} aria-hidden />
                  <span className="font-display text-charcoal group-hover:text-cream text-sm font-bold transition-colors">
                    {category.name_ar}
                  </span>
                  {count !== undefined && count > 0 && (
                    <span className="font-accent bg-brand-gold/15 text-brand-gold-dark group-hover:bg-cream/20 group-hover:text-cream rounded-full px-1.5 py-0.5 text-xs font-bold leading-none transition-colors">
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
}

function TrendingCouponsSection({
  coupons,
}: {
  coupons: Awaited<ReturnType<typeof getTrendingCoupons>>;
}) {
  return (
    <section className="bg-cream-dark/20 py-16">
      <Container size="xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="text-brand-red font-accent mb-1 inline-flex items-center gap-1.5 text-sm font-semibold">
              <TrendingUp className="h-4 w-4" aria-hidden />
              الأكثر استخداماً
            </div>
            <h2 className="font-display text-charcoal text-2xl font-extrabold md:text-3xl">
              كوبونات يستخدمها الجميع
            </h2>
            <p className="font-body text-warm-brown text-sm md:text-base">
              الأكواد الأكثر طلباً من مستخدمي كوبوناوي
            </p>
          </div>
          <Link
            href="/coupons"
            className="font-body text-brand-red hover:text-brand-red-dark inline-flex items-center gap-1 text-sm font-semibold transition-colors"
          >
            كل الكوبونات
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 stagger-children">
          {coupons.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} className="animate-fade-up" />
          ))}
        </div>
      </Container>
    </section>
  );
}

function ExpiringSoonSection({
  coupons,
}: {
  coupons: Awaited<ReturnType<typeof getExpiringSoonCoupons>>;
}) {
  return (
    <section className="bg-danger/5 border-danger/15 border-y py-16">
      <Container size="xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="text-danger font-accent mb-1 inline-flex items-center gap-1.5 text-sm font-semibold">
              <Flame className="h-4 w-4" aria-hidden />
              تنتهي قريباً
            </div>
            <h2 className="font-display text-charcoal text-2xl font-extrabold md:text-3xl">
              اغتنم الفرصة قبل فوات الأوان
            </h2>
            <p className="font-body text-warm-brown text-sm md:text-base">
              هذه الكوبونات تنتهي خلال 7 أيام
            </p>
          </div>
          <Link
            href="/coupons"
            className="font-body text-brand-red hover:text-brand-red-dark inline-flex items-center gap-1 text-sm font-semibold transition-colors"
          >
            كل الكوبونات
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {coupons.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} />
          ))}
        </div>
      </Container>
    </section>
  );
}

