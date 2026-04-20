import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { StoreGrid } from "@/components/stores/store-grid";
import { getActiveStores } from "@/lib/queries/detail";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "جميع المتاجر | كوبوناوي",
  description:
    "تصفّح جميع المتاجر السعودية على كوبوناوي واحصل على أحدث كوبونات الخصم المجرّبة.",
};

export default async function StoresPage() {
  const stores = await getActiveStores();

  return (
    <main className="flex flex-1 flex-col">
      <section className="from-cream-dark/60 to-cream border-brand-gold/20 border-b bg-gradient-to-b">
        <Container size="xl" className="py-10 md:py-14">
          <nav
            aria-label="مسار التنقّل"
            className="text-warm-brown-light font-accent mb-4 flex items-center gap-2 text-xs"
          >
            <Link href="/" className="hover:text-brand-green">
              الرئيسية
            </Link>
            <span>›</span>
            <span className="text-charcoal">المتاجر</span>
          </nav>
          <h1 className="font-display text-charcoal text-3xl font-extrabold md:text-4xl">
            جميع المتاجر
          </h1>
          <p className="font-body text-warm-brown mt-2 text-base">
            {stores.length} متجر · كوبونات مجرّبة ومحدّثة يومياً
          </p>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container size="xl">
          <StoreGrid stores={stores} />
        </Container>
      </section>
    </main>
  );
}
