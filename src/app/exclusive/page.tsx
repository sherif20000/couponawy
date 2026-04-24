import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { CouponGridWithFilters } from "@/components/coupons/coupon-grid-with-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { getExclusiveCoupons } from "@/lib/queries/homepage";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "العروض الحصرية",
  description:
    "كوبونات وعروض حصرية لا تجدها في أي مكان آخر — منتقاة ومجرّبة من كوبوناوي.",
};

export default async function ExclusivePage() {
  const coupons = await getExclusiveCoupons();

  return (
    <main className="flex flex-1 flex-col">
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
            <span className="text-white">العروض الحصرية</span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gold/20 text-brand-gold">
              <Sparkles className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            </span>
            <div>
              <h1 className="font-display text-white text-3xl font-extrabold md:text-4xl">
                العروض الحصرية
              </h1>
              <p className="font-body text-white/70 mt-1 text-base">
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
