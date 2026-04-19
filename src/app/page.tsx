import Link from "next/link";
import { ArrowLeft, BadgeCheck, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/brand/logo";
import { Mascot } from "@/components/brand/mascot";
import { CouponCard } from "@/components/coupons/coupon-card";
import { StoreCard } from "@/components/stores/store-card";
import { CategoryCard } from "@/components/categories/category-card";
import {
  getFeaturedCoupons,
  getFeaturedStores,
  getFeaturedCategories,
} from "@/lib/queries/homepage";

export const revalidate = 300;

export default async function Home() {
  const [coupons, stores, categories] = await Promise.all([
    getFeaturedCoupons(8),
    getFeaturedStores(10),
    getFeaturedCategories(10),
  ]);

  return (
    <main className="flex flex-1 flex-col">
      <HeroSection couponCount={coupons.length} storeCount={stores.length} />
      <FeaturedCouponsSection coupons={coupons} />
      <StoresSection stores={stores} />
      <CategoriesSection categories={categories} />
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
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 10%, #006c35 0, transparent 40%), radial-gradient(circle at 80% 80%, #d4af37 0, transparent 40%)",
        }}
      />
      <Container size="lg" className="relative z-10">
        <div className="flex flex-col items-center gap-8 text-center">
          <Badge variant="outline" className="!text-sm">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            جربها قبلك الأستاذ أبو عبدالله
          </Badge>

          <div className="flex flex-col items-center gap-6">
            <Mascot size="lg" />
            <Logo className="text-4xl md:text-5xl" />
          </div>

          <h1 className="font-display text-charcoal max-w-3xl text-3xl font-extrabold leading-tight md:text-5xl">
            كوبونات خصم <span className="text-brand-green">موثوقة</span> من
            أفضل المتاجر في السعودية
          </h1>

          <p className="font-body text-warm-brown max-w-2xl text-lg leading-loose">
            وفّر على كل طلب مع أكواد خصم مجرّبة ومحدّثة يومياً من نون، شي إن،
            أمازون، نهدي، جاهز والمزيد.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row">
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

          <div className="text-warm-brown-light font-accent flex flex-wrap items-center justify-center gap-x-8 gap-y-2 pt-4 text-sm">
            <span className="inline-flex items-center gap-2">
              <BadgeCheck className="text-brand-green h-4 w-4" aria-hidden />
              {couponCount}+ كوبون نشط
            </span>
            <span className="inline-flex items-center gap-2">
              <BadgeCheck className="text-brand-green h-4 w-4" aria-hidden />
              {storeCount}+ متجر موثّق
            </span>
            <span className="inline-flex items-center gap-2">
              <BadgeCheck className="text-brand-green h-4 w-4" aria-hidden />
              تحقّق يومي من الصلاحية
            </span>
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
          className="font-body text-brand-green hover:text-brand-green-dark inline-flex items-center gap-1 text-sm font-semibold transition-colors"
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
          <EmptyState message="لا توجد كوبونات مميّزة حالياً" />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {coupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
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
    <section className="bg-cream-dark/30 py-16">
      <Container size="xl">
        <SectionHeader
          title="متاجر نثق بها"
          subtitle="أكثر المتاجر شعبية في السعودية والخليج"
          cta={{ href: "/stores", label: "كل المتاجر" }}
        />
        {stores.length === 0 ? (
          <EmptyState message="لا توجد متاجر بعد" />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

function CategoriesSection({
  categories,
}: {
  categories: Awaited<ReturnType<typeof getFeaturedCategories>>;
}) {
  return (
    <section className="py-16">
      <Container size="xl">
        <SectionHeader
          title="تسوّق حسب القسم"
          subtitle="اعثر على العرض المناسب لاحتياجك"
        />
        {categories.length === 0 ? (
          <EmptyState message="لا توجد أقسام بعد" />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="border-brand-gold/30 bg-cream-dark/30 text-warm-brown font-body rounded-2xl border border-dashed p-12 text-center">
      {message}
    </div>
  );
}
