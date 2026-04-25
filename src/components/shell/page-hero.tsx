import Link from "next/link";
import * as React from "react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

type HeroVariant = "brand" | "subtle" | "dark";

type Crumb = { href?: string; label: string };

type PageHeroProps = {
  /** Visual variant — `brand` = signature red gradient (homepage), `subtle` = solid brand-red flat, `dark` = near-black */
  variant?: HeroVariant;
  /** Breadcrumb trail rendered above the title */
  breadcrumbs?: Crumb[];
  /** Optional eyebrow chip — sits above the title with a frosted-pill background */
  eyebrow?: React.ReactNode;
  /** Hero title — uses fluid clamp typography automatically */
  title: React.ReactNode;
  /** Optional sub-headline below the title */
  subtitle?: React.ReactNode;
  /** Optional content rendered after subtitle (CTAs, search bar, stats) */
  children?: React.ReactNode;
  /** Right-side slot — typically a logo / mascot / illustration */
  aside?: React.ReactNode;
  /** Heading level — h1 by default. Override only when the page already has an h1 elsewhere. */
  as?: "h1" | "h2";
  className?: string;
};

// Variant classes — every hero on every public page picks one of these three.
// `brand` is the signature gradient (was inline-styled on home), now a CSS variable so
// the noise texture and edge vignette live in one place instead of being duplicated.
const variantMap: Record<HeroVariant, string> = {
  brand: "page-hero-brand text-white",
  subtle: "bg-brand-red text-white",
  dark: "page-hero-dark text-white",
};

/**
 * Standard hero treatment for every page that needs one.
 *
 *   <PageHero
 *     variant="brand"
 *     breadcrumbs={[{ href: "/", label: "الرئيسية" }, { label: "المتاجر" }]}
 *     title="جميع المتاجر"
 *     subtitle="تصفّح أكواد الخصم من أكبر المتاجر السعودية"
 *   />
 *
 * Pages that need extra DOM (search bar, stats strip) pass them as `children`.
 */
export function PageHero({
  variant = "subtle",
  breadcrumbs,
  eyebrow,
  title,
  subtitle,
  children,
  aside,
  as = "h1",
  className,
}: PageHeroProps) {
  const Heading = as;

  return (
    <section
      aria-labelledby="page-hero-heading"
      className={cn(
        "relative overflow-hidden",
        // Vertical rhythm tuned per variant — brand variant gets the most generous space because
        // it's the visual signature; subtle/dark are utility heroes used on listing pages.
        variant === "brand" ? "py-16 md:py-24" : "py-10 md:py-14",
        variantMap[variant],
        className
      )}
    >
      <Container size="xl" className="relative z-10">
        <div
          className={cn(
            "flex flex-col gap-6",
            aside ? "md:flex-row md:items-center md:gap-10" : ""
          )}
        >
          <div className="flex flex-1 flex-col gap-4">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav
                aria-label="مسار التنقّل"
                className="font-accent flex items-center gap-2 text-xs text-white/60"
              >
                {breadcrumbs.map((crumb, idx) => {
                  const isLast = idx === breadcrumbs.length - 1;
                  return (
                    <React.Fragment key={`${crumb.label}-${idx}`}>
                      {crumb.href && !isLast ? (
                        <Link
                          href={crumb.href}
                          className="rounded-sm transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className={isLast ? "text-white" : "text-white/60"}>
                          {crumb.label}
                        </span>
                      )}
                      {!isLast && <span className="text-white/30">›</span>}
                    </React.Fragment>
                  );
                })}
              </nav>
            )}
            {eyebrow && (
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/85 backdrop-blur-sm">
                {eyebrow}
              </div>
            )}
            <Heading
              id="page-hero-heading"
              className="font-display font-black text-white"
              style={{
                // Fluid typography: scales from ~32px on small phones to ~60px on large desktops.
                // Replaces the three-breakpoint stack (text-3xl md:text-4xl lg:text-5xl) so headlines
                // never get awkwardly small on mid-sized devices.
                fontSize:
                  as === "h1"
                    ? "clamp(2rem, 4vw + 1rem, 3.75rem)"
                    : "clamp(1.625rem, 2.5vw + 1rem, 2.5rem)",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </Heading>
            {subtitle && (
              <p className="font-body max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
                {subtitle}
              </p>
            )}
            {children}
          </div>
          {aside && <div className="shrink-0">{aside}</div>}
        </div>
      </Container>
    </section>
  );
}
