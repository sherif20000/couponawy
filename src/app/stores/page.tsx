import Link from "next/link";
import type { Metadata } from "next";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/shell/section";
import { PageHero } from "@/components/shell/page-hero";
import { StoreGrid } from "@/components/stores/store-grid";
import { getActiveStoresPaginated } from "@/lib/queries/detail";
import { getPreferredCountry } from "@/lib/utils/country";
import { toArabicNumerals, pluralizeStore } from "@/lib/utils";

// Country preference is cookie-driven, so this page renders dynamically
// per request. Individual store detail pages retain their own ISR.
export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://couponawy.com";

export const metadata: Metadata = {
  title: "جميع المتاجر",
  description:
    "تصفّح جميع المتاجر السعودية على كوبوناوي واحصل على أحدث كوبونات الخصم المجرّبة.",
  alternates: {
    canonical: `${BASE_URL}/stores`,
  },
};

const PER_PAGE = 24;

interface Props {
  searchParams: Promise<{ page?: string; q?: string }>;
}

export default async function StoresPage({ searchParams }: Props) {
  const { page: pageParam, q: qParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const q = qParam?.trim() ?? "";

  const countryCode = await getPreferredCountry();
  const { stores, total } = await getActiveStoresPaginated(
    page,
    PER_PAGE,
    countryCode,
    q || undefined
  );
  const totalPages = Math.ceil(total / PER_PAGE);
  // Preserve search term across pagination so users don't lose their query on next/prev
  const qSuffix = q ? `&q=${encodeURIComponent(q)}` : "";

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "المتاجر", item: `${BASE_URL}/stores` },
    ],
  };

  return (
    <main className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PageHero
        variant="subtle"
        breadcrumbs={[
          { href: "/", label: "الرئيسية" },
          { label: "المتاجر" },
        ]}
        title="جميع المتاجر"
        subtitle={`${toArabicNumerals(total)} ${pluralizeStore(total)} · كوبونات مجرّبة ومحدّثة يومياً`}
      >
        {/* Directory search lives inside the hero — the page reads as searchable,
            not just as a static list dump. */}
        <form
          action="/stores"
          method="get"
          role="search"
          className="flex w-full items-center gap-2 pt-2 md:max-w-md"
        >
          <div className="relative w-full">
            <Search
              className="text-warm-brown-light pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2"
              aria-hidden
            />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="ابحث عن متجر..."
              aria-label="ابحث عن متجر"
              className="border-brand-gold/30 font-body text-charcoal placeholder:text-warm-brown-light focus:border-brand-gold focus:ring-brand-gold/30 w-full rounded-xl border bg-white py-3 pr-11 pl-4 transition-all focus:outline-none focus:ring-2"
            />
          </div>
          {q.length > 0 && (
            <Link
              href="/stores"
              className="font-accent text-white/80 hover:text-white inline-flex items-center gap-1 text-sm transition-colors"
              aria-label="مسح البحث"
            >
              <X className="h-4 w-4" aria-hidden />
              مسح
            </Link>
          )}
        </form>
      </PageHero>

      <Section spacing="md">
        <StoreGrid stores={stores} query={q} total={total} />

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            {page > 1 && (
              <Button asChild variant="primary" size="sm">
                <Link href={`/stores?page=${page - 1}${qSuffix}`}>
                  السابق
                </Link>
              </Button>
            )}
            <span className="font-body text-warm-brown text-sm">
              صفحة {toArabicNumerals(page)} من {toArabicNumerals(totalPages)}
            </span>
            {page < totalPages && (
              <Button asChild variant="primary" size="sm">
                <Link href={`/stores?page=${page + 1}${qSuffix}`}>التالي</Link>
              </Button>
            )}
          </div>
        )}
      </Section>
    </main>
  );
}
