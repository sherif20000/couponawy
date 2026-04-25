import * as React from "react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

type SectionTone = "default" | "muted" | "accent";

type SectionProps = React.HTMLAttributes<HTMLElement> & {
  /** Background tone — default = cream, muted = cream-dark/30, accent = cream-dark/60 */
  tone?: SectionTone;
  /** Container width — defaults to xl (max-w-7xl) */
  size?: "sm" | "md" | "lg" | "xl";
  /** Vertical rhythm — sm = py-10, md = py-14, lg = py-16, xl = py-20 */
  spacing?: "sm" | "md" | "lg" | "xl";
  /** When true, removes the inner Container — use for full-bleed sections that handle their own width */
  bleed?: boolean;
  children: React.ReactNode;
};

// Tone classes — single source of truth for section backgrounds across the entire site.
// Anything that's not one of these three should be challenged in code review.
const toneMap: Record<SectionTone, string> = {
  default: "",
  muted: "bg-cream-dark/30",
  accent: "bg-cream-dark/60",
};

// Spacing scale — every section uses one of these four values, no arbitrary py-12 / py-14 mixed in.
const spacingMap = {
  sm: "py-10 md:py-12",
  md: "py-12 md:py-16",
  lg: "py-16 md:py-20",
  xl: "py-20 md:py-28",
};

/**
 * Standard section wrapper. Enforces a consistent rhythm of background tone,
 * vertical spacing, and container width across every public page.
 *
 * Replace ad-hoc `<section className="bg-cream-dark/30 py-14">` with `<Section tone="muted">`.
 */
export function Section({
  tone = "default",
  size = "xl",
  spacing = "md",
  bleed = false,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn(toneMap[tone], spacingMap[spacing], className)} {...props}>
      {bleed ? children : <Container size={size}>{children}</Container>}
    </section>
  );
}
