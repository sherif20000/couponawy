"use client";

import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { StoreLogo } from "@/components/stores/store-logo";
import type { Database } from "@/types/database";

type Store = Database["public"]["Tables"]["stores"]["Row"];

type StoreCardProps = {
  store: Store;
  className?: string;
};

export function StoreCard({ store, className }: StoreCardProps) {
  return (
    <Link
      href={`/stores/${store.slug}`}
      className={cn(
        "group bg-cream-dark/30 border-brand-gold/20 hover:border-brand-red/40 hover:shadow-brand flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5",
        className
      )}
    >
      <div className="bg-cream ring-brand-gold/30 group-hover:ring-brand-red/40 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 transition-all">
        <StoreLogo
          logoUrl={store.logo_url}
          nameAr={store.name_ar}
          size="md"
        />
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="font-display text-charcoal group-hover:text-brand-red text-sm font-bold transition-colors">
          {store.name_ar}
        </span>
        {store.is_verified && (
          <span className="text-brand-red font-accent inline-flex items-center gap-1 text-xs">
            <BadgeCheck className="h-3 w-3" aria-hidden />
            موثّق
          </span>
        )}
      </div>
    </Link>
  );
}
