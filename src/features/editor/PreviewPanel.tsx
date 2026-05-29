import React, { useEffect, useRef } from 'react';
import { renderMarkdownToHTML } from '../markdown';

interface PreviewPanelProps {
  content: string;
  isDark: boolean;
}

export default function PreviewPanel({ content, isDark }: PreviewPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const html = content.trim() ? renderMarkdownToHTML(content) : '';

  useEffect(() => {
    if (!containerRef.current || !content.trim()) return;
    const w = window as any;
    if (w.MathJax?.typesetPromise) {
      w.MathJax.typesetClear([containerRef.current]);
      w.MathJax.typesetPromise([containerRef.current]).catch(() => {});
    }
  }, [content]);

  if (!content.trim()) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className={isDark ? 'text-[#6e7681] text-sm italic' : 'text-gray-400 text-sm italic'}>Nothing to preview</div>
          <div className={isDark ? 'text-[#484f58] text-[11px] font-mono mt-1' : 'text-gray-300 text-[11px] font-mono mt-1'}>Write something to see it rendered here</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-y-auto p-6 markdown-preview ${isDark ? 'markdown-dark' : 'markdown-light'}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}