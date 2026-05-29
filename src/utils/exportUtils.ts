import type { Document, UploadedImage } from '../types';

export function contentToHtml(
  doc: Document,
  images: UploadedImage[],
  theme: 'dark' | 'light'
): string {
  const bg = theme === 'dark' ? '#0d1117' : '#ffffff';
  const fg = theme === 'dark' ? '#e6edf3' : '#1f2937';
  const muted = theme === 'dark' ? '#8b949e' : '#6b7280';

  const body = doc.content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/<u>(.+?)<\/u>/g, '<u>$1</u>')
    .replace(/!\[(.*?)\]\((.*?)\)/g, (_, alt, src) => {
      const imgSrc = images.find((i) => `items/${i.name}` === src)
        ? `items/${src.split('/').pop()}`
        : src;
      return `<img alt="${alt}" src="${imgSrc}" style="max-width:100%;border-radius:6px;margin:8px 0;" />`;
    })
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    .replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid #3b82f6;padding-left:12px;color:' + muted + ';">$1</blockquote>')
    .replace(/```[\s\S]*?```/g, (m) => '<pre style="background:' + (theme === 'dark' ? '#161b22' : '#f3f4f6') + ';padding:12px;border-radius:6px;overflow-x:auto;"><code>' + m.slice(3, -3).trim() + '</code></pre>')
    .replace(/`(.+?)`/g, '<code style="background:' + (theme === 'dark' ? '#161b22' : '#f3f4f6') + ';padding:2px 6px;border-radius:3px;">$1</code>')
    .replace(/^[-] (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${doc.title}</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:720px;margin:0 auto;padding:24px;background:${bg};color:${fg};line-height:1.7;}
h1,h2,h3{margin-top:1.5em;margin-bottom:0.5em;}
blockquote{margin:0;padding:8px 16px;}
img{max-width:100%;}
pre{overflow-x:auto;}
li{margin-left:1.5em;}
</style>
</head>
<body>
<h1>${doc.title}</h1>
${doc.tags.length ? '<p style="color:' + muted + ';">Tags: ' + doc.tags.join(', ') + '</p>' : ''}
<p>${body}</p>
</body>
</html>`;
}

export function contentToMarkdown(doc: Document, _images: UploadedImage[]): string {
  return `# ${doc.title}\n\n${doc.tags.length ? '> Tags: ' + doc.tags.join(', ') + '\n\n' : ''}${doc.content}`;
}

export async function createExportZip(
  doc: Document,
  images: UploadedImage[],
  format: 'md' | 'html',
  theme: 'dark' | 'light'
): Promise<Blob> {
  const { default: JSZip } = await import('https://esm.sh/jszip@3.10.1');

  const zip = new JSZip();
  const itemsFolder = zip.folder('items');

  let mainContent: string;
  let fileName: string;

  if (format === 'md') {
    mainContent = contentToMarkdown(doc, images);
    fileName = 'article.md';
  } else {
    mainContent = contentToHtml(doc, images, theme);
    fileName = 'article.html';
  }

  zip.file(fileName, mainContent);

  for (const image of images) {
    const arrayBuffer = await image.file.arrayBuffer();
    itemsFolder.file(image.name, arrayBuffer);
  }

  return zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}