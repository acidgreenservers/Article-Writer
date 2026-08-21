import { memo, useMemo, useState, useCallback, useRef, useEffect } from 'react';
import type { Document } from '../types';
import { countWords, formatTags } from '../utils/documentUtils';

interface SidebarProps {
  documents: Document[];
  activeDocId: string | null;
  onSelectDoc: (id: string) => void;
  onNewDoc: () => void;
  onInfoClick: () => void;
  isDark: boolean;
  /** When true, renders as a slide-out drawer with backdrop (mobile/tablet) */
  isDrawer?: boolean;
  /** Whether the drawer is open (only used when isDrawer=true) */
  isOpen?: boolean;
  /** Called when the drawer backdrop or close button is tapped */
  onClose?: () => void;
}

/**
 * Memoized individual document item.
 * Prevents expensive word count recalculations and re-renders for documents
 * that haven't changed.
 */
const DocItem = memo(({
  doc,
  isActive,
  onSelect,
  isDark
}: {
  doc: Document;
  isActive: boolean;
  onSelect: (id: string) => void;
  isDark: boolean;
}) => {
  const wc = countWords(doc.content);
  return (
    <button
      onClick={() => onSelect(doc.id)}
      className="w-full text-left px-3 py-2.5 rounded-md transition-colors"
      style={{ backgroundColor: isActive ? '#3b82f6' : 'transparent' }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = isDark ? '#1c2128' : '#e5e7eb'; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      <div className="font-medium text-sm truncate" style={{ color: isActive ? '#fff' : isDark ? '#e6edf3' : '#1f2937' }}>{doc.title}</div>
      <div className="text-xs mt-0.5 truncate" style={{ color: isActive ? 'rgba(255,255,255,0.75)' : isDark ? '#6e7681' : '#9ca3af' }}>{formatTags(doc.tags)} • {wc} words</div>
    </button>
  );
});

DocItem.displayName = 'DocItem';

export function Sidebar({
  documents,
  activeDocId,
  onSelectDoc,
  onNewDoc,
  onInfoClick,
  isDark,
  isDrawer = false,
  isOpen = false,
  onClose,
}: SidebarProps) {
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // BOLT OPTIMIZATION: Cache per-document word counts in a component ref Map.
  // When documents array changes on typing, inactive documents reuse their cached count in O(1).
  const docCountsRef = useRef<Map<string, { content: string; count: number }>>(new Map());

  const totalWords = useMemo(() => {
    const cache = docCountsRef.current;
    let sum = 0;
    for (let i = 0; i < documents.length; i++) {
      const d = documents[i];
      const cached = cache.get(d.id);
      if (cached && cached.content === d.content) {
        sum += cached.count;
      } else {
        const count = countWords(d.content);
        cache.set(d.id, { content: d.content, count });
        sum += count;
      }
    }
    return sum;
  }, [documents]);

  // Focus search input when drawer opens
  useEffect(() => {
    if (isDrawer && isOpen && searchRef.current) {
      // Small delay to let the animation start
      const t = setTimeout(() => searchRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [isDrawer, isOpen]);

  // Reset search when drawer closes
  useEffect(() => {
    if (!isOpen) setSearch('');
  }, [isOpen]);

  const filteredDocs = useMemo(() => {
    if (!search.trim()) return documents;
    const q = search.toLowerCase();
    return documents.filter(d =>
      d.title.toLowerCase().includes(q) ||
      d.tags.some(t => t.toLowerCase().includes(q)) ||
      d.content.toLowerCase().includes(q)
    );
  }, [documents, search]);

  const handleSelect = useCallback((id: string) => {
    onSelectDoc(id);
    if (isDrawer && onClose) onClose();
  }, [onSelectDoc, isDrawer, onClose]);

  const sidebarContent = (
    <div
      className="flex flex-col h-full"
      style={{
        width: isDrawer ? 280 : 220,
        minWidth: isDrawer ? 280 : 220,
        backgroundColor: isDark ? '#0f1419' : '#f3f4f6',
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onInfoClick}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer text-left"
          >
            <span className="text-lg">📝</span>
            <span className="font-semibold text-sm" style={{ color: isDark ? '#e6edf3' : '#1f2937' }}>Article Writer</span>
          </button>
          {isDrawer && onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-md transition-colors"
              style={{ color: isDark ? '#8b949e' : '#6b7280' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = isDark ? '#21262d' : '#e5e7eb'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              aria-label="Close sidebar"
            >
              ✕
            </button>
          )}
        </div>

        {/* Search bar (drawer mode only, or always if you prefer) */}
        <div className="mb-3">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm"
            style={{
              backgroundColor: isDark ? '#1c2128' : '#ffffff',
              border: '1px solid ' + (isDark ? '#30363d' : '#e5e7eb'),
            }}
          >
            <span style={{ color: isDark ? '#6e7681' : '#9ca3af', fontSize: 13 }}>🔍</span>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: isDark ? '#e6edf3' : '#1f2937' }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-xs"
                style={{ color: isDark ? '#6e7681' : '#9ca3af' }}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <button
          onClick={onNewDoc}
          className="w-full py-2 px-3 rounded-md text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: '#3b82f6' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#3b82f6'; }}
        >
          + New Document
        </button>
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {filteredDocs.length === 0 ? (
          <div className="text-xs text-center py-4" style={{ color: isDark ? '#6e7681' : '#9ca3af' }}>
            {search ? 'No documents match your search' : 'No documents yet'}
          </div>
        ) : (
          filteredDocs.map(doc => (
            <DocItem
              key={doc.id}
              doc={doc}
              isActive={doc.id === activeDocId}
              onSelect={handleSelect}
              isDark={isDark}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 text-xs" style={{ color: isDark ? '#6e7681' : '#9ca3af', borderTop: '1px solid ' + (isDark ? '#21262d' : '#e5e7eb') }}>
        {documents.length} doc{documents.length !== 1 ? 's' : ''} • {totalWords.toLocaleString()} total words
        {search && filteredDocs.length !== documents.length && (
          <span> • {filteredDocs.length} shown</span>
        )}
      </div>
    </div>
  );

  // Drawer mode: render as a positioned overlay
  if (isDrawer) {
    return (
      <>
        {/* Backdrop */}
        <div
          className="sidebar-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 45,
            opacity: isOpen ? 1 : 0,
            pointerEvents: isOpen ? 'auto' : 'none',
            transition: 'opacity 0.25s ease',
          }}
          onClick={onClose}
        />
        {/* Drawer */}
        <div
          className="sidebar-drawer"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100%',
            zIndex: 46,
            transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: isOpen ? '2px 0 12px rgba(0,0,0,0.3)' : 'none',
          }}
        >
          {sidebarContent}
        </div>
      </>
    );
  }

  // Desktop mode: render inline (always visible)
  return (
    <div
      className="flex flex-col h-full"
      style={{
        width: 220,
        minWidth: 220,
        backgroundColor: isDark ? '#0f1419' : '#f3f4f6',
        borderRight: '1px solid ' + (isDark ? '#30363d' : '#e5e7eb'),
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={onInfoClick}
          className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity cursor-pointer text-left w-full"
        >
          <span className="text-lg">📝</span>
          <span className="font-semibold text-sm" style={{ color: isDark ? '#e6edf3' : '#1f2937' }}>Article Writer</span>
        </button>
        <button
          onClick={onNewDoc}
          className="w-full py-2 px-3 rounded-md text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: '#3b82f6' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#3b82f6'; }}
        >
          + New Document
        </button>
      </div>

      {/* Search (desktop gets search too now) */}
      <div className="px-3 pb-2">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm"
          style={{
            backgroundColor: isDark ? '#1c2128' : '#ffffff',
            border: '1px solid ' + (isDark ? '#30363d' : '#e5e7eb'),
          }}
        >
          <span style={{ color: isDark ? '#6e7681' : '#9ca3af', fontSize: 13 }}>🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: isDark ? '#e6edf3' : '#1f2937' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs"
              style={{ color: isDark ? '#6e7681' : '#9ca3af' }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {filteredDocs.length === 0 ? (
          <div className="text-xs text-center py-4" style={{ color: isDark ? '#6e7681' : '#9ca3af' }}>
            {search ? 'No documents match' : 'No documents yet'}
          </div>
        ) : (
          filteredDocs.map(doc => (
            <DocItem
              key={doc.id}
              doc={doc}
              isActive={doc.id === activeDocId}
              onSelect={handleSelect}
              isDark={isDark}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 text-xs" style={{ color: isDark ? '#6e7681' : '#9ca3af', borderTop: '1px solid ' + (isDark ? '#21262d' : '#e5e7eb') }}>
        {documents.length} doc{documents.length !== 1 ? 's' : ''} • {totalWords.toLocaleString()} total words
        {search && filteredDocs.length !== documents.length && (
          <span> • {filteredDocs.length} shown</span>
        )}
      </div>
    </div>
  );
}