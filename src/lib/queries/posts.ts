import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type Article = Database["public"]["Tables"]["articles"]["Row"];
export type BuyingGuide = Database["public"]["Tables"]["buying_guides"]["Row"];

// Articles list view — slimmed-down shape for grids/cards (excludes the heavy body_ar field).
export type ArticleListItem = Pick<
  Article,
  | "id"
  | "slug"
  | "title_ar"
  | "excerpt_ar"
  | "featured_image_url"
  | "author_name"
  | "category_id"
  | "tags"
  | "published_at"
  | "read_time_minutes"
>;

export type GuideListItem = Pick<
  BuyingGuide,
  | "id"
  | "slug"
  | "title_ar"
  | "excerpt_ar"
  | "featured_image_url"
  | "category_id"
  | "published_at"
>;

// ─── Articles (blog) ──────────────────────────────────────────────────────────

const ARTICLE_LIST_FIELDS =
  "id, slug, title_ar, excerpt_ar, featured_image_url, author_name, category_id, tags, published_at, read_time_minutes";

/**
 * Returns published articles, newest-first. Used by /blog listing page.
 * RLS already filters to status='published' AND published_at<=now() — we
 * still add the same filter explicitly so the query is self-documenting.
 */
export async function getPublishedArticles(
  limit = 24
): Promise<ArticleListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_LIST_FIELDS)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[getPublishedArticles]", error);
    return [];
  }
  return data ?? [];
}

/**
 * Returns a single published article by slug, or null when missing/unpublished.
 * Used by /blog/[slug] page.
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();
  if (error) {
    console.error("[getArticleBySlug]", error);
    return null;
  }
  return data;
}

/**
 * Returns up to {limit} other published articles, excluding the current one.
 * Prefers articles with overlapping tags; falls back to recency.
 */
export async function getRelatedArticles(
  excludeId: string,
  tags: string[] | null,
  limit = 3
): Promise<ArticleListItem[]> {
  const supabase = await createClient();

  // First try tag-overlap match if we have tags.
  if (tags && tags.length > 0) {
    const { data, error } = await supabase
      .from("articles")
      .select(ARTICLE_LIST_FIELDS)
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .neq("id", excludeId)
      .overlaps("tags", tags)
      .order("published_at", { ascending: false })
      .limit(limit);
    if (!error && data && data.length > 0) return data;
  }

  // Fallback to most-recent published.
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_LIST_FIELDS)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .neq("id", excludeId)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[getRelatedArticles] fallback", error);
    return [];
  }
  return data ?? [];
}

/**
 * Build-time helper used by generateStaticParams() in /blog/[slug].
 * Uses the admin client because static params have no request/cookie context.
 */
export async function getAllArticleSlugsBuildTime(): Promise<{ slug: string }[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("articles")
    .select("slug")
    .eq("status", "published");
  if (error) {
    console.error("[getAllArticleSlugsBuildTime]", error);
    return [];
  }
  return data ?? [];
}

// ─── Buying guides ───────────────────────────────────────────────────────────

const GUIDE_LIST_FIELDS =
  "id, slug, title_ar, excerpt_ar, featured_image_url, category_id, published_at";

export async function getPublishedGuides(limit = 24): Promise<GuideListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("buying_guides")
    .select(GUIDE_LIST_FIELDS)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[getPublishedGuides]", error);
    return [];
  }
  return data ?? [];
}

export async function getGuideBySlug(slug: string): Promise<BuyingGuide | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("buying_guides")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) {
    console.error("[getGuideBySlug]", error);
    return null;
  }
  return data;
}

export async function getAllGuideSlugsBuildTime(): Promise<{ slug: string }[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("buying_guides")
    .select("slug")
    .eq("status", "published");
  if (error) {
    console.error("[getAllGuideSlugsBuildTime]", error);
    return [];
  }
  return data ?? [];
}
