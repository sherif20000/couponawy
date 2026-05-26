import { ImageResponse } from "next/og";

/**
 * Apple Touch Icon — 180×180 coupon-ticket mark.
 *
 * Next.js convention: `app/apple-icon.tsx` is automatically wired into
 * <head> as <link rel="apple-touch-icon">. iOS uses it when the user
 * adds the site to their Home Screen.
 *
 * At 180×180 we render the full ticket aesthetic: red rounded body,
 * cream "punch-out" notches at the vertical mid-edges (mimicking a
 * real perforated coupon), and a gold "%" centered. A subtle dashed
 * gold line down the middle is the perforation cue.
 *
 * Why this size: iOS uses 180×180 for Retina (3×) and downsamples
 * for smaller home screen icons. Apple's HIG recommends a single
 * 180×180 master rather than shipping multiple sizes.
 */

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#c41e1a",
          borderRadius: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 900,
          fontSize: 124,
          color: "#dca700",
          lineHeight: 1,
          position: "relative",
        }}
      >
        {/* Left notch — "cuts" the ticket on the vertical midline */}
        <div
          style={{
            position: "absolute",
            left: -20,
            top: 70,
            width: 40,
            height: 40,
            background: "#fafaf9",
            borderRadius: 9999,
            display: "flex",
          }}
        />
        {/* Right notch — symmetric counterpart */}
        <div
          style={{
            position: "absolute",
            right: -20,
            top: 70,
            width: 40,
            height: 40,
            background: "#fafaf9",
            borderRadius: 9999,
            display: "flex",
          }}
        />
        {/* Perforation cue — vertical dashed gold line at 50% opacity */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 24,
            bottom: 24,
            width: 2,
            marginLeft: -1,
            background:
              "repeating-linear-gradient(to bottom, #dca700 0 6px, transparent 6px 14px)",
            opacity: 0.45,
            display: "flex",
          }}
        />
        <div style={{ display: "flex", position: "relative", zIndex: 2 }}>
          %
        </div>
      </div>
    ),
    { ...size }
  );
}
