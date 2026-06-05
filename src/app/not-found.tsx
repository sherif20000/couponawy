import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "الصفحة غير موجودة",
  description:
    "الصفحة التي تبحث عنها غير موجودة. تصفّح المتاجر والكوبونات على كوبوناوي.",
  // Tell crawlers not to index this 'not-found' shell. Next.js 16 + Vercel
  // ISR currently returns HTTP 200 when notFound() fires from a dynamically-
  // rendered detail page (soft-404), and the only reliable way to stop
  // Google from indexing that thin/duplicate content is the meta-robots tag.
  // Status code itself isn't an SEO ranking signal — what hurts is the
  // indexing of low-value content, and noindex blocks that directly.
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center">
      <Container size="md" className="py-20 text-center">
        {/* Big 404 */}
        <p className="font-display text-brand-gold/30 select-none text-[9rem] font-extrabold leading-none md:text-[12rem]">
          404
        </p>

        <h1 className="font-display text-charcoal -mt-4 mb-3 text-2xl font-extrabold md:text-3xl">
          الصفحة غير موجودة
        </h1>
        <p className="font-body text-warm-brown mx-auto mb-10 max-w-sm text-base">
          يبدو أن الأستاذ أبو عبدالله لم يمر من هنا. هذه الصفحة غير موجودة أو تم
          نقلها.
        </p>

        {/* Actions */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="bg-brand-red hover:bg-brand-red-dark active:scale-[0.98] font-body inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-cream transition-all"
          >
            العودة للرئيسية
          </Link>
          <Link
            href="/stores"
            className="border-brand-gold/40 bg-cream-dark/60 hover:border-brand-red/40 active:scale-[0.98] font-body text-warm-brown inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-all"
          >
            تصفّح المتاجر
          </Link>
          <Link
            href="/coupons"
            className="border-brand-gold/40 bg-cream-dark/60 hover:border-brand-red/40 active:scale-[0.98] font-body text-warm-brown inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-all"
          >
            جميع الكوبونات
          </Link>
        </div>
      </Container>
    </main>
  );
}
