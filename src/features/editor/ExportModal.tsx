import React from 'react';
import type { Document, DocumentImage, ExportFormat } from '../../types';
import { countWords } from '../../utils/documentUtils';

interface ExportModalProps {
  document: Document;
  images: DocumentImage[];
  onExport: (format: ExportFormat, theme: 'light' | 'dark') => void;
  onClose: () => void;
  isDark: boolean;
}

export default function ExportModal({ document: doc, images, onExport, onClose, isDark }: ExportModalProps) {
  const wordCount = countWords(doc.content);
  const label = isDark ? 'text-[#e6edf3]' : 'text-gray-900';
  const sublabel = isDark ? 'text-[#6e7681]' : 'text-gray-400';
  const cardDark = 'bg-[#0d1117] hover:bg-[#1c2128] border-[#30363d]';
  const cardLight = 'bg-gray-50 hover:bg-gray-100 border-gray-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={isDark ? 'relative w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden' : 'relative w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden'}>
        <div className={isDark ? 'flex items-center justify-between px-6 py-4 border-b border-[#21262d]' : 'flex items-center justify-between px-6 py-4 border-b border-gray-100'}>
          <h2 className={`text-lg font-semibold ${label}`}>Export Document</h2>
          <button onClick={onClose} className={isDark ? 'w-8 h-8 flex items-center justify-center rounded bg-[#21262d] hover:bg-[#30363d] text-gray-400 hover:text-white transition-colors cursor-pointer' : 'w-8 h-8 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer'}>✕</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <div className={`text-sm font-medium ${label}`}>{doc.title}</div>
            <div className={`text-[11px] mt-1 ${sublabel}`}>{wordCount} words • {images.length} image{images.length !== 1 ? 's' : ''}</div>
          </div>

          <div className="space-y-2">
            <button onClick={() => onExport('markdown', 'light')} className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer text-left border ${isDark ? cardDark : cardLight}`}>
              <span className="text-xl">📦</span>
              <div>
                <div className={`text-sm font-medium ${label}`}>Markdown (.md)</div>
                <div className={`text-[11px] ${sublabel}`}>Plain text with markdown formatting</div>
              </div>
            </button>

            <button onClick={() => onExport('html', 'light')} className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer text-left border ${isDark ? cardDark : cardLight}`}>
              <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-base">☀️</span>
              </div>
              <div>
                <div className={`text-sm font-medium ${label}`}>HTML — Light Theme</div>
                <div className={`text-[11px] ${sublabel}`}>Styled HTML with light background</div>
              </div>
            </button>

            <button onClick={() => onExport('html', 'dark')} className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer text-left border ${isDark ? cardDark : cardLight}`}>
              <div className="w-9 h-9 rounded-lg bg-[#0d1117] border border-[#30363d] flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-base">🌙</span>
              </div>
              <div>
                <div className={`text-sm font-medium ${label}`}>HTML — Dark Theme</div>
                <div className={`text-[11px] ${sublabel}`}>Styled HTML with dark background</div>
              </div>
            </button>
          </div>
        </div>

        <div className={isDark ? 'flex items-center justify-end px-6 py-3 border-t border-[#21262d] bg-[#0d1117]' : 'flex items-center justify-end px-6 py-3 border-t border-gray-100 bg-gray-50'}>
          <button onClick={onClose} className={isDark ? 'px-4 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-gray-300 text-[12px] rounded transition-colors cursor-pointer' : 'px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[12px] rounded transition-colors cursor-pointer'}>Cancel</button>
        </div>
      </div>
    </div>
  );
}