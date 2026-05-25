"use client";

import { useState } from "react";

type StoreLogoProps = {
  logoUrl: string | null;
  nameAr: string;
  size?: "sm" | "md" | "lg";
};

// Brandfetch Logo Link requires a public client ID appended as `?c=...`.
// Stored as NEXT_PUBLIC_* because it ends up in the URL anyway. If the env
// var is missing we still fetch — Brandfetch returns 401 without it, the
// onError handler then falls back to Arabic initials (visually consistent
// with the spec's brand-red on cream).
const BRANDFETCH_CLIENT_ID = process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID ?? "";

function withBrandfetchAuth(url: string): string {
  if (!url.startsWith("https://cdn.brandfetch.io/")) return url;
  if (!BRANDFETCH_CLIENT_ID) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}c=${BRANDFETCH_CLIENT_ID}`;
}

// Tiny client component isolated for `onError` fallback — keeps the parent
// StoreGrid a server component so search state lives in the URL.
export function StoreLogo({ logoUrl, nameAr, size = "md" }: StoreLogoProps) {
  const [imgError, setImgError] = useState(false);

  // Use max-w/max-h instead of forced w/h: native logo dims vary widely.
  // Forcing them upscales tiny favicons and creates the blurry "pixelated"
  // look. With max-*, large logos fill the box (downscaled = sharp) and
  // small ones display at native size centered (no upscale blur).
  const imgClass =
    size === "sm"
      ? "max-h-9 max-w-9 object-contain"
      : size === "lg"
        ? "max-h-14 max-w-14 object-contain md:max-h-16 md:max-w-16"
        : "max-h-12 max-w-12 object-contain";

  const fallbackClass =
    size === "sm"
      ? "font-display text-brand-red text-sm font-bold"
      : size === "lg"
        ? "font-display text-brand-red text-2xl font-extrabold"
        : "font-display text-brand-red text-lg font-extrabold";

  if (logoUrl && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={withBrandfetchAuth(logoUrl)}
        alt={nameAr}
        loading="lazy"
        decoding="async"
        className={imgClass}
        onError={() => setImgError(true)}
        onLoad={(e) => {
          // < 32 catches Brandfetch 1×1 fallbacks for unknown domains AND
          // any remaining S2 16×16 globes that slip through migration.
          if ((e.target as HTMLImageElement).naturalWidth < 32) setImgError(true);
        }}
      />
    );
  }

  return <span className={fallbackClass}>{nameAr.slice(0, 2)}</span>;
}
