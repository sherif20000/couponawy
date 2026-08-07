import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/utils/site";
import {
  getAllStoreSlugsBuildTime,
  getAllCouponSlugsBuildTime,
} from "@/lib/queries/detail";
import { getAllCategorySlugsBuildTime } from "@/lib/queries/categories";
import {
  getAllArticleSlugsBuildTime,
  getAllGuideSlugsBuildTime,
} from "@/lib/queries/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [storeSlugs, couponSlugs, categorySlugs, articleSlugs, guideSlugs] =
    await Promise.all([
      getAllStoreSlugsBuildTime(),
      getAllCouponSlugsBuildTime(),
      getAllCategorySlugsBuildTime(),
      getAllArticleSlugsBuildTime(),
      getAllGuideSlugsBuildTime(),
    ]);

  const now = new Date();

  // Helper — converts `updated_at` strings to Date, falling back to "now" when
  // a row was never touched (shouldn't happen, but defensive). `changeFrequency`
  // dropped from "hourly" (Google effectively caps it at "daily") to "daily".
  const toDate = (s: string | null) => (s ? new Date(s) : now);

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/stores`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/coupons`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/categories`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/guides`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/tools`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/tools/discount-calculator`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/tools/savings-calculator`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/exclusive`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/deals/today`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/how-it-works`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/report-coupon`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    // /careers removed — page is being trimmed in this cleanup pass
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Detail pages now carry per-row lastModified so Google can tell when an
  // individual store/coupon/category/article/guide changed, rather than seeing
  // every URL bumped on every sitemap regeneration.
  const storeRoutes: MetadataRoute.Sitemap = storeSlugs.map(
    ({ slug, updated_at }) => ({
      url: `${BASE_URL}/stores/${slug}`,
      lastModified: toDate(updated_at),
      changeFrequency: "daily" as const,
      priority: 0.8,
    }),
  );

  const couponRoutes: MetadataRoute.Sitemap = couponSlugs.map(
    ({ slug, updated_at }) => ({
      url: `${BASE_URL}/coupons/${slug}`,
      lastModified: toDate(updated_at),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }),
  );

  const categoryRoutes: MetadataRoute.Sitemap = categorySlugs.map(
    ({ slug, updated_at }) => ({
      url: `${BASE_URL}/categories/${slug}`,
      lastModified: toDate(updated_at),
      changeFrequency: "daily" as const,
      priority: 0.6,
    }),
  );

  const articleRoutes: MetadataRoute.Sitemap = articleSlugs.map(
    ({ slug, updated_at }) => ({
      url: `${BASE_URL}/blog/${slug}`,
      lastModified: toDate(updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }),
  );

  const guideRoutes: MetadataRoute.Sitemap = guideSlugs.map(
    ({ slug, updated_at }) => ({
      url: `${BASE_URL}/guides/${slug}`,
      lastModified: toDate(updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }),
  );

  return [
    ...staticRoutes,
    ...storeRoutes,
    ...couponRoutes,
    ...categoryRoutes,
    ...articleRoutes,
    ...guideRoutes,
  ];
}
