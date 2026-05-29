"use client";

import * as React from "react";
import { TrendingUp, BadgeCheck, Sparkles } from "lucide-react";

type Props = {
  revealCount: number;
  lastVerifiedAt: string | null;
  /** 0..1 */
  successRate: number | null;
};

// Ease-out count-up so the usage number animates from 0 on mount — turns a
// static stat into a small "live" moment without any network work.
function useCountUp(target: number, ms = 900): number {
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    if (target <= 0) {
      setN(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return n;
}

function freshnessLabel(iso: string | null): string | null {
  if (!iso) return null;
  const ageHours = (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60);
  if (ageHours <= 24) return "مُحقَّق اليوم";
  if (ageHours <= 24 * 7) return "مُحقَّق هذا الأسبوع";
  return "مُحقَّق مؤخّراً";
}

/**
 * Live trust signals for the coupon sidebar — usage count (animated), last-
 * verified freshness, and a success-rate meter. Dynamic proof that the offer is
 * real and active (EEAT trust). Renders nothing if there's no signal to show.
 */
export function CouponTrustSignals({ revealCount, lastVerifiedAt, successRate }: Props) {
  const count = useCountUp(revealCount);
  const fresh = freshnessLabel(lastVerifiedAt);
  const pct = successRate != null ? Math.round(successRate * 100) : null;

  if (revealCount <= 0 && !fresh && pct == null) return null;

  return (
    <div className="border-brand-gold/30 bg-cream-dark/20 flex flex-col gap-4 rounded-2xl border p-5">
      <h3 className="font-display text-charcoal text-base font-bold">إشارات الثقة</h3>

      {revealCount > 0 ? (
        <div className="flex items-center gap-2.5">
          <span className="bg-brand-red/10 text-brand-red flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
            <TrendingUp className="h-4 w-4" aria-hidden />
          </span>
          <span className="font-body text-warm-brown text-sm">
            <span className="font-display text-numeric-md text-charcoal">
              {count.toLocaleString("en-US")}
            </span>{" "}
            مرة استُخدم هذا العرض
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2.5">
          <span className="bg-brand-gold/20 text-brand-gold-dark flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <span className="font-body text-warm-brown text-sm">
            عرض جديد — كن أوّل المستفيدين
          </span>
        </div>
      )}

      {fresh && (
        <div className="flex items-center gap-2.5">
          <span className="bg-success/12 text-success flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
            <BadgeCheck className="h-4 w-4" aria-hidden />
          </span>
          <span className="font-body text-warm-brown text-sm">{fresh} من فريقنا</span>
        </div>
      )}

      {pct != null && (
        <div className="flex flex-col gap-1.5">
          <div className="font-body text-warm-brown flex items-center justify-between text-sm">
            <span>نسبة نجاح الكود</span>
            <span className="font-display text-numeric-md text-charcoal">{pct}%</span>
          </div>
          <div
            className="bg-cream-dark h-2 w-full overflow-hidden rounded-full"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="bg-success h-full rounded-full" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
