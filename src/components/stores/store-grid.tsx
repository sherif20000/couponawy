"use client";

import * as React from "react";
import Link from "next/link";
import { Search, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StoreListItem } from "@/lib/queries/detail";

type StoreGridProps = {
  stores: StoreListItem[];
};

export function StoreGrid({ stores }: StoreGridProps) {
  const [query, setQuery] = React.useState("");

  const filtered = query.trim()
    ? stores.filter(
        (s) =>
          s.name_ar.includes(query) ||
          s.name_en?.toLowerCase().includes(query.toLowerCase())
      )
    : stores;

  return (
    <div className="flex flex-col gap-8">
      <div className="relative max-w-md">
        <Search className="text-warm-brown-light absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2" aria-hidden />
        <input
          type="search"
          placeholder="ابحث عن متجر..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border-brand-gold/30 font-body text-charcoal placeholder:text-warm-brown-light focus:border-brand-red focus:ring-brand-red/20 w-full rounded-xl border bg-white py-3 pr-11 pl-4 transition-all focus:outline-none focus:ring-2"
        />
      </div>

      <p className="font-accent text-warm-brown-light text-sm">
        {filtered.length} متجر
      </p>

      {filtered.length === 0 ? (
        <div className="border-brand-gold/30 bg-cream-dark/30 font-body text-warm-brown rounded-2xl border border-dashed p-12 text-center">
          لا توجد متاجر تطابق بحثك.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((store) => (
            <Link
              key={store.id}
              href={`/stores/${store.slug}`}
              className={cn(
                "group border-brand-gold/20 bg-cream-dark/20 hover:border-brand-red/40 hover:shadow-brand flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-all duration-200 hover:-translate-y-0.5"
              )}
            >
              <div className="bg-cream ring-brand-gold/30 group-hover:ring-brand-red/40 flex h-16 w-16 items-center justify-center rounded-full ring-2 transition-all">
                {store.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={store.logo_url}
                    alt={store.name_ar}
                    className="h-12 w-12 rounded-full object-contain"
                  />
                ) : (
                  <span className="font-display text-brand-red text-lg font-extrabold">
                    {store.name_ar.slice(0, 2)}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="font-display text-charcoal group-hover:text-brand-red line-clamp-2 text-sm font-bold transition-colors">
                  {store.name_ar}
                </span>
                {store.is_verified && (
                  <span className="text-brand-red font-accent inline-flex items-center gap-1 text-[11px]">
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
