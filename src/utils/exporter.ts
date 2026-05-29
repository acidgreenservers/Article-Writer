import type { Document, UploadedImage } from '../types';
import { getImagesForExport } from './imageStore';

export async function exportAsRawMarkdown(doc: Document): Promise<void> {
  console.log(`[exporter] Exporting raw markdown for: ${doc.title}`);
  const content = buildMarkdownContent(doc);
  downloadTextFile(content, `${sanitize(doc.title)}.md`, 'text/markdown');
}

export async function exportAsRawHtml(doc: Document): Promise<void> {
  console.log(`[exporter] Exporting raw HTML for: ${doc.title}`);
  const html = buildHtmlContent(doc);
  downloadTextFile(html, `${sanitize(doc.title)}.html`, 'text/html');
}

export async function exportAsZip(
  doc: Document,
  images: UploadedImage[],
  format: 'md' | 'html'
): Promise<{ success: boolean; error?: string }> {
  if (images.length === 0) {
    console.warn('[exporter] ZIP export attempted with no items');
    return { success: false, error: 'No uploaded items found. Upload items first or use raw export.' };
  }

  console.log(`[exporter] Exporting ZIP (${format}) with ${images.length} item(s) for: ${doc.title}`);

  try {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    const filename = `${sanitize(doc.title)}.${format === 'md' ? 'md' : 'html'}`;
    const content = format === 'md' ? buildMarkdownContent(doc) : buildHtmlContent(doc);
    zip.file(filename, content);

    const itemsFolder = zip.folder('items');
    if (!itemsFolder) {
      return { success: false, error: 'Failed to create items directory in archive.' };
    }

    const imageExports = getImagesForExport(images);
    for (const imgExport of imageExports) {
      const blob = await imgExport.blob;
      itemsFolder.file(imgExport.name, blob);
      console.log(`[exporter] Added to zip: items/${imgExport.name} (${(blob.size / 1024).toFixed(1)}KB)`);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitize(doc.title)}-${format}-with-items.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log(`[exporter] ZIP export complete: ${a.download}`);
    return { success: true };
  } catch (e) {
    console.error('[exporter] ZIP export failed:', e);
    return { success: false, error: 'Failed to generate ZIP. Please try again.' };
  }
}

function buildMarkdownContent(doc: Document): string {
  const tagLine = doc.tags.length > 0 ? `\nTags: ${doc.tags.join(', ')}\n` : '';
  return `# ${doc.title || 'Untitled Document'}${tagLine}\n\n${doc.content}`;
}

function buildHtmlContent(doc: Document): string {
  const tagMeta = doc.tags.length > 0
    ? `\n  <meta name="keywords" content="${doc.tags.join(', ')}">`
    : '';
  const bodyHtml = markdownToBasicHtml(doc.content);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(doc.title || 'Untitled Document')}</title>${tagMeta}
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; color: #1c2128; }
    img { max-width: 100%; height: auto; border-radius: 6px; margin: 1rem 0; }
    code { background: #f6f8fa; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
    pre { background: #f6f8fa; padding: 1rem; border-radius: 6px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 3px solid #3b82f6; padding-left: 1rem; color: #57606a; margin: 1rem 0; }
    h1, h2, h3 { margin-top: 1.5em; }
  </style>
</head>
<body>
  <h1>${escapeHtml(doc.title || 'Untitled Document')}</h1>
${bodyHtml}
</body>
</html>`;
}

function markdownToBasicHtml(md: string): string {
  let html = escapeHtml(md);
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/!\[\*([^\]]+)\*\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
  html = html.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');
  html = html.replace(/\n{2,}/g, '\n</p>\n<p>\n');
  html = `<p>\n${html}\n</p>`;
  html = html.replace(/<p>\s*(<h[1-3]>)/g, '$1');
  html = html.replace(/(<\/h[1-3]>)\s*<\/p>/g, '$1');
  html = html.replace(/<p>\s*(<blockquote>)/g, '$1');
  html = html.replace(/(<\/blockquote>)\s*<\/p>/g, '$1');
  html = html.replace(/<p>\s*(<pre>)/g, '$1');
  html = html.replace(/(<\/pre>)\s*<\/p>/g, '$1');
  html = html.replace(/<p>\s*(<li>)/g, '<ul>$1');
  html = html.replace(/(<\/li>)\s*<\/p>/g, '$1</ul>');
  return html;
}

function sanitize(name: string): string {
  return (name || 'untitled').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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