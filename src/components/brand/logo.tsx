import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  variant?: "full" | "mark";
  /** Set true when rendering on a brand-red background — switches text to white */
  inverted?: boolean;
};

/**
 * Text-based brand mark until the final SVG logo lands.
 * كوبوناوي — الأستاذ أبو عبدالله
 */
export function Logo({ className, variant = "full", inverted = false }: LogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-2 font-display leading-none",
        className
      )}
    >
      <span
        className={cn(
          "text-2xl font-extrabold tracking-tight",
          inverted ? "text-white" : "text-brand-red"
        )}
      >
        كوبوناوي
      </span>
      {variant === "full" && (
        <span
          className={cn(
            "font-accent text-sm",
            inverted ? "text-brand-gold" : "text-brand-gold-dark"
          )}
        >
          ۞
        </span>
      )}
    </span>
  );
}
