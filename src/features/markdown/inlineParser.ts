import type { Token } from '../../types';

export function parseInline(src: string): Token[] {
  const tokens: Token[] = [];
  let r = src;
  while (r.length > 0) {
    if (r.startsWith('\n')) { r = r.slice(1); continue; }
    let m: RegExpMatchArray | null;
    m = r.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (m) { tokens.push({ type: 'image', alt: m[1], href: m[2] }); r = r.slice(m[0].length); continue; }
    m = r.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (m) { tokens.push({ type: 'link', href: m[2], children: parseInline(m[1]) }); r = r.slice(m[0].length); continue; }
    m = r.match(/^\[\^([^\]]+)\]/);
    if (m) { tokens.push({ type: 'footnote_ref', id: m[1] }); r = r.slice(m[0].length); continue; }
    m = r.match(/^==([^=]+)==/);
    if (m) { tokens.push({ type: 'highlight', children: parseInline(m[1]) }); r = r.slice(m[0].length); continue; }
    m = r.match(/^~~([\s\S]+?)~~/);
    if (m) { tokens.push({ type: 'strikethrough', children: parseInline(m[1]) }); r = r.slice(m[0].length); continue; }
    m = r.match(/^\+\+([\s\S]+?)\+\+/);
    if (m) { tokens.push({ type: 'underline', children: parseInline(m[1]) }); r = r.slice(m[0].length); continue; }
    m = r.match(/^\^([^\^]+)\^/);
    if (m) { tokens.push({ type: 'superscript', children: parseInline(m[1]) }); r = r.slice(m[0].length); continue; }
    m = r.match(/^~([^~\n]+?)~/);
    if (m) { tokens.push({ type: 'subscript', children: parseInline(m[1]) }); r = r.slice(m[0].length); continue; }
    m = r.match(/^(?:\*\*|__)([\s\S]+?)(?:\*\*|__)/);
    if (m) { tokens.push({ type: 'bold', children: parseInline(m[1]) }); r = r.slice(m[0].length); continue; }
    m = r.match(/^(?:\*|_)([^*_\n]+?)(?:\*|_)/);
    if (m) { tokens.push({ type: 'italic', children: parseInline(m[1]) }); r = r.slice(m[0].length); continue; }
    m = r.match(/^`([^`]+)`/);
    if (m) { tokens.push({ type: 'code_inline', content: m[1] }); r = r.slice(m[0].length); continue; }
    m = r.match(/^[^`*_~\[\]^!=\n+]+/);
    if (m && m[0].length > 0) { tokens.push({ type: 'text', content: m[0] }); r = r.slice(m[0].length); continue; }
    tokens.push({ type: 'text', content: r[0] });
    r = r.slice(1);
  }
  return tokens;
}