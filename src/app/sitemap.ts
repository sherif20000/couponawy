import type { MetadataRoute } from "next";
import {
  getAllStoreSlugsBuildTime,
  getAllCouponSlugsBuildTime,
} from "@/lib/queries/detail";
import { getAllCategorySlugsBuildTime } from "@/lib/queries/categories";
import {
  getAllArticleSlugsBuildTime,
  getAllGuideSlugsBuildTime,
} from "@/lib/queries/posts";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://couponawy.com";

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

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "hourly",
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
      changeFrequency: "hourly",
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
      url: `${BASE_URL}/exclusive`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/deals/today`,
      lastModified: now,
      changeFrequency: "hourly",
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

  // Store detail pages
  const storeRoutes: MetadataRoute.Sitemap = storeSlugs.map(({ slug }) => ({
    url: `${BASE_URL}/stores/${slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // Coupon detail pages
  const couponRoutes: MetadataRoute.Sitemap = couponSlugs.map(({ slug }) => ({
    url: `${BASE_URL}/coupons/${slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // Category detail pages
  const categoryRoutes: MetadataRoute.Sitemap = categorySlugs.map(
    ({ slug }) => ({
      url: `${BASE_URL}/categories/${slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })
  );

  // Blog articles
  const articleRoutes: MetadataRoute.Sitemap = articleSlugs.map(({ slug }) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Buying guides
  const guideRoutes: MetadataRoute.Sitemap = guideSlugs.map(({ slug }) => ({
    url: `${BASE_URL}/guides/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...storeRoutes,
    ...couponRoutes,
    ...categoryRoutes,
    ...articleRoutes,
    ...guideRoutes,
  ];
}
