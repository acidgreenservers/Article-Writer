import { useEffect, useMemo, useRef } from 'react';
import type { Document } from '../types';
import { markdownToHtml } from '../utils/markdownToHtml';

interface PreviewModalProps {
  document: Document;
  isDark: boolean;
  onClose: () => void;
}

export function PreviewModal({ document, isDark, onClose }: PreviewModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const htmlContent = useMemo(() => {
    try {
      return markdownToHtml(document.content || '');
    } catch (err) {
      console.error('[PreviewModal] markdownToHtml error:', err);
      return `<p style="color:#f85149">Error rendering preview: ${(err as Error).message}</p>`;
    }
  }, [document.content]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-lg overflow-hidden shadow-2xl flex flex-col"
        style={{
          backgroundColor: isDark ? '#161b22' : '#ffffff',
          border: '1px solid ' + (isDark ? '#30363d' : '#e5e7eb'),
          maxHeight: '85vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 shrink-0"
          style={{ borderBottom: '1px solid ' + (isDark ? '#21262d' : '#e5e7eb') }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center w-7 h-7 rounded-full"
              style={{ backgroundColor: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-sm" style={{ color: isDark ? '#e6edf3' : '#1f2937' }}>
                Preview
              </h2>
              <p className="text-xs" style={{ color: isDark ? '#8b949e' : '#6b7280' }}>
                {document.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-md transition-colors"
            style={{ backgroundColor: isDark ? '#21262d' : '#f3f4f6', color: isDark ? '#8b949e' : '#6b7280' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Rendered Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto px-6 py-5 preview-content"
          style={{ color: isDark ? '#c9d1d9' : '#374151' }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-2.5 shrink-0 text-xs"
          style={{
            borderTop: '1px solid ' + (isDark ? '#21262d' : '#e5e7eb'),
            backgroundColor: isDark ? '#0d1117' : '#f9fafb',
            color: isDark ? '#6e7681' : '#9ca3af',
          }}
        >
          <span>Markdown Preview</span>
          <span>Press ESC to close</span>
        </div>
      </div>

      {/* Scoped styles for rendered markdown */}
      <style>{`
        .preview-content .md-h1 { font-size: 2em; font-weight: 700; margin: 0.67em 0 0.3em; border-bottom: 1px solid ${isDark ? '#21262d' : '#e5e7eb'}; padding-bottom: 0.3em; }
        .preview-content .md-h2 { font-size: 1.5em; font-weight: 600; margin: 0.83em 0 0.3em; border-bottom: 1px solid ${isDark ? '#21262d' : '#e5e7eb'}; padding-bottom: 0.3em; }
        .preview-content .md-h3 { font-size: 1.25em; font-weight: 600; margin: 1em 0 0.3em; }
        .preview-content .md-h4 { font-size: 1em; font-weight: 600; margin: 1em 0 0.3em; }
        .preview-content .md-h5 { font-size: 0.875em; font-weight: 600; margin: 1em 0 0.3em; }
        .preview-content .md-h6 { font-size: 0.85em; font-weight: 600; margin: 1em 0 0.3em; color: ${isDark ? '#8b949e' : '#6b7280'}; }
        .preview-content .md-p { margin: 0.6em 0; line-height: 1.7; }
        .preview-content .md-ul { list-style: disc; padding-left: 2em; margin: 0.5em 0; }
        .preview-content .md-ol { list-style: decimal; padding-left: 2em; margin: 0.5em 0; }
        .preview-content .md-li { margin: 0.25em 0; line-height: 1.6; }
        .preview-content .md-blockquote {
          border-left: 4px solid ${isDark ? '#3b82f6' : '#3b82f6'};
          padding: 0.5em 1em;
          margin: 0.8em 0;
          background: ${isDark ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.04)'};
          border-radius: 0 6px 6px 0;
        }
        .preview-content .md-pre {
          background: ${isDark ? '#0d1117' : '#f6f8fa'};
          border: 1px solid ${isDark ? '#30363d' : '#d0d7de'};
          border-radius: 6px;
          padding: 1em;
          overflow-x: auto;
          margin: 0.8em 0;
          font-size: 0.875em;
        }
        .preview-content .md-pre code {
          font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
          background: none;
          padding: 0;
          border-radius: 0;
          font-size: inherit;
        }
        .preview-content .inline-code {
          background: ${isDark ? 'rgba(110,118,129,0.25)' : 'rgba(175,184,193,0.2)'};
          padding: 0.15em 0.4em;
          border-radius: 4px;
          font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
          font-size: 0.875em;
        }
        .preview-content .md-link {
          color: #58a6ff;
          text-decoration: none;
        }
        .preview-content .md-link:hover {
          text-decoration: underline;
        }
        .preview-content .md-img {
          max-width: 100%;
          border-radius: 6px;
          margin: 0.5em 0;
        }
        .preview-content .md-mark {
          background: ${isDark ? 'rgba(210,153,34,0.25)' : '#fff3bf'};
          padding: 0.1em 0.3em;
          border-radius: 3px;
        }
        .preview-content .md-kbd {
          background: ${isDark ? '#21262d' : '#f3f4f6'};
          border: 1px solid ${isDark ? '#30363d' : '#d1d5db'};
          border-radius: 4px;
          padding: 0.1em 0.5em;
          font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
          font-size: 0.8em;
          box-shadow: inset 0 -1px 0 ${isDark ? '#30363d' : '#d1d5db'};
        }
        .preview-content strong { font-weight: 700; }
        .preview-content em { font-style: italic; }
        .preview-content del { text-decoration: line-through; color: ${isDark ? '#8b949e' : '#6b7280'}; }
        .preview-content u { text-decoration: underline; }
      `}</style>
    </div>
  );
}