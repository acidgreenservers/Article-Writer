import type { UploadedImage } from '../types';

const IMAGE_STORE_KEY = 'article-writer-images-v2';

export function storeImages(images: UploadedImage[]): void {
  try {
    const serializable = images.map(({ id, name, url }) => ({ id, name, url }));
    localStorage.setItem(IMAGE_STORE_KEY, JSON.stringify(serializable));
    console.log(`[imageStore] Stored ${images.length} image(s)`);
  } catch (e) {
    console.error('[imageStore] Failed to store images:', e);
  }
}

export function loadImages(): UploadedImage[] {
  try {
    const raw = localStorage.getItem(IMAGE_STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('[imageStore] Failed to load images:', e);
  }
  return [];
}

export function createImageFromFile(file: File): UploadedImage {
  const image: UploadedImage = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    name: file.name,
    file,
    url: URL.createObjectURL(file),
  };
  console.log(`[imageStore] Created image ref: items/${image.name}`);
  return image;
}

export function removeImageById(images: UploadedImage[], imageId: string): UploadedImage[] {
  const img = images.find(i => i.id === imageId);
  if (img) {
    URL.revokeObjectURL(img.url);
    console.log(`[imageStore] Removed image: items/${img.name}`);
  }
  return images.filter(i => i.id !== imageId);
}

export function generateMarkdownReference(image: UploadedImage): string {
  return `\n![*${image.name}*](items/${image.name})\n`;
}

export function getImagesForExport(images: UploadedImage[]): { name: string; blob: Promise<Blob> }[] {
  return images.map(img => ({
    name: img.name,
    blob: img.file ? img.file.arrayBuffer().then(buf => new Blob([buf], { type: getMimeType(img.name) })) : fetch(img.url).then(r => r.blob()),
  }));
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
    bmp: 'image/bmp', ico: 'image/x-icon',
  };
  return mimeMap[ext] || 'application/octet-stream';
}