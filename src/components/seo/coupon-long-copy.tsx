import { Tag, ShieldCheck, Sparkles } from "lucide-react";
import { Section } from "@/components/shell/section";
import { SectionHeader } from "@/components/shell/section-header";
import { ProseFromText } from "@/components/seo/store-long-copy";
import {
  aboutOfferCopy,
  howToRedeemSteps,
  termsAndEligibilityCopy,
  maximizeSavingsCopy,
  couponHasCode,
  type CouponTemplateInput,
} from "@/lib/content/coupon-templates";

type Props = CouponTemplateInput & {
  /**
   * When the offer is expired the page hero already shows the "انتهت الصلاحية"
   * notice and hides the reveal button. We still render the about + terms +
   * savings prose (good for SEO and for the shopper hunting a replacement), but
   * we drop the how-to-redeem steps since there's nothing to redeem.
   */
  isExpired?: boolean;
};

/**
 * SEO long-copy block for coupon detail pages — the coupon-side mirror of
 * StoreLongCopy. Four stacked sections built from coupon-templates.ts:
 *   1. "عن العرض" — what the offer is + how couponawy verifies it
 *   2. "كيف تستخدم العرض" — ordered redeem steps (skipped when expired)
 *   3. "الشروط والأهلية" — terms, minimum order, why codes fail
 *   4. "كيف تضاعف توفيرك" — stacking tactics, BNPL ordering, seasonal timing
 *
 * Reuses the <Section>/<SectionHeader> primitives + the ProseFromText renderer
 * from store-long-copy so spacing, rhythm, and bold-run rendering stay identical
 * across store and coupon pages.
 */
export function CouponLongCopy(props: Props) {
  const { storeNameAr, isExpired = false } = props;
  const aboutText = aboutOfferCopy(props);
  const termsText = termsAndEligibilityCopy(props);
  const savingsText = maximizeSavingsCopy(props);
  const steps = howToRedeemSteps(props);
  const hasCode = couponHasCode(props);
  const stepsSubtitle = hasCode
    ? "من نسخ الكود إلى تأكيد الخصم"
    : "من الرابط إلى تأكيد التوفير";

  return (
    <>
      <Section spacing="lg">
        <SectionHeader title="عن هذا العرض" as="h2" />
        <ProseFromText text={aboutText} />
      </Section>

      {!isExpired && (
        <Section tone="muted" spacing="lg">
          <SectionHeader
            eyebrow={{ icon: Tag, label: "خطوات بسيطة", tone: "brand" }}
            title={`كيف تستخدم عرض ${storeNameAr}`}
            subtitle={stepsSubtitle}
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

      <Section spacing="lg">
        <SectionHeader
          eyebrow={{ icon: ShieldCheck, label: "الشروط والأهلية", tone: "gold" }}
          title="شروط استخدام العرض"
          subtitle="اقرأها قبل الدفع لتتجنّب رفض الكود"
          as="h2"
        />
        <ProseFromText text={termsText} />
      </Section>

      <Section tone="muted" spacing="lg">
        <SectionHeader
          eyebrow={{ icon: Sparkles, label: "نصائح التوفير", tone: "brand" }}
          title="كيف تضاعف توفيرك"
          subtitle="تكتيكات تركّب قيمة إضافية فوق الكود"
          as="h2"
        />
        <ProseFromText text={savingsText} />
      </Section>
    </>
  );
}
