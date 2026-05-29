interface DeleteConfirmModalProps {
  documentTitle: string;
  isDark: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({ documentTitle, isDark, onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)' }} onClick={onCancel}>
      <div className="w-full max-w-md rounded-lg overflow-hidden shadow-2xl" style={{ backgroundColor: isDark ? '#161b22' : '#fff', border: '1px solid ' + (isDark ? '#30363d' : '#e5e7eb') }} onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid ' + (isDark ? '#21262d' : '#e5e7eb') }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full" style={{ backgroundColor: isDark ? 'rgba(248,81,73,0.12)' : 'rgba(248,81,73,0.08)' }}>
              <span className="text-lg">🗑️</span>
            </div>
            <div>
              <h2 className="font-semibold text-base" style={{ color: isDark ? '#e6edf3' : '#1f2937' }}>Delete Document</h2>
              <p className="text-xs mt-0.5" style={{ color: isDark ? '#8b949e' : '#6b7280' }}>This action cannot be undone</p>
            </div>
          </div>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm leading-relaxed" style={{ color: isDark ? '#c9d1d9' : '#4b5563' }}>
            Are you sure you want to delete <span className="font-semibold" style={{ color: isDark ? '#e6edf3' : '#1f2937' }}>"{documentTitle}"</span>? This will permanently remove the document and all its content.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3" style={{ borderTop: '1px solid ' + (isDark ? '#21262d' : '#e5e7eb'), backgroundColor: isDark ? '#0d1117' : '#f9fafb' }}>
          <button onClick={onCancel} className="px-4 py-1.5 rounded-md text-sm font-medium" style={{ backgroundColor: isDark ? '#21262d' : '#e5e7eb', color: isDark ? '#c9d1d9' : '#374151', border: '1px solid ' + (isDark ? '#30363d' : '#d1d5db') }}>Cancel</button>
          <button onClick={onConfirm} className="px-4 py-1.5 rounded-md text-sm font-medium text-white" style={{ backgroundColor: '#da3633' }}>🗑️ Delete Document</button>
        </div>
      </div>
    </div>
  );
}