import type { Token, TokenType } from '../../types';
import { parseInline } from './inlineParser';

const isHr = (l: string) => { const t = l.trim(); if (t.length < 3) return false; const m = t.match(/^([-*_])\s*\1\s*\1[\s\1]*$/); return m ? t.split('').filter(c => c === m[1]).length >= 3 : false; };
const isUl = (l: string) => /^\s*[-*+]\s+/.test(l);
const isOl = (l: string) => /^\s*\d+\.\s+/.test(l);
const isTask = (l: string) => /^\s*[-*+]\s+\[[ xX]\]/.test(l);
const isBq = (l: string) => /^\s*>/.test(l);
const isHd = (l: string) => /^#{1,6}\s+/.test(l);
const isFc = (l: string) => /^(\s{0,3})(`{3,}|~{3,})(.*)/.test(l);
const isTbl = (l: string) => /^\|(.+)\|$/.test(l.trim());
const isTsp = (l: string) => /^\|[\s:|-]+\|$/.test(l.trim());
const isIc = (l: string) => /^    (.+)/.test(l);
const isBl = (l: string) => l.trim() === '';
const isBs = (l: string) => isBl(l) || isHd(l) || isFc(l) || isBq(l) || isTask(l) || isUl(l) || isOl(l) || isHr(l) || isIc(l) || isTbl(l);
const erx = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function parseBlocks(src: string): Token[] {
  const tk: Token[] = [];
  const ls = src.split('\n');
  let i = 0;
  while (i < ls.length) {
    const ln = ls[i];
    if (isBl(ln)) { i++; continue; }
    if (isHr(ln)) { tk.push({ type: 'hr' }); i++; continue; }
    const fm = ln.match(/^(\s{0,3})(`{3,}|~{3,})(.*)/);
    if (fm) {
      const fc = fm[2][0], fl = fm[2].length, lang = fm[3].trim(), cl: string[] = [];
      i++;
      while (i < ls.length) { if (new RegExp(`^\\s{0,3}${erx(fc)}{${fl},}\\s*$`).test(ls[i])) { i++; break; } cl.push(ls[i]); i++; }
      tk.push({ type: 'code_block', content: cl.join('\n'), id: lang || undefined }); continue;
    }
    if (isTbl(ln) && i + 1 < ls.length && isTsp(ls[i + 1])) {
      const hc = ln.trim().split('|').filter(c => c.trim() !== '');
      const am = ls[i + 1].trim().split('|').filter(c => c.trim() !== '');
      const al: Array<'left'|'center'|'right'> = am.map(c => { const t = c.trim(); if (t.startsWith(':') && t.endsWith(':')) return 'center'; if (t.endsWith(':')) return 'right'; return 'left'; });
      const ht: Token[] = hc.map((c, idx) => ({ type: 'table_cell' as TokenType, children: parseInline(c.trim()), align: al[idx] || 'left' as const }));
      i += 2; const rows: Token[] = [];
      while (i < ls.length && isTbl(ls[i])) { const rc = ls[i].trim().split('|').filter(c => c.trim() !== ''); rows.push({ type: 'table_row', children: rc.map((c, idx) => ({ type: 'table_cell' as TokenType, children: parseInline(c.trim()), align: al[idx] || 'left' as const })) }); i++; }
      tk.push({ type: 'table', children: [{ type: 'table_header', children: ht }, ...rows] }); continue;
    }
    if (isHd(ln)) { const hm = ln.match(/^(#{1,6})\s+(.+)/); if (hm) tk.push({ type: 'heading', level: hm[1].length, children: parseInline(hm[2]) }); i++; continue; }
    if (isBq(ln)) { const ql: string[] = []; while (i < ls.length && (isBq(ls[i]) || (!isBl(ls[i]) && ql.length > 0 && !isBs(ls[i])))) { ql.push(isBq(ls[i]) ? ls[i].replace(/^\s*> ?/, '') : ls[i]); i++; } tk.push({ type: 'blockquote', children: parseBlocks(ql.join('\n')) }); continue; }
    if (isTask(ln)) { const items: Token[] = []; while (i < ls.length) { if (isTask(ls[i])) { const tm = ls[i].match(/^\s*[-*+]\s+\[([ xX])\]\s*(.*)/); if (tm) { items.push({ type: 'task_item', checked: tm[1].toLowerCase() === 'x', children: parseInline(tm[2]) }); } i++; } else if (!isBl(ls[i]) && items.length > 0) i++; else break; } tk.push({ type: 'task_list', children: items }); continue; }
    if (isUl(ln)) { const items: Token[] = []; while (i < ls.length) { if (isUl(ls[i])) { const um = ls[i].match(/^\s*[-*+]\s+(.*)/); if (um) items.push({ type: 'list_item', children: parseInline(um[1]) }); i++; } else if (!isBl(ls[i]) && items.length > 0) i++; else break; } tk.push({ type: 'unordered_list', children: items }); continue; }
    if (isOl(ln)) { const items: Token[] = []; while (i < ls.length) { if (isOl(ls[i])) { const om = ls[i].match(/^\s*\d+\.\s+(.*)/); if (om) items.push({ type: 'list_item', children: parseInline(om[1]) }); i++; } else if (!isBl(ls[i]) && items.length > 0) i++; else break; } tk.push({ type: 'ordered_list', children: items }); continue; }
    if (isIc(ln)) { const cl: string[] = []; while (i < ls.length && isIc(ls[i])) { cl.push(ls[i].replace(/^    /, '')); i++; } tk.push({ type: 'code_block', content: cl.join('\n') }); continue; }
    const pl: string[] = []; while (i < ls.length && !isBl(ls[i]) && !isBs(ls[i])) { pl.push(ls[i]); i++; }
    if (pl.length > 0) tk.push({ type: 'paragraph', children: parseInline(pl.join('\n')) });
  }
  return tk;
}