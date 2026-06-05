import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  variant?: "full" | "mark";
  /** Set true when rendering on a brand-red background — switches text + mark to inverted palette */
  inverted?: boolean;
};

/**
 * Couponawy brand lockup — the inline SVG coupon-ticket mark + كوبوناوي wordmark.
 *
 * The mark is the same Concept B design used for the favicon, apple-icon and
 * default OG card: a rounded-corner ticket body with two semicircle notches
 * cut out of the sides (mimicking a perforated paper coupon), a thin dashed
 * vertical line down the middle as the perforation cue, and a bold "%" sign
 * in brand-gold centered inside. Drawing it inline as SVG (rather than
 * importing the static /logo.png) keeps the header weightless (no extra HTTP
 * round-trip) and means the mark inherits hover/focus animations naturally.
 *
 * `inverted` is set by the header + footer where the parent surface is
 * brand-red. In that mode the ticket body becomes cream and the wordmark
 * becomes white, so the lockup reads cleanly against the saturated red.
 *
 * `variant="mark"` returns the icon alone (no wordmark) for tight spots
 * like the mobile drawer trigger.
 */
export function Logo({
  className,
  variant = "full",
  inverted = false,
}: LogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 font-display leading-none",
        className,
      )}
    >
      <CouponTicketMark inverted={inverted} />
      {variant === "full" && (
        <span
          className={cn(
            "text-2xl font-extrabold tracking-tight",
            inverted ? "text-white" : "text-brand-red",
          )}
        >
          كوبوناوي
        </span>
      )}
    </span>
  );
}

/**
 * The SVG ticket mark. ViewBox is square so it can be sized via the
 * surrounding span's font-size (h-[1em] w-[1em]) — this makes the mark
 * grow proportionally with whatever text-size class the parent uses,
 * keeping the visual relationship to the wordmark consistent.
 *
 * Coordinate system reasoning: 32×32 viewBox is a sweet spot — enough
 * precision for the notch geometry, small enough that the path data
 * stays inline-friendly. Notches are circles centered at x=0 and x=32
 * (the edges) so they appear half-clipped.
 */
function CouponTicketMark({ inverted }: { inverted: boolean }) {
  // Inverted (on red bg): cream body, red percent, cream perforation line
  // Default (on cream bg): red body, gold percent, gold perforation line
  const bodyFill = inverted ? "var(--color-cream)" : "var(--color-brand-red)";
  const percentFill = inverted
    ? "var(--color-brand-red)"
    : "var(--color-brand-gold)";
  const dashFill = inverted
    ? "var(--color-brand-red)"
    : "var(--color-brand-gold)";

  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className="h-[1.4em] w-[1.4em] shrink-0 drop-shadow-sm"
      role="img"
    >
      <defs>
        {/* Mask cuts two notches out of the ticket body at the side midlines */}
        <mask id="couponawy-ticket-cut">
          <rect x="0" y="0" width="32" height="32" fill="white" />
          <circle cx="0" cy="16" r="3.5" fill="black" />
          <circle cx="32" cy="16" r="3.5" fill="black" />
        </mask>
      </defs>

      {/* Body */}
      <rect
        x="0"
        y="0"
        width="32"
        height="32"
        rx="6"
        ry="6"
        fill={bodyFill}
        mask="url(#couponawy-ticket-cut)"
      />

      {/* Perforation line — dashed vertical accent, low opacity */}
      <line
        x1="16"
        y1="5"
        x2="16"
        y2="27"
        stroke={dashFill}
        strokeWidth="0.5"
        strokeDasharray="1 1.4"
        opacity={inverted ? 0.55 : 0.4}
      />

      {/* Centered percent sign — drawn as text so it picks up bundled font */}
      <text
        x="16"
        y="17"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"
        fontWeight="900"
        fontSize="17"
        fill={percentFill}
        style={{ letterSpacing: "-0.04em" }}
      >
        %
      </text>
    </svg>
  );
}
