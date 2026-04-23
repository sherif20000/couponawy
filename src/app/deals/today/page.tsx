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
  title: "عروض اليوم | كوبوناوي",
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
            <span className="text-charcoal">عروض اليوم</span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="bg-danger/10 text-danger flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <Flame className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            </span>
            <div>
              <h1 className="font-display text-charcoal text-3xl font-extrabold md:text-4xl">
                عروض اليوم
              </h1>
              <p className="font-body text-warm-brown mt-1 text-base">
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
