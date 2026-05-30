import type { Document, UploadedImage } from '../types';
import { createZip } from './zipWriter';
import { markdownToHtml } from './markdownToHtml';

/**
 * exporter.ts — Centralized export logic
 * Handles raw exports (MD/HTML) and bundled ZIP exports using zipWriter.ts.
 */

export async function exportAsRawMarkdown(doc: Document): Promise<void> {
  const content = buildMarkdownContent(doc);
  downloadTextFile(content, `${sanitize(doc.title)}.md`, 'text/markdown');
}

export async function exportAsRawHtml(doc: Document, theme: 'light' | 'dark' = 'dark'): Promise<void> {
  const html = buildHtmlContent(doc, theme);
  downloadTextFile(html, `${sanitize(doc.title)}.html`, 'text/html');
}

export async function exportAsZip(
  doc: Document,
  images: UploadedImage[],
  format: 'md' | 'html',
  theme: 'light' | 'dark' = 'dark'
): Promise<void> {
  const filename = `${sanitize(doc.title)}.${format}`;
  const docContent = format === 'md' ? buildMarkdownContent(doc) : buildHtmlContent(doc, theme);

  const entries = [
    {
      path: filename,
      data: new TextEncoder().encode(docContent)
    }
  ];

  // Add images to the items/ folder
  for (const img of images) {
    entries.push({
      path: `items/${img.name}`,
      data: new Uint8Array(img.data)
    });
  }

  const zipBlob = await createZip(entries);
  const zipName = `${sanitize(doc.title)}-bundle.zip`;

  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function buildMarkdownContent(doc: Document): string {
  const tags = doc.tags.length > 0 ? `\nTags: ${doc.tags.join(', ')}\n` : '';
  return `# ${doc.title || 'Untitled Document'}${tags}\n\n${doc.content}`;
}

function buildHtmlContent(doc: Document, theme: 'light' | 'dark'): string {
  const bodyHtml = markdownToHtml(doc.content);
  const isDark = theme === 'dark';

  const bg = isDark ? '#0d1117' : '#ffffff';
  const text = isDark ? '#e6edf3' : '#1f2937';
  const muted = isDark ? '#8b949e' : '#4b5563';
  const codeBg = isDark ? '#161b22' : '#f3f4f6';
  const border = isDark ? '#30363d' : '#e5e7eb';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(doc.title || 'Untitled Document')}</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; background-color: ${bg}; color: ${text}; }
    img { max-width: 100%; border-radius: 8px; }
    pre { background: ${codeBg}; padding: 16px; border-radius: 8px; overflow-x: auto; border: 1px solid ${border}; }
    code { font-family: monospace; }
    blockquote { border-left: 4px solid #3b82f6; padding-left: 16px; color: ${muted}; font-style: italic; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid ${border}; padding: 8px; text-align: left; }
    th { background: ${codeBg}; }
    h1 { border-bottom: 1px solid ${border}; padding-bottom: 10px; }
  </style>
</head>
<body>
  <h1>${escapeHtml(doc.title || 'Untitled Document')}</h1>
  ${bodyHtml}
</body>
</html>`;
}

function sanitize(name: string): string {
  return (name || 'untitled').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]!));
}

function downloadTextFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
