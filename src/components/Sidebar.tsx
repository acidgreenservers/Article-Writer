import type { Document } from '../types';
import { countWords, formatTags } from '../utils/documentUtils';

interface SidebarProps {
  documents: Document[];
  activeDocId: string | null;
  onSelectDoc: (id: string) => void;
  onNewDoc: () => void;
  onInfoClick: () => void;
  isDark: boolean;
}

export function Sidebar({ documents, activeDocId, onSelectDoc, onNewDoc, onInfoClick, isDark }: SidebarProps) {
  const totalWords = documents.reduce((sum, d) => sum + countWords(d.content), 0);

  return (
    <div
      className="flex flex-col h-full"
      style={{
        width: 220,
        minWidth: 220,
        backgroundColor: isDark ? '#0f1419' : '#f3f4f6',
        borderRight: '1px solid ' + (isDark ? '#30363d' : '#e5e7eb'),
      }}
    >
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={onInfoClick}
          className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity cursor-pointer text-left w-full"
        >
          <span className="text-lg">📝</span>
          <span className="font-semibold text-sm" style={{ color: isDark ? '#e6edf3' : '#1f2937' }}>Article Writer</span>
        </button>
        <button
          onClick={onNewDoc}
          className="w-full py-2 px-3 rounded-md text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: '#3b82f6' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#3b82f6'; }}
        >
          + New Document
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {documents.map(doc => {
          const isActive = doc.id === activeDocId;
          const wc = countWords(doc.content);
          return (
            <button
              key={doc.id}
              onClick={() => onSelectDoc(doc.id)}
              className="w-full text-left px-3 py-2.5 rounded-md transition-colors"
              style={{ backgroundColor: isActive ? '#3b82f6' : 'transparent' }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = isDark ? '#1c2128' : '#e5e7eb'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <div className="font-medium text-sm truncate" style={{ color: isActive ? '#fff' : isDark ? '#e6edf3' : '#1f2937' }}>{doc.title}</div>
              <div className="text-xs mt-0.5 truncate" style={{ color: isActive ? 'rgba(255,255,255,0.75)' : isDark ? '#6e7681' : '#9ca3af' }}>{formatTags(doc.tags)} • {wc} words</div>
            </button>
          );
        })}
      </div>

      <div className="px-4 py-3 text-xs" style={{ color: isDark ? '#6e7681' : '#9ca3af', borderTop: '1px solid ' + (isDark ? '#21262d' : '#e5e7eb') }}>
        {documents.length} doc{documents.length !== 1 ? 's' : ''} • {totalWords} total words
      </div>
    </div>
  );
}
