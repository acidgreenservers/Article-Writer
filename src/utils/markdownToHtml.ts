/**
 * markdownToHtml.ts — Full markdown-to-HTML converter
 *
 * Architecture: Two-pass parser
 *   Pass 1: Block-level parsing (markdownBlocks.ts)
 *           Splits raw markdown into structured Block objects.
 *   Pass 2: Inline parsing (markdownInline.ts)
 *           Converts inline syntax within each block's content.
 *
 * This separation prevents block-level elements from being
 * incorrectly parsed by inline rules (the root cause of the
 * "- $2" header bug and broken list rendering).
 *
 * Security: All text is HTML-escaped before inline parsing.
 * Only explicitly-allowed HTML tags are un-escaped.
 * No raw user HTML is ever injected into the output.
 */

import { parseBlocks } from './markdownBlocks';
import { parseInline } from './markdownInline';

export function markdownToHtml(markdown: string): string {
  console.log('[markdownToHtml] Input length:', markdown.length);

  const blocks = parseBlocks(markdown);
  console.log('[markdownToHtml] Parsed blocks:', blocks.length, blocks.map((b) => b.type));

  const htmlParts: string[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case 'heading': {
        const tag = `h${block.level}`;
        const inlineHtml = parseInline(block.content);
        htmlParts.push(`<${tag} class="md-${tag}">${inlineHtml}</${tag}>`);
        break;
      }

      case 'code': {
        // Code blocks: do NOT parse inline markdown inside them.
        // Content is already escaped by parseInline if needed,
        // but since we skip inline parsing, we must escape manually.
        const escaped = block.content
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
        const langAttr = block.lang ? ` class="language-${block.lang}"` : '';
        htmlParts.push(`<pre class="md-pre"><code${langAttr}>${escaped}</code></pre>`);
        break;
      }

      case 'blockquote': {
        // Recursively parse block content for nested structures
        const inner = markdownToHtml(block.content);
        htmlParts.push(`<blockquote class="md-blockquote">${inner}</blockquote>`);
        break;
      }

      case 'ul': {
        const items = block.content.split('\n');
        const lis = items.map((item) => `<li class="md-li">${parseInline(item)}</li>`).join('');
        htmlParts.push(`<ul class="md-ul">${lis}</ul>`);
        break;
      }

      case 'ol': {
        const items = block.content.split('\n');
        const lis = items.map((item) => `<li class="md-li">${parseInline(item)}</li>`).join('');
        htmlParts.push(`<ol class="md-ol">${lis}</ol>`);
        break;
      }

      case 'paragraph': {
        const inlineHtml = parseInline(block.content);
        htmlParts.push(`<p class="md-p">${inlineHtml}</p>`);
        break;
      }

      default: {
        console.warn('[markdownToHtml] Unknown block type:', (block as any).type);
        const inlineHtml = parseInline(block.content);
        htmlParts.push(`<p class="md-p">${inlineHtml}</p>`);
      }
    }
  }

  const result = htmlParts.join('\n');
  console.log('[markdownToHtml] Output length:', result.length);
  return result;
}