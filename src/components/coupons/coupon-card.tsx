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

// The coupon card renders the store logo in a 36×36 container. The DB stores
// Brandfetch URLs at /w/256/h/256 which is overkill — every coupon card on the
// homepage was pulling a ~6KB image when 1.5KB would do. Rewrite small-context
// URLs to /w/128/h/128 (still 2× retina for our 36px target).
//
// IMPORTANT: Brandfetch returns 401 (interpreted as a 1×1 placeholder image)
// when the `?c={CLIENT_ID}` auth param is missing. The original StoreLogo
// component appends it via withBrandfetchAuth(); when this fast-path was added
// in PR #3 it accidentally dropped that step, causing every coupon-card
// avatar to fall back to the initials-only state. Now we re-append here so
// the URL always carries auth.
//
// Non-Brandfetch URLs pass through untouched (e.g. legacy stores still on
// their own CDN).
const BRANDFETCH_CLIENT_ID =
  process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID ?? "";

function smallLogoUrl(url: string): string {
  if (!url.includes("cdn.brandfetch.io/")) return url;
  let result = url.replace("/w/256/h/256", "/w/128/h/128");
  if (BRANDFETCH_CLIENT_ID && !result.includes("c=")) {
    const sep = result.includes("?") ? "&" : "?";
    result = `${result}${sep}c=${BRANDFETCH_CLIENT_ID}`;
  }
  return result;
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatExpiryDate(iso: string): string {
  return new Intl.DateTimeFormat("ar-SA-u-nu-latn", {
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

  // Fires the click tracking RPC. Extracted so reveal AND the explicit
  // "go to store" button can both record a click.
  function trackStoreClick() {
    const supabase = createClient();
    return supabase.rpc("track_click", {
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
  }

  // Opens the merchant URL in a new tab.
  //
  // Security policy:
  //   - We need a real reference to the new window so we can navigate it
  //     to the merchant URL once the RPC resolves (we pre-open about:blank
  //     synchronously to survive the popup blocker, then assign the real
  //     URL after the await — see handleReveal). The `noopener` *feature*
  //     flag on window.open() returns null per spec, which means the
  //     placeholder tab would be unreachable and the user stares at an
  //     empty about:blank. So we don't pass `noopener` here.
  //   - Instead we set `win.opener = null` explicitly. That achieves the
  //     same security goal (merchant page cannot access our window via
  //     window.opener) while keeping the reference.
  //   - `noreferrer` is HARMFUL HERE: it strips the Referer header, which
  //     CJ / Impact / Awin / arabclicks rely on to attribute the click and
  //     credit us with the affiliate commission. Keep the referrer so the
  //     cookie lands and we get paid.
  //
  // We pre-open the popup synchronously (before any await) — Safari and
  // Chrome both block window.open() called from inside an async handler
  // unless it's tied to a fresh user gesture.
  function openMerchantTab(): Window | null {
    const win = window.open("about:blank", "_blank");
    if (win) win.opener = null;
    return win;
  }

  async function handleReveal() {
    if (loading) return;
    setLoading(true);
    // Open the tab BEFORE the await so the popup blocker treats this as part
    // of the user-gesture chain. We assign the real URL after the RPC
    // resolves. If the destination URL is missing (rare data quality miss),
    // we skip the tab entirely.
    const popup = coupon.destination_url ? openMerchantTab() : null;
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("reveal_coupon", {
        p_coupon_id: coupon.id,
      });
      if (error) throw error;
      if (!data) throw new Error("لا يوجد كود لهذا الكوبون");
      setRevealed(data);
      // Reveal succeeded → drop the user on the merchant page so the
      // affiliate cookie sets while they switch to that tab to paste the
      // code. This is the industry-standard "show code + open tab"
      // pattern used by RetailMenot, Honey, almowafir, coupcode.
      if (popup && coupon.destination_url) {
        popup.location.href = coupon.destination_url;
        // Fire-and-forget click tracking; don't await — the popup is
        // already on its way.
        void trackStoreClick();
      } else if (popup) {
        // No destination_url; close the placeholder tab.
        popup.close();
      }
    } catch (err) {
      console.error("[reveal_coupon]", err);
      toast.error("تعذّر إظهار الكود، جرّب مرة أخرى");
      // Close the placeholder tab on failure so the user isn't dropped on
      // about:blank.
      popup?.close();
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

  // Explicit "Go to store" button — same security policy as openMerchantTab
  // above: no `noopener` feature flag (it would null the return value),
  // explicit `win.opener = null` instead. Referer is preserved for the
  // affiliate cookie to attribute the click.
  function handleGoToStore() {
    void trackStoreClick();
    if (!coupon.destination_url) return;
    const win = window.open(coupon.destination_url, "_blank");
    if (win) win.opener = null;
  }

  return (
    <Card
      className={cn(
        "group relative flex h-full flex-col bg-cream border border-brand-gold/20 rounded-2xl shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-red/30 hover:shadow-md",
        className
      )}
    >
      {/* ── Discount badge — logical end-of-row in RTL.
          start-4 in RTL = right; in LTR (future English mirror) = left.
          Using logical properties keeps RTL/LTR symmetry correct. */}
      {coupon.discount_display && (
        <div
          className="bg-brand-red text-white font-display absolute top-4 start-4 z-10 rounded-xl px-3 py-1.5 text-sm font-black tracking-tight shadow-sm"
          aria-label={`خصم ${coupon.discount_display}`}
        >
          {coupon.discount_display}
        </div>
      )}

      {/* ── Exclusive ribbon — logical opposite corner (RTL = left) ─── */}
      {coupon.is_exclusive && (
        <div className="bg-brand-gold absolute top-4 end-4 z-10 rounded-md px-2 py-1">
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
              // Brandfetch w/128 is plenty for a 36px display @ 2DPR.
              // The original DB URL is .../w/256/h/256; we rewrite to /w/128/h/128
              // for cards to cut payload ~75% per card. Falls back to original
              // URL untouched for non-Brandfetch sources.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={smallLogoUrl(coupon.store.logo_url)}
                alt={coupon.store.name_ar}
                loading="lazy"
                decoding="async"
                width={36}
                height={36}
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

          {/* Logical end-padding so the absolute badge doesn't collide
              with the name. Use pe-* instead of pr-* for RTL/LTR symmetry. */}
          <div className="flex min-w-0 flex-col pe-16">
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
              {coupon.reveal_count?.toLocaleString("en-US")} استخدام هذا الشهر
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
