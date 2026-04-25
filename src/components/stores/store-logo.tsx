"use client";

import { useState } from "react";

type StoreLogoProps = {
  logoUrl: string | null;
  nameAr: string;
  size?: "sm" | "md" | "lg";
};

// Tiny client component isolated for `onError` fallback — keeps the parent
// StoreGrid a server component so search state lives in the URL.
export function StoreLogo({ logoUrl, nameAr, size = "md" }: StoreLogoProps) {
  const [imgError, setImgError] = useState(false);

  // Use max-w/max-h instead of forced w/h: favicons are 48–192px native.
  // Forcing them to 80–96px upscales tiny favicons and creates the blurry
  // "pixelated" look. With max-*, large favicons fill the box (downscaled =
  // sharp) and small ones display at native size centered (no upscale blur).
  const imgClass =
    size === "sm"
      ? "max-h-9 max-w-9 object-contain"
      : size === "lg"
        ? "max-h-20 max-w-20 object-contain md:max-h-24 md:max-w-24"
        : "max-h-12 max-w-12 object-contain";

  const fallbackClass =
    size === "sm"
      ? "font-display text-brand-red text-sm font-bold"
      : size === "lg"
        ? "font-display text-brand-red text-3xl font-extrabold"
        : "font-display text-brand-red text-lg font-extrabold";

  if (logoUrl && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={nameAr}
        className={imgClass}
        onError={() => setImgError(true)}
        onLoad={(e) => {
          // < 32 catches both Clearbit's old 1×1 silent failure AND
          // Google S2's 16×16 generic-globe placeholder for unknown domains.
          if ((e.target as HTMLImageElement).naturalWidth < 32) setImgError(true);
        }}
      />
    );
  }

  return <span className={fallbackClass}>{nameAr.slice(0, 2)}</span>;
}
