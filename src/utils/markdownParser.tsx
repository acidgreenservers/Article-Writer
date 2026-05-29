import React from 'react';

export type TokenType =
  | 'heading' | 'paragraph' | 'bold' | 'italic' | 'strikethrough'
  | 'underline' | 'code_inline' | 'code_block' | 'blockquote'
  | 'unordered_list' | 'ordered_list' | 'list_item' | 'link'
  | 'image' | 'hr' | 'table' | 'table_header' | 'table_row'
  | 'table_cell' | 'task_list' | 'task_item' | 'footnote_ref'
  | 'footnote_def' | 'superscript' | 'subscript' | 'highlight' | 'text';

export interface Token {
  type: TokenType;
  content?: string;
  children?: Token[];
  level?: number;
  href?: string;
  alt?: string;
  checked?: boolean;
  align?: 'left' | 'center' | 'right';
  id?: string;
}

function parseInline(src: string): Token[] {
  const tokens: Token[] = [];
  let remaining = src;
  while (remaining.length > 0) {
    if (remaining.startsWith('\n')) { remaining = remaining.slice(1); continue; }
    let m = remaining.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (m) { tokens.push({ type: 'image', alt: m[1], href: m[2] }); remaining = remaining.slice(m[0].length); continue; }
    m = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (m) { tokens.push({ type: 'link', href: m[2], children: parseInline(m[1]) }); remaining = remaining.slice(m[0].length); continue; }
    m = remaining.match(/^\[\^([^\]]+)\]/);
    if (m) { tokens.push({ type: 'footnote_ref', id: m[1] }); remaining = remaining.slice(m[0].length); continue; }
    m = remaining.match(/^==([^=]+)==/);
    if (m) { tokens.push({ type: 'highlight', children: parseInline(m[1]) }); remaining = remaining.slice(m[0].length); continue; }
    m = remaining.match(/^~~([\s\S]+?)~~/);
    if (m) { tokens.push({ type: 'strikethrough', children: parseInline(m[1]) }); remaining = remaining.slice(m[0].length); continue; }
    m = remaining.match(/^\+\+([\s\S]+?)\+\+/);
    if (m) { tokens.push({ type: 'underline', children: parseInline(m[1]) }); remaining = remaining.slice(m[0].length); continue; }
    m = remaining.match(/^\^([^\^]+)\^/);
    if (m) { tokens.push({ type: 'superscript', children: parseInline(m[1]) }); remaining = remaining.slice(m[0].length); continue; }
    m = remaining.match(/^~([^~\n]+?)~/);
    if (m) { tokens.push({ type: 'subscript', children: parseInline(m[1]) }); remaining = remaining.slice(m[0].length); continue; }
    m = remaining.match(/^(?:\*\*|__)([\s\S]+?)(?:\*\*|__)/);
    if (m) { tokens.push({ type: 'bold', children: parseInline(m[1]) }); remaining = remaining.slice(m[0].length); continue; }
    m = remaining.match(/^(?:\*|_)([^*_\n]+?)(?:\*|_)/);
    if (m) { tokens.push({ type: 'italic', children: parseInline(m[1]) }); remaining = remaining.slice(m[0].length); continue; }
    m = remaining.match(/^`([^`]+)`/);
    if (m) { tokens.push({ type: 'code_inline', content: m[1] }); remaining = remaining.slice(m[0].length); continue; }
    m = remaining.match(/^[^`*_~\[\]^!=\n+]+/);
    if (m && m[0].length > 0) { tokens.push({ type: 'text', content: m[0] }); remaining = remaining.slice(m[0].length); continue; }
    tokens.push({ type: 'text', content: remaining[0] });
    remaining = remaining.slice(1);
  }
  return tokens;
}

function isHrLine(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 3) return false;
  const hrMatch = trimmed.match(/^([-*_])\s*\1\s*\1[\s\1]*$/);
  if (!hrMatch) return false;
  return trimmed.split('').filter(c => c === hrMatch[1]).length >= 3;
}

