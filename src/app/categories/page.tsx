import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { CategoryCard } from "@/components/categories/category-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getAllCategories, getCategoryCouponCounts } from "@/lib/queries/categories";

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
            <span className="text-white">الأقسام</span>
          </nav>
          <h1 className="font-display text-white text-3xl font-extrabold md:text-4xl">
            جميع الأقسام
          </h1>
          <p className="font-body text-white/70 mt-2 text-base">
            {categories.length} قسم · اعثر على العرض المناسب لاحتياجك
          </p>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container size="xl">
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
        </Container>
      </section>
    </main>
  );
}
