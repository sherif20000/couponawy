import { Flame } from "lucide-react";
import type { Metadata } from "next";
import { Section } from "@/components/shell/section";
import { PageHero } from "@/components/shell/page-hero";
import { CouponGridWithFilters } from "@/components/coupons/coupon-grid-with-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { getDealsOfTheDay } from "@/lib/queries/homepage";

// Note: this route will be redirected to /coupons?expires=today in Block 7 cleanup.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "عروض اليوم",
  description:
    "أفضل عروض وكوبونات اليوم من متاجر السعودية والخليج — محدّثة لحظة بلحظة.",
};

export default async function DealsOfTheDayPage() {
  const coupons = await getDealsOfTheDay();

  const today = new Intl.DateTimeFormat("ar-SA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Riyadh",
  }).format(new Date());

  return (
    <main className="flex flex-1 flex-col">
      <PageHero
        variant="subtle"
        breadcrumbs={[
          { href: "/", label: "الرئيسية" },
          { label: "عروض اليوم" },
        ]}
        eyebrow={
          <>
            <Flame className="h-3.5 w-3.5 text-brand-gold" aria-hidden />
            {today}
          </>
        }
        title="عروض اليوم"
        subtitle={
          coupons.length > 0
            ? `${coupons.length} عرض جديد اليوم — مجرّبة لحظة بلحظة`
            : "محدّثة لحظة بلحظة من أكبر متاجر السعودية والخليج"
        }
      />

      <Section spacing="lg">
        {coupons.length === 0 ? (
          <EmptyState
            message="لم تُضَف كوبونات جديدة اليوم بعد — تحقّق لاحقاً."
            cta={{ href: "/coupons", label: "تصفّح جميع الكوبونات" }}
          />
        ) : (
          <CouponGridWithFilters coupons={coupons} />
        )}
      </Section>
    </main>
  );
}
