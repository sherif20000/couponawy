"use client";

import * as React from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type CouponRevealHeroProps = {
  couponId: string;
  destinationUrl: string;
  hasCode: boolean;
  storeName: string;
};

export function CouponRevealHero({
  couponId,
  destinationUrl,
  hasCode,
  storeName,
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
      window.open(destinationUrl, "_blank", "noopener,noreferrer");
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
    window.open(destinationUrl, "_blank", "noopener,noreferrer");
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
      <button
        onClick={handleCopy}
        className="border-brand-gold bg-brand-gold/10 hover:bg-brand-gold/20 group flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-dashed p-5 transition-colors sm:w-auto sm:min-w-[340px]"
        aria-label="نسخ الكود"
      >
        <span className="font-display text-brand-green-dark text-2xl font-extrabold tracking-wider md:text-3xl">
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
