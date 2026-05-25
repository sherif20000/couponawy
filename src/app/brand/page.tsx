import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  Tag,
  Truck,
  Percent,
  Copy,
  ExternalLink,
  Clock,
  Flame,
  BadgeCheck,
  Star,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

// Internal source-of-truth visualization page for the Sprint 1 design lock-in.
// Robots: noindex (not for the public). Live URL preview only.
export const metadata: Metadata = {
  title: "Brand · Sprint 1 visualization",
  robots: { index: false, follow: false },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function Swatch({
  token,
  oklch,
  hex,
  inverted = false,
}: {
  token: string;
  oklch: string;
  hex?: string;
  inverted?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 ${inverted ? "text-cream" : "text-charcoal"}`}
      style={{ background: `var(--color-${token})` }}
    >
      <div className="font-display text-lg font-bold">--color-{token}</div>
      <div className={`mt-1 font-mono text-xs ${inverted ? "text-white/70" : "text-charcoal/60"}`}>
        {oklch}
      </div>
      {hex && (
        <div className={`font-mono text-[11px] ${inverted ? "text-white/50" : "text-charcoal/45"}`}>
          ≈ {hex}
        </div>
      )}
    </div>
  );
}

function Section({
  eyebrow,
  title,
  status,
  children,
}: {
  eyebrow: string;
  title: string;
  status: "locked" | "pick" | "preview";
  children: React.ReactNode;
}) {
  const statusBg = {
    locked: "bg-success/15 text-success ring-success/30",
    pick: "bg-brand-gold/30 text-brand-gold-dark ring-brand-gold/40",
    preview: "bg-cream-dark text-warm-brown ring-warm-brown/20",
  }[status];
  const statusLabel = {
    locked: "LOCKED",
    pick: "PICK ONE",
    preview: "PREVIEW",
  }[status];

  return (
    <section className="border-brand-gold/15 border-t py-16">
      <Container size="xl">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-accent text-warm-brown-light text-xs uppercase tracking-widest">
              {eyebrow}
            </span>
            <h2 className="font-display text-charcoal text-3xl font-extrabold">
              {title}
            </h2>
          </div>
          <span
            className={`font-accent inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ${statusBg}`}
          >
            {statusLabel}
          </span>
        </div>
        {children}
      </Container>
    </section>
  );
}

// ─── Mock data for card previews ────────────────────────────────────────────

const sampleCoupon = {
  store: { name_ar: "نون", slug: "noon" },
  title_ar: "خصم 15% على الإلكترونيات والأجهزة المنزلية",
  description_ar: "ينطبق على معظم الأقسام عدا عروض اليوم. الحد الأدنى 200 ر.س.",
  discount_display: "15%",
  discount_type: "percentage" as const,
  is_exclusive: true,
  expiry_label: "ينتهي خلال 25 يوماً",
};

// ─── COUPON CARD VARIANTS ───────────────────────────────────────────────────

function CouponCardV1Current() {
  return (
    <Card className="group flex h-full flex-col overflow-hidden hover:-translate-y-0.5 hover:shadow-lg">
      <div className="border-brand-gold/20 border-b p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="bg-cream ring-brand-gold/30 flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2">
              <span className="font-display text-brand-red text-sm font-bold">نو</span>
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <span className="font-display text-charcoal text-sm font-bold">
                {sampleCoupon.store.name_ar}
              </span>
              <span className="font-accent bg-brand-red/10 text-brand-red ring-brand-red/20 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold ring-1">
                <Percent className="h-2.5 w-2.5" />
                كود خصم
              </span>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <span className="font-display bg-brand-gold text-charcoal rounded-xl px-3 py-1.5 text-sm font-extrabold leading-none shadow-sm">
              {sampleCoupon.discount_display}
            </span>
            <Badge variant="exclusive">
              <Sparkles className="h-3 w-3" />
              حصري
            </Badge>
          </div>
        </div>
      </div>
      <CardContent className="flex flex-1 flex-col gap-4 p-5">
        <h3 className="font-display text-charcoal text-base font-bold leading-snug">
          {sampleCoupon.title_ar}
        </h3>
        <p className="text-warm-brown font-body line-clamp-2 text-sm leading-relaxed">
          {sampleCoupon.description_ar}
        </p>
        <div className="mt-auto flex flex-col gap-3">
          <span className="text-warning font-accent inline-flex items-center gap-1 text-xs font-medium">
            <Clock className="h-3 w-3" />
            {sampleCoupon.expiry_label}
          </span>
          <Button variant="primary" size="md" className="w-full">
            إظهار الكود
            <Tag className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CouponCardV2Featured() {
  // Larger discount, more breathing room, freshness badge top
  return (
    <Card className="group hover:shadow-brand relative flex h-full flex-col overflow-hidden border-2 border-transparent transition-all hover:-translate-y-1 hover:border-brand-gold">
      {/* Freshness pill */}
      <div className="bg-success/10 text-success border-success/20 absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide">
        <span className="bg-success h-1.5 w-1.5 animate-pulse rounded-full" />
        تم التحقق اليوم
      </div>
      {/* Exclusive ribbon */}
      <div className="bg-brand-gold-dark absolute top-3 right-3 z-10 rounded-md px-2 py-1">
        <span className="font-accent text-cream inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
          <Sparkles className="h-2.5 w-2.5" />
          حصري
        </span>
      </div>

      {/* Big discount banner */}
      <div className="bg-gradient-to-br from-brand-red to-brand-red-dark px-6 pb-5 pt-12">
        <div className="flex items-end justify-between gap-4">
          <div className="bg-cream ring-cream/40 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl ring-4">
            <span className="font-display text-brand-red text-xl font-bold">نو</span>
          </div>
          <div className="text-cream flex flex-col items-end leading-none">
            <span className="font-display text-5xl font-extrabold">
              {sampleCoupon.discount_display}
            </span>
            <span className="font-accent mt-1 text-xs uppercase tracking-widest opacity-80">
              خصم
            </span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="font-display text-cream text-sm font-bold">
            {sampleCoupon.store.name_ar}
          </span>
          <BadgeCheck className="text-brand-gold h-4 w-4" />
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-charcoal text-base font-bold leading-snug">
          {sampleCoupon.title_ar}
        </h3>
        <p className="text-warm-brown font-body line-clamp-2 text-sm leading-relaxed">
          {sampleCoupon.description_ar}
        </p>
        <div className="mt-auto flex flex-col gap-2">
          <span className="text-warning font-accent inline-flex items-center gap-1 text-xs font-medium">
            <Clock className="h-3 w-3" />
            {sampleCoupon.expiry_label}
          </span>
          <Button variant="primary" size="md" className="w-full">
            إظهار الكود
            <Tag className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CouponCardV3Editorial() {
  // Cleaner, more editorial — discount inline with title, single CTA, lighter feel
  return (
    <Card className="group hover:border-brand-red/40 flex h-full flex-col overflow-hidden border border-brand-gold/20 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="bg-cream-dark ring-brand-gold/20 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ring-1">
              <span className="font-display text-brand-red text-xs font-bold">نو</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-charcoal text-sm font-bold leading-tight">
                {sampleCoupon.store.name_ar}
              </span>
              <span className="text-warm-brown-light font-accent text-[10px] uppercase tracking-wider">
                كود خصم
              </span>
            </div>
          </div>
          <Badge variant="exclusive" className="shrink-0">
            <Sparkles className="h-3 w-3" />
            حصري
          </Badge>
        </div>

        {/* Discount line — typographic, not boxed */}
        <div className="border-brand-gold/30 flex items-baseline gap-3 border-b border-dashed pb-4">
          <span className="font-display text-brand-red text-5xl font-extrabold leading-none">
            {sampleCoupon.discount_display}
          </span>
          <span className="font-accent text-warm-brown text-sm">خصم على الإلكترونيات</span>
        </div>

        <h3 className="font-display text-charcoal text-base font-bold leading-snug">
          {sampleCoupon.title_ar}
        </h3>
        <p className="text-warm-brown font-body line-clamp-2 text-sm leading-relaxed">
          {sampleCoupon.description_ar}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-warning font-accent inline-flex items-center gap-1 text-xs font-medium">
            <Clock className="h-3 w-3" />
            {sampleCoupon.expiry_label}
          </span>
          <Button variant="primary" size="sm">
            إظهار الكود
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── HERO VARIANTS ──────────────────────────────────────────────────────────

function HeroV1BoldRed() {
  return (
    <div className="bg-brand-red overflow-hidden rounded-3xl p-10 text-cream md:p-14">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div className="flex flex-col gap-5">
          <Badge variant="gold">
            <Flame className="h-3 w-3" />
            +200 كوبون فعّال هذا الأسبوع
          </Badge>
          <h1 className="font-display text-4xl font-extrabold leading-tight md:text-6xl">
            وفّر في كل عملية تسوّق
          </h1>
          <p className="font-body text-cream/85 max-w-md text-base leading-relaxed md:text-lg">
            أكواد خصم حقيقية ومُحقّقة يومياً من أكبر المتاجر العربية والعالمية. انسخ الكود واحصل على خصمك فوراً.
          </p>
          <div className="bg-white/10 ring-white/20 flex items-center gap-2 rounded-2xl p-1 ring-1 backdrop-blur">
            <input
              type="search"
              placeholder="نون، أمازون، نمشي، طلبات، شي ان…"
              className="font-body text-cream placeholder:text-cream/60 flex-1 bg-transparent px-4 text-base outline-none"
            />
            <Button variant="gold" size="md">
              ابحث الكوبونات
            </Button>
          </div>
          <div className="text-cream/70 font-accent flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <BadgeCheck className="h-3.5 w-3.5" />
              120+ متجر موثّق
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-brand-gold text-brand-gold" />
              4.8 من 5 من 3 آلاف مستخدم
            </span>
          </div>
        </div>

        {/* Floating coupon stack */}
        <div className="relative hidden md:block">
          <div className="absolute -top-2 right-6 z-10 rotate-3 transform">
            <div className="bg-cream text-charcoal w-64 rounded-2xl p-4 shadow-xl">
              <div className="mb-3 flex items-center gap-2">
                <div className="bg-brand-gold/20 flex h-8 w-8 items-center justify-center rounded-full">
                  <span className="font-display text-brand-red text-[11px] font-bold">نو</span>
                </div>
                <span className="font-display text-sm font-bold">نون</span>
                <span className="bg-success/15 text-success ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold">
                  نشط
                </span>
              </div>
              <p className="font-body text-warm-brown line-clamp-2 text-xs leading-relaxed">
                خصم 20% على الإلكترونيات
              </p>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="font-display text-brand-red text-2xl font-extrabold">20%</span>
                <span className="text-warm-brown-light text-[10px]">خصم</span>
              </div>
            </div>
          </div>
          <div className="absolute top-32 right-2 -rotate-2 transform">
            <div className="bg-cream text-charcoal w-64 rounded-2xl p-4 shadow-xl">
              <div className="mb-3 flex items-center gap-2">
                <div className="bg-brand-gold/20 flex h-8 w-8 items-center justify-center rounded-full">
                  <span className="font-display text-brand-red text-[11px] font-bold">أم</span>
                </div>
                <span className="font-display text-sm font-bold">أمازون</span>
                <span className="bg-success/15 text-success ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold">
                  نشط
                </span>
              </div>
              <p className="font-body text-warm-brown line-clamp-2 text-xs leading-relaxed">
                شحن مجاني + خصم 15%
              </p>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="font-display text-brand-red text-2xl font-extrabold">15%</span>
                <span className="text-warm-brown-light text-[10px]">+ شحن</span>
              </div>
            </div>
          </div>
          <div className="h-72" />
        </div>
      </div>
    </div>
  );
}

function HeroV2CreamSplit() {
  return (
    <div className="bg-cream border-brand-gold/30 overflow-hidden rounded-3xl border p-10 md:p-14">
      <div className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-5">
          <Badge variant="outline">
            <Sparkles className="h-3 w-3" />
            محدّث الآن — آخر كوبون منذ 12 دقيقة
          </Badge>
          <h1 className="font-display text-charcoal text-4xl font-extrabold leading-tight md:text-6xl">
            وفّر في كل
            <br />
            <span className="text-brand-red">عمليّة تسوّق</span>
          </h1>
          <p className="font-body text-warm-brown max-w-md text-base leading-relaxed md:text-lg">
            أكواد خصم حقيقية ومُحقّقة يومياً من أكبر المتاجر العربية والعالمية. انسخ الكود واحصل على خصمك فوراً.
          </p>
          <div className="bg-white border-brand-gold/40 shadow-brand flex items-center gap-2 rounded-2xl border p-1.5">
            <input
              type="search"
              placeholder="نون، أمازون، نمشي، طلبات، شي ان…"
              className="font-body text-charcoal placeholder:text-warm-brown-light flex-1 bg-transparent px-4 text-base outline-none"
            />
            <Button variant="primary" size="md">
              ابحث الكوبونات
            </Button>
          </div>
          <div className="text-warm-brown font-accent flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <BadgeCheck className="text-success h-3.5 w-3.5" />
              120+ متجر موثّق
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Flame className="text-brand-red h-3.5 w-3.5" />
              2400+ كوبون فعّال
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { name: "نون", code: "NOON15", disc: "15%", color: "from-yellow-400 to-yellow-500" },
            { name: "شي ان", code: "SH25", disc: "25%", color: "from-black to-gray-800" },
            { name: "أمازون", code: "AMZ50", disc: "50ر.س", color: "from-orange-500 to-orange-600" },
            { name: "نمشي", code: "NM30", disc: "30%", color: "from-rose-500 to-rose-600" },
          ].map((c) => (
            <div
              key={c.code}
              className="bg-white border-brand-gold/20 flex flex-col gap-2 rounded-2xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className={`bg-gradient-to-br ${c.color} flex h-10 w-10 items-center justify-center rounded-xl`}
              >
                <span className="font-display text-cream text-xs font-bold">
                  {c.name.slice(0, 2)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-display text-charcoal text-sm font-bold">{c.name}</span>
                <span className="font-display text-brand-red text-lg font-extrabold">{c.disc}</span>
              </div>
              <span className="text-warm-brown-light font-mono text-[10px] uppercase tracking-wider">
                {c.code}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TICKER VARIANTS ────────────────────────────────────────────────────────

function TickerV1Current() {
  const items = [
    { icon: "🔥", text: "عروض تصل لـ 70%" },
    { icon: "⚡", text: "كوبونات جديدة كل يوم" },
    { icon: "✅", text: "أكثر من 2400 كوبون فعّال" },
    { icon: "🏪", text: "120+ متجر موثّق" },
    { icon: "💰", text: "وفّر على كل طلب" },
  ];
  return (
    <div className="overflow-hidden rounded-xl py-1.5" style={{ background: "oklch(8% 0.005 26)" }}>
      <div className="animate-ticker-rtl inline-flex whitespace-nowrap">
        {[0, 1].map((copy) => (
          <span key={copy} className="inline-flex items-center gap-0">
            {items.map((item, i) => (
              <span key={i} className="inline-flex items-center">
                <span className="font-body text-brand-gold px-5 text-[13px] font-bold tracking-wide">
                  {item.icon}&nbsp;{item.text}
                </span>
                <span className="text-brand-gold/30 select-none text-xs">·</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

function TickerV2LiveDeals() {
  const deals = [
    { store: "نون", code: "NOON25", disc: "25%", category: "إلكترونيات" },
    { store: "شي ان", code: "SH40", disc: "40%", category: "أزياء" },
    { store: "أمازون", code: "FREESHIP", disc: "شحن مجاني", category: "كل الأقسام" },
    { store: "نمشي", code: "EXTRA30", disc: "30%", category: "ملابس" },
    { store: "صيدلية النهدي", code: "NH15", disc: "15%", category: "العناية" },
  ];
  return (
    <div className="overflow-hidden rounded-xl py-2" style={{ background: "oklch(8% 0.005 26)" }}>
      <div className="animate-ticker-rtl inline-flex whitespace-nowrap">
        {[0, 1].map((copy) => (
          <span key={copy} className="inline-flex items-center">
            {deals.map((d, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-6">
                <span className="bg-brand-gold/20 text-brand-gold rounded-md px-1.5 py-0.5 text-[10px] font-bold">
                  جديد
                </span>
                <span className="font-display text-brand-gold text-xs font-bold">
                  {d.store}
                </span>
                <span className="text-cream font-body text-xs">{d.category}</span>
                <span className="font-mono text-brand-gold/70 text-[11px] uppercase">
                  {d.code}
                </span>
                <span className="text-cream font-display text-sm font-extrabold">
                  {d.disc} خصم
                </span>
                <span className="text-brand-gold/40 px-1">·</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

function TickerV3Compact() {
  const items = [
    "🔥 70% خصم",
    "⚡ كوبونات يومية",
    "✅ 2400+ فعّال",
    "🏪 120+ متجر",
    "💰 وفّر اليوم",
  ];
  return (
    <div
      className="bg-charcoal flex items-center gap-2 overflow-hidden rounded-xl px-3 py-1"
      style={{ background: "oklch(8% 0.005 26)" }}
    >
      <span className="bg-brand-red text-cream font-accent shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
        مباشر
      </span>
      <div className="flex-1 overflow-hidden">
        <div className="animate-ticker-rtl inline-flex whitespace-nowrap">
          {[0, 1].map((copy) => (
            <span key={copy} className="inline-flex items-center">
              {items.map((t, i) => (
                <span key={i} className="font-body text-brand-gold/90 px-4 text-xs font-semibold">
                  {t}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ──────────────────────────────────────────────────────────────

export default function BrandPage() {
  return (
    <main className="bg-cream min-h-screen pb-24">
      {/* Intro */}
      <div className="bg-charcoal py-12 text-cream">
        <Container size="xl">
          <div className="flex flex-col gap-4">
            <span className="font-accent text-brand-gold text-xs uppercase tracking-widest">
              Sprint 1 · Design lock-in · Closed
            </span>
            <h1 className="font-display text-4xl font-extrabold md:text-5xl">
              The Brand System
            </h1>
            <p className="font-body text-cream/80 max-w-2xl text-base leading-relaxed">
              Single source of truth for couponawy v2. Sprint 1 picks are <strong>locked</strong>:
              ticker V2 (live deals), coupon card V2 (featured), hero V1 (bold red full-bleed).
              Every page below the hero now uses these as the standard primitives.
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <Link
                href="/"
                className="bg-white/10 hover:bg-white/20 inline-flex items-center gap-2 rounded-full px-4 py-2 backdrop-blur transition-colors"
              >
                ↩ Back to homepage
              </Link>
            </div>
          </div>
        </Container>
      </div>

      {/* ── COLOR PALETTE ──────────────────────────────────────────── */}
      <Section eyebrow="Tokens" title="Color palette" status="locked">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Swatch token="brand-red" oklch="oklch(49% 0.25 26)" hex="#C40C2C" inverted />
          <Swatch token="brand-red-dark" oklch="oklch(41% 0.25 26)" hex="#A50924" inverted />
          <Swatch token="brand-gold" oklch="oklch(86% 0.19 94)" hex="#F5BE2A" />
          <Swatch token="brand-gold-dark" oklch="oklch(72% 0.17 88)" hex="#C8961B" inverted />
          <Swatch token="cream" oklch="oklch(99% 0.004 90)" hex="#FEFCF7" />
          <Swatch token="cream-dark" oklch="oklch(96% 0.005 90)" hex="#F4F1E8" />
          <Swatch token="charcoal" oklch="oklch(14% 0.010 80)" hex="#1A1812" inverted />
          <Swatch token="warm-brown" oklch="oklch(45% 0.012 75)" hex="#615345" inverted />
        </div>
        <p className="text-warm-brown font-body mt-6 text-sm">
          Semantic: <code className="bg-cream-dark rounded px-1.5 py-0.5 text-xs">--color-danger</code> = brand-red ·
          <code className="bg-cream-dark mx-1 rounded px-1.5 py-0.5 text-xs">--color-success</code> = oklch(50% 0.19 145) ·
          <code className="bg-cream-dark rounded px-1.5 py-0.5 text-xs">--color-warning</code> = brand-gold.
        </p>
      </Section>

      {/* ── TYPOGRAPHY ─────────────────────────────────────────────── */}
      <Section eyebrow="Tokens" title="Type scale · Cairo" status="locked">
        <div className="flex flex-col gap-6">
          <div className="border-brand-gold/20 flex items-baseline justify-between gap-4 border-b pb-4">
            <h1 className="font-display text-charcoal text-6xl font-extrabold">
              عنوان رئيسي
            </h1>
            <span className="font-mono text-warm-brown text-xs">text-6xl · font-extrabold (800)</span>
          </div>
          <div className="border-brand-gold/20 flex items-baseline justify-between gap-4 border-b pb-4">
            <h2 className="font-display text-charcoal text-4xl font-extrabold">عنوان قسم</h2>
            <span className="font-mono text-warm-brown text-xs">text-4xl · font-extrabold (800)</span>
          </div>
          <div className="border-brand-gold/20 flex items-baseline justify-between gap-4 border-b pb-4">
            <h3 className="font-display text-charcoal text-2xl font-bold">عنوان فرعي</h3>
            <span className="font-mono text-warm-brown text-xs">text-2xl · font-bold (700)</span>
          </div>
          <div className="border-brand-gold/20 flex items-baseline justify-between gap-4 border-b pb-4">
            <p className="font-body text-charcoal text-base leading-relaxed">
              نصّ المتن — يقرأ بسهولة على الموبايل والسطح المكتبي. عرض السطر مثاليّ بين 45 و 75 حرفاً.
            </p>
            <span className="font-mono text-warm-brown shrink-0 text-xs">text-base · font-regular (400)</span>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-accent text-warm-brown-light text-xs uppercase tracking-widest">
              نص فوقي · EYEBROW
            </span>
            <span className="font-mono text-warm-brown text-xs">text-xs · uppercase · tracking-widest</span>
          </div>
        </div>
      </Section>

      {/* ── MOVABLE BAR (TICKER) — LOCKED V2 ──────────────────────── */}
      <Section eyebrow="The movable bar" title="Ticker strip · V2 Live deals" status="locked">
        <div className="flex flex-col gap-3">
          <TickerV2LiveDeals />
          <p className="text-warm-brown font-body text-sm">
            <strong>Shipped:</strong> the live header ticker now pulls the top 5 active coupons from the DB on every
            request (server-rendered, no flash). Each tile is clickable → coupon detail page. The static
            &quot;مباشر&quot; (LIVE) anchor on the right stays put while the deals scroll RTL. Cron-refreshed inventory means
            the ticker is always current.
          </p>
        </div>
      </Section>

      {/* ── BUTTONS ────────────────────────────────────────────────── */}
      <Section eyebrow="Primitives" title="Buttons · variants × sizes × states" status="locked">
        <div className="flex flex-col gap-8">
          <div>
            <h4 className="font-display text-charcoal mb-3 text-sm font-bold">Variants</h4>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">إظهار الكود</Button>
              <Button variant="gold">اذهب للمتجر</Button>
              <Button variant="outline">المزيد</Button>
              <Button variant="ghost">إلغاء</Button>
              <Button variant="link">اعرف أكثر ←</Button>
            </div>
          </div>
          <div>
            <h4 className="font-display text-charcoal mb-3 text-sm font-bold">Sizes</h4>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">صغير</Button>
              <Button size="md">متوسط</Button>
              <Button size="lg">كبير</Button>
            </div>
          </div>
          <div>
            <h4 className="font-display text-charcoal mb-3 text-sm font-bold">States</h4>
            <div className="flex flex-wrap items-center gap-3">
              <Button>عادي</Button>
              <Button className="hover:bg-brand-red-dark">Hover (مرّر فوقه)</Button>
              <Button disabled>معطّل</Button>
              <Button variant="primary">
                <Tag className="h-4 w-4" />
                مع أيقونة
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* ── BADGES ─────────────────────────────────────────────────── */}
      <Section eyebrow="Primitives" title="Badges & pills" status="locked">
        <div className="flex flex-wrap gap-3">
          <Badge variant="primary">جديد</Badge>
          <Badge variant="gold">موصى به</Badge>
          <Badge variant="outline">عام</Badge>
          <Badge variant="cream">عادي</Badge>
          <Badge variant="danger">منتهي</Badge>
          <Badge variant="exclusive">
            <Sparkles className="h-3 w-3" />
            حصري
          </Badge>
          <Badge variant="inverted">على خلفية داكنة</Badge>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="font-accent bg-brand-red/10 text-brand-red ring-brand-red/20 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold ring-1">
            <Percent className="h-2.5 w-2.5" />
            كود خصم
          </span>
          <span className="font-accent bg-brand-gold/15 text-brand-gold-dark ring-brand-gold/30 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold ring-1">
            <Tag className="h-2.5 w-2.5" />
            عرض مباشر
          </span>
          <span className="font-accent inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <Truck className="h-2.5 w-2.5" />
            شحن مجاني
          </span>
          <span className="bg-success/10 text-success border-success/20 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold">
            <span className="bg-success h-1.5 w-1.5 animate-pulse rounded-full" />
            تم التحقق اليوم
          </span>
        </div>
      </Section>

      {/* ── COUPON CARD — LOCKED V2 ────────────────────────────────── */}
      <Section eyebrow="Components" title="Coupon card · V2 Featured" status="locked">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <h4 className="font-display text-charcoal text-sm font-bold">Standard card</h4>
            <p className="text-warm-brown-light font-body text-xs">
              Used everywhere: homepage, store pages, category pages, search results.
            </p>
            <CouponCardV2Featured />
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-display text-charcoal text-sm font-bold">With exclusive</h4>
            <p className="text-warm-brown-light font-body text-xs">
              Gold ribbon top-left when <code>is_exclusive = true</code>.
            </p>
            <CouponCardV2Featured />
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-display text-charcoal text-sm font-bold">Freshness pill</h4>
            <p className="text-warm-brown-light font-body text-xs">
              Green pulse pill appears top-right when <code>updated_at</code> is ≤24h old. Sprint 3 replaces with real
              <code>last_verified_at</code>.
            </p>
            <CouponCardV2Featured />
          </div>
        </div>
        <p className="text-warm-brown font-body mt-6 text-sm">
          <strong>Shipped:</strong> the production <code>&lt;CouponCard&gt;</code> component now matches this design.
          One unified card across every surface — no V1, no V3. All existing callers (8 homepage slots, store pages,
          category pages, search, related-coupons) automatically pick up the new visual.
        </p>
      </Section>

      {/* ── HERO — LOCKED V1 ─────────────────────────────────────── */}
      <Section eyebrow="Components" title="Homepage hero · V1 Bold red full-bleed" status="locked">
        <HeroV1BoldRed />
        <p className="text-warm-brown font-body mt-6 text-sm">
          <strong>Shipped:</strong> the homepage now leads with this hero. Brand-red full-bleed, gold CTA,
          search-first, trust pills, floating coupon stack on the right populated from the top 3 real featured
          coupons. The cards rotate subtly and stagger their fade-up. Mobile drops the floating stack and keeps the
          hero short to push users to the featured-coupons grid below.
        </p>
      </Section>

      {/* ── SECTION HEADER ────────────────────────────────────────── */}
      <Section eyebrow="Patterns" title="Section header" status="locked">
        <div className="bg-white border-brand-gold/20 rounded-2xl border p-8">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="font-accent text-brand-red text-xs uppercase tracking-widest">
                هذا الأسبوع
              </span>
              <h2 className="font-display text-charcoal text-3xl font-extrabold">
                أفضل الكوبونات هذا الأسبوع
              </h2>
              <p className="font-body text-warm-brown text-sm">
                عروض مختارة بعناية، مجرّبة وجاهزة للاستخدام
              </p>
            </div>
            <Link
              href="#"
              className="font-accent text-brand-red inline-flex items-center gap-1 text-sm font-semibold"
            >
              كل الكوبونات
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="h-32 rounded-xl bg-cream-dark/50" />
        </div>
      </Section>

      {/* ── SPACING / RADIUS / SHADOW ─────────────────────────────── */}
      <Section eyebrow="Tokens" title="Spacing · radius · shadow" status="locked">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white border-brand-gold/20 rounded-2xl border p-6">
            <h4 className="font-display text-charcoal mb-4 text-sm font-bold">Radius</h4>
            <div className="flex flex-col gap-3">
              {[
                { name: "rounded-md (8px)", cls: "rounded-md" },
                { name: "rounded-xl (12px)", cls: "rounded-xl" },
                { name: "rounded-2xl (16px)", cls: "rounded-2xl" },
                { name: "rounded-full", cls: "rounded-full" },
              ].map((r) => (
                <div key={r.name} className="flex items-center gap-3">
                  <div className={`bg-brand-red h-10 w-16 ${r.cls}`} />
                  <span className="font-mono text-warm-brown text-xs">{r.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border-brand-gold/20 rounded-2xl border p-6">
            <h4 className="font-display text-charcoal mb-4 text-sm font-bold">Shadows</h4>
            <div className="flex flex-col gap-4">
              <div className="bg-cream rounded-xl p-4 shadow-sm">shadow-sm</div>
              <div className="bg-cream shadow-brand rounded-xl p-4">shadow-brand</div>
              <div className="bg-cream shadow-gold rounded-xl p-4">shadow-gold</div>
            </div>
          </div>
          <div className="bg-white border-brand-gold/20 rounded-2xl border p-6">
            <h4 className="font-display text-charcoal mb-4 text-sm font-bold">Spacing scale</h4>
            <div className="flex flex-col gap-2">
              {[2, 3, 4, 6, 8, 10, 12].map((s) => (
                <div key={s} className="flex items-center gap-3">
                  <div className="bg-brand-gold h-3 rounded" style={{ width: `${s * 4}px` }} />
                  <span className="font-mono text-warm-brown text-xs">{s} · {s * 4}px</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── EMPTY / ERROR ─────────────────────────────────────────── */}
      <Section eyebrow="States" title="Empty · loading · error" status="locked">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white border-brand-gold/20 rounded-2xl border p-8">
            <div className="bg-cream-dark text-warm-brown mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
              <Tag className="h-6 w-6" />
            </div>
            <h4 className="font-display text-charcoal mb-1 text-center text-base font-bold">
              لا توجد كوبونات حالياً
            </h4>
            <p className="text-warm-brown font-body text-center text-sm">
              تصفّح متاجر أخرى أو عُد لاحقاً — نضيف كوبونات يومياً.
            </p>
          </div>
          <div className="bg-white border-brand-gold/20 rounded-2xl border p-8">
            <div className="bg-cream-dark mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
              <span className="border-brand-red/30 border-t-brand-red inline-block h-6 w-6 animate-spin rounded-full border-2" />
            </div>
            <h4 className="font-display text-charcoal mb-1 text-center text-base font-bold">
              جاري التحميل…
            </h4>
            <p className="text-warm-brown font-body text-center text-sm">
              ثوانٍ ونعرض لك أحدث الكوبونات.
            </p>
          </div>
          <div className="bg-white border-danger/20 rounded-2xl border p-8">
            <div className="bg-danger/10 text-danger mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
              <span className="text-2xl">⚠</span>
            </div>
            <h4 className="font-display text-charcoal mb-1 text-center text-base font-bold">
              حدث خطأ
            </h4>
            <p className="text-warm-brown font-body mb-4 text-center text-sm">
              تعذّر تحميل البيانات. حاول مرة أخرى.
            </p>
            <Button variant="primary" size="sm" className="mx-auto block">
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </Section>

      {/* ── SPRINT 1 CLOSED · SPRINT 2 NEXT ──────────────────────── */}
      <Section eyebrow="Sprint 1 closed" title="What ships next" status="preview">
        <div className="bg-charcoal text-cream rounded-3xl p-8 md:p-10">
          <div className="mb-8 flex flex-wrap items-baseline gap-4">
            <span className="bg-success/15 text-success border-success/30 font-accent rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider">
              ✓ Sprint 1 complete
            </span>
            <span className="text-cream/60 font-body text-sm">
              Ticker V2 · Coupon card V2 · Hero V1 — all live on preview, ready to merge to main
            </span>
          </div>

          <h3 className="font-display mb-6 text-2xl font-extrabold">
            Sprint 2 · Daily-Fresh Coupon Engine
          </h3>
          <p className="text-cream/80 font-body mb-6 max-w-2xl text-base leading-relaxed">
            Solves the &quot;no real updated daily/weekly mechanism&quot; gap. After Sprint 2, coupons can never silently
            rot — every code has a visible freshness signal, and a cron job verifies inventory nightly.
          </p>

          <ol className="flex flex-col gap-5">
            <li className="flex gap-4">
              <span className="bg-brand-gold text-charcoal font-display flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold">
                1
              </span>
              <div>
                <strong className="font-display text-lg">
                  DB migration: <code>last_verified_at</code>, <code>verified_by</code>
                </strong>
                <p className="text-cream/70 font-body mt-1 text-sm">
                  Real verification timestamps replace the <code>updated_at</code> proxy currently powering the
                  freshness pill on coupon cards.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="bg-brand-gold text-charcoal font-display flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold">
                2
              </span>
              <div>
                <strong className="font-display text-lg">Nightly scrape cron</strong>
                <p className="text-cream/70 font-body mt-1 text-sm">
                  <code>/api/cron/scrape-coupons</code> at 03:00 UTC. Adds new codes, marks dupes, bumps verified-at.
                  Never deletes — only archives via the existing expire-coupons cron.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="bg-brand-gold text-charcoal font-display flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold">
                3
              </span>
              <div>
                <strong className="font-display text-lg">Admin verify-queue</strong>
                <p className="text-cream/70 font-body mt-1 text-sm">
                  New <code>/admin/verify-queue</code> sorted by oldest verified-at. One-click manual verify bumps the
                  timestamp, optionally pins.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="bg-brand-gold text-charcoal font-display flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold">
                4
              </span>
              <div>
                <strong className="font-display text-lg">Sunday hand-test ritual</strong>
                <p className="text-cream/70 font-body mt-1 text-sm">
                  30-min weekly process: verify the top 50 by clicks. Documented in PLAYBOOK.
                </p>
              </div>
            </li>
          </ol>

          <div className="border-cream/15 mt-8 border-t pt-6">
            <p className="text-cream/70 font-body text-sm">
              Sprint 2 starts the moment you say &quot;merge sprint-1-design and start sprint 2&quot;. ETA: 5 working days
              once kicked off.
            </p>
          </div>
        </div>
      </Section>
    </main>
  );
}
