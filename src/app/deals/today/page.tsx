import Link from "next/link";
import { Flame } from "lucide-react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { CouponGridWithFilters } from "@/components/coupons/coupon-grid-with-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { getDealsOfTheDay } from "@/lib/queries/homepage";

// Revalidate every 5 minutes — deals of the day change frequently
export const revalidate = 300;

export const metadata: Metadata = {
  title: "عروض اليوم",
  description:
    "أفضل عروض وكوبونات اليوم من متاجر السعودية والخليج — محدّثة لحظة بلحظة.",
};

export default async function DealsOfTheDayPage() {
  const coupons = await getDealsOfTheDay();

  // Format today's date in Arabic (KSA)
  const today = new Intl.DateTimeFormat("ar-SA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Riyadh",
  }).format(new Date());

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
            <span className="text-white">عروض اليوم</span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
              <Flame className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            </span>
            <div>
              <h1 className="font-display text-white text-3xl font-extrabold md:text-4xl">
                عروض اليوم
              </h1>
              <p className="font-body text-white/70 mt-1 text-base">
                {coupons.length > 0
                  ? `${coupons.length} عرض · ${today}`
                  : today}
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container size="xl">
          {coupons.length === 0 ? (
            <EmptyState
              message="لم تُضَف كوبونات جديدة اليوم بعد — تحقّق لاحقاً."
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
