export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * Minimal slug generator compatible with github-slugger / rehype-slug output.
 * Inlined to avoid ESM-only github-slugger package causing webpack SSR failures.
 */
function createSlugger() {
  const occurrences = new Map<string, number>();
  return {
    slug(value: string): string {
      let s = value
        .toLowerCase()
        .trim()
        .replace(/<[^>]*>/g, "")
        .replace(
          /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g,
          "",
        )
        .replace(/\s/g, "-");

      const count = occurrences.get(s) ?? 0;
      occurrences.set(s, count + 1);
      if (count > 0) s += `-${count}`;
      return s;
    },
  };
}

/**
 * Extract h2/h3 headings from raw markdown content for Table of Contents.
 */
export function extractTocHeadings(markdown: string): TocItem[] {
  const slugger = createSlugger();
  const items: TocItem[] = [];
  const lines = markdown.split("\n");
  let inCodeBlock = false;

  for (const line of lines) {
    // Track fenced code blocks
    if (line.trimStart().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (!match) continue;

    const level = match[1].length as 2 | 3;
    // Strip inline markdown formatting (bold, italic, code, links)
    const text = match[2]
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/`(.+?)`/g, "$1")
      .replace(/\[(.+?)\]\(.+?\)/g, "$1")
      .trim();

    items.push({
      id: slugger.slug(text),
      text,
      level,
    });
  }

  return items;
}
