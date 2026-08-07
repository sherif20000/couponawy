import { ImageResponse } from "next/og";

/**
 * Dynamic favicon — 32×32 coupon-ticket mark.
 *
 * Next.js convention: `app/icon.tsx` is automatically wired into <head> as
 * the site favicon, replacing the static favicon.ico that lived here before.
 * Generated at the edge once, then cached on Vercel's CDN forever.
 *
 * Design: solid brand-red rounded square with a centered gold "%" — the
 * Coupon Ticket mark (Concept B from the brand mockups). At 32×32 we drop
 * the side notches since they'd compress into ~3px of visual noise; the
 * notches are restored at apple-icon (180×180) and opengraph-image sizes.
 *
 * Color values are hex (not OKLCH) because Satori needs deterministic
 * sRGB output for browser favicon decoding; the hex pair matches the
 * design tokens in globals.css to within a perceptual JND.
 */

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#c41e1a",
        borderRadius: 7,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 900,
        fontSize: 22,
        color: "#dca700",
        lineHeight: 1,
      }}
    >
      %
    </div>,
    { ...size },
  );
}
