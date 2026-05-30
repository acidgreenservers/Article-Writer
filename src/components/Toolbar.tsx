import type { SaveState } from '../types';

interface ToolbarProps {
  onFormat: (type: string) => void;
  onAction: (type: string) => void;
  isDark: boolean;
  isPreview: boolean;
  onTogglePreview: () => void;
  onToggleTheme: () => void;
  isLight: boolean;
  onImageClick: () => void;
  saveState: SaveState;
}

export function Toolbar({ onFormat, onAction, isDark, isPreview, onTogglePreview, onToggleTheme, isLight, onImageClick, saveState }: ToolbarProps) {
  const fmt: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minWidth: 28, height: 28, padding: '0 6px', borderRadius: 4,
    fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer',
    transition: 'background-color 0.15s',
    backgroundColor: isDark ? '#21262d' : '#e5e7eb',
    color: isDark ? '#e6edf3' : '#374151',
  };

  const act: React.CSSProperties = {
    ...fmt,
    backgroundColor: isDark ? '#1c2433' : '#dbeafe',
    color: isDark ? '#e6edf3' : '#1e40af',
    gap: 4, padding: '0 8px', fontSize: 11,
  };

  const sep: React.CSSProperties = { width: 1, height: 20, backgroundColor: isDark ? '#30363d' : '#d1d5db', margin: '0 4px' };

  const hF = (e: React.MouseEvent | React.FocusEvent) => { (e.currentTarget as HTMLElement).style.backgroundColor = isDark ? '#30363d' : '#d1d5db'; };
  const uF = (e: React.MouseEvent | React.FocusEvent) => { (e.currentTarget as HTMLElement).style.backgroundColor = isDark ? '#21262d' : '#e5e7eb'; };
  const hA = (e: React.MouseEvent | React.FocusEvent) => { (e.currentTarget as HTMLElement).style.backgroundColor = isDark ? '#253349' : '#bfdbfe'; };
  const uA = (e: React.MouseEvent | React.FocusEvent) => { (e.currentTarget as HTMLElement).style.backgroundColor = isDark ? '#1c2433' : '#dbeafe'; };

  const saveLabel = saveState === 'saving' ? '⏳ Saving...' : saveState === 'saved' ? '✓ Saved' : saveState === 'error' ? '✗ Error' : '💾 Save';
  const saveBg = saveState === 'saved' ? (isDark ? '#1a3a2a' : '#d1fae5') : saveState === 'error' ? (isDark ? '#3a1a1a' : '#fee2e2') : undefined;

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 flex-wrap" style={{ backgroundColor: isDark ? '#0d1117' : '#fff', borderBottom: '1px solid ' + (isDark ? '#21262d' : '#e5e7eb') }}>
      <button style={fmt} onMouseEnter={hF} onMouseLeave={uF} onFocus={hF} onBlur={uF} onClick={() => onFormat('bold')} aria-label="Bold" title="Bold"><b>B</b></button>
      <button style={fmt} onMouseEnter={hF} onMouseLeave={uF} onFocus={hF} onBlur={uF} onClick={() => onFormat('italic')} aria-label="Italic" title="Italic"><i>I</i></button>
      <button style={fmt} onMouseEnter={hF} onMouseLeave={uF} onFocus={hF} onBlur={uF} onClick={() => onFormat('underline')} aria-label="Underline" title="Underline"><u>U</u></button>
      <div style={sep} />
      <button style={fmt} onMouseEnter={hF} onMouseLeave={uF} onFocus={hF} onBlur={uF} onClick={() => onFormat('bullet')} aria-label="Bullet List" title="Bullet List">•</button>
      <button style={fmt} onMouseEnter={hF} onMouseLeave={uF} onFocus={hF} onBlur={uF} onClick={() => onFormat('number')} aria-label="Numbered List" title="Numbered List">1.</button>
      <button style={fmt} onMouseEnter={hF} onMouseLeave={uF} onFocus={hF} onBlur={uF} onClick={() => onFormat('h2')} aria-label="Heading 2" title="Heading 2">H2</button>
      <button style={fmt} onMouseEnter={hF} onMouseLeave={uF} onFocus={hF} onBlur={uF} onClick={() => onFormat('h3')} aria-label="Heading 3" title="Heading 3">H3</button>
      <div style={sep} />
      <button style={fmt} onMouseEnter={hF} onMouseLeave={uF} onFocus={hF} onBlur={uF} onClick={() => onFormat('quote')} aria-label="Blockquote" title="Blockquote">&ldquo;&rdquo;</button>
      <button style={fmt} onMouseEnter={hF} onMouseLeave={uF} onFocus={hF} onBlur={uF} onClick={() => onFormat('code')} aria-label="Code Block" title="Code Block">{'{ }'}</button>
      <button style={fmt} onMouseEnter={hF} onMouseLeave={uF} onFocus={hF} onBlur={uF} onClick={() => onFormat('link')} aria-label="Insert Link" title="Insert Link">🔗</button>
      <button style={fmt} onMouseEnter={hF} onMouseLeave={uF} onFocus={hF} onBlur={uF} onClick={onImageClick} aria-label="Insert Image" title="Insert Image">🖼️</button>
      <div style={sep} />
      <button style={{ ...act, backgroundColor: isPreview ? (isDark ? '#2d4a6f' : '#93c5fd') : act.backgroundColor }} onMouseEnter={hA} onMouseLeave={uA} onFocus={hA} onBlur={uA} onClick={onTogglePreview} aria-label="Toggle Preview" title="Toggle Preview">👁 Preview</button>
      <button style={{ ...act, ...(saveBg ? { backgroundColor: saveBg } : {}) }} onMouseEnter={hA} onMouseLeave={uA} onFocus={hA} onBlur={uA} onClick={() => onAction('save')} aria-label={saveLabel} title={saveLabel}>{saveLabel}</button>
      <button style={act} onMouseEnter={hA} onMouseLeave={uA} onFocus={hA} onBlur={uA} onClick={() => onAction('html')} aria-label="Export as HTML" title="Export as HTML">HTML</button>
      <button style={act} onMouseEnter={hA} onMouseLeave={uA} onFocus={hA} onBlur={uA} onClick={() => onAction('md')} aria-label="Export as Markdown" title="Export as Markdown">MD</button>
      <button style={act} onMouseEnter={hA} onMouseLeave={uA} onFocus={hA} onBlur={uA} onClick={() => onAction('delete')} aria-label="Delete Document" title="Delete Document">🗑️</button>
      <div className="flex-1" />
      <button style={fmt} onMouseEnter={hF} onMouseLeave={uF} onFocus={hF} onBlur={uF} onClick={onToggleTheme} aria-label={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'} title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>{isLight ? '🌙' : '☀️'}</button>
    </div>
  );
}