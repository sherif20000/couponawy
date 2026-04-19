"use client";

import * as React from "react";
import Link from "next/link";
import { Copy, Check, ExternalLink, Sparkles, Clock } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { FeaturedCoupon } from "@/lib/queries/homepage";

type CouponCardProps = {
  coupon: FeaturedCoupon;
  className?: string;
};

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function CouponCard({ coupon, className }: CouponCardProps) {
  const [revealed, setRevealed] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const days = daysUntil(coupon.expires_at);
  const hasCode = coupon.discount_type !== "free_shipping";

  async function handleReveal() {
    if (loading) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("reveal_coupon", {
        p_coupon_id: coupon.id,
      });
      if (error) throw error;
      if (!data) throw new Error("لا يوجد كود لهذا الكوبون");
      setRevealed(data);
      window.open(coupon.destination_url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("[reveal_coupon]", err);
      toast.error("تعذّر إظهار الكود، جرّب مرة أخرى");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!revealed) return;
    await navigator.clipboard.writeText(revealed);
    setCopied(true);
    toast.success("تم نسخ الكود");
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleGoToStore() {
    window.open(coupon.destination_url, "_blank", "noopener,noreferrer");
  }

  return (
    <Card
      className={cn(
        "group flex h-full flex-col overflow-hidden hover:-translate-y-0.5 hover:shadow-lg",
        className
      )}
    >
      <div className="bg-brand-green/5 border-brand-gold/20 flex items-start justify-between gap-3 border-b p-4">
        <div className="flex items-center gap-3">
          <div className="bg-cream ring-brand-gold/30 flex h-12 w-12 items-center justify-center rounded-full ring-2">
            <span className="font-display text-brand-green text-sm font-bold">
              {coupon.store?.name_ar?.slice(0, 2) ?? "؟"}
            </span>
          </div>
          <div className="flex flex-col">
            {coupon.store ? (
              <Link
                href={`/stores/${coupon.store.slug}`}
                className="font-display text-charcoal hover:text-brand-green text-sm font-bold"
              >
                {coupon.store.name_ar}
              </Link>
            ) : (
              <span className="font-display text-charcoal text-sm font-bold">
                متجر
              </span>
            )}
            <span className="text-warm-brown-light font-body text-xs">
              {coupon.discount_display ?? "عرض حصري"}
            </span>
          </div>
        </div>
        {coupon.is_exclusive && (
          <Badge variant="exclusive" className="shrink-0">
            <Sparkles className="h-3 w-3" aria-hidden />
            حصري
          </Badge>
        )}
      </div>

      <CardContent className="flex flex-1 flex-col gap-4 p-5">
        <h3 className="font-display text-charcoal text-base font-bold leading-snug">
          <Link
            href={`/coupons/${coupon.slug}`}
            className="hover:text-brand-green transition-colors"
          >
            {coupon.title_ar}
          </Link>
        </h3>

        {coupon.description_ar && (
          <p className="text-warm-brown font-body line-clamp-2 text-sm leading-relaxed">
            {coupon.description_ar}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-3">
          {days !== null && days <= 7 && (
            <div className="text-danger font-accent inline-flex items-center gap-1.5 text-xs font-semibold">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {days === 0
                ? "ينتهي اليوم"
                : days === 1
                  ? "ينتهي غداً"
                  : `ينتهي خلال ${days} أيام`}
            </div>
          )}

          {hasCode ? (
            revealed ? (
              <button
                onClick={handleCopy}
                className="border-brand-gold bg-brand-gold/10 hover:bg-brand-gold/20 group/code relative flex items-center justify-between gap-2 rounded-xl border-2 border-dashed p-3 transition-colors"
                aria-label="نسخ الكود"
              >
                <span className="font-display text-brand-green-dark text-lg font-extrabold tracking-wider">
                  {revealed}
                </span>
                <span className="text-warm-brown font-accent inline-flex items-center gap-1 text-xs">
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" aria-hidden />
                      تم النسخ
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" aria-hidden />
                      انسخ
                    </>
                  )}
                </span>
              </button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={handleReveal}
                disabled={loading}
                className="w-full"
              >
                {loading ? "جاري الإظهار..." : "إظهار الكود"}
                <ExternalLink className="h-4 w-4" aria-hidden />
              </Button>
            )
          ) : (
            <Button
              variant="gold"
              size="md"
              onClick={handleGoToStore}
              className="w-full"
            >
              الذهاب للمتجر
              <ExternalLink className="h-4 w-4" aria-hidden />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
