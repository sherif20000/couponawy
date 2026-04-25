"use client";

import * as React from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { buildOutboundUrl } from "@/lib/utils/outbound-url";

type CouponRevealHeroProps = {
  couponId: string;
  storeId: string;
  destinationUrl: string;
  hasCode: boolean;
  storeName: string;
  /** Optional slugs for UTM attribution. Falls back to "general" if missing. */
  couponSlug?: string;
  storeSlug?: string;
};

export function CouponRevealHero({
  couponId,
  storeId,
  destinationUrl,
  hasCode,
  storeName,
  couponSlug,
  storeSlug,
}: CouponRevealHeroProps) {
  const [revealed, setRevealed] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  async function handleReveal() {
    if (loading) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("reveal_coupon", {
        p_coupon_id: couponId,
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
      p_coupon_id: couponId || null,
      p_store_id: storeId || null,
      p_country_code:
        document.cookie
          .split("; ")
          .find((c) => c.startsWith("preferred_country="))
          ?.split("=")[1] ?? null,
      p_referrer: document.referrer || null,
      p_user_agent: navigator.userAgent || null,
    });
    // Append couponawy UTM params before opening — lets the merchant attribute
    // the traffic back to us in their analytics.
    const tracked = buildOutboundUrl(destinationUrl, {
      surface: "detail",
      couponSlug,
      storeSlug,
    });
    window.open(tracked, "_blank", "noopener,noreferrer");
  }

  if (!hasCode) {
    return (
      <Button
        variant="gold"
        size="lg"
        onClick={handleGoToStore}
        className="w-full sm:w-auto"
      >
        الذهاب إلى {storeName}
        <ExternalLink className="h-5 w-5" aria-hidden />
      </Button>
    );
  }

  if (revealed) {
    return (
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center animate-reveal-pop">
        {/* Screen-reader announcement */}
        <span className="sr-only" aria-live="polite" aria-atomic="true">
          كود الخصم هو {revealed}
        </span>
        <button
          onClick={handleCopy}
          className="border-brand-gold bg-brand-gold/10 hover:bg-brand-gold/20 group flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-dashed p-5 transition-colors sm:min-w-[300px]"
          aria-label="نسخ الكود"
        >
          <span className="font-display text-brand-red-dark text-2xl font-extrabold tracking-wider md:text-3xl">
            {revealed}
          </span>
          <span className="text-warm-brown font-accent inline-flex items-center gap-1.5 text-sm">
            {copied ? (
              <>
                <Check className="h-4 w-4" aria-hidden />
                تم النسخ
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden />
                انسخ الكود
              </>
            )}
          </span>
        </button>
        <Button
          variant="gold"
          size="lg"
          onClick={handleGoToStore}
          className="w-full sm:w-auto"
        >
          اذهب للمتجر الآن
          <ExternalLink className="h-5 w-5" aria-hidden />
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="primary"
      size="lg"
      onClick={handleReveal}
      disabled={loading}
      className="w-full sm:w-auto"
    >
      {loading ? "جاري الإظهار..." : "إظهار الكود والذهاب للمتجر"}
      <ExternalLink className="h-5 w-5" aria-hidden />
    </Button>
  );
}
