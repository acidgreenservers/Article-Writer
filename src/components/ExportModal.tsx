import { useState } from 'react';
import type { Document, UploadedImage } from '../types';
import { exportAsRawMarkdown, exportAsRawHtml, exportAsZip } from '../utils/exporter';

interface ExportModalProps {
  document: Document;
  images: UploadedImage[];
  format: 'md' | 'html';
  isDark: boolean;
  onClose: () => void;
}

export function ExportModal({ document, images, format, isDark, onClose }: ExportModalProps) {
  const [exportType, setExportType] = useState<'raw' | 'zip'>('raw');
  const [htmlTheme, setHtmlTheme] = useState<'light' | 'dark'>(isDark ? 'dark' : 'light');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (exportType === 'zip') {
        await exportAsZip(document, images, format, htmlTheme);
      } else {
        if (format === 'html') {
          await exportAsRawHtml(document, htmlTheme);
        } else {
          await exportAsRawMarkdown(document);
        }
      }
      onClose();
    } catch (err) {
      console.error('[ExportModal] Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const formatLabel = format === 'html' ? 'HTML' : 'Markdown';
  const formatExt = format === 'html' ? '.html' : '.md';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200"
        style={{
          backgroundColor: isDark ? '#161b22' : '#ffffff',
          border: '1px solid ' + (isDark ? '#30363d' : '#e5e7eb'),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid ' + (isDark ? '#21262d' : '#e5e7eb') }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg"
              style={{ backgroundColor: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-sm" style={{ color: isDark ? '#e6edf3' : '#1f2937' }}>
                Export {formatLabel}
              </h2>
              <p className="text-xs opacity-70" style={{ color: isDark ? '#8b949e' : '#6b7280' }}>
                Select distribution method
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-black/5 transition-colors"
            style={{ color: isDark ? '#8b949e' : '#6b7280' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: isDark ? '#8b949e' : '#6b7280' }}>
              Method
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setExportType('raw')}
                className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all group"
                style={{
                  backgroundColor: exportType === 'raw' ? (isDark ? '#1c2128' : '#eff6ff') : 'transparent',
                  borderColor: exportType === 'raw' ? '#3b82f6' : (isDark ? '#30363d' : '#e5e7eb'),
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: exportType === 'raw' ? '#3b82f6' : (isDark ? '#21262d' : '#f3f4f6') }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={exportType === 'raw' ? '#fff' : '#3b82f6'} strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold" style={{ color: isDark ? '#e6edf3' : '#1f2937' }}>Raw File</div>
                  <div className="text-[10px] opacity-60" style={{ color: isDark ? '#8b949e' : '#6b7280' }}>
                    {formatExt} only
                  </div>
                </div>
              </button>

              <button
                onClick={() => setExportType('zip')}
                className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all group"
                style={{
                  backgroundColor: exportType === 'zip' ? (isDark ? '#1c2128' : '#eff6ff') : 'transparent',
                  borderColor: exportType === 'zip' ? '#3b82f6' : (isDark ? '#30363d' : '#e5e7eb'),
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: exportType === 'zip' ? '#3b82f6' : (isDark ? '#21262d' : '#f3f4f6') }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={exportType === 'zip' ? '#fff' : '#3b82f6'} strokeWidth="2">
                    <path d="M21 8v13H3V8" />
                    <path d="M1 3h22v5H1z" />
                    <path d="M10 12h4" />
                  </svg>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold" style={{ color: isDark ? '#e6edf3' : '#1f2937' }}>ZIP Bundle</div>
                  <div className="text-[10px] opacity-60" style={{ color: isDark ? '#8b949e' : '#6b7280' }}>
                    {images.length} item{images.length !== 1 ? 's' : ''} included
                  </div>
                </div>
              </button>
            </div>
          </div>

          {format === 'html' && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: isDark ? '#8b949e' : '#6b7280' }}>
                Appearance
              </label>
              <div className="flex gap-2 p-1 rounded-lg" style={{ backgroundColor: isDark ? '#0d1117' : '#f3f4f6' }}>
                <button
                  onClick={() => setHtmlTheme('light')}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold transition-all"
                  style={{
                    backgroundColor: htmlTheme === 'light' ? (isDark ? '#30363d' : '#ffffff') : 'transparent',
                    color: htmlTheme === 'light' ? (isDark ? '#fff' : '#1f2937') : (isDark ? '#8b949e' : '#6b7280'),
                    boxShadow: htmlTheme === 'light' && !isDark ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  ☀️ Light
                </button>
                <button
                  onClick={() => setHtmlTheme('dark')}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold transition-all"
                  style={{
                    backgroundColor: htmlTheme === 'dark' ? (isDark ? '#30363d' : '#ffffff') : 'transparent',
                    color: htmlTheme === 'dark' ? (isDark ? '#fff' : '#1f2937') : (isDark ? '#8b949e' : '#6b7280'),
                    boxShadow: htmlTheme === 'dark' && !isDark ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  🌙 Dark
                </button>
              </div>
            </div>
          )}

          <div
            className="p-4 rounded-lg text-xs leading-relaxed"
            style={{
              backgroundColor: isDark ? '#0d1117' : '#f9fafb',
              border: '1px solid ' + (isDark ? '#21262d' : '#e5e7eb'),
              color: isDark ? '#8b949e' : '#6b7280'
            }}
          >
            {exportType === 'zip'
              ? `Creating a production-ready ZIP archive containing your ${formatLabel} document (${htmlTheme} theme) and all ${images.length} attached assets.`
              : `Downloading the standalone ${formatLabel} document (${htmlTheme} theme) directly to your device.`}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4"
          style={{
            borderTop: '1px solid ' + (isDark ? '#21262d' : '#e5e7eb'),
            backgroundColor: isDark ? '#0d1117' : '#f9fafb',
          }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              color: isDark ? '#8b949e' : '#6b7280',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold text-white transition-all shadow-md"
            style={{
              backgroundColor: '#3b82f6',
              opacity: isExporting ? 0.7 : 1,
              cursor: isExporting ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => { if (!isExporting) e.currentTarget.style.backgroundColor = '#2563eb'; }}
            onMouseLeave={(e) => { if (!isExporting) e.currentTarget.style.backgroundColor = '#3b82f6'; }}
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
}
