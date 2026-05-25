// Coupon source adapter interface.
//
// Each adapter knows ONE aggregator site. It takes a store slug, fetches the
// store page HTML, and extracts whatever coupons are listed.
//
// The route handler in ../route.ts calls every adapter in parallel for each
// store, then merges results — codes that appear on 2+ sources are tagged
// verification_method = 'multi-source' (higher trust), single-source codes
// get 'scrape'.
//
// To add a new source: create another file in this directory, implement
// CouponSource, and add it to ./index.ts. No route changes needed.

export type ScrapedCoupon = {
  code: string;
  title_ar?: string;
  discount_display?: string;
};

export type SourceResult = {
  store_found: boolean;
  coupons: ScrapedCoupon[];
  /** Source-specific status/diagnostic — surfaces in cron log */
  status: "ok" | "store_not_found" | "no_codes" | "error";
  error?: string;
};

export type CouponSource = {
  /** Stable identifier — used in the cron run log */
  name: string;
  /** Build the store page URL for this site from our internal slug */
  storeUrl: (slug: string) => string;
  /** Parse the fetched HTML and return whatever codes are listed */
  parse: (html: string) => ScrapedCoupon[];
};
