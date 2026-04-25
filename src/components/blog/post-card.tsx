import Link from "next/link";
import { Clock, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn, toArabicNumerals } from "@/lib/utils";
import type { ArticleListItem, GuideListItem } from "@/lib/queries/posts";

type PostCardProps = {
  /** Either an article or a guide — both share the same card UI */
  post: ArticleListItem | GuideListItem;
  /** URL prefix — "/blog" for articles, "/guides" for guides */
  basePath: "/blog" | "/guides";
  /** Optional eyebrow tag rendered above the title (e.g. "دليل" / "نصيحة") */
  tag?: string;
  className?: string;
};

// Formats an ISO timestamp as "12 أبريل 2026" in Arabic SA locale.
function formatPublishedDate(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("ar-SA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

function isArticle(p: ArticleListItem | GuideListItem): p is ArticleListItem {
  return "read_time_minutes" in p;
}

/**
 * Card that presents a blog post or buying guide. Hand-picked illustration covers
 * + colored bands; uses the post's featured_image_url when present, falls back to
 * a category-tinted gradient + emoji marker so empty states still look intentional.
 */
export function PostCard({ post, basePath, tag, className }: PostCardProps) {
  const href = `${basePath}/${post.slug}`;
  const readingMins = isArticle(post) ? post.read_time_minutes : null;
  // Pseudo-random but stable hue derived from slug — guarantees the same color
  // across renders for a given post, but variety across the grid.
  const hue =
    [...post.slug].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 360;

  return (
    <Card
      className={cn(
        "group flex h-full flex-col overflow-hidden hover:-translate-y-0.5 hover:shadow-lg",
        className
      )}
    >
      <Link href={href} className="flex flex-1 flex-col">
        {/* Cover */}
        {post.featured_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.featured_image_url}
            alt={post.title_ar}
            className="aspect-[16/10] w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="aspect-[16/10] w-full"
            style={{
              background: `linear-gradient(135deg, oklch(60% 0.18 ${hue}) 0%, oklch(35% 0.20 ${hue}) 100%)`,
            }}
            aria-hidden
          />
        )}

        <div className="flex flex-1 flex-col gap-3 p-5">
          {tag && (
            <span className="font-accent bg-brand-red/10 text-brand-red w-fit rounded-full px-2.5 py-0.5 text-xs font-bold">
              {tag}
            </span>
          )}

          <h3 className="font-display text-charcoal group-hover:text-brand-red line-clamp-2 text-lg font-bold leading-tight transition-colors">
            {post.title_ar}
          </h3>

          {post.excerpt_ar && (
            <p className="font-body text-warm-brown line-clamp-3 text-sm leading-relaxed">
              {post.excerpt_ar}
            </p>
          )}

          <div className="font-accent text-warm-brown-light mt-auto flex flex-wrap items-center gap-4 pt-2 text-xs">
            {post.published_at && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" aria-hidden />
                {formatPublishedDate(post.published_at)}
              </span>
            )}
            {readingMins != null && readingMins > 0 && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden />
                {toArabicNumerals(readingMins)} دقائق قراءة
              </span>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
}
