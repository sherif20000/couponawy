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
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
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

// Returns the freshness state for the green "verified" pill. Uses updated_at
// as a Sprint-1 proxy; Sprint 3 replaces this with a real last_verified_at
// column populated by the nightly scrape + manual admin verify-queue.
function freshnessState(updatedAt: string | null): "today" | "week" | "old" | null {
  if (!updatedAt) return null;
  const ageHours = (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60);
  if (ageHours <= 24) return "today";
  if (ageHours <= 24 * 7) return "week";
  return "old";
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
      <span className="font-accent text-cream/85 inline-flex items-center gap-1 text-[11px] font-semibold">
        <Truck className="h-3 w-3" aria-hidden />
        شحن مجاني
      </span>
    );
  }

  if (kind === "deal") {
    return (
      <span className="font-accent text-cream/85 inline-flex items-center gap-1 text-[11px] font-semibold">
        <Tag className="h-3 w-3" aria-hidden />
        عرض مباشر
      </span>
    );
  }

  return (
    <span className="font-accent text-cream/85 inline-flex items-center gap-1 text-[11px] font-semibold">
      <Percent className="h-3 w-3" aria-hidden />
      كود خصم
    </span>
  );
}

// ─── Main component — V2 Featured ───────────────────────────────────────────
// The card is split horizontally:
//   ↑ Top: bold red gradient block carrying store logo + giant discount + ribbons
//   ↓ Bottom: cream surface with title, description, expiry, primary CTA
// One unified design across every surface (homepage, store, category, search).

export function CouponCard({ coupon, className }: CouponCardProps) {
  const [revealed, setRevealed] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [logoError, setLogoError] = React.useState(false);

  const hasCode = coupon.discount_type !== "free_shipping";
  const kind = resolveKind(coupon.discount_type);
  const fresh = freshnessState(coupon.updated_at);

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
        "group hover:shadow-brand relative flex h-full flex-col overflow-hidden border-2 border-transparent transition-all duration-200 hover:-translate-y-1 hover:border-brand-gold",
        className
      )}
    >
      {/* ── Top: bold-red banner ───────────────────────────────────── */}
      <div className="bg-gradient-to-br from-brand-red to-brand-red-dark relative overflow-hidden px-5 pb-5 pt-12">
        {/* Freshness pill — top-right (RTL start) */}
        {fresh === "today" && (
          <div className="bg-success/15 text-cream border-success/40 absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide backdrop-blur">
            <span className="bg-success h-1.5 w-1.5 animate-pulse rounded-full" />
            تم التحقق اليوم
          </div>
        )}
        {fresh === "week" && (
          <div className="bg-white/10 text-cream/85 border-white/20 absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide backdrop-blur">
            <BadgeCheck className="h-2.5 w-2.5" aria-hidden />
            مُحقَّق هذا الأسبوع
          </div>
        )}

        {/* Exclusive ribbon — top-left (RTL end) */}
        {coupon.is_exclusive && (
          <div className="bg-brand-gold-dark absolute top-3 left-3 z-10 rounded-md px-2 py-1">
            <span className="font-accent text-cream inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="h-2.5 w-2.5" aria-hidden />
              حصري
            </span>
          </div>
        )}

        {/* Store + giant discount */}
        <div className="flex items-end justify-between gap-4">
          <div className="bg-cream ring-cream/40 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl ring-4">
            {coupon.store?.logo_url && !logoError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coupon.store.logo_url}
                alt={coupon.store.name_ar}
                className="max-h-10 max-w-10 object-contain"
                onError={() => setLogoError(true)}
                onLoad={(e) => {
                  if ((e.target as HTMLImageElement).naturalWidth < 32)
                    setLogoError(true);
                }}
              />
            ) : (
              <span className="font-display text-brand-red text-xl font-bold">
                {coupon.store?.name_ar?.slice(0, 2) ?? "؟"}
              </span>
            )}
          </div>

          {coupon.discount_display && (
            <div className="text-cream flex flex-col items-end leading-none">
              <span className="font-display text-5xl font-extrabold tracking-tight">
                {coupon.discount_display}
              </span>
              <span className="font-accent mt-1 text-[10px] uppercase tracking-widest opacity-80">
                خصم
              </span>
            </div>
          )}
        </div>

        {/* Store name + kind tag */}
        <div className="mt-3 flex items-center justify-between gap-2">
          {coupon.store ? (
            <Link
              href={`/stores/${coupon.store.slug}`}
              className="font-display text-cream hover:text-brand-gold truncate text-sm font-bold transition-colors"
            >
              {coupon.store.name_ar}
            </Link>
          ) : (
            <span className="font-display text-cream text-sm font-bold">متجر</span>
          )}
          <CouponTypeTag kind={kind} />
        </div>
      </div>

      {/* ── Bottom: cream surface ──────────────────────────────────── */}
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
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
          <ExpiryIndicator expiresAt={coupon.expires_at} />

          {hasCode ? (
            revealed ? (
              <div className="animate-reveal-pop flex flex-col gap-2">
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
