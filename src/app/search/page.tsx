import Link from "next/link";
import type { Metadata } from "next";
import { Search, ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";
import { CouponCard } from "@/components/coupons/coupon-card";
import { StoreCard } from "@/components/stores/store-card";
import { searchCoupons, searchStores } from "@/lib/queries/search";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  if (!q) return { title: "البحث | كوبوناوي" };
  return {
    title: `نتائج البحث عن "${q}" | كوبوناوي`,
    description: `نتائج البحث عن ${q} — كوبونات ومتاجر مجرّبة على كوبوناوي.`,
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const [coupons, stores] = query
    ? await Promise.all([searchCoupons(query), searchStores(query)])
    : [[], []];

  const totalResults = coupons.length + stores.length;

  return (
    <main className="flex flex-1 flex-col">
      {/* Header */}
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
            <span className="text-charcoal">البحث</span>
          </nav>

          <div className="flex flex-col gap-2">
            <h1 className="font-display text-charcoal text-3xl font-extrabold md:text-4xl">
              {query ? (
                <>
                  نتائج البحث عن{" "}
                  <span className="text-brand-red">&quot;{query}&quot;</span>
                </>
              ) : (
                "البحث"
              )}
            </h1>
            {query && (
              <p className="font-body text-warm-brown text-base">
                {totalResults > 0
                  ? `${totalResults} نتيجة`
                  : "لم نجد نتائج مطابقة"}
              </p>
            )}
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container size="xl">
          {/* Empty query — prompt to search */}
          {!query && (
            <div className="border-brand-gold/30 bg-cream-dark/30 font-body text-warm-brown flex flex-col items-center gap-4 rounded-2xl border border-dashed p-16 text-center">
              <Search className="text-brand-gold-dark h-10 w-10 opacity-40" aria-hidden />
              <p className="text-lg">ابحث عن متجر أو كوبون في الشريط أعلى الصفحة</p>
              <p className="text-warm-brown-light text-sm">
                اضغط <kbd className="font-accent bg-cream rounded border border-brand-gold/30 px-1.5 py-0.5 text-xs">/</kbd> في أي مكان للبحث السريع
              </p>
            </div>
          )}

          {/* No results */}
          {query && totalResults === 0 && (
            <div className="border-brand-gold/30 bg-cream-dark/30 font-body text-warm-brown flex flex-col items-center gap-3 rounded-2xl border border-dashed p-16 text-center">
              <Search className="text-brand-gold-dark h-10 w-10 opacity-40" aria-hidden />
              <p className="text-lg font-semibold">لا توجد نتائج لـ &quot;{query}&quot;</p>
              <p className="text-warm-brown-light text-sm">جرّب كلمة مختلفة أو تصفّح المتاجر والأقسام</p>
              <div className="mt-2 flex gap-3">
                <Link
                  href="/stores"
                  className="font-body text-brand-red hover:text-brand-red-dark inline-flex items-center gap-1 text-sm font-semibold"
                >
                  المتاجر
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                </Link>
                <Link
                  href="/coupons"
                  className="font-body text-brand-red hover:text-brand-red-dark inline-flex items-center gap-1 text-sm font-semibold"
                >
                  جميع الكوبونات
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                </Link>
                <Link
                  href="/categories"
                  className="font-body text-brand-red hover:text-brand-red-dark inline-flex items-center gap-1 text-sm font-semibold"
                >
                  التصنيفات
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
            </div>
          )}

          {/* Results */}
          {query && totalResults > 0 && (
            <div className="flex flex-col gap-14">
              {/* Stores section */}
              {stores.length > 0 && (
                <div>
                  <h2 className="font-display text-charcoal mb-6 text-xl font-extrabold md:text-2xl">
                    متاجر
                    <span className="font-body text-warm-brown-light mr-2 text-sm font-normal">
                      ({stores.length})
                    </span>
                  </h2>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {stores.map((store) => (
                      <StoreCard key={store.id} store={store} />
                    ))}
                  </div>
                </div>
              )}

              {/* Coupons section */}
              {coupons.length > 0 && (
                <div>
                  <h2 className="font-display text-charcoal mb-6 text-xl font-extrabold md:text-2xl">
                    كوبونات
                    <span className="font-body text-warm-brown-light mr-2 text-sm font-normal">
                      ({coupons.length})
                    </span>
                  </h2>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {coupons.map((coupon) => (
                      <CouponCard key={coupon.id} coupon={coupon} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
