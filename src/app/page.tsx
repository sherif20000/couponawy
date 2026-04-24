import Link from "next/link";
import type { Metadata } from "next";
import { StoreLogo } from "@/components/stores/store-logo";
import {
  ArrowLeft,
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

const BASE_URL_META =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://couponawy.com";

export const metadata: Metadata = {
  title: {
    absolute: "كوبوناوي — كوبونات وعروض موثوقة من الأستاذ أبو عبدالله",
  },
  description:
    "كوبونات خصم وعروض مختارة بعناية للمتاجر الموثوقة في السعودية والخليج. جربها قبلك الأستاذ أبو عبدالله.",
  alternates: {
    canonical: BASE_URL_META,
    languages: {
      "ar-SA": BASE_URL_META,
      ar: BASE_URL_META,
    },
  },
  openGraph: {
    title: "كوبوناوي — كوبونات وعروض موثوقة",
    description:
      "كوبونات خصم وعروض مختارة بعناية للمتاجر الموثوقة في السعودية والخليج.",
    url: BASE_URL_META,
    type: "website",
  },
};

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
      <HeroSection />
      {categories.length > 0 && <CategoryFilterStrip categories={categories} />}
      <FeaturedCouponsSection coupons={coupons} />
      {expiringSoon.length > 0 && <ExpiringSoonSection coupons={expiringSoon} />}
      {trendingFiltered.length > 0 && <TrendingCouponsSection coupons={trendingFiltered} />}
      <StoresSection stores={stores} />
      <CategoriesSection categories={categories} categoryCounts={categoryCounts} />
    </main>
  );
}

function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden py-20 md:py-28"
      style={{
        background:
          "radial-gradient(ellipse at 70% 50%, oklch(41% 0.25 26) 0%, oklch(8% 0.005 26) 70%)",
      }}
    >
      {/* Subtle noise texture for depth */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />

      <Container size="xl" className="relative z-10">
        <div className="flex max-w-2xl flex-col gap-7">

          {/* Trust badge */}
          <div
            className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/80 animate-fade-up"
            style={{ animationDelay: "0ms" }}
          >
            <Sparkles className="h-3.5 w-3.5 text-brand-gold" aria-hidden />
            جربها قبلك الأستاذ أبو عبدالله
          </div>

          {/* Headline */}
          <h1
            id="hero-heading"
            className="font-display text-4xl font-black leading-[1.3] text-white animate-fade-up md:text-5xl lg:text-6xl"
            style={{ animationDelay: "75ms" }}
          >
            كوبونات خصم{" "}
            <span className="text-brand-gold">موثوقة</span>
            {" "}من أفضل متاجر
            <br className="hidden md:block" />
            {" "}السعودية والخليج
          </h1>

          {/* Sub-headline */}
          <p
            className="font-body max-w-md text-base leading-loose text-white/65 animate-fade-up"
            style={{ animationDelay: "150ms" }}
          >
            وفّر على كل طلب مع أكواد خصم مجرّبة ومحدّثة يومياً من نون، شي إن،
            أمازون، نهدي، جاهز والمزيد.
          </p>

          {/* Single CTA */}
          <div
            className="animate-fade-up"
            style={{ animationDelay: "225ms" }}
          >
            <Button asChild variant="gold" size="lg">
              <Link href="#featured-coupons">
                تصفح العروض الآن
                <ArrowLeft className="h-5 w-5" aria-hidden />
              </Link>
            </Button>
          </div>

          {/* ── Trust bar — slim social-proof strip, no boxes ───────── */}
          <div
            className="flex flex-wrap items-center border-t border-white/10 pt-5 animate-fade-up"
            style={{ animationDelay: "300ms" }}
          >
            {(
              [
                { number: "+٢٤٠٠", label: "كوبون فعّال" },
                { number: "+١٢٠", label: "متجر موثّق" },
                { number: "٧٠٪", label: "أقصى توفير" },
                { number: "يومي", label: "تحديث مستمر" },
              ] as const
            ).map((stat, i, arr) => (
              <span
                key={stat.label}
                className="font-body inline-flex items-baseline gap-1.5 px-4 text-sm text-white/55 first:ps-0 last:pe-0"
                style={
                  i < arr.length - 1
                    ? { borderInlineEndWidth: "1px", borderInlineEndColor: "oklch(100% 0 0 / 0.15)" }
                    : undefined
                }
              >
                <span className="font-display font-black text-brand-gold">
                  {stat.number}
                </span>
                {stat.label}
              </span>
            ))}
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
    <section id="featured-coupons" className="scroll-mt-32 py-16">
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
                <div className="bg-cream ring-brand-gold/20 group-hover:ring-brand-red/40 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 shadow-sm transition-all duration-200 group-hover:shadow-md md:h-16 md:w-16">
                  <StoreLogo
                    logoUrl={store.logo_url}
                    nameAr={store.name_ar}
                    size="md"
                  />
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
                    <span className="font-accent bg-brand-gold/15 text-charcoal group-hover:bg-cream/20 group-hover:text-cream rounded-full px-1.5 py-0.5 text-xs font-bold leading-none transition-colors">
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

// ─── Category filter strip ───────────────────────────────────────────────────
// Horizontal scrollable pill row that lives between the hero and featured grid.
// "الكل" is always active-styled; remaining pills link to category pages.

function CategoryFilterStrip({
  categories,
}: {
  categories: Awaited<ReturnType<typeof getFeaturedCategories>>;
}) {
  return (
    <nav aria-label="تصفية الكوبونات حسب القسم" className="sticky top-16 z-40 border-b border-brand-gold/15 bg-cream">
      <Container size="xl">
        <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto py-3">
          {/* "All" pill — always rendered first, styled as active */}
          <Link
            href="/coupons"
            className="font-display shrink-0 rounded-full bg-brand-red px-5 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-red-dark"
          >
            الكل
          </Link>
          {/* Category pills */}
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="font-display shrink-0 rounded-full border border-brand-gold/25 bg-cream px-5 py-2 text-sm font-semibold text-charcoal transition-colors hover:border-brand-red hover:bg-brand-red hover:text-white"
            >
              {category.name_ar}
            </Link>
          ))}
        </div>
      </Container>
    </nav>
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
    <section className="border-warm-brown/10 border-y py-16">
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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 stagger-children">
          {coupons.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} className="animate-fade-up" />
          ))}
        </div>
      </Container>
    </section>
  );
}

