import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://couponawy.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /admin/ + /auth/ keep crawlers out of authenticated UX.
        // /api/ avoids wasted crawl budget on JSON endpoints.
        // /*?utm_* + /*?fbclid + /search?q= block tracker/parameter URLs
        //   that would otherwise generate duplicate-content URLs in Google's
        //   index for every campaign and visitor session.
        disallow: [
          "/admin/",
          "/auth/",
          "/api/",
          "/*?utm_*",
          "/*?fbclid=*",
          "/*?gclid=*",
          "/search?q=",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    // `host` removed — non-standard directive that Google ignores. Bing
    // recommends it but the canonical link element in <head> serves the
    // same purpose for them too.
  };
}
