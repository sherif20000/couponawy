import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { CouponGridWithFilters } from "@/components/coupons/coupon-grid-with-filters";
import { getActiveCoupons } from "@/lib/queries/categories";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "جميع الكوبونات | كوبوناوي",
  description:
    "تصفّح جميع كوبونات الخصم المجرّبة والمحدّثة يومياً من أفضل المتاجر السعودية على كوبوناوي.",
};

export default async function CouponsPage() {
  const coupons = await getActiveCoupons();

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
            <span className="text-charcoal">الكوبونات</span>
          </nav>
          <h1 className="font-display text-charcoal text-3xl font-extrabold md:text-4xl">
            جميع الكوبونات
          </h1>
          <p className="font-body text-warm-brown mt-2 text-base">
            {coupons.length} كوبون · مجرّبة ومحدّثة يومياً
          </p>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container size="xl">
          {coupons.length === 0 ? (
            <div className="border-brand-gold/30 bg-cream-dark/30 font-body text-warm-brown rounded-2xl border border-dashed p-12 text-center">
              لا توجد كوبونات نشطة حالياً.
            </div>
          ) : (
            <CouponGridWithFilters coupons={coupons} />
          )}
        </Container>
      </section>
    </main>
  );
}
