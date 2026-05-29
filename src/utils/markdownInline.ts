/**
 * markdownInline.ts — Inline markdown parser
 *
 * Converts inline markdown syntax into safe HTML.
 * Order matters: code spans must be parsed first (to protect their content),
 * then images, then links, then emphasis, then HTML tags.
 *
 * All text is HTML-escaped first, then markdown syntax is selectively converted.
 */

/** Escape the 5 HTML-significant characters */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Parse inline markdown and return safe HTML.
 * 
 * Strategy: escape everything first, then selectively un-escape
 * the parts that are valid markdown syntax.
 */
export function parseInline(text: string): string {
  // Step 0: Escape all HTML
  let html = escapeHtml(text);

  // Step 1: Inline code — `code` and ``code``
  // Must come first so content inside backticks is not further processed.
  // We use a placeholder to protect code content from later rules.
  const codeSpans: string[] = [];
  html = html.replace(/(`+)([\s\S]*?)\1/g, (_match, _delim: string, code: string) => {
    const idx = codeSpans.length;
    codeSpans.push(`<code class="inline-code">${code}</code>`);
    return `\x00CODE${idx}\x00`;
  });

  // Step 2: Images — ![alt](src)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt: string, src: string) => {
    return `<img src="${src}" alt="${alt}" class="md-img" />`;
  });

  // Step 3: Links — [text](href)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, linkText: string, href: string) => {
    return `<a href="${href}" class="md-link" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
  });

  // Step 4: Bold — **text** or __text__
  html = html.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([\s\S]+?)__/g, '<strong>$1</strong>');

  // Step 5: Italic — *text* or _text_
  // Use non-greedy match; avoid matching across word boundaries incorrectly
  html = html.replace(/(?<!\*)\*(?!\*)([\s\S]+?)\*(?!\*)/g, '<em>$1</em>');
  html = html.replace(/(?<!_)_(?!_)([\s\S]+?)_(?!_)/g, '<em>$1</em>');

  // Step 6: Strikethrough — ~~text~~
  html = html.replace(/~~([\s\S]+?)~~/g, '<del>$1</del>');

  // Step 7: Allowed inline HTML tags
  // Since we escaped everything, we need to un-escape our allowed tags.
  // <u>underline</u>
  html = html.replace(/&lt;u&gt;([\s\S]*?)&lt;\/u&gt;/gi, '<u>$1</u>');
  // <br>
  html = html.replace(/&lt;br\s*\/?&gt;/gi, '<br />');
  // <mark>highlight</mark>
  html = html.replace(/&lt;mark&gt;([\s\S]*?)&lt;\/mark&gt;/gi, '<mark class="md-mark">$1</mark>');
  // <sup>superscript</sup>
  html = html.replace(/&lt;sup&gt;([\s\S]*?)&lt;\/sup&gt;/gi, '<sup>$1</sup>');
  // <sub>subscript</sub>
  html = html.replace(/&lt;sub&gt;([\s\S]*?)&lt;\/sub&gt;/gi, '<sub>$1</sub>');
  // <kbd>keyboard</kbd>
  html = html.replace(/&lt;kbd&gt;([\s\S]*?)&lt;\/kbd&gt;/gi, '<kbd class="md-kbd">$1</kbd>');

  // Step 8: Restore protected code spans
  html = html.replace(/\x00CODE(\d+)\x00/g, (_match, idxStr: string) => {
    return codeSpans[parseInt(idxStr, 10)];
  });

  // Step 9: Line breaks — double space at end of line → <br>
  html = html.replace(/  \n/g, '<br />\n');

  return html;
}