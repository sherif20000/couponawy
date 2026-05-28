import { Section } from "@/components/shell/section";
import { SectionHeader } from "@/components/shell/section-header";
import { CouponCard } from "@/components/coupons/coupon-card";
import type { FeaturedCoupon } from "@/lib/queries/homepage";

type Props = {
  coupons: FeaturedCoupon[];
  title?: string;
  subtitle?: string;
  cta?: { href: string; label: string };
  tone?: "default" | "muted" | "accent";
  /** Cap rendered cards (default 4 — one clean row at xl). */
  limit?: number;
};

/**
 * Presentational related-coupons rail. Mounted on editorial pages (guides,
 * calculator tools) so long-form content links back into live offers —
 * closing the affiliate loop on content that previously dead-ended. Data
 * fetching stays in the page; this component only renders.
 */
export function RelatedCoupons({
  coupons,
  title = "كوبونات مختارة قد تهمّك",
  subtitle,
  cta,
  tone = "muted",
  limit = 4,
}: Props) {
  if (coupons.length === 0) return null;
  const shown = coupons.slice(0, limit);

  return (
    <Section tone={tone} spacing="lg">
      <SectionHeader title={title} subtitle={subtitle} cta={cta} as="h2" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((coupon) => (
          <CouponCard key={coupon.id} coupon={coupon} />
        ))}
      </div>
    </Section>
  );
}
