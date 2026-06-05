import { ImageResponse } from "next/og";

/**
 * Default Open Graph image — 1200×630.
 *
 * Next.js convention: `app/opengraph-image.tsx` is the fallback OG card
 * served for any URL whose page doesn't define its own `openGraph.images`.
 * In practice this means the homepage and a few utility pages — most
 * content routes (coupons, stores, blog, guides) generate per-page cards
 * via /api/og?title=... which is far more expressive.
 *
 * Why this exists: the previous fallback path was the literal string
 * `${BASE_URL}/icon.png` which 404'd because no such file ever existed.
 * Social platforms (WhatsApp, Twitter, Facebook) were caching a 404 OG
 * for every share that didn't have a custom image set.
 *
 * Design: the Coupon Ticket mark on the brand-red gradient, with the
 * Couponawy wordmark in gold and a tagline below. Matches the visual
 * grammar of /api/og so cards feel consistent across the share funnel.
 */

export const runtime = "edge";
export const alt = "كوبوناوي — كوبونات السعودية والخليج";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function DefaultOG() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: 72,
        background:
          "radial-gradient(ellipse at 80% 20%, oklch(46% 0.25 26) 0%, oklch(10% 0.02 26) 75%)",
        color: "#fff",
        direction: "rtl",
      }}
    >
      {/* Top row: ticket mark + wordmark on the right (RTL start) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* The mark — same Concept B coupon ticket, scaled to 88×88 */}
          <div
            style={{
              width: 88,
              height: 88,
              background: "#c41e1a",
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 900,
              fontSize: 60,
              color: "#dca700",
              lineHeight: 1,
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: -10,
                top: 34,
                width: 20,
                height: 20,
                background: "oklch(10% 0.02 26)",
                borderRadius: 9999,
                display: "flex",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: -10,
                top: 34,
                width: 20,
                height: 20,
                background: "oklch(46% 0.25 26)",
                borderRadius: 9999,
                display: "flex",
              }}
            />
            <div style={{ display: "flex", position: "relative", zIndex: 2 }}>
              %
            </div>
          </div>
          <span
            style={{
              fontSize: 44,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              color: "#dca700",
            }}
          >
            كوبوناوي
          </span>
        </div>
        <span
          style={{
            fontSize: 20,
            padding: "10px 20px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.10)",
            color: "#dca700",
            fontWeight: 700,
          }}
        >
          موقع موثّق
        </span>
      </div>

      <div style={{ flex: 1, display: "flex" }} />

      {/* Headline + tagline */}
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <span
          style={{
            fontSize: 80,
            fontWeight: 900,
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
            color: "#fff",
            maxWidth: "100%",
          }}
        >
          كوبونات خصم موثّقة
        </span>
        <span
          style={{
            fontSize: 32,
            fontWeight: 600,
            lineHeight: 1.4,
            color: "rgba(255,255,255,0.85)",
            maxWidth: "85%",
          }}
        >
          أحدث أكواد الخصم من أكبر متاجر السعودية والخليج — تتجدّد يومياً.
        </span>
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
    { ...size },
  );
}
