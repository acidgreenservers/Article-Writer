import type { ThemeColors } from '../utils/theme';
import type { UploadedImage } from '../types';

interface ImageListModalProps {
  images: UploadedImage[];
  onRemoveImage: (id: string) => void;
  onInsertMarkdown: (image: UploadedImage) => void;
  onClose: () => void;
  theme: ThemeColors;
}

export function ImageListModal({ images, onRemoveImage, onInsertMarkdown, onClose, theme }: ImageListModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: theme.modalOverlay }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg shadow-2xl"
        style={{ backgroundColor: theme.modalBg, border: `1px solid ${theme.borderColor}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${theme.borderColor}` }}>
          <div className="flex items-center gap-2">
            <span className="text-lg">🖼️</span>
            <h3 className="text-base font-semibold" style={{ color: theme.primaryText }}>
              Uploaded Items
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: theme.mutedText }}>
              {images.length} item{images.length !== 1 ? 's' : ''}
            </span>
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
        </div>

        <div className="px-5 py-4 max-h-96 overflow-y-auto">
          {images.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-3xl block mb-3">📷</span>
              <p className="text-sm" style={{ color: theme.mutedText }}>
                No items uploaded yet.
              </p>
              <p className="text-xs mt-1" style={{ color: theme.mutedText }}>
                Use the 🖼️ button in the toolbar to upload items.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {images.map(img => (
                <div
                  key={img.id}
                  className="flex items-center gap-3 rounded-md p-3"
                  style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.borderColor}` }}
                >
                  <div
                    className="w-14 h-14 rounded overflow-hidden shrink-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${img.url})` }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: theme.primaryText }}>
                      {img.name}
                    </div>
                    <div className="text-xs mt-0.5 font-mono" style={{ color: theme.mutedText }}>
                      items/{img.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onInsertMarkdown(img)}
                      className="px-2.5 py-1.5 rounded text-xs font-medium transition-colors"
                      style={{ backgroundColor: theme.accentBlue, color: '#ffffff' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.accentBlue; }}
                    >
                      Insert
                    </button>
                    <button
                      onClick={() => onRemoveImage(img.id)}
                      className="px-2.5 py-1.5 rounded text-xs font-medium transition-colors"
                      style={{ backgroundColor: theme.dangerBg, color: theme.dangerText }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.dangerHover; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.dangerBg; }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end px-5 py-3" style={{ borderTop: `1px solid ${theme.borderColor}` }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
            style={{ backgroundColor: theme.toolbarBtnBg, color: theme.primaryText }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.toolbarBtnHoverBg; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.toolbarBtnBg; }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}