/**
 * markdownBlocks.ts — Block-level markdown parser
 *
 * Converts raw markdown into an array of Block objects.
 * Each block has a `type` and `content` (raw inner text, not yet inline-parsed).
 *
 * Supported block types:
 *   heading    — # H1, ## H2, ### H3, #### H4, ##### H5, ###### H6
 *   code       — fenced ``` blocks with optional language tag
 *   blockquote — > lines (consecutive > lines are merged)
 *   ul         — unordered list (-, *, +)
 *   ol         — ordered list (1. 2. 3.)
 *   paragraph  — anything else
 */

export type BlockType = 'heading' | 'code' | 'blockquote' | 'ul' | 'ol' | 'paragraph';

export interface Block {
  type: BlockType;
  content: string;
  level?: number;   // heading level 1-6
  lang?: string;    // code fence language
}

export function parseBlocks(markdown: string): Block[] {
  const lines = markdown.split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ── Fenced code block ──────────────────────────────────
    if (line.trimStart().startsWith('```')) {
      const lang = line.trimStart().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({ type: 'code', content: codeLines.join('\n'), lang: lang || undefined });
      continue;
    }

    // ── Heading ────────────────────────────────────────────
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({ type: 'heading', content: headingMatch[2], level: headingMatch[1].length });
      i++;
      continue;
    }

    // ── Blockquote ─────────────────────────────────────────
    if (line.match(/^>\s?/)) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].match(/^>\s?/)) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({ type: 'blockquote', content: quoteLines.join('\n') });
      continue;
    }

    // ── Unordered list ─────────────────────────────────────
    if (line.match(/^[\s]*[-*+]\s+/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[\s]*[-*+]\s+/)) {
        items.push(lines[i].replace(/^[\s]*[-*+]\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ul', content: items.join('\n') });
      continue;
    }

    // ── Ordered list ───────────────────────────────────────
    if (line.match(/^[\s]*\d+\.\s+/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[\s]*\d+\.\s+/)) {
        items.push(lines[i].replace(/^[\s]*\d+\.\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ol', content: items.join('\n') });
      continue;
    }

    // ── Empty line ─────────────────────────────────────────
    if (line.trim() === '') {
      i++;
      continue;
    }

    // ── Paragraph ──────────────────────────────────────────
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].match(/^#{1,6}\s+/) &&
      !lines[i].match(/^>\s?/) &&
      !lines[i].match(/^[\s]*[-*+]\s+/) &&
      !lines[i].match(/^[\s]*\d+\.\s+/) &&
      !lines[i].trimStart().startsWith('```')
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push({ type: 'paragraph', content: paraLines.join('\n') });
  }

  return blocks;
}