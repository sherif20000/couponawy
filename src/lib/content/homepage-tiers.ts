/**
 * Single source of truth for homepage store prominence tiers.
 * To retune the ranking, edit slug membership here (no DB migration needed).
 * If a tier renders fewer logos than expected, update these slugs to match active store slugs.
 */
export const HOMEPAGE_TIERS = {
  hero: ["noon", "iherb", "nahdi", "jarir"],
  featured: ["amazon-sa", "sephora", "shein", "hungerstation", "jahez", "temu"],
  rising: ["keeta", "niceone", "ikea", "aliexpress"],
} as const;

export type HomepageTierKey = keyof typeof HOMEPAGE_TIERS;
