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
import { Section } from "@/components/shell/section";
import { SectionHeader } from "@/components/shell/section-header";
import { PageHero } from "@/components/shell/page-hero";
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
  // Stats live next to the headline, separated by hairline dividers.
  // Number + label pattern picked over boxed cards because a slim strip reads as confident,
  // not promotional — the hero earns trust through restraint, not stat-card clutter.
  const stats = [
    { number: "+٢٤٠٠", label: "كوبون فعّال" },
    { number: "+١٢٠", label: "متجر موثّق" },
    { number: "٧٠٪", label: "أقصى توفير" },
    { number: "يومي", label: "تحديث مستمر" },
  ] as const;

  return (
    <PageHero
      variant="brand"
      eyebrow={
        <>
          <Sparkles className="h-3.5 w-3.5 text-brand-gold" aria-hidden />
          جربها قبلك الأستاذ أبو عبدالله
        </>
      }
      title={
        <>
          كوبونات خصم <span className="text-brand-gold">موثوقة</span>{" "}
          من أفضل متاجر
          <br className="hidden md:block" /> السعودية والخليج
        </>
      }
      subtitle="وفّر على كل طلب مع أكواد خصم مجرّبة ومحدّثة يومياً من نون، شي إن، أمازون، نهدي، جاهز والمزيد."
    >
      {/* CTA */}
      <div className="animate-fade-up" style={{ animationDelay: "225ms" }}>
        <Button asChild variant="gold" size="lg">
          <Link href="#featured-coupons">
            تصفح العروض الآن
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </Link>
        </Button>
      </div>

      {/* Trust strip — hairline divider above, vertical separators between stats */}
      <div
        className="animate-fade-up flex flex-wrap items-center border-t border-white/10 pt-5"
        style={{ animationDelay: "300ms" }}
      >
        {stats.map((stat, i) => (
          <span
            key={stat.label}
            className="font-body inline-flex items-baseline gap-1.5 px-4 text-sm text-white/60 first:ps-0 last:pe-0"
            style={
              i < stats.length - 1
                ? {
                    borderInlineEndWidth: "1px",
                    borderInlineEndColor: "oklch(100% 0 0 / 0.15)",
                  }
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
    </PageHero>
  );
}

function FeaturedCouponsSection({
  coupons,
}: {
  coupons: Awaited<ReturnType<typeof getFeaturedCoupons>>;
}) {
  return (
    <Section spacing="lg" className="scroll-mt-32" id="featured-coupons">
      <SectionHeader
        title="أفضل الكوبونات هذا الأسبوع"
        subtitle="عروض مختارة بعناية، مجرّبة وجاهزة للاستخدام"
        cta={{ href: "/coupons", label: "كل الكوبونات" }}
      />
      {coupons.length === 0 ? (
        <EmptyState
          message="لا توجد كوبونات مميّزة حالياً"
          cta={{ href: "/coupons", label: "تصفح جميع الكوبونات" }}
        />
      ) : (
        <div className="stagger-children grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {coupons.map((coupon) => (
            <CouponCard
              key={coupon.id}
              coupon={coupon}
              className="animate-fade-up"
            />
          ))}
        </div>
      )}
    </Section>
  );
}

function StoresSection({
  stores,
}: {
  stores: Awaited<ReturnType<typeof getFeaturedStores>>;
}) {
  return (
    <Section tone="muted" spacing="md">
      <SectionHeader
        title="متاجر نثق بها"
        subtitle="أكثر المتاجر شعبية في السعودية والخليج"
        cta={{ href: "/stores", label: "كل المتاجر" }}
      />
      {stores.length === 0 ? (
        <EmptyState message="لا توجد متاجر بعد" />
      ) : (
        // Logo strip — wraps on all sizes; centered to feel like a curated showcase, not a list.
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          {stores.map((store) => (
            <Link
              key={store.id}
              href={`/stores/${store.slug}`}
              className="group flex flex-col items-center gap-2"
              title={store.name_ar}
            >
              <div className="bg-cream ring-brand-gold/20 group-hover:ring-brand-red/40 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full shadow-sm ring-2 transition-all duration-200 group-hover:shadow-md md:h-16 md:w-16">
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
    </Section>
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
    <Section spacing="md">
      <SectionHeader
        title="تسوّق حسب القسم"
        subtitle="اعثر على العرض المناسب لاحتياجك"
      />
      {categories.length === 0 ? (
        <EmptyState message="لا توجد أقسام بعد" />
      ) : (
        // Pill chips: compact + scannable + visually distinct from coupon cards.
        // Hover = full red fill so the affordance reads instantly.
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
                <Icon
                  className="text-brand-red group-hover:text-cream group-hover:animate-icon-bounce h-4 w-4 shrink-0 transition-colors"
                  strokeWidth={1.75}
                  aria-hidden
                />
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
    </Section>
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
    <nav
      aria-label="تصفية الكوبونات حسب القسم"
      className="sticky top-[88px] z-30 border-b border-brand-gold/15 bg-cream/95 backdrop-blur-sm"
    >
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
    <Section tone="muted" spacing="lg">
      <SectionHeader
        eyebrow={{ icon: TrendingUp, label: "الأكثر استخداماً", tone: "brand" }}
        title="كوبونات يستخدمها الجميع"
        subtitle="الأكواد الأكثر طلباً من مستخدمي كوبوناوي"
        cta={{ href: "/coupons", label: "كل الكوبونات" }}
      />
      <div className="stagger-children grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {coupons.map((coupon) => (
          <CouponCard
            key={coupon.id}
            coupon={coupon}
            className="animate-fade-up"
          />
        ))}
      </div>
    </Section>
  );
}

function ExpiringSoonSection({
  coupons,
}: {
  coupons: Awaited<ReturnType<typeof getExpiringSoonCoupons>>;
}) {
  return (
    <Section spacing="lg">
      <SectionHeader
        eyebrow={{ icon: Flame, label: "تنتهي قريباً", tone: "danger" }}
        title="اغتنم الفرصة قبل فوات الأوان"
        subtitle="هذه الكوبونات تنتهي خلال 7 أيام"
        cta={{ href: "/coupons", label: "كل الكوبونات" }}
      />
      <div className="stagger-children grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {coupons.map((coupon) => (
          <CouponCard
            key={coupon.id}
            coupon={coupon}
            className="animate-fade-up"
          />
        ))}
      </div>
    </Section>
  );
}

