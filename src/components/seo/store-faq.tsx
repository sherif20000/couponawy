import { HelpCircle } from "lucide-react";
import { Section } from "@/components/shell/section";
import { SectionHeader } from "@/components/shell/section-header";

type FaqItem = { question: string; answer: string };

type Props = {
  /** Heading title — default is "الأسئلة الشائعة". Override for category vs store contexts. */
  title?: string;
  subtitle?: string;
  items: FaqItem[];
  /** Visual tone — default uses cream background, "muted" applies cream-dark/30 */
  tone?: "default" | "muted";
};

/**
 * Renders an Arabic FAQ list using HTML <details>/<summary>.
 *
 * Why <details>: it works without JS (server-rendered, expandable on click), is
 * keyboard-accessible by default, and Google parses it for FAQPage rich-results
 * regardless of whether the answer text is initially visible — so we get SEO
 * benefit + clean UX in one component.
 *
 * The matching FAQPage JSON-LD is rendered by the parent page (so it can also
 * include questions answered elsewhere on the page).
 */
export function StoreFaq({
  title = "الأسئلة الشائعة",
  subtitle,
  items,
  tone = "muted",
}: Props) {
  if (items.length === 0) return null;

  return (
    <Section tone={tone} spacing="lg" size="lg">
      <SectionHeader
        eyebrow={{ icon: HelpCircle, label: "FAQ", tone: "brand" }}
        title={title}
        subtitle={subtitle}
        as="h2"
      />
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <details
            key={i}
            className="border-brand-gold/20 bg-cream group rounded-2xl border p-5 transition-colors open:border-brand-red/30"
          >
            <summary className="font-display text-charcoal cursor-pointer list-none text-base font-bold leading-snug md:text-lg">
              <span className="flex items-start justify-between gap-4">
                <span>{item.question}</span>
                {/* Pure CSS chevron — rotates when <details open> via the [open]: variant */}
                <span
                  aria-hidden
                  className="text-brand-red transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </span>
            </summary>
            <p className="font-body text-warm-brown mt-3 text-sm leading-relaxed md:text-base">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </Section>
  );
}

/**
 * Helper: build the FAQPage JSON-LD blob from the same items array.
 *
 *   <script
 *     type="application/ld+json"
 *     dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(items)) }}
 *   />
 */
export function buildFaqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
