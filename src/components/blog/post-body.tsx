import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { TocItem } from "@/lib/content/toc";

type Props = {
  body: string;
  className?: string;
  /**
   * Heading list from `extractToc(body)`. When provided, h2/h3 renderers emit
   * matching `id` anchors so the <ArticleTOC> links resolve. The list is in
   * document order, so we walk it with a per-render cursor that advances on
   * every h2/h3 — keeping IDs in lock-step with what extractToc produced.
   */
  headings?: TocItem[];
};

/**
 * Renders article body markdown with brand typography. Uses remark-gfm for
 * tables / strikethrough / task-lists which Arabic shopping guides commonly use.
 *
 * Why pass through ReactMarkdown instead of a `prose` Tailwind class:
 *   - Tailwind's @tailwindcss/typography plugin isn't installed and `prose-*`
 *     classes won't work in Tailwind v4 without it.
 *   - ReactMarkdown lets us bind each tag to brand-specific classes precisely
 *     (text colors, spacing, RTL list markers, etc.) without a plugin.
 */
export function PostBody({ body, className, headings }: Props) {
  // Per-render cursor over the document-ordered heading list. Both the h2 and
  // h3 renderers close over it and advance it as ReactMarkdown reconciles the
  // tree top-to-bottom, so heading N gets headings[N].id. scroll-mt offsets the
  // anchor jump so the sticky header doesn't cover the heading.
  let headingCursor = 0;
  const nextHeadingId = (): string | undefined => {
    const id = headings?.[headingCursor]?.id;
    headingCursor += 1;
    return id;
  };

  return (
    <div
      className={`font-body text-warm-brown space-y-5 text-base leading-relaxed md:text-lg ${className ?? ""}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <h2
              id={nextHeadingId()}
              className="font-display text-headline-md text-charcoal mt-10 mb-3 scroll-mt-28 font-extrabold"
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              id={nextHeadingId()}
              className="font-display text-headline-sm text-charcoal mt-8 mb-2 scroll-mt-28 font-bold"
            >
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-brand-red hover:text-brand-red-dark font-semibold underline-offset-2 hover:underline"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            // RTL: list-disc renders bullet on the right because dir=rtl on <html>;
            // list-inside keeps markers from getting clipped at narrow widths.
            <ul className="list-disc list-inside space-y-2 pr-4">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2 pr-4">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pr-1">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-brand-red bg-cream-dark/30 text-charcoal my-4 rounded-r-2xl border-r-4 px-5 py-3 italic">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="text-charcoal font-bold">{children}</strong>
          ),
          code: ({ children }) => (
            <code className="bg-cream-dark text-brand-red-dark rounded px-1.5 py-0.5 text-sm">
              {children}
            </code>
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto">
              <table className="border-brand-gold/30 w-full border-collapse rounded-2xl border text-sm">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-brand-gold/30 bg-cream-dark/40 font-display text-charcoal border p-3 text-right font-bold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-brand-gold/30 border p-3 text-right">
              {children}
            </td>
          ),
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}
