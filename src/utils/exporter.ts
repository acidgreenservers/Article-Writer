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

export async function exportAsRawHtml(doc: Document): Promise<void> {
  const html = buildHtmlContent(doc);
  downloadTextFile(html, `${sanitize(doc.title)}.html`, 'text/html');
}

export async function exportAsZip(
  doc: Document,
  images: UploadedImage[],
  format: 'md' | 'html'
): Promise<void> {
  const filename = `${sanitize(doc.title)}.${format}`;
  const docContent = format === 'md' ? buildMarkdownContent(doc) : buildHtmlContent(doc);

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

function buildHtmlContent(doc: Document): string {
  // Use the same styling as Preview but in a standalone template
  const bodyHtml = markdownToHtml(doc.content);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(doc.title || 'Untitled Document')}</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #1f2937; }
    img { max-width: 100%; border-radius: 8px; }
    pre { background: #f3f4f6; padding: 16px; border-radius: 8px; overflow-x: auto; }
    code { font-family: monospace; }
    blockquote { border-left: 4px solid #3b82f6; padding-left: 16px; color: #4b5563; font-style: italic; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
    th { background: #f9fafb; }
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
