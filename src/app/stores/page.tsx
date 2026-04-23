import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { StoreGrid } from "@/components/stores/store-grid";
import { getActiveStoresPaginated } from "@/lib/queries/detail";
import { getPreferredCountry } from "@/lib/utils/country";

// Country preference is cookie-driven, so this page renders dynamically
// per request. Individual store detail pages retain their own ISR.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "جميع المتاجر | كوبوناوي",
  description:
    "تصفّح جميع المتاجر السعودية على كوبوناوي واحصل على أحدث كوبونات الخصم المجرّبة.",
};

const PER_PAGE = 24;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function StoresPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const countryCode = await getPreferredCountry();
  const { stores, total } = await getActiveStoresPaginated(page, PER_PAGE, countryCode);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <main className="flex flex-1 flex-col">
      <section className="from-cream-dark/60 to-cream border-brand-gold/20 border-b bg-gradient-to-b">
        <Container size="xl" className="py-10 md:py-14">
          <nav
            aria-label="مسار التنقّل"
            className="text-warm-brown-light font-accent mb-4 flex items-center gap-2 text-xs"
          >
            <Link href="/" className="hover:text-brand-red">
              الرئيسية
            </Link>
            <span>›</span>
            <span className="text-charcoal">المتاجر</span>
          </nav>
          <h1 className="font-display text-charcoal text-3xl font-extrabold md:text-4xl">
            جميع المتاجر
          </h1>
          <p className="font-body text-warm-brown mt-2 text-base">
            {total.toLocaleString("ar-EG")} متجر · كوبونات مجرّبة ومحدّثة يومياً
          </p>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container size="xl">
          <StoreGrid stores={stores} />

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              {page > 1 && (
                <Link
                  href={`/stores?page=${page - 1}`}
                  className="font-body bg-white border border-charcoal/10 text-charcoal hover:border-brand-red hover:text-brand-red rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  السابق
                </Link>
              )}
              <span className="font-body text-warm-brown text-sm">
                صفحة {page.toLocaleString("ar-EG")} من {totalPages.toLocaleString("ar-EG")}
              </span>
              {page < totalPages && (
                <Link
                  href={`/stores?page=${page + 1}`}
                  className="font-body bg-white border border-charcoal/10 text-charcoal hover:border-brand-red hover:text-brand-red rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  التالي
                </Link>
              )}
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
