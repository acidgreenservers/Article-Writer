import type { Document } from '../types';

export function createNewDocument(): Document {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    title: 'Untitled Document',
    content: '',
    tags: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function countWords(text: string): number {
  const trimmed = (text || '').trim();
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
}

export function formatTags(tags: string[]): string {
  if (!tags || tags.length === 0) return 'No tags';
  return tags.join(', ');
}