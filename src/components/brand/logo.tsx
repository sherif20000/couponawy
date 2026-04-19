import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  variant?: "full" | "mark";
};

/**
 * Text-based brand mark until the final SVG logo lands.
 * الكوبوناوي — الأستاذ أبو عبدالله
 */
export function Logo({ className, variant = "full" }: LogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-2 font-display leading-none",
        className
      )}
      aria-label="الكوبوناوي"
    >
      <span className="text-brand-green text-2xl font-extrabold tracking-tight">
        الكوبوناوي
      </span>
      {variant === "full" && (
        <span className="text-brand-gold-dark font-accent text-sm">
          ۞
        </span>
      )}
    </span>
  );
}
