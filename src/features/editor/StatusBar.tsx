import React from 'react';
import { countWords } from '../../utils/documentUtils';

interface StatusBarProps {
  content: string;
  lastSaved: number | null;
  isDark: boolean;
}

export default function StatusBar({ content, lastSaved, isDark }: StatusBarProps) {
  const wc = countWords(content);
  const ts = lastSaved ? new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <div className={isDark ? 'flex items-center justify-between px-5 py-1.5 bg-[#010409] border-t border-[#1c2128]' : 'flex items-center justify-between px-5 py-1.5 bg-gray-100 border-t border-gray-200'}>
      <span className={isDark ? 'text-gray-500 text-[12px]' : 'text-gray-400 text-[12px]'}>{wc} word{wc !== 1 ? 's' : ''}</span>
      <span className="text-[12px] font-mono flex items-center gap-1.5">
        <span>🔒</span>
        <span className={isDark ? 'text-[#3fb950]' : 'text-green-600'}>Local Only</span>
      </span>
      <span className={isDark ? 'text-gray-500 text-[12px]' : 'text-gray-400 text-[12px]'}>{ts ? `Saved ${ts}` : 'Not saved'}</span>
    </div>
  );
}