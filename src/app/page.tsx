import Link from "next/link";
import type { Metadata } from "next";
import { StoreLogo } from "@/components/stores/store-logo";
import { BASE_URL } from "@/lib/utils/site";
import {
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

export const metadata: Metadata = {
  title: {
    absolute: "كوبوناوي — كوبونات وعروض موثوقة من الأستاذ أبو عبدالله",
  },
  description:
    "كوبونات خصم وعروض مختارة بعناية للمتاجر الموثوقة في السعودية والخليج. جربها قبلك الأستاذ أبو عبدالله.",
  alternates: {
    canonical: BASE_URL,
    languages: {
      "ar-SA": BASE_URL,
      ar: BASE_URL,
    },
  },
  openGraph: {
    title: "كوبوناوي — كوبونات وعروض موثوقة",
    description:
      "كوبونات خصم وعروض مختارة بعناية للمتاجر الموثوقة في السعودية والخليج.",
    url: BASE_URL,
    type: "website",
  },
};

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

  const [coupons, expiringSoon, trending, stores, categories, categoryCounts] =
    await Promise.all([
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
      {expiringSoon.length > 0 && (
        <ExpiringSoonSection coupons={expiringSoon} />
      )}
      {trendingFiltered.length > 0 && (
        <TrendingCouponsSection coupons={trendingFiltered} />
      )}
      <StoresSection stores={stores} />
      <CategoriesSection
        categories={categories}
        categoryCounts={categoryCounts}
      />
    </main>
  );
}

// ── Hero — Bold Bazaar spec (.impeccable.md §3) ──────────────────────────
// Dark crimson-to-near-black radial gradient. Two columns on desktop:
//   text right (RTL start), 2×2 stat cards left (RTL end).
// The single CTA is yellow on dark — the high-contrast moment the spec calls
// out as "the deal feeling". No search bar here (the header search handles
// intent navigation; this hero is for the first-time emotional pitch).
//
// Why we replaced the rotated floating-card hero: the floating cards made
// the page feel like a marketing template and competed with the live grid
// directly below. Stats are quieter, more credible, and let the headline
// breathe.
const HERO_STATS: Array<{ value: string; label: string }> = [
  { value: "500+", label: "متجر شريك" },
  { value: "2,400+", label: "كوبون فعّال" },
  { value: "يومي", label: "تحديث" },
  { value: "98%", label: "معدّل النجاح" },
];

function HeroSection() {
  return (
    <section
      className="relative overflow-hidden text-white"
      style={{
        background:
          "radial-gradient(ellipse at 65% 50%, oklch(41% 0.25 26) 0%, oklch(10% 0.008 26) 75%)",
      }}
    >
      <Container size="xl" className="relative py-16 md:py-24">
        <div className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
          {/* ── Right column (RTL start) — headline + CTA ─────────── */}
          <div className="flex flex-col gap-6">
            <h1
              className="font-display text-headline-xl animate-fade-up font-black"
              style={{ animationDelay: "0ms" }}
            >
              خصومات تصل
              <br />
              إلى <span className="text-brand-gold">70%</span>
            </h1>

            <p
              className="font-body animate-fade-up max-w-md text-base leading-[1.7] text-white/70 md:text-lg"
              style={{ animationDelay: "75ms" }}
            >
              اكتشف أفضل كوبونات الخصم من أكبر المتاجر العربية والعالمية —
              مُحقّقة يومياً، فعّالة فوراً.
            </p>

            <div
              className="animate-fade-up flex flex-wrap items-center gap-3"
              style={{ animationDelay: "150ms" }}
            >
              <Button asChild variant="gold" size="lg" className="rounded-xl">
                <Link href="/coupons">ابدأ التوفير الآن</Link>
              </Button>
            </div>
          </div>

          {/* ── Left column (RTL end) — 2×2 stat cards ───────────────
              Cards use bg-black/30 + brand-gold/15 border so they have
              real edge definition against the already-dark gradient.
              min-h locks the 2×2 grid to a stable height so single-word
              labels like "تحديث" don't collapse the cell.
              Semantic <dl>/<dt>/<dd> so screen readers announce each
              stat as a structured term + definition rather than a
              floating string of numbers and words. */}
          <dl className="grid grid-cols-2 gap-3 md:gap-4">
            {HERO_STATS.map((s, i) => (
              <div
                key={s.label}
                className="border-brand-gold/15 animate-fade-up flex min-h-[120px] flex-col justify-center rounded-2xl border bg-black/30 p-5 backdrop-blur-sm md:p-6"
                style={{ animationDelay: `${200 + i * 50}ms` }}
              >
                <dd className="font-display text-numeric-xl text-brand-gold text-3xl leading-none md:text-4xl">
                  {s.value}
                </dd>
                <dt className="font-body mt-2 whitespace-nowrap text-xs font-medium text-white/65 md:text-sm">
                  {s.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}

function FeaturedCouponsSection({
  coupons,
}: {
  coupons: Awaited<ReturnType<typeof getFeaturedCoupons>>;
}) {
  return (
    <Section spacing="lg" className="scroll-mt-32" id="featured-coupons">
      {/* Eyebrow matches the pattern used by Trending + Expiring sections.
          Without it the most-important section was the only one without
          an eyebrow tag — backward hierarchy per audit. */}
      <SectionHeader
        eyebrow={{ icon: Sparkles, label: "مختارة لك", tone: "gold" }}
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
    <Section tone="muted" spacing="lg">
      <SectionHeader
        title="متاجر نثق بها"
        subtitle="أكثر المتاجر شعبية في السعودية والخليج"
        cta={{ href: "/stores", label: "كل المتاجر" }}
      />
      {stores.length === 0 ? (
        <EmptyState message="لا توجد متاجر بعد" />
      ) : (
        // Trust-anchor showcase. Larger avatars (72-80px) + bigger name labels
        // give the section the visual weight a "stores we trust" claim demands —
        // per design audit, the prior 56-64px circles read as footer accessories.
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
          {stores.map((store) => (
            <Link
              key={store.id}
              href={`/stores/${store.slug}`}
              className="group flex flex-col items-center gap-2.5"
              title={store.name_ar}
            >
              <div className="bg-cream ring-brand-gold/25 group-hover:ring-brand-red/40 flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full shadow-sm ring-2 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md md:h-20 md:w-20">
                <StoreLogo
                  logoUrl={store.logo_url}
                  nameAr={store.name_ar}
                  size="lg"
                />
              </div>
              <span className="font-display text-charcoal group-hover:text-brand-red w-20 truncate text-center text-[13px] font-semibold transition-colors">
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
    <Section tone="muted" spacing="lg">
      {/* Role differentiation from the sticky top filter strip: that's a
          single-row FILTER (quick switch). This bottom section is the
          DESTINATION grid — bigger touch targets, larger icons, the
          coupon count as a real signal not a tiny badge. */}
      <SectionHeader
        eyebrow={{ icon: Tag, label: "تصفّح", tone: "brand" }}
        title="تسوّق حسب القسم"
        subtitle="اختر القسم وانطلق إلى أحدث العروض"
      />
      {categories.length === 0 ? (
        <EmptyState message="لا توجد أقسام بعد" />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((category) => {
            const Icon = CATEGORY_ICONS[category.slug] ?? Tag;
            const count = categoryCounts[category.id];
            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className={cn(
                  "group bg-cream border-brand-gold/25 hover:border-brand-red/40 active:scale-[0.97]",
                  "flex flex-col items-center justify-center gap-2 rounded-2xl border p-5 shadow-sm",
                  "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                )}
              >
                <div className="bg-brand-red/8 group-hover:bg-brand-red/15 flex h-12 w-12 items-center justify-center rounded-xl transition-colors">
                  <Icon
                    className="text-brand-red h-6 w-6 transition-transform group-hover:scale-110"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </div>
                <span className="font-display text-charcoal text-sm font-bold leading-tight">
                  {category.name_ar}
                </span>
                {count !== undefined && count > 0 && (
                  <span className="font-accent text-warm-brown text-[11px] font-medium">
                    {count} كوبون
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
      // top-[104px] = ticker (~40px) + header (h-16 = 64px). Was 88px which
      // tucked the strip under the bottom 16px of the header on scroll.
      className="sticky top-[104px] z-30 border-b border-brand-gold/15 bg-cream/95 backdrop-blur-sm"
    >
      <Container size="xl">
        <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto py-3">
          {/* "All" pill — visual anchor for the row, but NOT in a pressed/active
              state. Audit flagged the previous shadow-brand + font-black combo
              as a false "you are on /coupons" signal even when viewing the
              homepage. Now reads as a clear primary CTA: solid red, bold (not
              black), no inset shadow. */}
          <Link
            href="/coupons"
            className="font-display shrink-0 rounded-full bg-brand-red px-5 py-2 text-sm font-bold text-white transition-all duration-150 hover:bg-brand-red-dark active:scale-[0.97]"
          >
            الكل
          </Link>
          {/* Category pills — lighter weight + active-press feedback */}
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="font-display shrink-0 rounded-full border border-brand-gold/25 bg-cream px-5 py-2 text-sm font-semibold text-charcoal transition-all duration-150 hover:border-brand-red hover:bg-brand-red hover:text-white active:scale-[0.97]"
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
            variant="trending"
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
