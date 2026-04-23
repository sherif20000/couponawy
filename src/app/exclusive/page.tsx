import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { CouponGridWithFilters } from "@/components/coupons/coupon-grid-with-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { getExclusiveCoupons } from "@/lib/queries/homepage";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "العروض الحصرية | كوبوناوي",
  description:
    "كوبونات وعروض حصرية لا تجدها في أي مكان آخر — منتقاة ومجرّبة من كوبوناوي.",
};

export default async function ExclusivePage() {
  const coupons = await getExclusiveCoupons();

  return (
    <main className="flex flex-1 flex-col">
      <section className="from-cream-dark/60 to-cream border-brand-gold/20 border-b bg-gradient-to-b">
        <Container size="xl" className="py-10 md:py-14">
          <nav
            aria-label="مسار التنقّل"
            className="text-warm-brown-light font-accent mb-4 flex items-center gap-2 text-xs"
          >
            <Link href="/" className="hover:text-brand-red transition-colors">
              الرئيسية
            </Link>
            <span>›</span>
            <span className="text-charcoal">العروض الحصرية</span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="bg-brand-red/10 text-brand-red flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <Sparkles className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            </span>
            <div>
              <h1 className="font-display text-charcoal text-3xl font-extrabold md:text-4xl">
                العروض الحصرية
              </h1>
              <p className="font-body text-warm-brown mt-1 text-base">
                {coupons.length > 0
                  ? `${coupons.length} عرض حصري · لا تجدها في أي مكان آخر`
                  : "كوبونات حصرية لا تجدها في أي مكان آخر"}
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container size="xl">
          {coupons.length === 0 ? (
            <EmptyState
              message="لا توجد عروض حصرية نشطة حالياً — تحقّق لاحقاً."
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
