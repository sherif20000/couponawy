import type { Metadata } from "next";
import { CategoryCard } from "@/components/categories/category-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Section } from "@/components/shell/section";
import { PageHero } from "@/components/shell/page-hero";
import {
  getAllCategories,
  getCategoryCouponCounts,
} from "@/lib/queries/categories";

export const revalidate = 300;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://couponawy.com";

export const metadata: Metadata = {
  title: "جميع الأقسام",
  description:
    "تصفّح أقسام التسوّق على كوبوناوي واعثر على كوبونات الخصم المناسبة لاحتياجك.",
  alternates: {
    canonical: `${BASE_URL}/categories`,
  },
};

export default async function CategoriesPage() {
  const [categories, categoryCounts] = await Promise.all([
    getAllCategories(),
    getCategoryCouponCounts(),
  ]);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "الأقسام", item: `${BASE_URL}/categories` },
    ],
  };

  return (
    <main className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PageHero
        variant="subtle"
        breadcrumbs={[
          { href: "/", label: "الرئيسية" },
          { label: "الأقسام" },
        ]}
        title="جميع الأقسام"
        subtitle={`${categories.length} قسم · اعثر على العرض المناسب لاحتياجك`}
      />

      <Section spacing="lg">
        {categories.length === 0 ? (
          <EmptyState message="لا توجد أقسام بعد." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                couponCount={categoryCounts[category.id]}
              />
            ))}
          </div>
        )}
      </Section>
    </main>
  );
}
