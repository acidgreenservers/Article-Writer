import type { Token } from '../../types';

const esc = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

export function tokensToHTML(tokens: Token[]): string {
  return tokens.map(t => {
    const ch = t.children ? tokensToHTML(t.children) : '';
    const co = t.content || '';
    switch (t.type) {
      case 'heading': return `<h${t.level}>${ch}</h${t.level}>\n`;
      case 'paragraph': return `<p>${ch}</p>\n`;
      case 'bold': return `<strong>${ch}</strong>`;
      case 'italic': return `<em>${ch}</em>`;
      case 'strikethrough': return `<del>${ch}</del>`;
      case 'underline': return `<u>${ch}</u>`;
      case 'highlight': return `<mark>${ch}</mark>`;
      case 'superscript': return `<sup>${ch}</sup>`;
      case 'subscript': return `<sub>${ch}</sub>`;
      case 'code_inline': return `<code>${esc(co)}</code>`;
      case 'code_block': { const la = t.id ? ` class="language-${esc(t.id)}"` : ''; return `<pre><code${la}>${esc(co)}</code></pre>\n`; }
      case 'blockquote': return `<blockquote>${ch}</blockquote>\n`;
      case 'unordered_list': return `<ul>${ch}</ul>\n`;
      case 'ordered_list': return `<ol>${ch}</ol>\n`;
      case 'task_list': return `<ul class="task-list">${ch}</ul>\n`;
      case 'task_item': return `<li><input type="checkbox"${t.checked?' checked':''} disabled /> ${ch}</li>\n`;
      case 'list_item': return `<li>${ch}</li>\n`;
      case 'link': return `<a href="${esc(t.href||'')}">${ch}</a>`;
      case 'image': return `<img src="${esc(t.href||'')}" alt="${esc(t.alt||'')}" />\n`;
      case 'hr': return `<hr />\n`;
      case 'table': return `<table>${ch}</table>\n`;
      case 'table_header': return `<thead>${ch}</thead>`;
      case 'table_row': return `<tr>${ch}</tr>\n`;
      case 'table_cell': return `<td>${ch}</td>`;
      case 'footnote_ref': return `<sup><a href="#fn-${esc(t.id||'')}">${esc(t.id||'')}</a></sup>`;
      case 'footnote_def': return `<div id="fn-${esc(t.id||'')}"><a href="#fnref-${esc(t.id||'')}">${esc(t.id||'')}.</a> ${ch}</div>\n`;
      case 'text': return esc(co);
      default: return ch;
    }
  }).join('');
}

export function tokensToMarkdown(tokens: Token[]): string {
  return tokens.map(t => {
    const ch = t.children ? tokensToMarkdown(t.children) : '';
    const co = t.content || '';
    switch (t.type) {
      case 'heading': return `${'#'.repeat(t.level||1)} ${ch}\n\n`;
      case 'paragraph': return `${ch}\n\n`;
      case 'bold': return `**${ch}**`;
      case 'italic': return `*${ch}*`;
      case 'strikethrough': return `~~${ch}~~`;
      case 'underline': return `++${ch}++`;
      case 'highlight': return `==${ch}==`;
      case 'superscript': return `^${ch}^`;
      case 'subscript': return `~${ch}~`;
      case 'code_inline': return `\`${co}\``;
      case 'code_block': return `\`\`\`${t.id||''}\n${co}\n\`\`\`\n\n`;
      case 'blockquote': return ch.split('\n').map((l:string)=>`> ${l}`).join('\n')+'\n\n';
      case 'task_item': return `- [${t.checked?'x':' '}] ${ch}\n`;
      case 'list_item': return `- ${ch}\n`;
      case 'link': return `[${ch}](${t.href||''})`;
      case 'image': return `![${t.alt||''}](${t.href||''})`;
      case 'hr': return '---\n\n';
      case 'footnote_ref': return `[^${t.id}]`;
      case 'footnote_def': return `[^${t.id}]: ${ch}\n\n`;
      case 'text': return co;
      default: return ch;
    }
  }).join('');
}