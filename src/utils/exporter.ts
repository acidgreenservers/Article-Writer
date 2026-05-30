import type { Document, UploadedImage } from '../types';
import { createZip } from './zipWriter';
import { generateHtmlExport } from './htmlExportTemplate';

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
  const docContent = format === 'md' ? buildMarkdownContent(doc) : buildHtmlContent(doc, theme, images);

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

function buildHtmlContent(doc: Document, theme: 'light' | 'dark', images: UploadedImage[] = []): string {
  return generateHtmlExport(doc, images, theme);
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
