import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/shell/section";
import { PageHero } from "@/components/shell/page-hero";
import { CouponGridWithFilters } from "@/components/coupons/coupon-grid-with-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { getActiveCouponsPaginated } from "@/lib/queries/categories";
import { getPreferredCountry } from "@/lib/utils/country";

// Country preference is cookie-driven, so this page renders dynamically per request.
export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://couponawy.com";

export const metadata: Metadata = {
  title: "جميع الكوبونات",
  description:
    "تصفّح جميع كوبونات الخصم المجرّبة والمحدّثة يومياً من أفضل المتاجر السعودية على كوبوناوي.",
  alternates: {
    canonical: `${BASE_URL}/coupons`,
  },
};

const PER_PAGE = 24;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function CouponsPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const countryCode = await getPreferredCountry();
  const { coupons, total } = await getActiveCouponsPaginated(page, PER_PAGE, countryCode);
  const totalPages = Math.ceil(total / PER_PAGE);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "الكوبونات", item: `${BASE_URL}/coupons` },
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
          { label: "الكوبونات" },
        ]}
        title="جميع الكوبونات"
        subtitle={`${total.toLocaleString("ar-EG")} كوبون · مجرّبة ومحدّثة يومياً`}
      />

      <Section spacing="lg">
        {coupons.length === 0 ? (
          <EmptyState
            message="لا توجد كوبونات نشطة حالياً."
            cta={{ href: "/stores", label: "تصفّح المتاجر" }}
          />
        ) : (
          <CouponGridWithFilters coupons={coupons} />
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            {page > 1 && (
              <Button asChild variant="primary" size="sm">
                <Link href={`/coupons?page=${page - 1}`}>السابق</Link>
              </Button>
            )}
            <span className="font-body text-warm-brown text-sm">
              صفحة {page.toLocaleString("ar-EG")} من{" "}
              {totalPages.toLocaleString("ar-EG")}
            </span>
            {page < totalPages && (
              <Button asChild variant="primary" size="sm">
                <Link href={`/coupons?page=${page + 1}`}>التالي</Link>
              </Button>
            )}
          </div>
        )}
      </Section>
    </main>
  );
}
