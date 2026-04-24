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

  const imgClass =
    size === "sm"
      ? "h-9 w-9 object-contain"
      : size === "lg"
        ? "h-20 w-20 object-contain md:h-24 md:w-24"
        : "h-12 w-12 object-contain";

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
          if ((e.target as HTMLImageElement).naturalWidth <= 1) setImgError(true);
        }}
      />
    );
  }

  return <span className={fallbackClass}>{nameAr.slice(0, 2)}</span>;
}
