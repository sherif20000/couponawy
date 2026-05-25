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
  Flame,
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
  /**
   * Visual variant for the card.
   * - "featured" (default): standard layout
   * - "trending": adds a small flame + reveal-count pill above the title so
   *   the card visually signals popularity (per design audit — Trending was
   *   indistinguishable from Featured before this).
   */
  variant?: "featured" | "trending";
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

// Returns the freshness state for the green "verified" pill. Prefers the
// dedicated last_verified_at column (populated by the nightly scrape and the
// admin verify-queue); falls back to updated_at for legacy/import rows.
function freshnessState(
  lastVerifiedAt: string | null,
  updatedAt: string | null
): "today" | "week" | "old" | null {
  const ref = lastVerifiedAt ?? updatedAt;
  if (!ref) return null;
  const ageHours = (Date.now() - new Date(ref).getTime()) / (1000 * 60 * 60);
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
      <span className="text-warm-brown font-accent inline-flex items-center gap-1 text-xs font-medium">
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

// ─── Coupon kind tag ─────────────────────────────────────────────────────────
// On the cream card we use warm-brown text — never gold (gold-on-cream fails
// contrast per .impeccable.md anti-patterns).

type CouponKind = "code" | "deal" | "free_shipping";

function resolveKind(discountType: string | null | undefined): CouponKind {
  if (discountType === "free_shipping") return "free_shipping";
  if (discountType === "bogo" || discountType === "other") return "deal";
  return "code"; // percentage, fixed, or unknown
}

function CouponTypeTag({ kind }: { kind: CouponKind }) {
  const baseClasses =
    "font-accent text-warm-brown inline-flex items-center gap-1 text-[11px] font-semibold";

  if (kind === "free_shipping") {
    return (
      <span className={baseClasses}>
        <Truck className="h-3 w-3" aria-hidden />
        شحن مجاني
      </span>
    );
  }

  if (kind === "deal") {
    return (
      <span className={baseClasses}>
        <Tag className="h-3 w-3" aria-hidden />
        عرض مباشر
      </span>
    );
  }

  return (
    <span className={baseClasses}>
      <Percent className="h-3 w-3" aria-hidden />
      كود خصم
    </span>
  );
}

// ─── Main component — V3 Cream Surface ──────────────────────────────────────
// Aligns with .impeccable.md §5: bg-cream card, gold-tinted border, red
// discount badge as the only red accent on the surface. The discount sits in
// the top-start corner (RTL = right). Store identity is a calm avatar +
// name; the hero of the card is the title + the badge.
//
// Why this changed from V2 (bold-red gradient header): V2 made every card
// scream. On a grid of 4-8 cards the surface read as "wall of red" rather
// than "a strip of distinct deals". The spec was explicit on this — see
// "Bold doesn't mean loud" in design principles.

export function CouponCard({ coupon, className, variant = "featured" }: CouponCardProps) {
  const [revealed, setRevealed] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [logoError, setLogoError] = React.useState(false);

  const hasCode = coupon.discount_type !== "free_shipping";
  const kind = resolveKind(coupon.discount_type);
  const showTrendingPill =
    variant === "trending" && typeof coupon.reveal_count === "number" && coupon.reveal_count > 0;

  // last_verified_at lives on the row but the generated Database type isn't
  // refreshed yet — defensive read avoids a build error.
  const lastVerifiedAt =
    (coupon as unknown as { last_verified_at?: string | null }).last_verified_at ?? null;
  const fresh = freshnessState(lastVerifiedAt, coupon.updated_at);

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
        "group relative flex h-full flex-col bg-cream border border-brand-gold/20 rounded-2xl shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-red/30 hover:shadow-md",
        className
      )}
    >
      {/* ── Discount badge — top-start corner (RTL = right) ────────── */}
      {coupon.discount_display && (
        <div
          className="bg-brand-red text-cream font-display absolute top-4 right-4 z-10 rounded-xl px-3 py-1.5 text-sm font-black tracking-tight shadow-sm"
          aria-label={`خصم ${coupon.discount_display}`}
        >
          {coupon.discount_display}
        </div>
      )}

      {/* ── Exclusive ribbon — top-end (RTL = left) ────────────────── */}
      {coupon.is_exclusive && (
        <div className="bg-brand-gold absolute top-4 left-4 z-10 rounded-md px-2 py-1">
          <span className="font-accent text-charcoal inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="h-2.5 w-2.5" aria-hidden />
            حصري
          </span>
        </div>
      )}

      <CardContent className="flex flex-1 flex-col gap-3 p-5 pt-6">
        {/* ── Store row ───────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="bg-cream-dark ring-brand-gold/25 flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl ring-1">
            {coupon.store?.logo_url && !logoError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coupon.store.logo_url}
                alt={coupon.store.name_ar}
                className="max-h-9 max-w-9 object-contain"
                onError={() => setLogoError(true)}
                onLoad={(e) => {
                  if ((e.target as HTMLImageElement).naturalWidth < 32)
                    setLogoError(true);
                }}
              />
            ) : (
              <span className="font-display text-brand-red text-base font-bold">
                {coupon.store?.name_ar?.slice(0, 2) ?? "؟"}
              </span>
            )}
          </div>

          {/* Right-pad so the absolute badge doesn't collide with the name */}
          <div className="flex min-w-0 flex-col pr-16">
            {coupon.store ? (
              <Link
                href={`/stores/${coupon.store.slug}`}
                className="font-display text-charcoal hover:text-brand-red truncate text-sm font-bold transition-colors"
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

        {/* ── Trending signal (only on cards with variant="trending") ─
            Inserts a small flame + reveal-count line above the title so the
            card communicates popularity even at a glance — solves the
            "Trending looks identical to Featured" issue from the audit. */}
        {showTrendingPill && (
          <div className="text-brand-red font-accent inline-flex w-fit items-center gap-1.5 text-xs font-bold">
            <Flame className="h-3.5 w-3.5" aria-hidden />
            <span>
              {coupon.reveal_count?.toLocaleString("ar-EG")} استخدام هذا الشهر
            </span>
          </div>
        )}

        {/* ── Title ───────────────────────────────────────────────── */}
        <h3 className="font-display text-charcoal text-base font-bold leading-snug">
          <Link
            href={`/coupons/${coupon.slug}`}
            className="hover:text-brand-red transition-colors"
          >
            {coupon.title_ar}
          </Link>
        </h3>

        {/* ── Description ────────────────────────────────────────── */}
        {coupon.description_ar && (
          <p className="text-warm-brown font-body line-clamp-2 text-sm leading-relaxed">
            {coupon.description_ar}
          </p>
        )}

        {/* Screen-reader live region — announces the code when revealed */}
        <span className="sr-only" aria-live="polite" aria-atomic="true">
          {revealed ? `كود الخصم هو ${revealed}` : ""}
        </span>

        {/* ── Footer row: expiry + freshness, then CTA ───────────── */}
        <div className="mt-auto flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <ExpiryIndicator expiresAt={coupon.expires_at} />
            {fresh === "today" && (
              <span className="bg-success/12 text-success border-success/30 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold">
                <span className="bg-success h-1.5 w-1.5 animate-pulse rounded-full" />
                مُحقَّق اليوم
              </span>
            )}
            {fresh === "week" && (
              <span className="bg-cream-dark text-warm-brown border-brand-gold/30 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold">
                <BadgeCheck className="h-2.5 w-2.5" aria-hidden />
                مُحقَّق هذا الأسبوع
              </span>
            )}
          </div>

          {hasCode ? (
            revealed ? (
              <div className="animate-reveal-pop flex flex-col gap-2">
                <button
                  onClick={handleCopy}
                  className={cn(
                    "border-brand-gold bg-brand-gold/10 hover:bg-brand-gold/20 group/code flex items-center justify-between gap-2 rounded-xl border-2 border-dashed p-3 transition-colors",
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
                  variant="primary"
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
              variant="primary"
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
