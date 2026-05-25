import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Render a number using Latin digits (0-9).
 *
 * Historically this function converted to Eastern Arabic numerals (٠-٩), but
 * site-wide we now render all numerals in Latin form (per product decision —
 * easier to scan, consistent with prices/coupon codes that are always Latin,
 * better OCR/accessibility). Kept the function name for callsite churn but
 * the body is now an identity. New code should just use `String(value)` or
 * call `.toLocaleString("en-US")` directly.
 */
export function toArabicNumerals(value: number | string): string {
  return String(value);
}

/** Pluralize Arabic coupon label based on count. */
export function pluralizeCoupon(count: number): string {
  if (count === 1) return "كوبون نشط";
  if (count >= 2 && count <= 10) return "كوبونات نشطة";
  return "كوبون نشط";
}

/** Pluralize Arabic store label based on count (Arabic plurals use 2-10 bracket). */
export function pluralizeStore(count: number): string {
  if (count === 1) return "متجر";
  if (count === 2) return "متجران";
  if (count >= 3 && count <= 10) return "متاجر";
  return "متجر";
}

/** Pluralize Arabic result label based on count. */
export function pluralizeResult(count: number): string {
  if (count === 1) return "نتيجة";
  if (count === 2) return "نتيجتان";
  if (count >= 3 && count <= 10) return "نتائج";
  return "نتيجة";
}
