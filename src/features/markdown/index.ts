import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({ gfm: true, breaks: true });

export function renderMarkdownToHTML(content: string): string {
  const raw = marked.parse(content) as string;
  return DOMPurify.sanitize(raw);
}

export function renderMarkdownToJSX(content: string): string {
  return renderMarkdownToHTML(content);
}