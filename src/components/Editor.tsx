interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  isDark: boolean;
}

export function Editor({ content, onChange, isDark }: EditorProps) {
  return (
    <textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Start writing..."
      className={isDark
        ? 'flex-1 w-full bg-transparent text-sm leading-relaxed resize-none outline-none px-6 py-4 font-mono text-gray-200 placeholder-[#6e7681] transition-colors duration-300'
        : 'flex-1 w-full bg-transparent text-sm leading-relaxed resize-none outline-none px-6 py-4 font-mono text-gray-800 placeholder-gray-400 transition-colors duration-300'}
      spellCheck={false}
    />
  );
}