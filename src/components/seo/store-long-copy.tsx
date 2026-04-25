import { Tag } from "lucide-react";
import { Section } from "@/components/shell/section";
import { SectionHeader } from "@/components/shell/section-header";
import {
  aboutStoreCopy,
  howToUseCouponSteps,
  type StoreTemplateInput,
} from "@/lib/content/store-templates";

type Props = StoreTemplateInput & {
  /**
   * Which sections to render:
   *   - "full" (default): about + how-to-use steps
   *   - "about-only": just the "عن {store}" paragraphs
   *   - "steps-only": just the 4-step how-to-use block
   *     (use when admin has already written a custom description, so we skip the
   *      template-generated "about" but still want to show the steps)
   */
  variant?: "full" | "about-only" | "steps-only";
};

/**
 * SEO long-copy block for store detail pages.
 *
 * Two stacked sections:
 *   1. "عن {store}" — paragraph(s) describing the store (template-generated)
 *   2. "كيف تستخدم كوبون {store}" — 4-step ordered checklist
 *
 * Each block uses the standard <Section> + <SectionHeader> primitives so spacing
 * and rhythm stay consistent with the rest of the page.
 */
export function StoreLongCopy(props: Props) {
  const { variant = "full", nameAr } = props;
  const aboutText = aboutStoreCopy(props);
  const steps = howToUseCouponSteps(props);
  const showAbout = variant !== "steps-only";
  const showSteps = variant !== "about-only";

  return (
    <>
      {showAbout && (
        <Section spacing="lg">
          <SectionHeader title={`عن ${nameAr}`} as="h2" />
          <div className="font-body text-warm-brown max-w-3xl space-y-4 text-base leading-relaxed">
            {aboutText.split(/\n\s*\n/).map((paragraph, i) => (
              <p key={i}>{paragraph.trim()}</p>
            ))}
          </div>
        </Section>
      )}

      {showSteps && (
        <Section tone="muted" spacing="lg">
          <SectionHeader
            eyebrow={{ icon: Tag, label: "خطوات بسيطة", tone: "brand" }}
            title={`كيف تستخدم كوبون ${nameAr}`}
            subtitle="٤ خطوات سريعة من الكود إلى الخصم"
            as="h2"
          />
          <ol className="grid gap-4 md:grid-cols-2">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="border-brand-gold/20 bg-cream relative flex gap-4 rounded-2xl border p-5"
              >
                <span className="bg-brand-red/10 text-brand-red font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                  {/* Arabic-Indic digits keep the steps localized */}
                  {(i + 1).toLocaleString("ar-EG")}
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-display text-charcoal text-base font-bold">
                    {step.title}
                  </h3>
                  <p className="font-body text-warm-brown text-sm leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Section>
      )}
    </>
  );
}
