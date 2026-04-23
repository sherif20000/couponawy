import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "المتجر غير موجود | كوبوناوي",
  description: "المتجر الذي تبحث عنه غير موجود. تصفّح جميع المتاجر على كوبوناوي.",
};

export default function StoreNotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center">
      <Container size="md" className="py-20 text-center">
        <p className="font-display text-brand-gold/30 select-none text-[9rem] font-extrabold leading-none md:text-[12rem]">
          ٤٠٤
        </p>

        <h1 className="font-display text-charcoal -mt-4 mb-3 text-2xl font-extrabold md:text-3xl">
          المتجر غير موجود
        </h1>
        <p className="font-body text-warm-brown mx-auto mb-10 max-w-sm text-base">
          هذا المتجر غير موجود أو ربما تم إيقافه. تصفّح المتاجر المتاحة للعثور على ما تريد.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/stores"
            className="bg-brand-red hover:bg-brand-red-dark active:scale-[0.98] font-body inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-cream transition-all"
          >
            جميع المتاجر
          </Link>
          <Link
            href="/coupons"
            className="border-brand-gold/40 bg-cream-dark/60 hover:border-brand-red/40 active:scale-[0.98] font-body text-warm-brown inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-all"
          >
            تصفّح الكوبونات
          </Link>
          <Link
            href="/"
            className="border-brand-gold/40 bg-cream-dark/60 hover:border-brand-red/40 active:scale-[0.98] font-body text-warm-brown inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-all"
          >
            الرئيسية
          </Link>
        </div>
      </Container>
    </main>
  );
}
