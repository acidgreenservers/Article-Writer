import React from 'react';
import { parse, tokensToJSX } from '../utils/markdownParser';

interface PreviewPanelProps {
  content: string;
  isDark: boolean;
}

export default function PreviewPanel({ content, isDark }: PreviewPanelProps) {
  const tokens = parse(content);
  const jsxElements = tokensToJSX(tokens, isDark);

  return (
    <div className="flex-1 overflow-y-auto" style={{ backgroundColor: isDark ? '#0d1117' : '#ffffff', padding: '24px' }}>
      {content.trim() ? (
        <div className="max-w-none">{jsxElements}</div>
      ) : (
        <p style={{ color: isDark ? '#6e7681' : '#9ca3af' }} className="italic">Nothing to preview. Start writing...</p>
      )}
    </div>
  );
}