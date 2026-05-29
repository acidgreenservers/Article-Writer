import { useState } from 'react';
import type { Document, UploadedImage } from '../types';
import { generateHtmlExport } from '../utils/htmlExportTemplate';

interface ExportModalProps {
  document: Document;
  images: UploadedImage[];
  format: 'md' | 'html';
  isDark: boolean;
  onClose: () => void;
}

export function ExportModal({ document, images, format, isDark, onClose }: ExportModalProps) {
  const [exportType, setExportType] = useState<'raw' | 'zip'>('raw');
  const [htmlTheme, setHtmlTheme] = useState<'light' | 'dark'>('dark');
  const [zipError, setZipError] = useState('');

  const handleExport = async () => {
    if (exportType === 'zip' && images.length === 0) {
      setZipError('No items found. Upload images before exporting as ZIP.');
      return;
    }

    setZipError('');

    if (format === 'html') {
      const htmlContent = generateHtmlExport(document, images, htmlTheme);

      if (exportType === 'raw') {
        downloadFile(htmlContent, `${document.title || 'untitled'}.html`, 'text/html');
        onClose();
      } else {
        try {
          const JSZip = (await import('https://esm.sh/jszip@3.10.1')).default;
          const zip = new JSZip();
          zip.file(`${document.title || 'untitled'}.html`, htmlContent);
          const itemsFolder = zip.folder('items');
          for (const img of images) {
            const buffer = await img.file.arrayBuffer();
            itemsFolder!.file(img.name, buffer);
          }
          const blob = await zip.generateAsync({ type: 'blob' });
          downloadBlob(blob, `${document.title || 'untitled'}.zip`);
          onClose();
        } catch (err) {
          console.error('[ExportModal] ZIP export error:', err);
          setZipError('Failed to create ZIP. Please try again.');
        }
      }
    } else {
      const mdContent = document.content || '';

      if (exportType === 'raw') {
        downloadFile(mdContent, `${document.title || 'untitled'}.md`, 'text/markdown');
        onClose();
      } else {
        try {
          const JSZip = (await import('https://esm.sh/jszip@3.10.1')).default;
          const zip = new JSZip();
          zip.file(`${document.title || 'untitled'}.md`, mdContent);
          const itemsFolder = zip.folder('items');
          for (const img of images) {
            const buffer = await img.file.arrayBuffer();
            itemsFolder!.file(img.name, buffer);
          }
          const blob = await zip.generateAsync({ type: 'blob' });
          downloadBlob(blob, `${document.title || 'untitled'}.zip`);
          onClose();
        } catch (err) {
          console.error('[ExportModal] ZIP export error:', err);
          setZipError('Failed to create ZIP. Please try again.');
        }
      }
    }
  };

  const formatLabel = format === 'html' ? 'HTML' : 'Markdown';
  const formatExt = format === 'html' ? '.html' : '.md';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg overflow-hidden shadow-2xl"
        style={{
          backgroundColor: isDark ? '#161b22' : '#ffffff',
          border: '1px solid ' + (isDark ? '#30363d' : '#e5e7eb'),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid ' + (isDark ? '#21262d' : '#e5e7eb') }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-full"
              style={{ backgroundColor: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-sm" style={{ color: isDark ? '#e6edf3' : '#1f2937' }}>
                Export {formatLabel}
              </h2>
              <p className="text-xs" style={{ color: isDark ? '#8b949e' : '#6b7280' }}>
                Choose your export format
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

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Export Type */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: isDark ? '#8b949e' : '#6b7280' }}>
              Export Type
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => { setExportType('raw'); setZipError(''); }}
                className="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all"
                style={{
                  backgroundColor: exportType === 'raw' ? (isDark ? '#1c2128' : '#eff6ff') : (isDark ? '#0d1117' : '#f9fafb'),
                  border: '1px solid ' + (exportType === 'raw' ? '#3b82f6' : (isDark ? '#30363d' : '#e5e7eb')),
                  color: exportType === 'raw' ? '#3b82f6' : (isDark ? '#8b949e' : '#6b7280'),
                }}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  Raw File
                </div>
                <div className="text-xs mt-0.5 opacity-70">{document.title || 'untitled'}{formatExt}</div>
              </button>
              <button
                onClick={() => { setExportType('zip'); setZipError(''); }}
                className="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all"
                style={{
                  backgroundColor: exportType === 'zip' ? (isDark ? '#1c2128' : '#eff6ff') : (isDark ? '#0d1117' : '#f9fafb'),
                  border: '1px solid ' + (exportType === 'zip' ? '#3b82f6' : (isDark ? '#30363d' : '#e5e7eb')),
                  color: exportType === 'zip' ? '#3b82f6' : (isDark ? '#8b949e' : '#6b7280'),
                }}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 8v13H3V8" />
                    <path d="M1 3h22v5H1z" />
                    <path d="M10 12h4" />
                  </svg>
                  ZIP Archive
                </div>
                <div className="text-xs mt-0.5 opacity-70">+ items/ folder</div>
              </button>
            </div>
          </div>

          {/* HTML Theme Selector — only for HTML exports */}
          {format === 'html' && (
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: isDark ? '#8b949e' : '#6b7280' }}>
                Export Theme
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setHtmlTheme('light')}
                  className="flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: htmlTheme === 'light' ? '#ffffff' : (isDark ? '#0d1117' : '#f3f4f6'),
                    border: '1px solid ' + (htmlTheme === 'light' ? '#3b82f6' : (isDark ? '#30363d' : '#e5e7eb')),
                    color: htmlTheme === 'light' ? '#1f2937' : (isDark ? '#8b949e' : '#6b7280'),
                    boxShadow: htmlTheme === 'light' ? '0 0 0 2px rgba(59,130,246,0.2)' : 'none',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                  Light
                </button>
                <button
                  onClick={() => setHtmlTheme('dark')}
                  className="flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: htmlTheme === 'dark' ? '#0d1117' : (isDark ? '#0d1117' : '#f3f4f6'),
                    border: '1px solid ' + (htmlTheme === 'dark' ? '#3b82f6' : (isDark ? '#30363d' : '#e5e7eb')),
                    color: htmlTheme === 'dark' ? '#e6edf3' : (isDark ? '#8b949e' : '#6b7280'),
                    boxShadow: htmlTheme === 'dark' ? '0 0 0 2px rgba(59,130,246,0.2)' : 'none',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  Dark
                </button>
              </div>
            </div>
          )}

          {/* ZIP Error */}
          {zipError && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm"
              style={{
                backgroundColor: isDark ? 'rgba(248,81,73,0.1)' : 'rgba(248,81,73,0.08)',
                border: '1px solid ' + (isDark ? 'rgba(248,81,73,0.3)' : 'rgba(248,81,73,0.2)'),
                color: '#f85149',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {zipError}
            </div>
          )}

          {/* Info */}
          {format === 'html' && (
            <div
              className="text-xs px-3 py-2 rounded-md"
              style={{
                backgroundColor: isDark ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.04)',
                border: '1px solid ' + (isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)'),
                color: isDark ? '#8b949e' : '#6b7280',
              }}
            >
              {exportType === 'raw'
                ? `Exports a standalone HTML file with the ${htmlTheme} theme applied.`
                : `Exports a ZIP with the HTML file and an items/ folder containing ${images.length} image(s).`}
            </div>
          )}
          {format === 'md' && (
            <div
              className="text-xs px-3 py-2 rounded-md"
              style={{
                backgroundColor: isDark ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.04)',
                border: '1px solid ' + (isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)'),
                color: isDark ? '#8b949e' : '#6b7280',
              }}
            >
              {exportType === 'raw'
                ? 'Exports a raw Markdown file.'
                : `Exports a ZIP with the Markdown file and an items/ folder containing ${images.length} image(s).`}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2 px-5 py-3"
          style={{
            borderTop: '1px solid ' + (isDark ? '#21262d' : '#e5e7eb'),
            backgroundColor: isDark ? '#0d1117' : '#f9fafb',
          }}
        >
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
            style={{
              backgroundColor: isDark ? '#21262d' : '#e5e7eb',
              color: isDark ? '#c9d1d9' : '#374151',
              border: '1px solid ' + (isDark ? '#30363d' : '#d1d5db'),
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
            style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#3b82f6'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export {formatLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}