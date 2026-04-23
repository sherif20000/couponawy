import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "font-accent inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
  {
    variants: {
      variant: {
        primary: "bg-brand-red text-cream",
        gold: "bg-brand-gold text-charcoal",
        outline: "border border-brand-red/30 bg-transparent text-brand-red",
        cream: "bg-cream-dark text-warm-brown",
        danger: "bg-danger text-cream",
        exclusive:
          "bg-brand-gold-dark text-cream shadow-gold",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}

export { Badge, badgeVariants };
