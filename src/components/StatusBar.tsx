import type { SaveState } from '../types';

interface StatusBarProps {
  wordCount: number;
  isDark: boolean;
  saveState: SaveState;
}

export function StatusBar({ wordCount, isDark, saveState }: StatusBarProps) {
  const indicator = saveState === 'saving' ? '⏳ Saving...' : saveState === 'saved' ? '✓ Saved' : saveState === 'error' ? '✗ Save failed' : '';
  const indicatorColor = saveState === 'saved' ? '#3fb950' : saveState === 'error' ? '#f85149' : '#d29922';

  return (
    <div className="flex items-center justify-between px-4 py-1.5 text-xs" style={{ backgroundColor: isDark ? '#010409' : '#f9fafb', borderTop: '1px solid ' + (isDark ? '#21262d' : '#e5e7eb'), color: isDark ? '#6e7681' : '#9ca3af' }}>
      <span>{wordCount} words</span>
      <span className="font-mono">
        🔒 <span style={{ color: '#3fb950' }}>Local Only</span>
        {indicator && <span className="ml-2" style={{ color: indicatorColor }}>{indicator}</span>}
      </span>
      <span>UTF-8</span>
    </div>
  );
}