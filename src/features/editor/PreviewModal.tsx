import React, { useEffect, useRef } from 'react';
import type { Document, DocumentImage } from '../../types';
import { countWords } from '../../utils/documentUtils';
import { renderMarkdownToHTML } from '../markdown';

interface PreviewModalProps {
  document: Document;
  images: DocumentImage[];
  onClose: () => void;
  isDark: boolean;
}

export default function PreviewModal({ document: doc, images, onClose, isDark }: PreviewModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const html = renderMarkdownToHTML(doc.content);
  const wc = countWords(doc.content);

  useEffect(() => {
    if (!containerRef.current || !doc.content.trim()) return;
    const w = window as any;
    if (w.MathJax?.typesetPromise) {
      w.MathJax.typesetClear([containerRef.current]);
      w.MathJax.typesetPromise([containerRef.current]).catch(() => {});
    }
  }, [doc.content]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={isDark ? 'relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden' : 'relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden'}>
        <div className={isDark ? 'flex items-center justify-between px-6 py-4 border-b border-[#21262d]' : 'flex items-center justify-between px-6 py-4 border-b border-gray-100'}>
          <div>
            <h2 className={isDark ? 'text-lg font-semibold text-[#e6edf3]' : 'text-lg font-semibold text-gray-900'}>{doc.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              {doc.tags.map((tag, i) => (
                <span key={i} className={isDark ? 'text-[11px] bg-[rgba(59,110,248,0.15)] text-blue-300 px-2 py-0.5 rounded-full' : 'text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full'}>{tag}</span>
              ))}
              <span className={isDark ? 'text-[11px] text-[#6e7681]' : 'text-[11px] text-gray-400'}>{wc} words</span>
            </div>
          </div>
          <button onClick={onClose} className={isDark ? 'w-8 h-8 flex items-center justify-center rounded bg-[#21262d] hover:bg-[#30363d] text-gray-400 hover:text-white transition-colors cursor-pointer' : 'w-8 h-8 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer'}>✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5" ref={containerRef}>
          {doc.content.trim() ? (
            <div className={`prose prose-sm max-w-none markdown-preview ${isDark ? 'markdown-dark' : 'markdown-light'}`} dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <div className="text-center py-12">
              <div className="text-3xl mb-3">📄</div>
              <div className={isDark ? 'text-[#6e7681] text-sm' : 'text-gray-400 text-sm'}>No content to preview</div>
            </div>
          )}
        </div>

        <div className={isDark ? 'flex items-center justify-between px-6 py-3 border-t border-[#21262d] bg-[#0d1117]' : 'flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50'}>
          <span className={isDark ? 'text-[11px] font-mono text-[#6e7681]' : 'text-[11px] font-mono text-gray-400'}>🔒 Local Only</span>
          <button onClick={onClose} className={isDark ? 'px-4 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-gray-300 text-[12px] rounded transition-colors cursor-pointer' : 'px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[12px] rounded transition-colors cursor-pointer'}>Close</button>
        </div>
      </div>
    </div>
  );
}