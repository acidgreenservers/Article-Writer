import { useEffect, useRef, useState } from 'react';
import { renderMarkdown } from '../utils/markdownRenderer';

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mathJaxReady, setMathJaxReady] = useState(false);
  const [mathJaxLoading, setMathJaxLoading] = useState(true);
  const renderedHtml = content ? renderMarkdown(content) : '';

  useEffect(() => {
    const w = window as any;
    if (w.MathJax?.typesetPromise) {
      setMathJaxReady(true);
      setMathJaxLoading(false);
      return;
    }

    const existingScript = document.querySelector('script[src*="mathjax"]');
    if (existingScript) {
      const checkReady = setInterval(() => {
        if (w.MathJax?.typesetPromise) {
          setMathJaxReady(true);
          setMathJaxLoading(false);
          clearInterval(checkReady);
        }
      }, 100);
      const timeout = setTimeout(() => {
        clearInterval(checkReady);
        setMathJaxLoading(false);
      }, 15000);
      return () => { clearInterval(checkReady); clearTimeout(timeout); };
    }

    w.MathJax = {
      tex: {
        inlineMath: [['\\(', '\\)']],
        displayMath: [['\\[', '\\]']],
        processEscapes: true,
      },
      options: { skipHtmlTags: ['script', 'noscript', 'style', 'textarea'] },
      startup: {
        ready: () => {
          w.MathJax.startup.defaultReady();
          setMathJaxReady(true);
          setMathJaxLoading(false);
        },
      },
    };

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
    script.async = true;
    script.onerror = () => { setMathJaxLoading(false); };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!mathJaxReady || !containerRef.current) return;
    const w = window as any;
    if (!w.MathJax?.typesetPromise) return;
    w.MathJax.typesetClear([containerRef.current]);
    w.MathJax.typesetPromise([containerRef.current]).catch(() => {});
  }, [renderedHtml, mathJaxReady]);

  if (!content.trim()) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#6e7681] text-sm italic">Nothing to preview</div>
          <div className="text-[#484f58] text-[11px] font-mono mt-1">Write something to see it rendered here</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {mathJaxLoading && (
        <div className="px-6 pt-3 pb-1">
          <span className="text-[10px] font-mono text-[#6e7681] uppercase tracking-wider">Loading MathJax...</span>
        </div>
      )}
      <div
        ref={containerRef}
        className="markdown-preview px-6 py-4"
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    </div>
  );
}