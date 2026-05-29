import React from 'react';

interface ToolbarProps {
  onFormat: (type: string, prefix?: string, suffix?: string) => void;
  onTogglePreview: () => void;
  isPreviewing: boolean;
  onSave: () => void;
  onExport: () => void;
  onDelete: () => void;
  onToggleTheme: () => void;
  isDark: boolean;
  saveState: 'idle' | 'saving' | 'saved' | 'error';
}

function ToolbarButton({ onClick, title, children, active, isDark }: { onClick: () => void; title: string; children: React.ReactNode; active?: boolean; isDark: boolean }) {
  return (
    <button onClick={onClick} title={title} className={`h-7 min-w-[28px] px-1.5 flex items-center justify-center rounded text-[12px] font-medium transition-colors cursor-pointer ${active ? 'bg-blue-600 text-white' : (isDark ? 'bg-[#21262d] text-[#e6edf3] hover:bg-[#30363d]' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}`}>
      {children}
    </button>
  );
}

function ToolbarDivider({ isDark }: { isDark: boolean }) {
  return <div className={isDark ? 'w-px h-5 bg-[#30363d] mx-1' : 'w-px h-5 bg-gray-300 mx-1'} />;
}

export default function Toolbar({ onFormat, onTogglePreview, isPreviewing, onSave, onExport, onDelete, onToggleTheme, isDark, saveState }: ToolbarProps) {
  return (
    <div className={isDark ? 'flex items-center gap-0.5 px-4 py-1.5 border-b border-[#1c2128] flex-wrap' : 'flex items-center gap-0.5 px-4 py-1.5 border-b border-gray-200 flex-wrap'}>
      <ToolbarButton onClick={() => onFormat('bold','**','**')} title="Bold (Ctrl+B)" isDark={isDark}><b>B</b></ToolbarButton>
      <ToolbarButton onClick={() => onFormat('italic','_','_')} title="Italic (Ctrl+I)" isDark={isDark}><i>I</i></ToolbarButton>
      <ToolbarButton onClick={() => onFormat('underline','','')} title="Underline" isDark={isDark}><u>U</u></ToolbarButton>
      <ToolbarButton onClick={() => onFormat('strikethrough','~~','~~')} title="Strikethrough" isDark={isDark}><s>S</s></ToolbarButton>

      <ToolbarDivider isDark={isDark} />

      <ToolbarButton onClick={() => onFormat('bullet','- ','')} title="Bullet List" isDark={isDark}>•</ToolbarButton>
      <ToolbarButton onClick={() => onFormat('numbered','1. ','')} title="Numbered List" isDark={isDark}>1.</ToolbarButton>
      <ToolbarButton onClick={() => onFormat('h2','## ','')} title="Heading 2" isDark={isDark}>H2</ToolbarButton>
      <ToolbarButton onClick={() => onFormat('h3','### ','')} title="Heading 3" isDark={isDark}>H3</ToolbarButton>

      <ToolbarDivider isDark={isDark} />

      <ToolbarButton onClick={() => onFormat('quote','> ','')} title="Blockquote" isDark={isDark}>&quot;</ToolbarButton>
      <ToolbarButton onClick={() => onFormat('code','`','`')} title="Inline Code" isDark={isDark}>{'{ }'}</ToolbarButton>
      <ToolbarButton onClick={() => onFormat('link','[','](url)')} title="Insert Link" isDark={isDark}>🔗</ToolbarButton>
      <ToolbarButton onClick={() => onFormat('image','![alt](',')')} title="Insert Image" isDark={isDark}>🖼️</ToolbarButton>

      <ToolbarDivider isDark={isDark} />

      <ToolbarButton onClick={onTogglePreview} title="Toggle Preview" isDark={isDark} active={isPreviewing}>👁 Preview</ToolbarButton>
      <ToolbarButton onClick={onSave} title="Save (Ctrl+S)" isDark={isDark}>
        {saveState === 'saving' ? '⏳' : saveState === 'saved' ? '✓' : '💾'} Save
      </ToolbarButton>
      <ToolbarButton onClick={onExport} title="Export" isDark={isDark}>📤 Export</ToolbarButton>
      <ToolbarButton onClick={onDelete} title="Delete Document" isDark={isDark}>🗑️</ToolbarButton>

      <div className="flex-1" />
      <ToolbarButton onClick={onToggleTheme} title="Toggle Theme" isDark={isDark}>{isDark ? '🌙' : '☀️'}</ToolbarButton>
    </div>
  );
}