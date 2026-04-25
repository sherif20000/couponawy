import { Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { Section } from "@/components/shell/section";
import { PageHero } from "@/components/shell/page-hero";
import { CouponGridWithFilters } from "@/components/coupons/coupon-grid-with-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { getExclusiveCoupons } from "@/lib/queries/homepage";

// Note: this route will be redirected to /coupons?type=exclusive in Block 7 cleanup.
// Until then, the page renders so any existing inbound traffic still resolves.
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
      <PageHero
        variant="subtle"
        breadcrumbs={[
          { href: "/", label: "الرئيسية" },
          { label: "العروض الحصرية" },
        ]}
        eyebrow={
          <>
            <Sparkles className="h-3.5 w-3.5 text-brand-gold" aria-hidden />
            حصري على كوبوناوي
          </>
        }
        title="العروض الحصرية"
        subtitle={
          coupons.length > 0
            ? `${coupons.length} عرض حصري · لا تجدها في أي مكان آخر`
            : "كوبونات حصرية لا تجدها في أي مكان آخر"
        }
      />

      <Section spacing="lg">
        {coupons.length === 0 ? (
          <EmptyState
            message="لا توجد عروض حصرية نشطة حالياً — تحقّق لاحقاً."
            cta={{ href: "/coupons", label: "تصفّح جميع الكوبونات" }}
          />
        ) : (
          <CouponGridWithFilters coupons={coupons} />
        )}
      </Section>
    </main>
  );
}
