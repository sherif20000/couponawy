import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BookOpen, Calendar } from "lucide-react";
import { Section } from "@/components/shell/section";
import { SectionHeader } from "@/components/shell/section-header";
import { PageHero } from "@/components/shell/page-hero";
import { CouponGridWithFilters } from "@/components/coupons/coupon-grid-with-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { StoreFaq, buildFaqJsonLd } from "@/components/seo/store-faq";
import { ProseFromText } from "@/components/seo/store-long-copy";
import { StoreLogo } from "@/components/stores/store-logo";
import { BASE_URL } from "@/lib/utils/site";
import {
  aboutCategoryCopy,
  categoryFaq,
  categorySeasonalCalendar,
  categoryShoppingGuide,
} from "@/lib/content/store-templates";
import {
  getAllCategorySlugsBuildTime,
  getCategoryBySlug,
  getCouponsByCategory,
} from "@/lib/queries/categories";

export const revalidate = 300;

// See comment in src/app/coupons/[slug]/page.tsx — Next.js 16 + Vercel ISR
// soft-404s unknown slugs (renders not-found body but with HTTP 200).
// dynamicParams=false forces a hard 404 at the routing layer for any
// category slug not pre-rendered by generateStaticParams.
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  // Strip extra fields (updated_at, used by sitemap) — Next.js expects
  // params objects to contain only the dynamic segment values when
  // dynamicParams=false is in effect.
  const slugs = await getAllCategorySlugsBuildTime();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.seo_title ?? category.name_ar,
    description:
      category.seo_description ??
      `اعثر على أفضل كوبونات ${category.name_ar} المجرّبة والمحدّثة يومياً على كوبوناوي.`,
    alternates: {
      canonical: `${BASE_URL}/categories/${slug}`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const coupons = await getCouponsByCategory(category.id);

  const categoryUrl = `${BASE_URL}/categories/${slug}`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: BASE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "الأقسام",
        item: `${BASE_URL}/categories`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: category.name_ar,
        item: categoryUrl,
      },
    ],
  };

  const itemListJsonLd =
    coupons.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `كوبونات ${category.name_ar}`,
          url: categoryUrl,
          numberOfItems: coupons.length,
          itemListElement: coupons.slice(0, 10).map((coupon, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${BASE_URL}/coupons/${coupon.slug}`,
            name: coupon.title_ar,
          })),
        }
      : null;

  // Derive top stores from coupons (no extra DB roundtrip).
  // Dedupe by store.id, preserve order so featured stores appear first.
  const topStoresMap = new Map<
    string,
    NonNullable<(typeof coupons)[number]["store"]>
  >();
  for (const coupon of coupons) {
    if (coupon.store && !topStoresMap.has(coupon.store.id)) {
      topStoresMap.set(coupon.store.id, coupon.store);
    }
    if (topStoresMap.size >= 10) break;
  }
  const topStores = [...topStoresMap.values()];

  const templateInput = {
    nameAr: category.name_ar,
    description: category.description_ar,
    countryCode: null,
    activeCouponCount: coupons.length,
    topStoreCount: topStores.length,
    // Editorial overrides — admin-authored long-form Arabic copy. Template
    // functions return these verbatim when set, otherwise fall back to the
    // programmatic baseline.
    editorialIntroOverride: category.editorial_intro_ar,
    seasonalCalendarOverride: category.seasonal_calendar_ar,
    shoppingGuideOverride: category.shopping_guide_ar,
  } as const;

  const aboutText = aboutCategoryCopy(templateInput);
  const seasonalText = categorySeasonalCalendar(templateInput);
  const guideText = categoryShoppingGuide(templateInput);
  const faqItems = categoryFaq(templateInput);
  const faqJsonLd = buildFaqJsonLd(faqItems);

  return (
    <main className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <PageHero
        variant="subtle"
        breadcrumbs={[
          { href: "/", label: "الرئيسية" },
          { href: "/categories", label: "الأقسام" },
          { label: category.name_ar },
        ]}
        title={`كوبونات ${category.name_ar}`}
        subtitle={
          category.description_ar ??
          `${coupons.length} كوبون نشط في قسم ${category.name_ar}`
        }
      />

      <Section spacing="lg">
        {coupons.length === 0 ? (
          <EmptyState
            message="لا توجد كوبونات في هذا القسم حالياً."
            cta={{ href: "/coupons", label: "تصفّح جميع الكوبونات" }}
          />
        ) : (
          <CouponGridWithFilters coupons={coupons} />
        )}
      </Section>

      {/* Long-copy block — gives the category page real SEO depth.
          Falls back to template-generated copy when admin hasn't written one. */}
      <Section tone="muted" spacing="lg">
        <SectionHeader
          title={`عن قسم ${category.name_ar}`}
          subtitle={`${coupons.length} كوبون نشط${topStores.length > 0 ? ` من ${topStores.length} متجر` : ""}`}
          as="h2"
        />
        <ProseFromText text={aboutText} />
      </Section>

      {/* Shopping guide — generic checklist that helps shoppers buy smart in
          this category. ~300-400 ar words from the categoryShoppingGuide
          template (or admin override). */}
      <Section spacing="lg">
        <SectionHeader
          eyebrow={{ icon: BookOpen, label: "دليل الشراء", tone: "gold" }}
          title={`نصائح للشراء الذكي في قسم ${category.name_ar}`}
          subtitle="٧ خطوات قبل تطبيق أي كوبون"
          as="h2"
        />
        <ProseFromText text={guideText} />
      </Section>

      {/* Seasonal calendar — when do prices in this category drop. ~300-400
          ar words. Restored from category template; high editorial value. */}
      <Section tone="muted" spacing="lg">
        <SectionHeader
          eyebrow={{ icon: Calendar, label: "تقويم العروض", tone: "brand" }}
          title={`أفضل وقت للشراء في ${category.name_ar}`}
          subtitle="رمضان، الجمعة البيضاء، يوم التأسيس — متى تنخفض الأسعار؟"
          as="h2"
        />
        <ProseFromText text={seasonalText} />
      </Section>

      {/* Top stores in this category — links shoppers to store pages and adds
          internal-linking value for Google to crawl deeper into the site. */}
      {topStores.length > 0 && (
        <Section spacing="lg">
          <SectionHeader
            title={`أبرز المتاجر في ${category.name_ar}`}
            cta={{ href: "/stores", label: "كل المتاجر" }}
            as="h2"
          />
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            {topStores.map((store) => (
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
        </Section>
      )}

      <StoreFaq
        title={`أسئلة شائعة عن قسم ${category.name_ar}`}
        items={faqItems}
      />
    </main>
  );
}
