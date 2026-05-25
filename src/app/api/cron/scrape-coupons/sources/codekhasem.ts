// codekhasem.com adapter — KSA-focused Arabic coupon aggregator.
//
// Uses the exact same CMS template as alcoupon (verified 2026-05 — same class
// names, same DOM structure). We reuse alcoupon's parser to avoid duplication;
// only the storeUrl differs.
//
// If codekhasem's template ever diverges, fork the parser into its own
// function here. For now, one parser serves both sources.

import { parseAlcouponTemplate } from "./alcoupon";
import type { CouponSource } from "./types";

export const codekhasem: CouponSource = {
  name: "codekhasem",
  storeUrl: (slug) => `https://codekhasem.com/ar-sa/coupons/${encodeURIComponent(slug)}`,
  parse: parseAlcouponTemplate,
};