function isUnorderedListItem(line: string): boolean { return /^\s*[-*+]\s+/.test(line); }
function isOrderedListItem(line: string): boolean { return /^\s*\d+\.\s+/.test(line); }
function isTaskListItem(line: string): boolean { return /^\s*[-*+]\s+\[[ xX]\]/.test(line); }
function isBlockquoteLine(line: string): boolean { return /^\s*>/.test(line); }
function isHeadingLine(line: string): boolean { return /^#{1,6}\s+/.test(line); }
function isFencedCodeStart(line: string): boolean { return /^(\s{0,3})(`{3,}|~{3,})(.*)/.test(line); }
function isTableLine(line: string): boolean { return /^\|(.+)\|$/.test(line.trim()); }
function isTableSeparator(line: string): boolean { return /^\|[\s:|-]+\|$/.test(line.trim()); }
function isIndentedCodeLine(line: string): boolean { return /^    (.+)/.test(line); }
function isBlankLine(line: string): boolean { return line.trim() === ''; }

function isBlockStart(line: string): boolean {
  if (isBlankLine(line)) return true;
  if (isHeadingLine(line)) return true;
  if (isFencedCodeStart(line)) return true;
  if (isBlockquoteLine(line)) return true;
  if (isTaskListItem(line)) return true;
  if (isUnorderedListItem(line)) return true;
  if (isOrderedListItem(line)) return true;
  if (isHrLine(line)) return true;
  if (isIndentedCodeLine(line)) return true;
  if (isTableLine(line)) return true;
  return false;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseBlocks(src: string): Token[] {
  const tokens: Token[] = [];
  const lines = src.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (isBlankLine(line)) { i++; continue; }
    if (isHrLine(line)) { tokens.push({ type: 'hr' }); i++; continue; }
    const fenceMatch = line.match(/^(\s{0,3})(`{3,}|~{3,})(.*)/);
    if (fenceMatch) {
      const fenceChar = fenceMatch[2][0];
      const fenceLen = fenceMatch[2].length;
      const lang = fenceMatch[3].trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length) {
        const closingRegex = new RegExp(`^\\s{0,3}${escapeRegex(fenceChar)}{${fenceLen},}\\s*$`);
        if (closingRegex.test(lines[i])) { i++; break; }
        codeLines.push(lines[i]); i++;
      }
      tokens.push({ type: 'code_block', content: codeLines.join('\n'), id: lang || undefined });
      continue;
    }
    if (isTableLine(line) && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const headerCells = line.trim().split('|').filter(c => c.trim() !== '');
      const alignMatch = lines[i + 1].trim().split('|').filter(c => c.trim() !== '');
      const aligns: Array<'left' | 'center' | 'right'> = alignMatch.map(cell => {
        const t = cell.trim();
        if (t.startsWith(':') && t.endsWith(':')) return 'center';
        if (t.endsWith(':')) return 'right';
        return 'left';
      });
      const headerTokens: Token[] = headerCells.map((cell, idx) => ({
        type: 'table_cell' as TokenType, children: parseInline(cell.trim()), align: aligns[idx] || 'left' as const,
      }));
      i += 2;
      const rows: Token[] = [];
      while (i < lines.length && isTableLine(lines[i])) {
        const rowCells = lines[i].trim().split('|').filter(c => c.trim() !== '');
        rows.push({ type: 'table_row', children: rowCells.map((cell, idx) => ({ type: 'table_cell' as TokenType, children: parseInline(cell.trim()), align: aligns[idx] || 'left' as const })) });
        i++;
      }
      tokens.push({ type: 'table', children: [{ type: 'table_header', children: headerTokens }, ...rows] });
      continue;
    }
    if (isHeadingLine(line)) {
      const hm = line.match(/^(#{1,6})\s+(.+)/);
      if (hm) tokens.push({ type: 'heading', level: hm[1].length, children: parseInline(hm[2]) });
      i++; continue;
    }
    if (isBlockquoteLine(line)) {
      const ql: string[] = [];
      while (i < lines.length && (isBlockquoteLine(lines[i]) || (!isBlankLine(lines[i]) && ql.length > 0 && !isBlockStart(lines[i])))) {
        ql.push(isBlockquoteLine(lines[i]) ? lines[i].replace(/^\s*> ?/, '') : lines[i]); i++;
      }
      tokens.push({ type: 'blockquote', children: parseBlocks(ql.join('\n')) }); continue;
    }
    if (isTaskListItem(line)) {
      const items: Token[] = [];
      while (i < lines.length) {
        if (isTaskListItem(lines[i])) {
          const tm = lines[i].match(/^\s*[-*+]\s+\[([ xX])\]\s*(.*)/);
          if (tm) { const it = [tm[2]]; i++; while (i < lines.length && !isBlankLine(lines[i]) && !isBlockStart(lines[i])) { it.push(lines[i]); i++; } items.push({ type: 'task_item', checked: tm[1].toLowerCase() === 'x', children: parseInline(it.join(' ')) }); } else { i++; }
        } else if (!isBlankLine(lines[i]) && items.length > 0) { i++; } else { break; }
      }
      tokens.push({ type: 'task_list', children: items }); continue;
    }
    if (isUnorderedListItem(line)) {
      const items: Token[] = [];
      while (i < lines.length) {
        if (isUnorderedListItem(lines[i])) {
          const um = lines[i].match(/^\s*[-*+]\s+(.*)/);
          if (um) { const it = [um[1]]; i++; while (i < lines.length && !isBlankLine(lines[i]) && !isBlockStart(lines[i])) { it.push(lines[i].replace(/^\s{2,}/, '')); i++; } items.push({ type: 'list_item', children: parseInline(it.join(' ')) }); } else { i++; }
        } else if (!isBlankLine(lines[i]) && items.length > 0) { i++; } else { break; }
      }
      tokens.push({ type: 'unordered_list', children: items }); continue;
    }
    if (isOrderedListItem(line)) {
      const items: Token[] = [];
      while (i < lines.length) {
        if (isOrderedListItem(lines[i])) {
          const om = lines[i].match(/^\s*\d+\.\s+(.*)/);
          if (om) { const it = [om[1]]; i++; while (i < lines.length && !isBlankLine(lines[i]) && !isBlockStart(lines[i])) { it.push(lines[i].replace(/^\s{2,}/, '')); i++; } items.push({ type: 'list_item', children: parseInline(it.join(' ')) }); } else { i++; }
        } else if (!isBlankLine(lines[i]) && items.length > 0) { i++; } else { break; }
      }
      tokens.push({ type: 'ordered_list', children: items }); continue;
    }
    if (isIndentedCodeLine(line)) {
      const cl: string[] = [];
      while (i < lines.length && isIndentedCodeLine(lines[i])) { cl.push(lines[i].replace(/^    /, '')); i++; }
      tokens.push({ type: 'code_block', content: cl.join('\n') }); continue;
    }
    const pl: string[] = [];
    while (i < lines.length && !isBlankLine(lines[i]) && !isBlockStart(lines[i])) { pl.push(lines[i]); i++; }
    if (pl.length > 0) tokens.push({ type: 'paragraph', children: parseInline(pl.join('\n')) });
  }
  return tokens;
}

