"use client";

import * as React from "react";
import Link from "next/link";
import {
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Clock,
  Tag,
  Truck,
  Percent,
} from "lucide-react";
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

// ─── Helpers ────────────────────────────────────────────────────────────────

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatExpiryDate(iso: string): string {
  return new Intl.DateTimeFormat("ar-SA", {
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

// ─── Expiry indicator (always rendered) ─────────────────────────────────────

function ExpiryIndicator({ expiresAt }: { expiresAt: string | null }) {
  const days = daysUntil(expiresAt);

  if (days === null) {
    return (
      <span className="text-warm-brown-light font-accent inline-flex items-center gap-1 text-xs">
        <Clock className="h-3 w-3" aria-hidden />
        لا تنتهي
      </span>
    );
  }

  if (days === 0) {
    return (
      <span className="text-danger font-accent inline-flex items-center gap-1 text-xs font-bold">
        <Clock className="h-3 w-3" aria-hidden />
        ينتهي اليوم
      </span>
    );
  }

  if (days <= 7) {
    return (
      <span className="text-danger font-accent inline-flex items-center gap-1 text-xs font-semibold">
        <Clock className="h-3 w-3" aria-hidden />
        {days === 1 ? "ينتهي غداً" : `ينتهي خلال ${days} أيام`}
      </span>
    );
  }

  if (days <= 30) {
    return (
      <span className="text-warning font-accent inline-flex items-center gap-1 text-xs font-medium">
        <Clock className="h-3 w-3" aria-hidden />
        {`ينتهي خلال ${days} يوماً`}
      </span>
    );
  }

  return (
    <span className="text-warm-brown-light font-accent inline-flex items-center gap-1 text-xs">
      <Clock className="h-3 w-3" aria-hidden />
      {`ينتهي ${formatExpiryDate(expiresAt!)}`}
    </span>
  );
}

// ─── Coupon type tag ─────────────────────────────────────────────────────────

type CouponKind = "code" | "deal" | "free_shipping";

function resolveKind(discountType: string | null | undefined): CouponKind {
  if (discountType === "free_shipping") return "free_shipping";
  if (discountType === "bogo" || discountType === "other") return "deal";
  return "code"; // percentage, fixed, or unknown
}

function CouponTypeTag({ kind }: { kind: CouponKind }) {
  if (kind === "free_shipping") {
    return (
      <span className="font-accent inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
        <Truck className="h-2.5 w-2.5" aria-hidden />
        شحن مجاني
      </span>
    );
  }

  if (kind === "deal") {
    return (
      <span className="font-accent bg-brand-gold/10 text-brand-gold-dark ring-brand-gold/30 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold ring-1">
        <Tag className="h-2.5 w-2.5" aria-hidden />
        عرض مباشر
      </span>
    );
  }

  return (
    <span className="font-accent bg-brand-red/10 text-brand-red ring-brand-red/20 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold ring-1">
      <Percent className="h-2.5 w-2.5" aria-hidden />
      كود خصم
    </span>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function CouponCard({ coupon, className }: CouponCardProps) {
  const [revealed, setRevealed] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [logoError, setLogoError] = React.useState(false);

  const hasCode = coupon.discount_type !== "free_shipping";
  const kind = resolveKind(coupon.discount_type);

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
      // window.open is intentionally NOT called here —
      // user copies the code first, then taps the separate store button.
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

  function handleGoToStore() {
    // Fire-and-forget: track the click without blocking navigation
    const supabase = createClient();
    supabase.rpc("track_click", {
      p_coupon_id: coupon.id || null,
      p_store_id: coupon.store?.id || null,
      p_country_code:
        document.cookie
          .split("; ")
          .find((c) => c.startsWith("preferred_country="))
          ?.split("=")[1] ?? null,
      p_referrer: document.referrer || null,
      p_user_agent: navigator.userAgent || null,
    });
    window.open(coupon.destination_url, "_blank", "noopener,noreferrer");
  }

  return (
    <Card
      className={cn(
        "group flex h-full flex-col overflow-hidden hover:-translate-y-0.5 hover:shadow-lg",
        className
      )}
    >
      {/* ── Card header ─────────────────────────────────────────────── */}
      <div className="border-brand-gold/20 border-b p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Store info */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="bg-cream ring-brand-gold/30 flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2">
              {coupon.store?.logo_url && !logoError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coupon.store.logo_url}
                  alt={coupon.store.name_ar}
                  className="h-9 w-9 object-contain"
                  onError={() => setLogoError(true)}
                  onLoad={(e) => {
                    if ((e.target as HTMLImageElement).naturalWidth === 0)
                      setLogoError(true);
                  }}
                />
              ) : (
                <span className="font-display text-brand-red text-sm font-bold">
                  {coupon.store?.name_ar?.slice(0, 2) ?? "؟"}
                </span>
              )}
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              {coupon.store ? (
                <Link
                  href={`/stores/${coupon.store.slug}`}
                  className="font-display text-charcoal hover:text-brand-red truncate text-sm font-bold"
                >
                  {coupon.store.name_ar}
                </Link>
              ) : (
                <span className="font-display text-charcoal text-sm font-bold">
                  متجر
                </span>
              )}
              <CouponTypeTag kind={kind} />
            </div>
          </div>

          {/* Discount badge + exclusive badge */}
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            {coupon.discount_display && (
              <span className="font-display bg-brand-gold text-charcoal rounded-xl px-3 py-1.5 text-sm font-extrabold leading-none shadow-sm">
                {coupon.discount_display}
              </span>
            )}
            {coupon.is_exclusive && (
              <Badge variant="exclusive" className="shrink-0">
                <Sparkles className="h-3 w-3" aria-hidden />
                حصري
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* ── Card body ───────────────────────────────────────────────── */}
      <CardContent className="flex flex-1 flex-col gap-4 p-5">
        <h3 className="font-display text-charcoal text-base font-bold leading-snug">
          <Link
            href={`/coupons/${coupon.slug}`}
            className="hover:text-brand-red transition-colors"
          >
            {coupon.title_ar}
          </Link>
        </h3>

        {coupon.description_ar && (
          <p className="text-warm-brown font-body line-clamp-2 text-sm leading-relaxed">
            {coupon.description_ar}
          </p>
        )}

        {/* Screen-reader live region — announces the code when revealed */}
        <span className="sr-only" aria-live="polite" aria-atomic="true">
          {revealed ? `كود الخصم هو ${revealed}` : ""}
        </span>

        <div className="mt-auto flex flex-col gap-3">
          {/* Expiry — always shown */}
          <ExpiryIndicator expiresAt={coupon.expires_at} />

          {hasCode ? (
            revealed ? (
              <div className="flex flex-col gap-2 animate-reveal-pop">
                <button
                  onClick={handleCopy}
                  className={cn(
                    "border-brand-gold bg-brand-gold/10 hover:bg-brand-gold/20 group/code relative flex items-center justify-between gap-2 rounded-xl border-2 border-dashed p-3 transition-colors",
                    copied && "animate-gold-flash"
                  )}
                  aria-label="نسخ الكود"
                >
                  <span className="font-display text-brand-red-dark text-lg font-extrabold tracking-wider">
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
                <Button
                  variant="gold"
                  size="md"
                  onClick={handleGoToStore}
                  className="w-full"
                >
                  اذهب للمتجر الآن
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={handleReveal}
                disabled={loading}
                className="w-full"
              >
                {loading ? "جاري الإظهار..." : "إظهار الكود"}
                <Tag className="h-4 w-4" aria-hidden />
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
