import type { UploadedImage } from '../types';

interface UploadedItemsModalProps {
  images: UploadedImage[];
  isDark: boolean;
  onInsert: (markdown: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function UploadedItemsModal({ images, isDark, onInsert, onDelete, onClose }: UploadedItemsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-lg overflow-hidden shadow-2xl" style={{ backgroundColor: isDark ? '#161b22' : '#fff', border: '1px solid ' + (isDark ? '#30363d' : '#e5e7eb') }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid ' + (isDark ? '#21262d' : '#e5e7eb') }}>
          <div className="flex items-center gap-2">
            <span className="text-lg">🖼️</span>
            <h3 className="font-semibold text-sm" style={{ color: isDark ? '#e6edf3' : '#1f2937' }}>Uploaded Items</h3>
            <span className="text-xs" style={{ color: isDark ? '#6e7681' : '#9ca3af' }}>{images.length} item{images.length !== 1 ? 's' : ''}</span>
          </div>
          <button onClick={onClose} className="flex items-center justify-center w-7 h-7 rounded-md" style={{ backgroundColor: isDark ? '#21262d' : '#f3f4f6', color: isDark ? '#8b949e' : '#6b7280' }}>✕</button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {images.length === 0 ? (
            <div className="py-10 text-center"><p className="text-sm" style={{ color: isDark ? '#8b949e' : '#9ca3af' }}>No uploaded images yet</p></div>
          ) : images.map(img => (
            <div key={img.id} className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: '1px solid ' + (isDark ? '#21262d' : '#f3f4f6') }}>
              <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isDark ? '#21262d' : '#e5e7eb' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#58a6ff' : '#2563eb'} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate" style={{ color: isDark ? '#e6edf3' : '#1f2937' }}>{img.name}</p>
                <p className="text-xs font-mono" style={{ color: isDark ? '#6e7681' : '#9ca3af' }}>items/{img.name}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => onInsert(`![${img.name}](items/${img.name})`)} className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-white" style={{ backgroundColor: isDark ? '#238636' : '#10b981' }}>+ Insert</button>
                <button onClick={() => onDelete(img.id)} className="flex items-center justify-center w-7 h-7 rounded" style={{ backgroundColor: isDark ? '#21262d' : '#f3f4f6', color: isDark ? '#f85149' : '#ef4444' }}>✕</button>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 flex justify-end" style={{ borderTop: '1px solid ' + (isDark ? '#21262d' : '#e5e7eb'), backgroundColor: isDark ? '#0d1117' : '#f9fafb' }}>
          <button onClick={onClose} className="px-4 py-1.5 rounded-md text-sm font-medium" style={{ backgroundColor: isDark ? '#21262d' : '#e5e7eb', color: isDark ? '#c9d1d9' : '#374151', border: '1px solid ' + (isDark ? '#30363d' : '#d1d5db') }}>Close</button>
        </div>
      </div>
    </div>
  );
}