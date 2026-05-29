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

  const hF = (e: React.MouseEvent) => { e.currentTarget.style.backgroundColor = isDark ? '#30363d' : '#d1d5db'; };
  const uF = (e: React.MouseEvent) => { e.currentTarget.style.backgroundColor = isDark ? '#21262d' : '#e5e7eb'; };
  const hA = (e: React.MouseEvent) => { e.currentTarget.style.backgroundColor = isDark ? '#253349' : '#bfdbfe'; };
  const uA = (e: React.MouseEvent) => { e.currentTarget.style.backgroundColor = isDark ? '#1c2433' : '#dbeafe'; };

  const saveLabel = saveState === 'saving' ? '⏳ Saving...' : saveState === 'saved' ? '✓ Saved' : saveState === 'error' ? '✗ Error' : '💾 Save';
  const saveBg = saveState === 'saved' ? (isDark ? '#1a3a2a' : '#d1fae5') : saveState === 'error' ? (isDark ? '#3a1a1a' : '#fee2e2') : undefined;

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 flex-wrap" style={{ backgroundColor: isDark ? '#0d1117' : '#fff', borderBottom: '1px solid ' + (isDark ? '#21262d' : '#e5e7eb') }}>
      <button style={fmt} onMouseEnter={hF} onMouseLeave={uF} onClick={() => onFormat('bold')}><b>B</b></button>
      <button style={fmt} onMouseEnter={hF} onMouseLeave={uF} onClick={() => onFormat('italic')}><i>I</i></button>
      <button style={fmt} onMouseEnter={hF} onMouseLeave={uF} onClick={() => onFormat('underline')}><u>U</u></button>
      <div style={sep} />
      <button style={fmt} onMouseEnter={hF} onMouseLeave={uF} onClick={() => onFormat('bullet')}>•</button>
      <button style={fmt} onMouseEnter={hF} onMouseLeave={uF} onClick={() => onFormat('number')}>1.</button>
      <button style={fmt} onMouseEnter={hF} onMouseLeave={uF} onClick={() => onFormat('h2')}>H2</button>
      <button style={fmt} onMouseEnter={hF} onMouseLeave={uF} onClick={() => onFormat('h3')}>H3</button>
      <div style={sep} />
      <button style={fmt} onMouseEnter={hF} onMouseLeave={uF} onClick={() => onFormat('quote')}>&ldquo;&rdquo;</button>
      <button style={fmt} onMouseEnter={hF} onMouseLeave={uF} onClick={() => onFormat('code')}>{'{ }'}</button>
      <button style={fmt} onMouseEnter={hF} onMouseLeave={uF} onClick={() => onFormat('link')}>🔗</button>
      <button style={fmt} onMouseEnter={hF} onMouseLeave={uF} onClick={onImageClick}>🖼️</button>
      <div style={sep} />
      <button style={{ ...act, backgroundColor: isPreview ? (isDark ? '#2d4a6f' : '#93c5fd') : act.backgroundColor }} onMouseEnter={hA} onMouseLeave={uA} onClick={onTogglePreview}>👁 Preview</button>
      <button style={{ ...act, ...(saveBg ? { backgroundColor: saveBg } : {}) }} onMouseEnter={hA} onMouseLeave={uA} onClick={() => onAction('save')}>{saveLabel}</button>
      <button style={act} onMouseEnter={hA} onMouseLeave={uA} onClick={() => onAction('html')}>HTML</button>
      <button style={act} onMouseEnter={hA} onMouseLeave={uA} onClick={() => onAction('md')}>MD</button>
      <button style={act} onMouseEnter={hA} onMouseLeave={uA} onClick={() => onAction('delete')}>🗑️</button>
      <div className="flex-1" />
      <button style={fmt} onMouseEnter={hF} onMouseLeave={uF} onClick={onToggleTheme}>{isLight ? '🌙' : '☀️'}</button>
    </div>
  );
}