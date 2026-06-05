import { Tag, BookOpen, Truck, Calendar } from "lucide-react";
import { Section } from "@/components/shell/section";
import { SectionHeader } from "@/components/shell/section-header";
import {
  aboutStoreCopy,
  howToUseCouponSteps,
  shippingInfoCopy,
  seasonalCalendarCopy,
  storeHistoryCopy,
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

// Tiny prose renderer — splits markdown-ish text into paragraphs at double
// newlines, then renders **bold** runs inside each paragraph. Avoids pulling
// react-markdown into the bundle for what is essentially "paragraphs + bold".
export function ProseFromText({ text }: { text: string }) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <div className="font-body text-warm-brown max-w-3xl space-y-4 text-base leading-relaxed">
      {paragraphs.map((p, i) => {
        // Each paragraph: split on **bold** markers, render alternating runs
        const parts = p.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i}>
            {parts.map((part, j) =>
              part.startsWith("**") && part.endsWith("**") ? (
                <strong key={j} className="text-charcoal font-bold">
                  {part.slice(2, -2)}
                </strong>
              ) : (
                <span key={j}>{part}</span>
              ),
            )}
          </p>
        );
      })}
    </div>
  );
}

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
  const historyText = storeHistoryCopy(props);
  const shippingText = shippingInfoCopy(props);
  const seasonalText = seasonalCalendarCopy(props);
  const steps = howToUseCouponSteps(props);
  const showAbout = variant !== "steps-only";
  const showSteps = variant !== "about-only";
  // History / shipping / seasonal only render in full variant — they're the
  // "flagship" depth blocks. about-only and steps-only modes are reserved for
  // pages with custom layouts that just want those slivers.
  const showDeepBlocks = variant === "full";

  return (
    <>
      {showAbout && (
        <Section spacing="lg">
          <SectionHeader title={`عن ${nameAr}`} as="h2" />
          <ProseFromText text={aboutText} />
        </Section>
      )}

      {showDeepBlocks && (
        <Section tone="muted" spacing="lg">
          <SectionHeader
            eyebrow={{ icon: BookOpen, label: "خلفية المتجر", tone: "gold" }}
            title={`قصة ${nameAr}`}
            as="h2"
          />
          <ProseFromText text={historyText} />
        </Section>
      )}

      {showSteps && (
        <Section spacing="lg">
          <SectionHeader
            eyebrow={{ icon: Tag, label: "خطوات بسيطة", tone: "brand" }}
            title={`كيف تستخدم كوبون ${nameAr}`}
            subtitle="4 خطوات سريعة من الكود إلى الخصم"
            as="h2"
          />
          <ol className="grid gap-4 md:grid-cols-2">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="border-brand-gold/20 bg-cream relative flex gap-4 rounded-2xl border p-5"
              >
                <span className="bg-brand-red/10 text-brand-red font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                  {(i + 1).toLocaleString("en-US")}
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

      {showDeepBlocks && (
        <Section tone="muted" spacing="lg">
          <SectionHeader
            eyebrow={{ icon: Truck, label: "الشحن والدفع", tone: "gold" }}
            title={`دليل الشراء من ${nameAr}`}
            subtitle="كل ما تحتاجه قبل الضغط على «شراء»"
            as="h2"
          />
          <ProseFromText text={shippingText} />
        </Section>
      )}

      {showDeepBlocks && (
        <Section spacing="lg">
          <SectionHeader
            eyebrow={{ icon: Calendar, label: "تقويم العروض", tone: "brand" }}
            title={`أفضل وقت للشراء من ${nameAr}`}
            subtitle="رمضان، الجمعة البيضاء، 11.11 — متى تجد أعلى خصم؟"
            as="h2"
          />
          <ProseFromText text={seasonalText} />
        </Section>
      )}
    </>
  );
}
