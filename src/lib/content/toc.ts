/**
 * Table-of-contents extraction for markdown article bodies (blog, guides,
 * calculator explainers — all rendered by <PostBody>).
 *
 * Dependency-free on purpose: rather than pull in rehype-slug + github-slugger
 * just to add heading IDs, we parse the markdown once here and assign
 * deterministic slugs. <PostBody> then emits matching `id` attributes on its
 * h2/h3 renderers by walking the SAME heading list in document order, so the
 * TOC anchor links always resolve. See post-body.tsx for the positional match.
 *
 * Only `##` and `###` are captured — `#` is the page title (rendered in the
 * hero, not the body) and `####`+ are too granular for a TOC.
 */

export type TocItem = {
  /** Slug used as the heading's DOM id and the anchor href target. */
  id: string;
  /** Display text with markdown inline markers stripped. */
  text: string;
  /** Heading level — 2 (##) or 3 (###). */
  level: 2 | 3;
};

/**
 * Strip markdown inline markers from heading text so the TOC shows clean labels:
 *   **bold** → bold,  *em* → em,  `code` → code,  [label](url) → label.
 */
function cleanHeadingText(raw: string): string {
  return raw
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links → label
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
    .replace(/\*([^*]+)\*/g, "$1") // italic
    .replace(/__([^_]+)__/g, "$1") // bold (underscore)
    .replace(/_([^_]+)_/g, "$1") // italic (underscore)
    .replace(/#+\s*$/, "") // trailing ATX closers
    .trim();
}

/**
 * Slugify a heading into a URL-safe, RTL-safe id. Keeps Arabic letters and
 * Arabic-Indic digits (some bodies use ٤١٧ etc.), lowercases Latin, turns
 * whitespace into hyphens, and drops punctuation. Mirrors github-slugger's
 * essential behavior closely enough for in-page anchors.
 */
function slugifyHeading(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      // Remove anything that isn't a letter (any script), a digit (any script),
      // whitespace, or hyphen. \p{L}/\p{N} require the /u flag.
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
  );
}

/**
 * Parse `##`/`###` headings out of a markdown string in document order,
 * assigning deduplicated slugs (repeat slugs get `-1`, `-2`, … like GitHub).
 *
 * Skips headings inside fenced code blocks (``` … ```), and ignores lines that
 * are blockquoted headings (`> ##`) — both so the IDs stay in lock-step with
 * what ReactMarkdown actually renders as a top-level <h2>/<h3>.
 */
export function extractToc(markdown: string): TocItem[] {
  if (!markdown) return [];

  const lines = markdown.split("\n");
  const items: TocItem[] = [];
  const seen = new Map<string, number>();
  let inFence = false;

  for (const line of lines) {
    // Toggle fenced code-block state on ``` or ~~~ fences.
    if (/^\s{0,3}(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    // Up to 3 leading spaces, then exactly ## or ### (not ####), then a space.
    const match = /^\s{0,3}(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!match) continue;

    const level = match[1].length as 2 | 3;
    const text = cleanHeadingText(match[2]);
    if (!text) continue;

    let id = slugifyHeading(text);
    if (!id) id = `section-${items.length + 1}`; // pure-punctuation fallback

    // Deduplicate identical slugs.
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count}`;

    items.push({ id, text, level });
  }

  return items;
}
