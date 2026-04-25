import Link from "next/link";
import * as React from "react";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  /** Optional eyebrow line above the title — small, accent-colored, often with an icon */
  eyebrow?: {
    icon?: LucideIcon;
    label: string;
    /** Eyebrow color — defaults to brand-red. Use "danger" / "warning" / "success" for semantic eyebrows */
    tone?: "brand" | "danger" | "warning" | "success" | "gold";
  };
  title: string;
  subtitle?: string;
  /** Optional CTA link aligned to the end (left in RTL, right in LTR) */
  cta?: { href: string; label: string };
  /** Heading level — default h2. Use h1 only on dedicated landing pages */
  as?: "h1" | "h2" | "h3";
  className?: string;
};

const eyebrowToneMap = {
  brand: "text-brand-red",
  danger: "text-danger",
  warning: "text-warning",
  success: "text-success",
  gold: "text-brand-gold-dark",
} as const;

/**
 * Single source of truth for "section header" treatments. Replaces every ad-hoc
 *   <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
 *     <div className="flex flex-col gap-1">
 *       <h2 ...>...</h2>
 *       <p ...>...</p>
 *     </div>
 *     <Link ...>...</Link>
 *   </div>
 * scattered across pages.
 */
export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  cta,
  as = "h2",
  className,
}: SectionHeaderProps) {
  const Heading = as;
  const headingSize =
    as === "h1"
      ? "text-3xl md:text-4xl lg:text-5xl"
      : as === "h2"
        ? "text-2xl md:text-3xl"
        : "text-xl md:text-2xl";

  const EyebrowIcon = eyebrow?.icon;

  return (
    <div
      className={cn(
        "mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10",
        className
      )}
    >
      <div className="flex flex-col gap-1.5">
        {eyebrow && (
          <div
            className={cn(
              "font-accent inline-flex items-center gap-1.5 text-sm font-semibold",
              eyebrowToneMap[eyebrow.tone ?? "brand"]
            )}
          >
            {EyebrowIcon && <EyebrowIcon className="h-4 w-4" aria-hidden />}
            {eyebrow.label}
          </div>
        )}
        <Heading
          className={cn(
            "font-display text-charcoal font-extrabold leading-tight",
            headingSize
          )}
        >
          {title}
        </Heading>
        {subtitle && (
          <p className="font-body text-warm-brown text-sm md:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {cta && (
        <Link
          href={cta.href}
          className="font-body text-brand-red hover:text-brand-red-dark inline-flex items-center gap-1 text-sm font-semibold transition-colors"
        >
          {cta.label}
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}
