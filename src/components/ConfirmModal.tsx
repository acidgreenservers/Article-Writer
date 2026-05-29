import React, { useEffect } from 'react';

interface ConfirmModalProps {
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDark: boolean;
}

export default function ConfirmModal({ title, message, confirmLabel = 'Delete', onConfirm, onCancel, isDark }: ConfirmModalProps) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className={isDark ? 'relative w-full max-w-sm bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden' : 'relative w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden'}>
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🗑️</span>
            </div>
            <h2 className={isDark ? 'text-lg font-semibold text-[#e6edf3]' : 'text-lg font-semibold text-gray-900'}>{title}</h2>
          </div>
          <p className={isDark ? 'text-sm text-[#8b949e] leading-relaxed pl-[52px]' : 'text-sm text-gray-500 leading-relaxed pl-[52px]'}>{message}</p>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4">
          <button onClick={onCancel} className={isDark ? 'px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-gray-300 text-sm font-medium rounded-lg transition-colors cursor-pointer' : 'px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium rounded-lg transition-colors cursor-pointer'}>Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer shadow-sm">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}