import { useState, useEffect, useRef } from 'react';

interface LinkModalProps {
  isDark: boolean;
  onInsert: (markdown: string) => void;
  onClose: () => void;
}

export function LinkModal({ isDark, onInsert, onClose }: LinkModalProps) {
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const textRef = useRef<HTMLInputElement>(null);

  useEffect(() => { textRef.current?.focus(); }, []);

  const handleInsert = () => {
    const displayText = text.trim() || 'link text';
    const linkUrl = url.trim() || 'url';
    onInsert(`[${displayText}](${linkUrl})`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-lg overflow-hidden shadow-2xl" style={{ backgroundColor: isDark ? '#161b22' : '#fff', border: '1px solid ' + (isDark ? '#30363d' : '#e5e7eb') }} onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid ' + (isDark ? '#21262d' : '#e5e7eb') }}>
          <h2 className="font-semibold text-sm" style={{ color: isDark ? '#e6edf3' : '#1f2937' }}>Insert Link</h2>
          <p className="text-xs mt-0.5" style={{ color: isDark ? '#8b949e' : '#6b7280' }}>Add a markdown link</p>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: isDark ? '#8b949e' : '#6b7280' }}>Display Text</label>
            <input ref={textRef} type="text" value={text} onChange={e => setText(e.target.value)} placeholder="My link" className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{ backgroundColor: isDark ? '#0d1117' : '#f9fafb', color: isDark ? '#e6edf3' : '#1f2937', border: '1px solid ' + (isDark ? '#30363d' : '#d1d5db') }} onKeyDown={e => { if (e.key === 'Enter') handleInsert(); if (e.key === 'Escape') onClose(); }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: isDark ? '#8b949e' : '#6b7280' }}>URL</label>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" className="w-full px-3 py-2 rounded-md text-sm outline-none font-mono" style={{ backgroundColor: isDark ? '#0d1117' : '#f9fafb', color: isDark ? '#e6edf3' : '#1f2937', border: '1px solid ' + (isDark ? '#30363d' : '#d1d5db') }} onKeyDown={e => { if (e.key === 'Enter') handleInsert(); if (e.key === 'Escape') onClose(); }} />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3" style={{ borderTop: '1px solid ' + (isDark ? '#21262d' : '#e5e7eb'), backgroundColor: isDark ? '#0d1117' : '#f9fafb' }}>
          <button onClick={onClose} className="px-4 py-1.5 rounded-md text-sm font-medium" style={{ backgroundColor: isDark ? '#21262d' : '#e5e7eb', color: isDark ? '#c9d1d9' : '#374151' }}>Cancel</button>
          <button onClick={handleInsert} className="px-4 py-1.5 rounded-md text-sm font-medium text-white" style={{ backgroundColor: '#3b82f6' }}>Insert Link</button>
        </div>
      </div>
    </div>
  );
}