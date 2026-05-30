import { useEffect, useMemo, useRef } from 'react';
import type { Document } from '../types';
import { markdownToHtml } from '../utils/markdownToHtml';

interface PreviewModalProps {
  document: Document;
  isDark: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    MathJax?: {
      typesetPromise?: (elements?: HTMLElement[]) => Promise<void>;
    };
  }
}

export function PreviewModal({ document, isDark, onClose }: PreviewModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const htmlContent = useMemo(() => {
    return markdownToHtml(document.content || '');
  }, [document.content]);

  // Handle MathJax Typesetting
  useEffect(() => {
    const typeset = async () => {
      if (window.MathJax && window.MathJax.typesetPromise && contentRef.current) {
        try {
          // Reset MathJax if needed or just typeset
          await window.MathJax.typesetPromise([contentRef.current]);
        } catch (err) {
          console.error('MathJax typesetting failed:', err);
        }
      }
    };

    // Give a small delay to ensure DOM is updated
    const timer = setTimeout(typeset, 100);
    return () => clearTimeout(timer);
  }, [htmlContent]);

  // Load MathJax script and config
  useEffect(() => {
    if (!window.MathJax) {
      window.MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']],
          processEscapes: true,
          processEnvironments: true
        },
        options: {
          ignoreHtmlClass: 'tex2jax_ignore',
          processHtmlClass: 'tex2jax_process'
        },
        loader: { load: ['[tex]/ams'] }
      } as any;

      const script = window.document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      script.async = true;
      script.id = 'mathjax-script';
      window.document.head.appendChild(script);
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200"
        style={{
          backgroundColor: isDark ? '#161b22' : '#ffffff',
          border: '1px solid ' + (isDark ? '#30363d' : '#e5e7eb'),
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid ' + (isDark ? '#21262d' : '#e5e7eb') }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg shadow-sm"
              style={{ backgroundColor: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-sm" style={{ color: isDark ? '#e6edf3' : '#1f2937' }}>
                Rich Preview
              </h2>
              <p className="text-xs opacity-70" style={{ color: isDark ? '#8b949e' : '#6b7280' }}>
                {document.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-black/5 transition-colors"
            style={{ color: isDark ? '#8b949e' : '#6b7280' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Rendered Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto px-8 py-6 rich-preview-content tex2jax_process"
          style={{ color: isDark ? '#c9d1d9' : '#374151' }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-3 shrink-0 text-xs"
          style={{
            borderTop: '1px solid ' + (isDark ? '#21262d' : '#e5e7eb'),
            backgroundColor: isDark ? '#0d1117' : '#f9fafb',
            color: isDark ? '#6e7681' : '#9ca3af',
          }}
        >
          <div className="flex gap-4">
            <span>GFM Markdown</span>
            <span>MathJax (TeX)</span>
          </div>
          <span>Press ESC to close</span>
        </div>
      </div>

      <style>{`
        .rich-preview-content h1 { font-size: 2.25em; font-weight: 800; margin: 0.7em 0 0.4em; border-bottom: 2px solid ${isDark ? '#30363d' : '#eaecef'}; padding-bottom: 0.3em; }
        .rich-preview-content h2 { font-size: 1.75em; font-weight: 700; margin: 1em 0 0.4em; border-bottom: 1px solid ${isDark ? '#30363d' : '#eaecef'}; padding-bottom: 0.3em; }
        .rich-preview-content h3 { font-size: 1.5em; font-weight: 600; margin: 1.2em 0 0.4em; }
        .rich-preview-content p { margin: 1em 0; line-height: 1.8; }

        .rich-preview-content table { border-collapse: collapse; width: 100%; margin: 1.5em 0; overflow: hidden; border-radius: 8px; border: 1px solid ${isDark ? '#30363d' : '#e5e7eb'}; }
        .rich-preview-content th { background: ${isDark ? '#21262d' : '#f6f8fa'}; font-weight: 600; padding: 10px 14px; text-align: left; border: 1px solid ${isDark ? '#30363d' : '#e5e7eb'}; }
        .rich-preview-content td { padding: 10px 14px; border: 1px solid ${isDark ? '#30363d' : '#e5e7eb'}; }
        .rich-preview-content tr:nth-child(even) { background: ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'}; }

        .rich-preview-content blockquote {
          border-left: 5px solid #3b82f6;
          padding: 0.8em 1.25em;
          margin: 1.5em 0;
          background: ${isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.04)'};
          border-radius: 0 8px 8px 0;
          color: ${isDark ? '#8b949e' : '#4b5563'};
          font-style: italic;
        }

        .rich-preview-content details { border: 1px solid ${isDark ? '#30363d' : '#e5e7eb'}; border-radius: 6px; padding: 0.5em 1em; margin: 1em 0; }
        .rich-preview-content summary { font-weight: 600; cursor: pointer; }
        .rich-preview-content details[open] { padding-bottom: 1em; }
        .rich-preview-content details[open] summary { margin-bottom: 0.5em; border-bottom: 1px solid ${isDark ? '#30363d' : '#e5e7eb'}; padding-bottom: 0.3em; }

        .rich-preview-content pre {
          background: ${isDark ? '#0d1117' : '#f6f8fa'};
          border: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
          border-radius: 8px;
          padding: 1.25em;
          overflow-x: auto;
          margin: 1.5em 0;
        }
        .rich-preview-content code {
          font-family: 'ui-monospace', 'SFMono-Regular', 'SF Mono', Menlo, Monaco, Consolas, monospace;
          font-size: 0.9em;
        }
        .rich-preview-content :not(pre) > code {
          background: ${isDark ? 'rgba(110,118,129,0.3)' : 'rgba(175,184,193,0.2)'};
          padding: 0.2em 0.4em;
          border-radius: 4px;
        }
        .rich-preview-content ul, .rich-preview-content ol { padding-left: 2em; margin: 1em 0; }
        .rich-preview-content li { margin: 0.4em 0; }
      `}</style>
    </div>
  );
}
