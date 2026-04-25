import { Mail } from "lucide-react";
import type { Metadata } from "next";
import { Section } from "@/components/shell/section";
import { PageHero } from "@/components/shell/page-hero";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "تواصل معنا",
  description:
    "تواصل مع فريق كوبوناوي لأي استفسار أو اقتراح — نرد في أقرب وقت.",
};

export default function ContactPage() {
  return (
    <main className="flex flex-1 flex-col">
      <PageHero
        variant="subtle"
        breadcrumbs={[
          { href: "/", label: "الرئيسية" },
          { label: "تواصل معنا" },
        ]}
        eyebrow={
          <>
            <Mail className="h-3.5 w-3.5 text-brand-gold" aria-hidden />
            نرحب بأسئلتك واقتراحاتك
          </>
        }
        title="تواصل معنا"
        subtitle="نرد على معظم الرسائل خلال 24 ساعة"
      />

      <Section size="sm" spacing="lg">
        <p className="font-body text-warm-brown mb-8 text-sm leading-relaxed md:text-base">
          هل لديك سؤال أو اقتراح؟ أرسل لنا رسالة وسنرد في أقرب وقت ممكن.
          يمكنك أيضاً مراسلتنا مباشرةً على{" "}
          <a
            href="mailto:hello@couponawy.com"
            className="text-brand-red hover:text-brand-red-dark font-semibold transition-colors"
          >
            hello@couponawy.com
          </a>
        </p>

        <ContactForm />
      </Section>
    </main>
  );
}
