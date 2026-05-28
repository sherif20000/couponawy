import { List } from "lucide-react";
import type { TocItem } from "@/lib/content/toc";

type Props = {
  items: TocItem[];
  /** Heading shown above the list. */
  title?: string;
  className?: string;
};

/**
 * The shared link list — reused by both the mobile (collapsible) and desktop
 * (sticky) renderings so the markup stays in one place. Level-3 items indent
 * under their level-2 parent for a sense of structure.
 */
function TocList({ items }: { items: TocItem[] }) {
  return (
    <ol className="font-body flex flex-col gap-1.5 text-sm">
      {items.map((item) => (
        <li key={item.id} className={item.level === 3 ? "ps-4" : ""}>
          <a
            href={`#${item.id}`}
            className="text-warm-brown hover:text-brand-red block border-r-2 border-transparent py-0.5 pe-2 leading-snug transition-colors hover:border-brand-red"
          >
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

/**
 * Table of contents for long-form article bodies. Pure server component, no JS:
 *   - Mobile: a collapsible <details> card rendered above the article.
 *   - Desktop (lg+): a sticky sidebar that stays in view while scrolling.
 *
 * Both render the same anchor list; the headings carry matching `id`s emitted by
 * <PostBody> from the same extractToc() output. Renders nothing for short pages
 * (< 3 headings) where a TOC adds noise rather than value.
 */
export function ArticleToc({ items, title = "محتويات الموضوع", className }: Props) {
  if (items.length < 3) return null;

  return (
    <>
      {/* Mobile / tablet — collapsible disclosure above the article */}
      <details
        className={`border-brand-gold/30 bg-cream-dark/20 group mb-8 rounded-2xl border p-4 lg:hidden ${className ?? ""}`}
      >
        <summary className="font-display text-charcoal flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold">
          <span className="inline-flex items-center gap-2">
            <List className="text-brand-red h-4 w-4" aria-hidden />
            {title}
          </span>
          <span
            aria-hidden
            className="text-brand-red transition-transform duration-200 group-open:rotate-45"
          >
            +
          </span>
        </summary>
        <nav aria-label={title} className="mt-3">
          <TocList items={items} />
        </nav>
      </details>

      {/* Desktop — sticky sidebar. max-h + overflow so very long TOCs scroll
          independently instead of running off the viewport. */}
      <nav
        aria-label={title}
        className={`sticky top-24 hidden max-h-[calc(100vh-8rem)] overflow-y-auto lg:block ${className ?? ""}`}
      >
        <p className="font-display text-charcoal mb-3 inline-flex items-center gap-2 text-sm font-bold">
          <List className="text-brand-red h-4 w-4" aria-hidden />
          {title}
        </p>
        <TocList items={items} />
      </nav>
    </>
  );
}
