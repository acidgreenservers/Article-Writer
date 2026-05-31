import { useState, useRef, useEffect, useCallback } from 'react';

interface MobileBarProps {
  isDark: boolean;
  onNewDoc: () => void;
  onPreview: () => void;
  onToggleTheme: () => void;
  onToggleFormatBar: () => void;
  onSave: () => void;
  onExportHtml: () => void;
  onExportMd: () => void;
  onDelete: () => void;
}

export function MobileBar({
  isDark,
  onNewDoc,
  onPreview,
  onToggleTheme,
  onToggleFormatBar,
  onSave,
  onExportHtml,
  onExportMd,
  onDelete,
}: MobileBarProps) {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  // Close popovers on outside tap
  useEffect(() => {
    if (!leftOpen && !rightOpen) return;
    const handler = (e: MouseEvent) => {
      if (leftRef.current && !leftRef.current.contains(e.target as Node)) {
        setLeftOpen(false);
      }
      if (rightRef.current && !rightRef.current.contains(e.target as Node)) {
        setRightOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [leftOpen, rightOpen]);

  const closeAll = useCallback(() => {
    setLeftOpen(false);
    setRightOpen(false);
  }, []);

  // Theme colors
  const textSecondary = isDark ? '#8b949e' : '#6b7280';
  const textPrimary = '#3b82f6';
  const hoverBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const barBg = isDark ? '#0d1117' : '#ffffff';
  const barBorder = isDark ? '#21262d' : '#e5e7eb';
  const popoverBg = isDark ? '#1c2128' : '#ffffff';
  const popoverBorder = isDark ? '#30363d' : '#e5e7eb';

  // Shared button style matching the example
  const sideBtnBase: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 500,
    backgroundColor: 'transparent',
    color: textSecondary,
    transition: 'color 0.15s, background-color 0.15s',
    position: 'relative',
    lineHeight: 1,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '-0.05em',
    marginTop: 2,
  };

  const popoverBase: React.CSSProperties = {
    position: 'absolute',
    bottom: 60,
    borderRadius: 12,
    padding: 6,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    zIndex: 50,
    backgroundColor: popoverBg,
    border: '1px solid ' + popoverBorder,
    boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
    minWidth: 160,
  };

  const popBtn: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    backgroundColor: 'transparent',
    color: isDark ? '#e6edf3' : '#374151',
    transition: 'background-color 0.12s',
    textAlign: 'left',
    width: '100%',
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 flex items-center justify-around z-40"
      style={{
        height: 64,
        paddingLeft: 'max(16px, env(safe-area-inset-left, 16px))',
        paddingRight: 'max(16px, env(safe-area-inset-right, 16px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        backgroundColor: barBg,
        borderTop: '1px solid ' + barBorder,
      }}
    >
      {/* Left: View actions */}
      <div ref={leftRef} style={{ position: 'relative' }}>
        {leftOpen && (
          <div style={{ ...popoverBase, left: 0 }}>
            <button
              style={popBtn}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = isDark ? '#30363d' : '#f3f4f6'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              onClick={() => { closeAll(); onPreview(); }}
            >
              <span>👁</span> Preview
            </button>
            <button
              style={popBtn}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = isDark ? '#30363d' : '#f3f4f6'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              onClick={() => { closeAll(); onToggleFormatBar(); }}
            >
              <span>⌨</span> Format Bar
            </button>
            <button
              style={popBtn}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = isDark ? '#30363d' : '#f3f4f6'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              onClick={() => { closeAll(); onToggleTheme(); }}
            >
              <span>{isDark ? '☀️' : '🌙'}</span> {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        )}
        <button
          style={sideBtnBase}
          onClick={() => { setRightOpen(false); setLeftOpen(p => !p); }}
          onMouseEnter={e => {
            e.currentTarget.style.color = textPrimary;
            e.currentTarget.style.backgroundColor = hoverBg;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = textSecondary;
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          aria-label="View actions"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span style={labelStyle}>View</span>
        </button>
      </div>

      {/* Center: Blue circular + button (raised) */}
      <div style={{ position: 'relative', marginTop: -20 }}>
        <button
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: '4px solid ' + barBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#ffffff',
            backgroundColor: '#3b82f6',
            boxShadow: '0 4px 20px rgba(59, 110, 248, 0.5)',
            transition: 'background-color 0.15s, transform 0.1s',
          }}
          onClick={() => { closeAll(); onNewDoc(); }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#2563eb'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#3b82f6'; }}
          onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.93)'; }}
          onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
          aria-label="New Document"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
        </button>
      </div>

      {/* Right: Document actions */}
      <div ref={rightRef} style={{ position: 'relative' }}>
        {rightOpen && (
          <div style={{ ...popoverBase, right: 0 }}>
            <button
              style={popBtn}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = isDark ? '#30363d' : '#f3f4f6'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              onClick={() => { closeAll(); onSave(); }}
            >
              <span>💾</span> Save
            </button>
            <button
              style={popBtn}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = isDark ? '#30363d' : '#f3f4f6'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              onClick={() => { closeAll(); onExportHtml(); }}
            >
              <span>📄</span> Export HTML
            </button>
            <button
              style={popBtn}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = isDark ? '#30363d' : '#f3f4f6'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              onClick={() => { closeAll(); onExportMd(); }}
            >
              <span>📝</span> Export Markdown
            </button>
            <div style={{ height: 1, backgroundColor: popoverBorder, margin: '2px 0' }} />
            <button
              style={{ ...popBtn, color: '#f85149' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = isDark ? '#3a1a1a' : '#fee2e2'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              onClick={() => { closeAll(); onDelete(); }}
            >
              <span>🗑️</span> Delete
            </button>
          </div>
        )}
        <button
          style={sideBtnBase}
          onClick={() => { setLeftOpen(false); setRightOpen(p => !p); }}
          onMouseEnter={e => {
            e.currentTarget.style.color = textPrimary;
            e.currentTarget.style.backgroundColor = hoverBg;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = textSecondary;
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          aria-label="Document actions"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
          <span style={labelStyle}>Actions</span>
        </button>
      </div>
    </div>
  );
}