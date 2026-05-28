import { Section } from "@/components/shell/section";
import { SectionHeader } from "@/components/shell/section-header";
import { StoreCard } from "@/components/stores/store-card";
import type { Database } from "@/types/database";

type Store = Database["public"]["Tables"]["stores"]["Row"];

type Props = {
  stores: Store[];
  title?: string;
  subtitle?: string;
  cta?: { href: string; label: string };
  tone?: "default" | "muted" | "accent";
  /** Cap rendered cards (default 6). */
  limit?: number;
};

/**
 * Presentational related-stores rail. Mounted on store + coupon detail pages
 * to surface other stores in the same category/country — restoring internal
 * link equity that previously dead-ended on the leaf page. Data fetching stays
 * in the page (getRelatedStores); this component only renders.
 */
export function RelatedStores({
  stores,
  title = "متاجر مشابهة قد تعجبك",
  subtitle,
  cta,
  tone = "muted",
  limit = 6,
}: Props) {
  if (stores.length === 0) return null;
  const shown = stores.slice(0, limit);

  return (
    <Section tone={tone} spacing="lg">
      <SectionHeader title={title} subtitle={subtitle} cta={cta} as="h2" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {shown.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
    </Section>
  );
}
