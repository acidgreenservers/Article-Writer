import { marked } from 'marked';

/**
 * markdownToHtml.ts — High-fidelity markdown-to-HTML converter
 * Uses 'marked' with GFM support for tables, blockquotes, and complex structures.
 */

export function markdownToHtml(markdown: string): string {
  try {
    return marked.parse(markdown, {
      gfm: true,
      breaks: true,
    }) as string;
  } catch (err) {
    console.error('[markdownToHtml] error:', err);
    return `<p style="color:#f85149">Error rendering markdown: ${(err as Error).message}</p>`;
  }
}
