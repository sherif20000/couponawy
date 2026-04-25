/**
 * Append UTM tracking params to an outbound destination URL so we can attribute
 * traffic back to couponawy from the merchant's analytics.
 *
 * Why we do this client-side rather than baking UTMs into stored destination_url:
 *   - The same coupon may have different surfaces (homepage card, search result,
 *     coupon detail page) and we want to know which surface drove the click.
 *   - Stored URLs may already contain affiliate params (admitad, arabclicks);
 *     UTMs are added on top non-destructively.
 *
 * Source: always "couponawy".
 * Medium: "coupon" for any coupon-driven click, "store" for a direct store-button click.
 * Campaign: the coupon slug (or store slug if no coupon).
 */

export type OutboundContext = {
  /** Where the click originated — "card" | "detail" | "store_button" | "store_hero" */
  surface?: "card" | "detail" | "store_button" | "store_hero";
  /** Coupon slug or id — becomes utm_campaign */
  couponSlug?: string | null;
  /** Store slug — fallback for utm_campaign when no coupon */
  storeSlug?: string | null;
};

export function buildOutboundUrl(
  destinationUrl: string,
  ctx: OutboundContext = {}
): string {
  try {
    const url = new URL(destinationUrl);
    // Don't overwrite existing UTMs if the merchant or affiliate network already
    // added them — only set what's missing.
    if (!url.searchParams.has("utm_source")) {
      url.searchParams.set("utm_source", "couponawy");
    }
    if (!url.searchParams.has("utm_medium")) {
      url.searchParams.set(
        "utm_medium",
        ctx.surface === "store_button" || ctx.surface === "store_hero"
          ? "store"
          : "coupon"
      );
    }
    if (!url.searchParams.has("utm_campaign")) {
      const campaign = ctx.couponSlug ?? ctx.storeSlug ?? "general";
      url.searchParams.set("utm_campaign", campaign);
    }
    if (ctx.surface && !url.searchParams.has("utm_content")) {
      url.searchParams.set("utm_content", ctx.surface);
    }
    return url.toString();
  } catch {
    // If destinationUrl is malformed, return it unchanged — better to lose
    // attribution than to break the click.
    return destinationUrl;
  }
}
