import React from 'react';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  isDark: boolean;
}

export default function Editor({ content, onChange, isDark }: EditorProps) {
  return (
    <textarea
      value={content}
      onChange={e => onChange(e.target.value)}
      placeholder="Start writing..."
      spellCheck={false}
      className={`flex-1 w-full resize-none outline-none p-6 text-[14px] leading-relaxed font-mono ${isDark ? 'bg-[#0d1117] text-[#c9d1d9] placeholder-[#484f58]' : 'bg-white text-gray-800 placeholder-gray-400'}`}
    />
  );
}