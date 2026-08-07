import {
  Tag,
  ShieldCheck,
  Sparkles,
  Award,
  Check,
  Minus,
  type LucideIcon,
} from "lucide-react";
import { ProseFromText } from "@/components/seo/store-long-copy";
import {
  aboutOfferCopy,
  howToRedeemSteps,
  termsAndEligibilityCopy,
  maximizeSavingsCopy,
  editorVerdict,
  type CouponTemplateInput,
} from "@/lib/content/coupon-templates";

type Props = CouponTemplateInput & {
  /** When expired, drop the how-to-redeem steps (nothing left to redeem). */
  isExpired?: boolean;
};

/** Section heading with optional eyebrow, sized via the Sprint 3 type tokens. */
function BlockHeading({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
}: {
  icon?: LucideIcon;
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4 flex flex-col gap-1.5">
      {Icon && eyebrow && (
        <span className="font-accent text-brand-red inline-flex items-center gap-1.5 text-xs font-bold">
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-headline-md text-charcoal font-extrabold">
        {title}
      </h2>
      {subtitle && (
        <p className="font-body text-warm-brown-light text-sm">{subtitle}</p>
      )}
    </div>
  );
}

/**
 * Coupon-page editorial column (flow mode — no <Section> wrappers, so it lives
 * inside the 2-column grid alongside the sticky sidebar). Blocks:
 *   1. About the offer
 *   2. Editor's verdict (EEAT) — first-party "we tried it" + pros/cons
 *   3. How to redeem (ordered steps; skipped when expired)
 *   4. Terms & eligibility
 *   5. Maximize your savings
 */
export function CouponLongCopy(props: Props) {
  const { storeNameAr, isExpired = false } = props;
  const aboutText = aboutOfferCopy(props);
  const termsText = termsAndEligibilityCopy(props);
  const savingsText = maximizeSavingsCopy(props);
  const steps = howToRedeemSteps(props);
  const verdict = editorVerdict(props);

  return (
    <div className="flex flex-col gap-12">
      <section>
        <BlockHeading title="عن هذا العرض" />
        <ProseFromText text={aboutText} />
      </section>

      {/* Editor's verdict — EEAT experience signal */}
      <section
        data-speakable
        className="border-brand-gold/30 bg-cream-dark/20 rounded-2xl border p-6"
      >
        <BlockHeading
          icon={Award}
          eyebrow="رأي المحرّر"
          title="هل يستحق هذا العرض؟"
        />
        <p className="font-body text-warm-brown text-base leading-relaxed">
          {verdict.verdict}
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <ul className="flex flex-col gap-2">
            {verdict.pros.map((p) => (
              <li
                key={p}
                className="font-body text-warm-brown flex items-start gap-2 text-sm leading-relaxed"
              >
                <Check
                  className="text-success mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden
                />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <ul className="flex flex-col gap-2">
            {verdict.cons.map((c) => (
              <li
                key={c}
                className="font-body text-warm-brown flex items-start gap-2 text-sm leading-relaxed"
              >
                <Minus
                  className="text-warm-brown-light mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden
                />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {!isExpired && (
        <section>
          <BlockHeading
            icon={Tag}
            eyebrow="خطوات بسيطة"
            title={`كيف تستخدم عرض ${storeNameAr}`}
          />
          <ol className="grid gap-4 sm:grid-cols-2">
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
        </section>
      )}

      <section>
        <BlockHeading
          icon={ShieldCheck}
          eyebrow="الشروط والأهلية"
          title="شروط استخدام العرض"
          subtitle="اقرأها قبل الدفع لتتجنّب رفض الكود"
        />
        <ProseFromText text={termsText} />
      </section>

      <section>
        <BlockHeading
          icon={Sparkles}
          eyebrow="نصائح التوفير"
          title="كيف تضاعف توفيرك"
        />
        <ProseFromText text={savingsText} />
      </section>
    </div>
  );
}
