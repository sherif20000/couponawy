import Link from "next/link";
import { Mail } from "lucide-react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "تواصل معنا | كوبوناوي",
  description:
    "تواصل مع فريق كوبوناوي لأي استفسار أو اقتراح — نرد في أقرب وقت.",
};

export default function ContactPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="from-cream-dark/60 to-cream border-brand-gold/20 border-b bg-gradient-to-b">
        <Container size="md" className="py-10 md:py-14">
          <nav
            aria-label="مسار التنقّل"
            className="text-warm-brown-light font-accent mb-4 flex items-center gap-2 text-xs"
          >
            <Link href="/" className="hover:text-brand-red transition-colors">
              الرئيسية
            </Link>
            <span>›</span>
            <span className="text-charcoal">تواصل معنا</span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="bg-brand-red/10 text-brand-red flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <Mail className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            </span>
            <div>
              <h1 className="font-display text-charcoal text-3xl font-extrabold md:text-4xl">
                تواصل معنا
              </h1>
              <p className="font-body text-warm-brown mt-1 text-base">
                نرحب بأسئلتك واقتراحاتك
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container size="sm">
          <p className="font-body text-warm-brown mb-8 text-sm leading-relaxed">
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
        </Container>
      </section>
    </main>
  );
}
