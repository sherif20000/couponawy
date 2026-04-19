import { cn } from "@/lib/utils";

type MascotProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: "h-12 w-12 text-xl",
  md: "h-20 w-20 text-3xl",
  lg: "h-32 w-32 text-5xl",
};

/**
 * Placeholder mascot for الأستاذ أبو عبدالله.
 * Swap the emoji-in-circle for the final illustration in Phase 2.
 */
export function Mascot({ className, size = "md" }: MascotProps) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full bg-brand-green/10 ring-2 ring-brand-gold/40 shadow-gold",
        sizeMap[size],
        className
      )}
      role="img"
      aria-label="الأستاذ أبو عبدالله"
    >
      <span aria-hidden className="font-accent text-brand-green-dark">
        أ.ع
      </span>
    </div>
  );
}
