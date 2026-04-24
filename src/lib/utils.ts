import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Convert a number or numeric string to Eastern Arabic (٠١٢..٩) numerals. */
export function toArabicNumerals(value: number | string): string {
  return String(value).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[+d]);
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
