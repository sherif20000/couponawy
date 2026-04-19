import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
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
        "group bg-cream-dark/30 border-brand-gold/20 hover:border-brand-green/40 hover:shadow-brand flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5",
        className
      )}
    >
      <div className="bg-cream ring-brand-gold/30 group-hover:ring-brand-green/40 flex h-16 w-16 items-center justify-center rounded-full ring-2 transition-all">
        {store.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={store.logo_url}
            alt={store.name_ar}
            className="h-12 w-12 rounded-full object-contain"
          />
        ) : (
          <span className="font-display text-brand-green text-lg font-extrabold">
            {store.name_ar.slice(0, 2)}
          </span>
        )}
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="font-display text-charcoal group-hover:text-brand-green text-sm font-bold transition-colors">
          {store.name_ar}
        </span>
        {store.is_verified && (
          <span className="text-brand-green font-accent inline-flex items-center gap-1 text-[11px]">
            <BadgeCheck className="h-3 w-3" aria-hidden />
            موثّق
          </span>
        )}
      </div>
    </Link>
  );
}
