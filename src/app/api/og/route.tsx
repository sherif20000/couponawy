import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Dynamic Open Graph image generator.
 *
 * Usage:
 *   /api/og?title=أفضل كوبونات نون
 *   /api/og?title=كوبون 25%25 على نون&store=نون&type=coupon
 *   /api/og?title=نون السعودية&type=store
 *   /api/og?title=أفضل وقت لحجز الطيران&type=blog
 *
 * Why: Sharing a coupon/store link to Twitter/Whatsapp/Facebook should show a
 * branded card with title + brand mark, not a generic favicon. Generated on the
 * edge so it's free + fast.
 *
 * Wired into per-page metadata via openGraph.images = [`/api/og?title=${...}`].
 *
 * Note: next/og uses Satori under the hood — Arabic text rendering requires the
 * font file to be loaded explicitly. We bundle Tajawal Bold + Regular as edge
 * function assets via `new URL(import.meta.url)`; ImageResponse caches them on
 * the edge so subsequent calls reuse them.
 */

const SITE_NAME = "كوبوناوي";

// Tajawal Bold + Regular — single unified family covering both Latin and
// Arabic glyphs in one TTF each. Replaced the dual-file Cairo setup that was
// surfacing `Error: lookupType: 5 - substitution` in Vercel runtime logs ~3x
// per day. Cairo's dual-file design forced Satori to juggle two GSUB tables
// per render; some glyph sequences hit a chained-context substitution path
// Satori's font subsetter couldn't process.
//
// Tajawal has half the total GSUB lookup count of Cairo (12 vs 23) and ships
// Latin + Arabic in one file, so Satori only walks one GSUB table per render.
// Static TTFs from the Google Fonts OFL repo so we own the bytes forever and
// don't depend on Google's variable font URLs (which previously served us
// partial tables and broke the cards entirely).
async function loadFonts() {
  const [boldRes, regularRes] = await Promise.all([
    fetch(new URL("./tajawal-bold.ttf", import.meta.url)),
    fetch(new URL("./tajawal-regular.ttf", import.meta.url)),
  ]);
  if (!boldRes.ok || !regularRes.ok) {
    throw new Error("Failed to load Tajawal font for OG image");
  }
  return Promise.all([boldRes.arrayBuffer(), regularRes.arrayBuffer()]);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title")?.slice(0, 120) ?? SITE_NAME;
  const subtitle = searchParams.get("subtitle")?.slice(0, 80) ?? "";
  const type = (searchParams.get("type") ?? "default") as
    | "default"
    | "coupon"
    | "store"
    | "blog"
    | "guide";

  // Type-specific eyebrow/badge so the card communicates what's behind the link
  // before someone clicks. Different colors map to different content types.
  const typeBadge: Record<typeof type, { label: string; color: string }> = {
    default: { label: SITE_NAME, color: "#dca700" },
    coupon: { label: "كوبون خصم", color: "#dca700" },
    store: { label: "متجر موثّق", color: "#dca700" },
    blog: { label: "مقال", color: "#dca700" },
    guide: { label: "دليل", color: "#dca700" },
  };
  const badge = typeBadge[type];

  let tajawalBold: ArrayBuffer | null = null;
  let tajawalRegular: ArrayBuffer | null = null;
  try {
    const [bold, regular] = await loadFonts();
    tajawalBold = bold;
    tajawalRegular = regular;
  } catch {
    // If the bundled font fetch fails (shouldn't happen — it's in the function
    // bundle) fall back to system fonts. Arabic shaping may break but the card
    // still renders so social previews don't 500.
    tajawalBold = null;
    tajawalRegular = null;
  }

  return new ImageResponse(
    <div
      // Direction RTL because Arabic. Background is the brand red gradient
      // (matches the homepage hero) so OG cards feel native to the brand.
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "72px",
        background:
          "radial-gradient(ellipse at 80% 20%, oklch(46% 0.25 26) 0%, oklch(10% 0.02 26) 75%)",
        color: "#fff",
        fontFamily: "Tajawal",
        direction: "rtl",
      }}
    >
      {/* Brand mark — top-right (RTL: visually right, logically start) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "#dca700",
          }}
        >
          {SITE_NAME}
        </span>
        <span
          style={{
            fontSize: 18,
            padding: "8px 18px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.10)",
            color: badge.color,
            fontWeight: 700,
          }}
        >
          {badge.label}
        </span>
      </div>

      {/* Spacer pushes title block toward the bottom-center for cinematic framing */}
      <div style={{ flex: 1 }} />

      {/* Title block */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          maxWidth: "100%",
        }}
      >
        <span
          style={{
            fontSize: title.length > 60 ? 56 : 72,
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            color: "#fff",
          }}
        >
          {title}
        </span>
        {subtitle && (
          <span
            style={{
              fontSize: 28,
              fontWeight: 600,
              lineHeight: 1.4,
              color: "rgba(255,255,255,0.75)",
            }}
          >
            {subtitle}
          </span>
        )}
      </div>

      {/* Footer URL */}
      <div
        style={{
          marginTop: 36,
          fontSize: 22,
          color: "rgba(255,255,255,0.55)",
          fontWeight: 500,
        }}
      >
        couponawy.com
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      // Register Bold (700) for headings + Regular (400) for the body URL line.
      // Tajawal is one file per weight, no Latin/Arabic split — Satori reads the
      // unicode coverage from each TTF and picks the right one per glyph.
      // Falls back to system if either fails (best-effort, won't render Arabic
      // correctly but won't 500).
      fonts:
        tajawalBold && tajawalRegular
          ? [
              {
                name: "Tajawal",
                data: tajawalBold,
                style: "normal",
                weight: 700,
              },
              {
                name: "Tajawal",
                data: tajawalRegular,
                style: "normal",
                weight: 400,
              },
            ]
          : undefined,
      // Cache aggressively at the edge — these images change rarely (only when
      // titles change), and regenerating per request would be wasteful.
      headers: {
        "Cache-Control":
          "public, immutable, no-transform, max-age=31536000, s-maxage=31536000",
      },
    },
  );
}
