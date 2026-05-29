/**
 * Markdown-to-HTML renderer with proper support for:
 * - Blockquotes (nested, multi-paragraph)
 * - Thematic breaks / delineations (---, ***, ___)
 * - Headings (h1-h6)
 * - Fenced code blocks (```)
 * - Ordered and unordered lists
 * - Inline formatting (bold, italic, code, links, images, strikethrough)
 * - Paragraphs
 *
 * Block-level parsing follows CommonMark priority:
 *   1. Fenced code blocks
 *   2. Headings
 *   3. Thematic breaks
 *   4. Blockquotes
 *   5. Lists
 *   6. Paragraphs (fallback)
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderInline(text: string): string {
  let html = escapeHtml(text);

  // Images: ![alt](src)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:6px;margin:8px 0" />');

  // Links: [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#58a6ff;text-decoration:underline">$1</a>');

  // Bold: **text** or __text__
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/(?<!\w)_(.+?)_(?!\w)/g, '<em>$1</em>');

  // Strikethrough: ~~text~~
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Inline code: `text`
  html = html.replace(/`(.+?)`/g, '<code style="background:#1c2128;color:#e6edf3;padding:2px 6px;border-radius:4px;font-size:0.85em;font-family:monospace">$1</code>');

  return html;
}

/**
 * Parse and render a blockquote section starting at the given line index.
 * Handles nested > markers and multi-paragraph blockquotes.
 * Returns [rendered HTML, next line index after blockquote].
 */
function parseBlockquote(lines: string[], startIdx: number): [string, number] {
  const contentLines: string[] = [];
  let i = startIdx;

  while (i < lines.length) {
    const line = lines[i];
    // A blockquote line starts with > (optionally followed by a space)
    // Empty lines can be part of a blockquote if followed by another > line
    if (/^>\s?/.test(line)) {
      contentLines.push(line.replace(/^>\s?/, ''));
      i++;
    } else if (line.trim() === '') {
      // Check if the next non-empty line continues the blockquote
      let peek = i + 1;
      while (peek < lines.length && lines[peek].trim() === '') peek++;
      if (peek < lines.length && /^>\s?/.test(lines[peek])) {
        // Empty line is part of the blockquote (paragraph break)
        contentLines.push('');
        i++;
      } else {
        // Blockquote has ended
        break;
      }
    } else {
      // Non-blockquote line — blockquote has ended
      break;
    }
  }

  // Recursively render the inner content (supports nested blockquotes)
  const innerHtml = renderMarkdownLines(contentLines);
  return [`<blockquote>${innerHtml}</blockquote>`, i];
}

/**
 * Parse and render a list section starting at the given line index.
 * Handles both ordered and unordered lists.
 * Returns [rendered HTML, next line index after list].
 */
function parseList(lines: string[], startIdx: number): [string, number] {
  const isOrdered = /^\d+\.\s/.test(lines[startIdx]);
  const items: string[] = [];
  let i = startIdx;

  while (i < lines.length) {
    const line = lines[i];
    if (isOrdered && /^\d+\.\s/.test(line)) {
      items.push(line.replace(/^\d+\.\s+/, ''));
      i++;
    } else if (!isOrdered && /^[-*+]\s/.test(line)) {
      items.push(line.replace(/^[-*+]\s+/, ''));
      i++;
    } else {
      break;
    }
  }

  const tag = isOrdered ? 'ol' : 'ul';
  const itemsHtml = items.map(it => `<li>${renderInline(it)}</li>`).join('');
  return [`<${tag}>${itemsHtml}</${tag}>`, i];
}

/**
 * Core rendering function that processes lines with proper block-level priority.
 */
function renderMarkdownLines(lines: string[]): string {
  const html: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ── Fenced code blocks ────────────────────────────────────
    if (line.trimStart().startsWith('```')) {
      const lang = line.trimStart().replace(/^```/, '').trim();
      const codeLines: string[] = [];
      i++; // skip opening fence

      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing fence

      const langAttr = lang ? ` class="language-${escapeHtml(lang)}"` : '';
      html.push(`<pre><code${langAttr}>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
      continue;
    }

    // ── Empty lines ────────────────────────────────────────────
    if (line.trim() === '') {
      i++;
      continue;
    }

    // ── Headings ───────────────────────────────────────────────
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = renderInline(headingMatch[2]);
      html.push(`<h${level}>${text}</h${level}>`);
      i++;
      continue;
    }

    // ── Thematic breaks (delineations) ─────────────────────────
    // Matches: --- or *** or ___ (3+ chars, all same, nothing else on line)
    if (/^[-*_]{3,}\s*$/.test(line.trim()) && !/^\d+\.\s/.test(line)) {
      // Extra check: --- could be a list marker if followed by a number, but
      // the regex above ensures it's 3+ identical chars with nothing else
      html.push('<hr />');
      i++;
      continue;
    }

    // ── Blockquotes ────────────────────────────────────────────
    if (/^>\s?/.test(line)) {
      const [blockquoteHtml, nextIdx] = parseBlockquote(lines, i);
      html.push(blockquoteHtml);
      i = nextIdx;
      continue;
    }

    // ── Unordered lists ────────────────────────────────────────
    if (/^[-*+]\s/.test(line)) {
      const [listHtml, nextIdx] = parseList(lines, i);
      html.push(listHtml);
      i = nextIdx;
      continue;
    }

    // ── Ordered lists ──────────────────────────────────────────
    if (/^\d+\.\s/.test(line)) {
      const [listHtml, nextIdx] = parseList(lines, i);
      html.push(listHtml);
      i = nextIdx;
      continue;
    }

    // ── Paragraphs (fallback) ──────────────────────────────────
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^#{1,6}\s/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^[-*+]\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) &&
      !lines[i].trimStart().startsWith('```') &&
      !/^[-*_]{3,}\s*$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      html.push(`<p>${renderInline(paraLines.join(' '))}</p>`);
    }
  }

  return html.join('\n');
}

/**
 * Public API: Convert a markdown string to styled HTML.
 */
export function renderMarkdown(content: string): string {
  const lines = content.split('\n');
  return renderMarkdownLines(lines);
}