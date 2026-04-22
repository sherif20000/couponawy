import Link from "next/link";
import {
  ShoppingBag,
  Shirt,
  Sparkles,
  UtensilsCrossed,
  HeartPulse,
  House,
  Baby,
  Plane,
  ShoppingCart,
  Briefcase,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

type Category = Database["public"]["Tables"]["categories"]["Row"];

type CategoryCardProps = {
  category: Category;
  couponCount?: number;
  className?: string;
};

const iconMap: Record<string, LucideIcon> = {
  electronics: ShoppingBag,
  fashion: Shirt,
  beauty: Sparkles,
  food: UtensilsCrossed,
  pharmacy: HeartPulse,
  home: House,
  kids: Baby,
  travel: Plane,
  grocery: ShoppingCart,
  services: Briefcase,
};

export function CategoryCard({ category, couponCount, className }: CategoryCardProps) {
  const Icon = iconMap[category.slug] ?? Tag;

  return (
    <Link
      href={`/categories/${category.slug}`}
      className={cn(
        "group bg-cream-dark/30 border-brand-gold/20 hover:border-brand-green/40 hover:bg-brand-green/5 relative flex flex-col items-center gap-3 rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-0.5",
        className
      )}
    >
      {/* Coupon count badge */}
      {couponCount !== undefined && couponCount > 0 && (
        <span className="font-accent bg-brand-gold text-cream absolute top-2 start-2 rounded-full px-2 py-0.5 text-[10px] font-bold leading-none shadow-sm">
          {couponCount}
        </span>
      )}

      <div className="bg-brand-green/10 text-brand-green group-hover:bg-brand-green group-hover:text-cream flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-200">
        <Icon className="h-7 w-7" strokeWidth={1.75} aria-hidden />
      </div>
      <span className="font-display text-charcoal group-hover:text-brand-green text-center text-sm font-bold transition-colors">
        {category.name_ar}
      </span>
    </Link>
  );
}
