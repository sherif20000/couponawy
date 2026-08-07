"use client";

import * as React from "react";
import { Calculator } from "lucide-react";
import type { CouponDiscountType } from "@/lib/content/coupon-templates";

type Props = {
  discountType: CouponDiscountType;
  discountValue: number | null;
  maxDiscount?: number | null;
};

// Latin digits to match the site-wide numeral convention.
function fmt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

/**
 * Interactive offer savings calculator for the coupon sidebar. The visitor types
 * their cart total and sees the riyal saved + final price for THIS offer's exact
 * discount — an on-topic interaction that keeps users on the page (dwell time)
 * and makes the offer's value concrete. Only renders for percentage/fixed
 * offers (free-shipping/bogo have no cart-proportional figure to compute).
 */
export function CouponSavingsWidget({
  discountType,
  discountValue,
  maxDiscount,
}: Props) {
  const [cart, setCart] = React.useState(300);

  if (
    (discountType !== "percentage" && discountType !== "fixed") ||
    discountValue == null
  ) {
    return null;
  }

  let saving =
    discountType === "percentage"
      ? (cart * discountValue) / 100
      : Math.min(discountValue, cart);
  if (maxDiscount != null && saving > maxDiscount) saving = maxDiscount;
  saving = Math.max(0, Math.min(saving, cart));
  const finalPrice = Math.max(0, cart - saving);

  return (
    <div className="border-brand-gold/30 bg-cream rounded-2xl border p-5">
      <h3 className="font-display text-charcoal mb-1 inline-flex items-center gap-2 text-base font-bold">
        <Calculator className="text-brand-red h-4 w-4" aria-hidden />
        احسب توفيرك من هذا العرض
      </h3>
      <p className="font-body text-warm-brown-light mb-4 text-xs leading-relaxed">
        أدخل قيمة سلتك لترى كم ستوفّر فعلياً.
      </p>

      <label
        htmlFor="coupon-cart-total"
        className="font-body text-warm-brown mb-1.5 block text-xs font-semibold"
      >
        قيمة الطلب (ريال)
      </label>
      <input
        id="coupon-cart-total"
        type="number"
        inputMode="numeric"
        min={0}
        value={cart}
        onChange={(e) => setCart(Math.max(0, Number(e.target.value) || 0))}
        className="border-brand-gold/40 focus:border-brand-red font-body text-charcoal mb-4 w-full rounded-xl border bg-white px-3 py-2 text-sm tabular-nums outline-none transition-colors"
      />

      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="font-body text-warm-brown-light text-xs">توفيرك</div>
          <div className="font-display text-numeric-xl text-brand-red text-2xl leading-none">
            {fmt(saving)}
            <span className="ms-1 text-sm font-bold">ريال</span>
          </div>
        </div>
        <div className="text-end">
          <div className="font-body text-warm-brown-light text-xs">
            بعد الخصم
          </div>
          <div className="font-display text-numeric-md text-charcoal text-lg leading-none">
            {fmt(finalPrice)}
            <span className="ms-1 text-xs font-bold">ريال</span>
          </div>
        </div>
      </div>
    </div>
  );
}
