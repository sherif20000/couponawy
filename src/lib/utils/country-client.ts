"use client";

import {
  COUNTRY_COOKIE,
  DEFAULT_COUNTRY,
} from "@/app/actions/country-constants";

/**
 * Client-side equivalent of getPreferredCountry() from country.ts.
 *
 * Read the country preference from document.cookie. Used by client-island
 * components (CountrySwitcher, MobileMenuDrawer) that need to know the
 * preferred country without forcing the parent server tree into dynamic
 * rendering.
 *
 * Why this exists: getPreferredCountry() in country.ts uses next/headers
 * cookies(), which opts the entire route into dynamic rendering. Detail
 * pages (/coupons/[slug], /stores/[slug], /categories/[slug]) don't need
 * country-filtered content — but if their layout's <Header> reads the
 * cookie at server render, the whole page becomes dynamic. Reading the
 * cookie on the client instead keeps the route static + ISR.
 *
 * SSR safety: returns DEFAULT_COUNTRY when document is unavailable.
 * Components should treat the initial render as DEFAULT_COUNTRY and let
 * useEffect refresh once mounted in the browser.
 */
export function readPreferredCountryFromCookie(): string {
  if (typeof document === "undefined") return DEFAULT_COUNTRY;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COUNTRY_COOKIE}=`));
  return match?.split("=")[1] ?? DEFAULT_COUNTRY;
}
