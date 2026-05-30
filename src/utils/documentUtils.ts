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

/**
 * BOLT OPTIMIZATION: High-performance word counter.
 * Avoids creating temporary arrays and strings via split() and regex,
 * significantly reducing GC pressure during typing.
 */
export function countWords(text: string): number {
  if (!text) return 0;

  let count = 0;
  let inWord = false;

  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    // Consider whitespace: space, tab, newline, vertical tab, form feed, carriage return
    const isWhitespace = charCode <= 32;

    if (isWhitespace) {
      inWord = false;
    } else if (!inWord) {
      count++;
      inWord = true;
    }
  }

  return count;
}

export function formatTags(tags: string[]): string {
  if (!tags || tags.length === 0) return 'No tags';
  return tags.join(', ');
}