import { marked } from 'marked';
import DOMPurify from 'dompurify';

/**
 * markdownToHtml.ts — High-fidelity markdown-to-HTML converter
 * Uses 'marked' with GFM support and DOMPurify for security.
 */

export function markdownToHtml(markdown: string): string {
  try {
    const rawHtml = marked.parse(markdown, {
      gfm: true,
      breaks: true,
    }) as string;

    // Sanitize to prevent XSS
    return DOMPurify.sanitize(rawHtml, {
      ADD_TAGS: ['details', 'summary'], // Allow collapsible sections
      ADD_ATTR: ['target']
    });
  } catch (err) {
    console.error('[markdownToHtml] error:', err);
    // Sanitize error message to prevent XSS if it contains user input or unexpected HTML
    const safeError = DOMPurify.sanitize((err as Error).message);
    return `<p style="color:#f85149">Error rendering markdown: ${safeError}</p>`;
  }
}
