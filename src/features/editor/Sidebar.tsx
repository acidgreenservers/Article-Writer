import React from 'react';
import type { Document } from '../../types';
import { countWords, formatTags } from '../../utils/documentUtils';

interface SidebarProps {
  documents: Document[];
  activeDocId: string | null;
  onSelectDoc: (id: string) => void;
  onNewDoc: () => void;
  isDark: boolean;
}

export default function Sidebar({ documents, activeDocId, onSelectDoc, onNewDoc, isDark }: SidebarProps) {
  const totalWords = documents.reduce((sum, d) => sum + countWords(d.content), 0);

  return (
    <div className={isDark ? 'w-52 flex-shrink-0 flex flex-col bg-[#0f1419] border-r border-[#1c2128] h-screen' : 'w-52 flex-shrink-0 flex flex-col bg-gray-50 border-r border-gray-200 h-screen'}>
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">📝</span>
          <span className={isDark ? 'text-[#e6edf3] text-sm font-medium' : 'text-gray-800 text-sm font-medium'}>Article Writer</span>
        </div>
        <button onClick={onNewDoc} className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium rounded-md transition-colors cursor-pointer">+ New Document</button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {documents.map(doc => {
          const isActive = doc.id === activeDocId;
          const wc = countWords(doc.content);
          return (
            <button key={doc.id} onClick={() => onSelectDoc(doc.id)} className={`w-full text-left p-3 rounded-md transition-colors cursor-pointer ${isActive ? (isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : (isDark ? 'hover:bg-[#1c2128] text-[#c9d1d9]' : 'hover:bg-gray-100 text-gray-700')}`}>
              <div className="text-[13px] font-medium truncate">{doc.title}</div>
              <div className={`text-[11px] mt-1 ${isActive ? 'opacity-80' : (isDark ? 'text-[#6e7681]' : 'text-gray-400')}`}>{formatTags(doc.tags)} • {wc} words</div>
            </button>
          );
        })}
      </div>

      <div className={isDark ? 'px-4 py-3 text-[11px] text-[#484f58] border-t border-[#1c2128]' : 'px-4 py-3 text-[11px] text-gray-400 border-t border-gray-200'}>
        {documents.length} doc{documents.length !== 1 ? 's' : ''} • {totalWords} total words
      </div>
    </div>
  );
}