export function parse(src: string): Token[] { return parseBlocks(src); }

export function tokensToJSX(tokens: Token[], isDark: boolean, keyPrefix = '0'): React.ReactNode[] {
  const codeBg = isDark ? '#161b22' : '#f6f8fa';
  const codeBorder = isDark ? '#30363d' : '#d0d7de';
  const codeColor = isDark ? '#e6edf3' : '#1f2328';
  const inlineCodeBg = isDark ? 'rgba(110,118,129,0.2)' : 'rgba(175,184,193,0.2)';
  const inlineCodeColor = isDark ? '#79c0ff' : '#0550ae';
  const hSizes: Record<number, string> = { 1: 'text-2xl', 2: 'text-xl', 3: 'text-lg', 4: 'text-base', 5: 'text-sm', 6: 'text-xs' };
  const hWeights: Record<number, string> = { 1: 'font-bold', 2: 'font-bold', 3: 'font-semibold', 4: 'font-semibold', 5: 'font-semibold', 6: 'font-semibold' };
  const hMargins: Record<number, string> = { 1: 'mt-8 mb-4', 2: 'mt-6 mb-3', 3: 'mt-5 mb-2', 4: 'mt-4 mb-2', 5: 'mt-3 mb-1', 6: 'mt-3 mb-1' };
  const hColors: Record<number, string> = { 1: isDark ? 'text-[#e6edf3]' : 'text-gray-900', 2: isDark ? 'text-[#e6edf3]' : 'text-gray-900', 3: isDark ? 'text-[#e6edf3]' : 'text-gray-800', 4: isDark ? 'text-[#e6edf3]' : 'text-gray-800', 5: isDark ? 'text-[#8b949e]' : 'text-gray-600', 6: isDark ? 'text-[#8b949e]' : 'text-gray-600' };

  return tokens.map((token, idx) => {
    const key = `${keyPrefix}-${idx}`;
    const children = token.children ? tokensToJSX(token.children, isDark, key) : null;

    switch (token.type) {
      case 'heading': {
        const lvl = token.level || 1;
        const cls = `${hSizes[lvl]} ${hWeights[lvl]} ${hMargins[lvl]} ${hColors[lvl]} leading-snug`;
        if (lvl === 1) return <h1 key={key} className={cls}>{children}</h1>;
        if (lvl === 2) return <h2 key={key} className={cls}>{children}</h2>;
        if (lvl === 3) return <h3 key={key} className={cls}>{children}</h3>;
        if (lvl === 4) return <h4 key={key} className={cls}>{children}</h4>;
        if (lvl === 5) return <h5 key={key} className={cls}>{children}</h5>;
        return <h6 key={key} className={cls}>{children}</h6>;
      }
      case 'paragraph': return <p key={key} className={isDark ? 'text-[#c9d1d9] mb-4 leading-relaxed' : 'text-gray-700 mb-4 leading-relaxed'}>{children}</p>;
      case 'bold': return <strong key={key} className="font-bold">{children}</strong>;
      case 'italic': return <em key={key} className="italic">{children}</em>;
      case 'strikethrough': return <del key={key} className="line-through">{children}</del>;
      case 'underline': return <u key={key} className="underline">{children}</u>;
      case 'highlight': return <mark key={key} className="bg-yellow-300/35 rounded px-0.5">{children}</mark>;
      case 'superscript': return <sup key={key} className="text-[0.75em] align-super">{children}</sup>;
      case 'subscript': return <sub key={key} className="text-[0.75em] align-sub">{children}</sub>;
      case 'code_inline': return <code key={key} className="font-mono text-[0.9em] px-1.5 py-0.5 rounded" style={{ backgroundColor: inlineCodeBg, color: inlineCodeColor }}>{token.content}</code>;
      case 'code_block': return (
        <pre key={key} className="mb-4 overflow-x-auto rounded-lg border p-4 text-[13px] leading-5" style={{ backgroundColor: codeBg, borderColor: codeBorder }}>
          {token.id && <div className="text-[11px] mb-2 uppercase tracking-wide" style={{ color: isDark ? '#6e7681' : '#656d76' }}>{token.id}</div>}
          <code className="font-mono" style={{ color: codeColor }}>{token.content}</code>
        </pre>
      );
      case 'blockquote': return <blockquote key={key} className="mb-4 pl-4 ml-0 italic" style={{ borderLeft: '4px solid #3b82f6', color: isDark ? '#8b949e' : '#656d76' }}>{children}</blockquote>;
      case 'unordered_list': return <ul key={key} className={isDark ? 'text-[#c9d1d9] mb-4 list-disc pl-6 space-y-1' : 'text-gray-700 mb-4 list-disc pl-6 space-y-1'}>{children}</ul>;
      case 'ordered_list': return <ol key={key} className={isDark ? 'text-[#c9d1d9] mb-4 list-decimal pl-6 space-y-1' : 'text-gray-700 mb-4 list-decimal pl-6 space-y-1'}>{children}</ol>;
      case 'task_list': return <div key={key} className="mb-4 space-y-1.5">{children}</div>;
      case 'task_item': return (<label key={key} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={token.checked} readOnly className="w-4 h-4 rounded" /><span className={isDark ? 'text-[#c9d1d9]' : 'text-gray-700'}>{children}</span></label>);
      case 'list_item': return <li key={key}>{children}</li>;
      case 'link': return <a key={key} href={token.href} className="text-blue-500 hover:text-blue-400 underline underline-offset-2" target="_blank" rel="noopener noreferrer">{children}</a>;
      case 'image': return (<figure key={key} className="mb-4"><img src={token.href} alt={token.alt || ''} className="max-w-full rounded-lg border" style={{ borderColor: codeBorder }} />{token.alt && <figcaption className={isDark ? 'text-[#6e7681] text-xs mt-1 text-center' : 'text-gray-400 text-xs mt-1 text-center'}>{token.alt}</figcaption>}</figure>);
      case 'hr': return <hr key={key} className={isDark ? 'border-[#21262d] my-6' : 'border-gray-200 my-6'} />;
      case 'table': return (<div key={key} className="mb-4 overflow-x-auto"><table className={isDark ? 'w-full border-collapse text-sm text-[#c9d1d9]' : 'w-full border-collapse text-sm text-gray-700'}>{children}</table></div>);
      case 'table_header': return <thead>{children}</thead>;
      case 'table_row': return <tr className={isDark ? 'border-b border-[#21262d]' : 'border-b border-gray-200'}>{children}</tr>;
      case 'table_cell': { const align = token.align || 'left'; const isHeader = key.includes('-0-'); return (<td key={key} style={{ textAlign: align, padding: '8px 12px' }} className={isHeader ? (isDark ? 'font-semibold text-[#e6edf3] bg-[#161b22]' : 'font-semibold text-gray-900 bg-gray-50') : ''}>{children}</td>); }
      case 'footnote_ref': return (<sup key={key}><a href={`#fn-${token.id}`} className="text-blue-500 hover:text-blue-400 no-underline" id={`fnref-${token.id}`}>{token.id}</a></sup>);
      case 'footnote_def': return (<div key={key} id={`fn-${token.id}`} className={isDark ? 'text-[#8b949e] text-sm mb-2 pl-4 border-l-2 border-[#30363d]' : 'text-gray-500 text-sm mb-2 pl-4 border-l-2 border-gray-300'}><a href={`#fnref-${token.id}`} className="text-blue-500 hover:text-blue-400 mr-1">{token.id}.</a>{children}</div>);
      case 'text': return <React.Fragment key={key}>{token.content}</React.Fragment>;
      default: return <React.Fragment key={key}>{children}</React.Fragment>;
    }
  });
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function tokensToHTML(tokens: Token[]): string {
  return tokens.map(token => {
    const children = token.children ? tokensToHTML(token.children) : '';
    const content = token.content || '';
    switch (token.type) {
      case 'heading': return `<h${token.level}>${children}</h${token.level}>\n`;
      case 'paragraph': return `<p>${children}</p>\n`;
      case 'bold': return `<strong>${children}</strong>`;
      case 'italic': return `<em>${children}</em>`;
      case 'strikethrough': return `<del>${children}</del>`;
      case 'underline': return `<u>${children}</u>`;
      case 'highlight': return `<mark>${children}</mark>`;
      case 'superscript': return `<sup>${children}</sup>`;
      case 'subscript': return `<sub>${children}</sub>`;
      case 'code_inline': return `<code>${escapeHtml(content)}</code>`;
      case 'code_block': { const langAttr = token.id ? ` class="language-${escapeHtml(token.id)}"` : ''; return `<pre><code${langAttr}>${escapeHtml(content)}</code></pre>\n`; }
      case 'blockquote': return `<blockquote>${children}</blockquote>\n`;
      case 'unordered_list': return `<ul>${children}</ul>\n`;
      case 'ordered_list': return `<ol>${children}</ol>\n`;
      case 'task_list': return `<ul class="task-list">${children}</ul>\n`;
      case 'task_item': return `<li class="task-list-item"><input type="checkbox"${token.checked ? ' checked' : ''} disabled /> ${children}</li>\n`;
      case 'list_item': return `<li>${children}</li>\n`;
      case 'link': return `<a href="${escapeHtml(token.href || '')}">${children}</a>`;
      case 'image': return `<figure><img src="${escapeHtml(token.href || '')}" alt="${escapeHtml(token.alt || '')}" /><figcaption>${escapeHtml(token.alt || '')}</figcaption></figure>\n`;
      case 'hr': return `<hr />\n`;
      case 'table': return `<table>${children}</table>\n`;
      case 'table_header': return `<thead>${children}</thead>`;
      case 'table_row': return `<tr>${children}</tr>\n`;
      case 'table_cell': { const align = token.align ? ` style="text-align: ${token.align}"` : ''; return `<td${align}>${children}</td>`; }
      case 'footnote_ref': return `<sup><a href="#fn-${escapeHtml(token.id || '')}" id="fnref-${escapeHtml(token.id || '')}">${escapeHtml(token.id || '')}</a></sup>`;
      case 'footnote_def': return `<div id="fn-${escapeHtml(token.id || '')}" class="footnote"><a href="#fnref-${escapeHtml(token.id || '')}">${escapeHtml(token.id || '')}.</a> ${children}</div>\n`;
      case 'text': return escapeHtml(content);
      default: return children;
    }
  }).join('');
}

export function tokensToMarkdown(tokens: Token[]): string {
  return tokens.map(token => {
    const children = token.children ? tokensToMarkdown(token.children) : '';
    const content = token.content || '';
    switch (token.type) {
      case 'heading': return `${'#'.repeat(token.level || 1)} ${children}\n\n`;
      case 'paragraph': return `${children}\n\n`;
      case 'bold': return `**${children}**`;
      case 'italic': return `*${children}*`;
      case 'strikethrough': return `~~${children}~~`;
      case 'underline': return `++${children}++`;
      case 'highlight': return `==${children}==`;
      case 'superscript': return `^${children}^`;
      case 'subscript': return `~${children}~`;
      case 'code_inline': return `\`${content}\``;
      case 'code_block': return `\`\`\`${token.id || ''}\n${content}\n\`\`\`\n\n`;
      case 'blockquote': return children.split('\n').map((l: string) => `> ${l}`).join('\n') + '\n\n';
      case 'task_item': return `- [${token.checked ? 'x' : ' '}] ${children}\n`;
      case 'list_item': return `- ${children}\n`;
      case 'link': return `[${children}](${token.href || ''})`;
      case 'image': return `![${token.alt || ''}](${token.href || ''})`;
      case 'hr': return '---\n\n';
      case 'footnote_ref': return `[^${token.id}]`;
      case 'footnote_def': return `[^${token.id}]: ${children}\n\n`;
      case 'text': return content;
      default: return children;
    }
  }).join('');
}