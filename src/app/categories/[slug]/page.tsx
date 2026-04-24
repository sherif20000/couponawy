import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { CouponGridWithFilters } from "@/components/coupons/coupon-grid-with-filters";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getAllCategorySlugsBuildTime,
  getCategoryBySlug,
  getCouponsByCategory,
} from "@/lib/queries/categories";

export const revalidate = 300;

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://couponawy.com";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllCategorySlugsBuildTime();
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
      { "@type": "ListItem", position: 2, name: "الأقسام", item: `${BASE_URL}/categories` },
      { "@type": "ListItem", position: 3, name: category.name_ar, item: categoryUrl },
    ],
  };

  const itemListJsonLd = coupons.length > 0
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
      <section className="bg-brand-red py-10 md:py-14">
        <Container size="xl">
          <nav
            aria-label="مسار التنقّل"
            className="font-accent mb-4 flex items-center gap-2 text-xs text-white/60"
          >
            <Link href="/" className="hover:text-white transition-colors">
              الرئيسية
            </Link>
            <span className="text-white/30">›</span>
            <Link href="/categories" className="hover:text-white transition-colors">
              الأقسام
            </Link>
            <span className="text-white/30">›</span>
            <span className="text-white">{category.name_ar}</span>
          </nav>
          <h1 className="font-display text-white text-3xl font-extrabold md:text-4xl">
            كوبونات {category.name_ar}
          </h1>
          {category.description_ar && (
            <p className="font-body text-white/70 mt-2 text-base">
              {category.description_ar}
            </p>
          )}
          <p className="font-body text-white/50 mt-2 text-sm">
            {coupons.length} كوبون نشط
          </p>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container size="xl">
          {coupons.length === 0 ? (
            <EmptyState
              message="لا توجد كوبونات في هذا القسم حالياً."
              cta={{ href: "/coupons", label: "تصفّح جميع الكوبونات" }}
            />
          ) : (
            <CouponGridWithFilters coupons={coupons} />
          )}
        </Container>
      </section>
    </main>
  );
}
