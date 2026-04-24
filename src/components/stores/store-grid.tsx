import Link from "next/link";
import { BadgeCheck, X } from "lucide-react";
import { cn, toArabicNumerals, pluralizeResult } from "@/lib/utils";
import type { StoreListItem } from "@/lib/queries/detail";
import { StoreLogo } from "./store-logo";

type StoreGridProps = {
  stores: StoreListItem[];
  query?: string;
  total?: number;
};

// Pure grid — search now lives in the hero of /stores so the page reads
// as a searchable directory. Results-count stays next to the grid it describes.
export function StoreGrid({ stores, query = "", total }: StoreGridProps) {
  const hasQuery = query.trim().length > 0;
  const count = total ?? stores.length;

  return (
    <div className="flex flex-col gap-6">
      {hasQuery && (
        <p className="font-accent text-warm-brown-light text-sm">
          {toArabicNumerals(count)} {pluralizeResult(count)} لـ «{query}»
        </p>
      )}

      {stores.length === 0 ? (
        <div className="border-brand-gold/30 bg-cream-dark/30 font-body text-warm-brown flex flex-col items-center gap-4 rounded-2xl border border-dashed p-12 text-center">
          <p>
            {hasQuery
              ? `لم نجد متاجر تطابق «${query}».`
              : "لا توجد متاجر متاحة حالياً."}
          </p>
          {hasQuery && (
            <Link
              href="/stores"
              className="font-accent text-brand-red hover:text-brand-red-dark inline-flex items-center gap-1 text-sm font-semibold transition-colors"
            >
              <X className="h-4 w-4" aria-hidden />
              مسح البحث وعرض كل المتاجر
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {stores.map((store) => (
            <Link
              key={store.id}
              href={`/stores/${store.slug}`}
              className={cn(
                "group border-brand-gold/20 bg-cream hover:border-brand-red/40 hover:shadow-md flex flex-col items-center gap-3 rounded-2xl border p-5 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97]"
              )}
            >
              <div className="bg-cream-dark ring-brand-gold/30 group-hover:ring-brand-red/40 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full ring-2 transition-all duration-200">
                <StoreLogo
                  logoUrl={store.logo_url}
                  nameAr={store.name_ar}
                  size="md"
                />
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <span className="font-display text-charcoal group-hover:text-brand-red line-clamp-2 text-sm font-bold transition-colors duration-200">
                  {store.name_ar}
                </span>
                {store.is_verified && (
                  <span className="font-accent bg-brand-red/8 text-brand-red inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold">
                    <BadgeCheck className="h-3 w-3" aria-hidden />
                    موثّق
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
