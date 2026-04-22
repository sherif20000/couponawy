import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { CouponCard } from "@/components/coupons/coupon-card";
import {
  getAllCategorySlugsBuildTime,
  getCategoryBySlug,
  getCouponsByCategory,
} from "@/lib/queries/categories";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllCategorySlugsBuildTime();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.seo_title ?? `${category.name_ar} | كوبوناوي`,
    description:
      category.seo_description ??
      `اعثر على أفضل كوبونات ${category.name_ar} المجرّبة والمحدّثة يومياً على كوبوناوي.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const coupons = await getCouponsByCategory(category.id);

  return (
    <main className="flex flex-1 flex-col">
      <section className="from-cream-dark/60 to-cream border-brand-gold/20 border-b bg-gradient-to-b">
        <Container size="xl" className="py-10 md:py-14">
          <nav
            aria-label="مسار التنقّل"
            className="text-warm-brown-light font-accent mb-4 flex items-center gap-2 text-xs"
          >
            <Link href="/" className="hover:text-brand-green">
              الرئيسية
            </Link>
            <span>›</span>
            <Link href="/categories" className="hover:text-brand-green">
              الأقسام
            </Link>
            <span>›</span>
            <span className="text-charcoal">{category.name_ar}</span>
          </nav>
          <h1 className="font-display text-charcoal text-3xl font-extrabold md:text-4xl">
            كوبونات {category.name_ar}
          </h1>
          {category.description_ar && (
            <p className="font-body text-warm-brown mt-2 text-base">
              {category.description_ar}
            </p>
          )}
          <p className="font-body text-warm-brown-light mt-2 text-sm">
            {coupons.length} كوبون نشط
          </p>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container size="xl">
          {coupons.length === 0 ? (
            <div className="border-brand-gold/30 bg-cream-dark/30 font-body text-warm-brown rounded-2xl border border-dashed p-12 text-center">
              لا توجد كوبونات في هذا القسم حالياً.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {coupons.map((coupon) => (
                <CouponCard key={coupon.id} coupon={coupon} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
