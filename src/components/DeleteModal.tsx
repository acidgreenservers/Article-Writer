import type { ThemeColors } from '../utils/theme';

interface DeleteModalProps {
  documentTitle: string;
  onConfirm: () => void;
  onClose: () => void;
  theme: ThemeColors;
}

export function DeleteModal({ documentTitle, onConfirm, onClose, theme }: DeleteModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: theme.modalOverlay }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg p-6 shadow-2xl"
        style={{ backgroundColor: theme.modalBg, border: `1px solid ${theme.borderColor}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
            style={{ backgroundColor: theme.dangerBg }}
          >
            <span className="text-lg">⚠️</span>
          </div>
          <div>
            <h3 className="text-base font-semibold" style={{ color: theme.primaryText }}>
              Delete Document
            </h3>
            <p className="text-sm mt-0.5" style={{ color: theme.mutedText }}>
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div
          className="rounded-md px-4 py-3 mb-5 text-sm"
          style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.borderColor}` }}
        >
          <span style={{ color: theme.mutedText }}>Deleting: </span>
          <span className="font-medium" style={{ color: theme.primaryText }}>
            {documentTitle || 'Untitled Document'}
          </span>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
            style={{
              backgroundColor: theme.toolbarBtnBg,
              color: theme.primaryText,
              border: `1px solid ${theme.borderColor}`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.toolbarBtnHoverBg; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.toolbarBtnBg; }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
            style={{
              backgroundColor: theme.dangerBg,
              color: theme.dangerText,
              border: `1px solid ${theme.dangerText}33`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.dangerHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.dangerBg; }}
          >
            🗑️ Delete Document
          </button>
        </div>
      </div>
    </div>
  );
}