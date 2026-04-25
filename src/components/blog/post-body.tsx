import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  body: string;
  className?: string;
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
export function PostBody({ body, className }: Props) {
  return (
    <div
      className={`font-body text-warm-brown space-y-5 text-base leading-relaxed md:text-lg ${className ?? ""}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <h2 className="font-display text-charcoal mt-10 mb-3 text-2xl font-extrabold md:text-3xl">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-display text-charcoal mt-8 mb-2 text-xl font-bold md:text-2xl">
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
