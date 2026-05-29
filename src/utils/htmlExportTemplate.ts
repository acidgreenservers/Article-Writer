import type { Document } from '../types';
import type { UploadedImage } from '../types';
import { markdownToHtml } from './markdownToHtml';

function countCharacters(text: string): number {
  return text.length;
}

export function generateHtmlExport(
  doc: Document,
  images: UploadedImage[],
  theme: 'light' | 'dark'
): string {
  const isDark = theme === 'dark';
  const bodyBg = isDark ? '#0d1117' : '#ffffff';
  const textPrimary = isDark ? '#e6edf3' : '#1f2937';
  const textSecondary = isDark ? '#8b949e' : '#6b7280';
  const textMuted = isDark ? '#6e7681' : '#9ca3af';
  const cardBg = isDark ? '#161b22' : '#f9fafb';
  const cardBorder = isDark ? '#30363d' : '#e5e7eb';
  const separatorBg = '#3b82f6';
  const codeBlockBg = isDark ? '#0d1117' : '#f6f8fa';
  const codeBlockBorder = isDark ? '#30363d' : '#d0d7de';
  const inlineCodeBg = isDark ? 'rgba(110,118,129,0.25)' : 'rgba(175,184,193,0.2)';
  const blockquoteBg = isDark ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.04)';
  const blockquoteBorder = '#3b82f6';
  const linkColor = '#58a6ff';
  const markBg = isDark ? 'rgba(210,153,34,0.25)' : '#fff3bf';
  const kbdBg = isDark ? '#21262d' : '#f3f4f6';
  const kbdBorder = isDark ? '#30363d' : '#d1d5db';
  const kbdShadow = isDark ? '#30363d' : '#d1d5db';
  const delColor = isDark ? '#8b949e' : '#6b7280';
  const h6Color = isDark ? '#8b949e' : '#6b7280';
  const headingBorder = isDark ? '#21262d' : '#e5e7eb';
  const metaAccentBg = isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)';
  const footerBg = isDark ? '#0a0e14' : '#f3f4f6';
  const footerBorder = isDark ? '#21262d' : '#e5e7eb';
  const githubBtnBg = '#24292f';
  const githubBtnHover = '#3b82f6';

  const content = doc.content || '';
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = countCharacters(content);

  // Convert --- to blue separator in the HTML
  const processedContent = content.replace(/^---$/gm, '\n<!--SEPARATOR-->\n');
  const renderedBody = markdownToHtml(processedContent);
  const finalBody = renderedBody.replace(/<p class="md-p"><!--SEPARATOR--><\/p>/g, '<div class="separator"></div>');

  const title = doc.title || 'Untitled Document';
  const tags = doc.tags.length > 0 ? doc.tags.join(', ') : 'None';
  const itemCount = images.length;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      background-color: ${bodyBg};
      color: ${textPrimary};
      line-height: 1.7;
      font-size: 16px;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 24px 120px;
    }

    /* ── Article Title ─────────────────────────── */
    .article-title {
      font-size: 2.25em;
      font-weight: 700;
      color: ${textPrimary};
      margin-bottom: 8px;
      line-height: 1.2;
    }

    .article-tags {
      font-size: 0.875em;
      color: ${textMuted};
      margin-bottom: 32px;
    }

    .article-tags span {
      display: inline-block;
      background: ${metaAccentBg};
      color: #3b82f6;
      padding: 2px 10px;
      border-radius: 12px;
      margin-right: 6px;
      font-weight: 500;
    }

    /* ── Blue Separator ────────────────────────── */
    .separator {
      height: 3px;
      background: ${separatorBg};
      border-radius: 2px;
      margin: 2em 0;
      opacity: 0.7;
    }

    /* ── Metadata Dropper Box ───────────────────── */
    .meta-dropper {
      background: ${metaAccentBg};
      border-left: 4px solid #3b82f6;
      border-radius: 0 8px 8px 0;
      padding: 16px 20px;
      margin: 2em 0;
      font-size: 0.875em;
    }

    .meta-dropper .meta-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      border-bottom: 1px solid ${isDark ? 'rgba(48,54,61,0.5)' : 'rgba(0,0,0,0.06)'};
    }

    .meta-dropper .meta-row:last-child {
      border-bottom: none;
    }

    .meta-dropper .meta-label {
      color: ${textSecondary};
      font-weight: 500;
    }

    .meta-dropper .meta-value {
      color: ${textPrimary};
      font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
      font-size: 0.85em;
    }

    /* ── Typography ────────────────────────────── */
    .md-h1 { font-size: 2em; font-weight: 700; margin: 1em 0 0.4em; border-bottom: 1px solid ${headingBorder}; padding-bottom: 0.3em; }
    .md-h2 { font-size: 1.5em; font-weight: 600; margin: 0.9em 0 0.35em; border-bottom: 1px solid ${headingBorder}; padding-bottom: 0.25em; }
    .md-h3 { font-size: 1.25em; font-weight: 600; margin: 0.8em 0 0.3em; }
    .md-h4 { font-size: 1em; font-weight: 600; margin: 0.8em 0 0.3em; }
    .md-h5 { font-size: 0.875em; font-weight: 600; margin: 0.8em 0 0.3em; }
    .md-h6 { font-size: 0.85em; font-weight: 600; margin: 0.8em 0 0.3em; color: ${h6Color}; }

    .md-p { margin: 0.65em 0; }

    .md-ul { list-style: disc; padding-left: 2em; margin: 0.5em 0; }
    .md-ol { list-style: decimal; padding-left: 2em; margin: 0.5em 0; }
    .md-li { margin: 0.3em 0; }

    .md-blockquote {
      border-left: 4px solid ${blockquoteBorder};
      background: ${blockquoteBg};
      padding: 0.6em 1.2em;
      margin: 0.8em 0;
      border-radius: 0 6px 6px 0;
    }

    .md-pre {
      background: ${codeBlockBg};
      border: 1px solid ${codeBlockBorder};
      border-radius: 6px;
      padding: 1em;
      overflow-x: auto;
      margin: 0.8em 0;
      font-size: 0.875em;
    }

    .md-pre code {
      font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', Consolas, monospace;
      background: none;
      padding: 0;
      font-size: inherit;
    }

    .inline-code {
      background: ${inlineCodeBg};
      padding: 0.15em 0.4em;
      border-radius: 4px;
      font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', Consolas, monospace;
      font-size: 0.875em;
    }

    .md-link { color: ${linkColor}; text-decoration: none; }
    .md-link:hover { text-decoration: underline; }

    .md-img { max-width: 100%; border-radius: 6px; margin: 0.5em 0; }

    .md-mark { background: ${markBg}; padding: 0.1em 0.3em; border-radius: 3px; }

    .md-kbd {
      background: ${kbdBg};
      border: 1px solid ${kbdBorder};
      border-radius: 4px;
      padding: 0.1em 0.5em;
      font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', Consolas, monospace;
      font-size: 0.8em;
      box-shadow: inset 0 -1px 0 ${kbdShadow};
    }

    strong { font-weight: 700; }
    em { font-style: italic; }
    del { text-decoration: line-through; color: ${delColor}; }
    u { text-decoration: underline; }

    /* ── Footer ─────────────────────────────────── */
    .article-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: ${footerBg};
      border-top: 1px solid ${footerBorder};
      padding: 10px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.75em;
      color: ${textMuted};
      z-index: 100;
    }

    .footer-left, .footer-right {
      flex: 1;
    }

    .footer-center {
      flex: 0 0 auto;
    }

    .footer-right {
      text-align: right;
    }

    .github-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: ${githubBtnBg};
      color: #ffffff;
      padding: 5px 14px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.85em;
      transition: background 0.2s;
    }

    .github-btn:hover {
      background: ${githubBtnHover};
    }

    .github-btn svg {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }

    /* ── Print ──────────────────────────────────── */
    @media print {
      .article-footer { position: static; margin-top: 2em; }
      .container { padding-bottom: 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="article-title">${escapeHtmlAttr(title)}</h1>
    ${doc.tags.length > 0 ? `<div class="article-tags">${doc.tags.map((t) => `<span>${escapeHtmlAttr(t)}</span>`).join('')}</div>` : '<div class="article-tags" style="margin-bottom:24px;"></div>'}

    <div class="meta-dropper">
      <div class="meta-row">
        <span class="meta-label">Article Title</span>
        <span class="meta-value">${escapeHtmlAttr(title)}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Character Count</span>
        <span class="meta-value">${charCount.toLocaleString()}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Word Count</span>
        <span class="meta-value">${wordCount.toLocaleString()}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Items</span>
        <span class="meta-value">${itemCount}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Exported By</span>
        <span class="meta-value">Article Writer</span>
      </div>
    </div>

    <div class="article-body">
      ${finalBody}
    </div>
  </div>

  <div class="article-footer">
    <div class="footer-left">
      Article Writer 2026
    </div>
    <div class="footer-center">
      <a href="https://github.com/acidgreenservers" target="_blank" rel="noopener noreferrer" class="github-btn">
        <svg viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
        Check Out My GitHub
      </a>
    </div>
    <div class="footer-right">
      Created by: AcidGreen Servers
    </div>
  </div>
</body>
</html>`;

  return html;
}

function escapeHtmlAttr(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}