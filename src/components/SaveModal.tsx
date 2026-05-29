import { useState } from 'react';
import type { ThemeColors } from '../utils/theme';
import type { Document, UploadedImage } from '../types';

interface SaveModalProps {
  document: Document;
  images: UploadedImage[];
  onSave: () => void;
  onClose: () => void;
  theme: ThemeColors;
}

export function SaveModal({ document: doc, images, onSave, onClose, theme }: SaveModalProps) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      onSave();
      setSaveStatus('saved');
      setTimeout(() => {
        onClose();
      }, 1200);
    }, 600);
  };

  const wordCount = doc.content.trim() ? doc.content.trim().split(/\s+/).length : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: theme.modalOverlay }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg shadow-2xl"
        style={{ backgroundColor: theme.modalBg, border: `1px solid ${theme.borderColor}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${theme.borderColor}` }}>
          <div className="flex items-center gap-2">
            <span className="text-lg">💾</span>
            <h3 className="text-base font-semibold" style={{ color: theme.primaryText }}>
              Save Document
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded transition-colors"
            style={{ color: theme.mutedText }}
            onMouseEnter={(e) => { e.currentTarget.style.color = theme.primaryText; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = theme.mutedText; }}
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div
            className="rounded-md px-4 py-3"
            style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.borderColor}` }}
          >
            <div className="text-sm font-medium" style={{ color: theme.primaryText }}>
              {doc.title || 'Untitled Document'}
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: theme.mutedText }}>
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{doc.tags.length} tag{doc.tags.length !== 1 ? 's' : ''}</span>
              <span>•</span>
              <span>{images.length} image{images.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {saveStatus === 'saved' && (
            <div
              className="rounded-md px-4 py-3 text-sm flex items-center gap-2"
              style={{ backgroundColor: theme.dangerBg === '#4a1e1e' ? '#1a3a1a' : '#dcfce7', color: theme.successText }}
            >
              <span>✅</span> Document saved successfully!
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-3" style={{ borderTop: `1px solid ${theme.borderColor}` }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
            style={{
              backgroundColor: theme.toolbarBtnBg,
              color: theme.primaryText,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.toolbarBtnHoverBg; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.toolbarBtnBg; }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saveStatus !== 'idle'}
            className="px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            style={{
              backgroundColor: theme.accentBlue,
              color: '#ffffff',
            }}
            onMouseEnter={(e) => { if (saveStatus === 'idle') e.currentTarget.style.backgroundColor = '#2563eb'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.accentBlue; }}
          >
            {saveStatus === 'saving' ? '💾 Saving...' : saveStatus === 'saved' ? '✅ Saved!' : '💾 Save'}
          </button>
        </div>
      </div>
    </div>
  );
}