"use client";

import * as React from "react";
import { Tag, Truck, Percent, LayoutGrid } from "lucide-react";
import { CouponCard } from "@/components/coupons/coupon-card";
import { cn } from "@/lib/utils";
import type { FeaturedCoupon } from "@/lib/queries/homepage";

type Filter = "all" | "code" | "deal" | "free_shipping";

const FILTERS: { id: Filter; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "الكل", icon: <LayoutGrid className="h-3.5 w-3.5" /> },
  { id: "code", label: "كود خصم", icon: <Percent className="h-3.5 w-3.5" /> },
  { id: "deal", label: "عرض مباشر", icon: <Tag className="h-3.5 w-3.5" /> },
  { id: "free_shipping", label: "شحن مجاني", icon: <Truck className="h-3.5 w-3.5" /> },
];

function matchesFilter(coupon: FeaturedCoupon, filter: Filter): boolean {
  if (filter === "all") return true;
  if (filter === "free_shipping") return coupon.discount_type === "free_shipping";
  // "deal" = bogo + other (non-numeric, non-shipping offer types)
  if (filter === "deal")
    return coupon.discount_type === "bogo" || coupon.discount_type === "other";
  // "code" = percentage + fixed (numeric discount with a code)
  return coupon.discount_type === "percentage" || coupon.discount_type === "fixed";
}

type Props = {
  coupons: FeaturedCoupon[];
};

export function CouponGridWithFilters({ coupons }: Props) {
  const [active, setActive] = React.useState<Filter>("all");

  const filtered = coupons.filter((c) => matchesFilter(c, active));

  // Count per filter for the badge
  const counts = React.useMemo(
    () =>
      FILTERS.reduce<Record<Filter, number>>(
        (acc, f) => {
          acc[f.id] = f.id === "all" ? coupons.length : coupons.filter((c) => matchesFilter(c, f.id)).length;
          return acc;
        },
        { all: 0, code: 0, deal: 0, free_shipping: 0 }
      ),
    [coupons]
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Filter bar */}
      <div
        role="group"
        aria-label="تصفية الكوبونات"
        className="flex flex-wrap gap-2"
      >
        {FILTERS.map((f) => {
          const isActive = active === f.id;
          // Don't show filters that have 0 coupons (except "all")
          if (f.id !== "all" && counts[f.id] === 0) return null;
          return (
            <button
              key={f.id}
              onClick={() => setActive(f.id)}
              aria-pressed={isActive}
              className={cn(
                "font-accent inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-150",
                isActive
                  ? "bg-brand-red border-brand-red text-cream shadow-sm"
                  : "bg-cream border-brand-gold/30 text-warm-brown hover:border-brand-red/40 hover:text-brand-red"
              )}
            >
              {f.icon}
              {f.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs font-bold leading-none",
                  isActive
                    ? "bg-white/20 text-cream"
                    : "bg-brand-gold/15 text-brand-gold-dark"
                )}
              >
                {counts[f.id]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="border-brand-gold/30 bg-cream-dark/30 font-body text-warm-brown rounded-2xl border border-dashed p-12 text-center">
          لا توجد كوبونات في هذا التصنيف حالياً.
        </div>
      ) : (
        <div
          className={cn(
            "stagger-children grid gap-5",
            filtered.length === 1
              ? "max-w-sm"
              : filtered.length === 2
                ? "sm:grid-cols-2"
                : filtered.length === 3
                  ? "sm:grid-cols-2 lg:grid-cols-3"
                  : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          )}
        >
          {filtered.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} />
          ))}
        </div>
      )}
    </div>
  );
}
