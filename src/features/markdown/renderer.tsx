import React from 'react';
import type { Token } from '../../types';

export function tokensToJSX(tokens: Token[], isDark: boolean, kp = '0'): React.ReactNode[] {
  const cbg = isDark ? '#161b22' : '#f6f8fa';
  const cbr = isDark ? '#30363d' : '#d0d7de';
  const ccl = isDark ? '#e6edf3' : '#1f2328';
  const ibg = isDark ? 'rgba(110,118,129,0.2)' : 'rgba(175,184,193,0.2)';
  const icl = isDark ? '#79c0ff' : '#0550ae';
  const hS: Record<number,string> = {1:'text-2xl',2:'text-xl',3:'text-lg',4:'text-base',5:'text-sm',6:'text-xs'};
  const hW: Record<number,string> = {1:'font-bold',2:'font-bold',3:'font-semibold',4:'font-semibold',5:'font-semibold',6:'font-semibold'};
  const hM: Record<number,string> = {1:'mt-8 mb-4',2:'mt-6 mb-3',3:'mt-5 mb-2',4:'mt-4 mb-2',5:'mt-3 mb-1',6:'mt-3 mb-1'};
  const hC: Record<number,string> = {1:isDark?'text-[#e6edf3]':'text-gray-900',2:isDark?'text-[#e6edf3]':'text-gray-900',3:isDark?'text-[#e6edf3]':'text-gray-800',4:isDark?'text-[#e6edf3]':'text-gray-800',5:isDark?'text-[#8b949e]':'text-gray-600',6:isDark?'text-[#8b949e]':'text-gray-600'};

  return tokens.map((t, i) => {
    const k = `${kp}-${i}`;
    const ch = t.children ? tokensToJSX(t.children, isDark, k) : null;
    switch (t.type) {
      case 'heading': { const l=t.level||1; return React.createElement(`h${l}`,{key:k,className:`${hS[l]} ${hW[l]} ${hM[l]} ${hC[l]} leading-snug`},ch); }
      case 'paragraph': return <p key={k} className={isDark?'text-[#c9d1d9] mb-4 leading-relaxed':'text-gray-700 mb-4 leading-relaxed'}>{ch}</p>;
      case 'bold': return <strong key={k} className="font-bold">{ch}</strong>;
      case 'italic': return <em key={k} className="italic">{ch}</em>;
      case 'strikethrough': return <del key={k} className="line-through">{ch}</del>;
      case 'underline': return <u key={k} className="underline">{ch}</u>;
      case 'highlight': return <mark key={k} className="bg-yellow-300/35 rounded px-0.5">{ch}</mark>;
      case 'superscript': return <sup key={k} className="text-[0.75em] align-super">{ch}</sup>;
      case 'subscript': return <sub key={k} className="text-[0.75em] align-sub">{ch}</sub>;
      case 'code_inline': return <code key={k} className="font-mono text-[0.9em] px-1.5 py-0.5 rounded" style={{backgroundColor:ibg,color:icl}}>{t.content}</code>;
      case 'code_block': return <pre key={k} className="mb-4 overflow-x-auto rounded-lg border p-4 text-[13px] leading-5" style={{backgroundColor:cbg,borderColor:cbr}}>{t.id&&<div className="text-[11px] mb-2 uppercase tracking-wide" style={{color:isDark?'#6e7681':'#656d76'}}>{t.id}</div>}<code className="font-mono" style={{color:ccl}}>{t.content}</code></pre>;
      case 'blockquote': return <blockquote key={k} className={`md-blockquote ${isDark?'md-blockquote-dark':'md-blockquote-light'}`}>{ch}</blockquote>;
      case 'unordered_list': return <ul key={k} className={isDark?'text-[#c9d1d9] mb-4 list-disc pl-6 space-y-1':'text-gray-700 mb-4 list-disc pl-6 space-y-1'}>{ch}</ul>;
      case 'ordered_list': return <ol key={k} className={isDark?'text-[#c9d1d9] mb-4 list-decimal pl-6 space-y-1':'text-gray-700 mb-4 list-decimal pl-6 space-y-1'}>{ch}</ol>;
      case 'task_list': return <div key={k} className="mb-4 space-y-1.5">{ch}</div>;
      case 'task_item': return <label key={k} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={t.checked} readOnly className="w-4 h-4 rounded" /><span className={isDark?'text-[#c9d1d9]':'text-gray-700'}>{ch}</span></label>;
      case 'list_item': return <li key={k}>{ch}</li>;
      case 'link': return <a key={k} href={t.href} className="text-blue-500 hover:text-blue-400 underline underline-offset-2" target="_blank" rel="noopener noreferrer">{ch}</a>;
      case 'image': return <figure key={k} className="mb-4"><img src={t.href} alt={t.alt||''} className="max-w-full rounded-lg border" style={{borderColor:cbr}} />{t.alt&&<figcaption className={isDark?'text-[#6e7681] text-xs mt-1 text-center':'text-gray-400 text-xs mt-1 text-center'}>{t.alt}</figcaption>}</figure>;
      case 'hr': return <hr key={k} className={isDark?'border-[#21262d] my-6':'border-gray-200 my-6'} />;
      case 'table': return <div key={k} className="mb-4 overflow-x-auto"><table className={isDark?'w-full border-collapse text-sm text-[#c9d1d9]':'w-full border-collapse text-sm text-gray-700'}>{ch}</table></div>;
      case 'table_header': return <thead>{ch}</thead>;
      case 'table_row': return <tr className={isDark?'border-b border-[#21262d]':'border-b border-gray-200'}>{ch}</tr>;
      case 'table_cell': return <td key={k} style={{textAlign:t.align||'left',padding:'8px 12px'}}>{ch}</td>;
      case 'footnote_ref': return <sup key={k}><a href={`#fn-${t.id}`} className="text-blue-500">{t.id}</a></sup>;
      case 'footnote_def': return <div key={k} id={`fn-${t.id}`} className={isDark?'text-[#8b949e] text-sm mb-2 pl-4 border-l-2 border-[#30363d]':'text-gray-500 text-sm mb-2 pl-4 border-l-2 border-gray-300'}><a href={`#fnref-${t.id}`} className="text-blue-500 mr-1">{t.id}.</a>{ch}</div>;
      case 'text': return <React.Fragment key={k}>{t.content}</React.Fragment>;
      default: return <React.Fragment key={k}>{ch}</React.Fragment>;
    }
  });
}