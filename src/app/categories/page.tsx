import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { CategoryCard } from "@/components/categories/category-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getAllCategories, getCategoryCouponCounts } from "@/lib/queries/categories";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "جميع الأقسام | كوبوناوي",
  description:
    "تصفّح أقسام التسوّق على كوبوناوي واعثر على كوبونات الخصم المناسبة لاحتياجك.",
};

export default async function CategoriesPage() {
  const [categories, categoryCounts] = await Promise.all([
    getAllCategories(),
    getCategoryCouponCounts(),
  ]);

  return (
    <main className="flex flex-1 flex-col">
      <section className="from-cream-dark/60 to-cream border-brand-gold/20 border-b bg-gradient-to-b">
        <Container size="xl" className="py-10 md:py-14">
          <nav
            aria-label="مسار التنقّل"
            className="text-warm-brown-light font-accent mb-4 flex items-center gap-2 text-xs"
          >
            <Link href="/" className="hover:text-brand-red">
              الرئيسية
            </Link>
            <span>›</span>
            <span className="text-charcoal">الأقسام</span>
          </nav>
          <h1 className="font-display text-charcoal text-3xl font-extrabold md:text-4xl">
            جميع الأقسام
          </h1>
          <p className="font-body text-warm-brown mt-2 text-base">
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
