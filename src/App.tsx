import { useState, useCallback, useRef } from 'react';
import { countWords } from './utils/documentUtils';
import { useDocuments } from './hooks/useDocuments';
import { useIsMobile, useIsTablet } from './hooks/useMediaQuery';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { PreviewModal } from './components/PreviewModal';
import { StatusBar } from './components/StatusBar';
import { ImageUploader } from './components/ImageUploader';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { SaveToast } from './components/SaveToast';
import { UploadedItemsModal } from './components/UploadedItemsModal';
import { ExportModal } from './components/ExportModal';
import { LinkModal } from './components/LinkModal';
import { InfoModal } from './components/InfoModal';
import { TagInput } from './components/TagInput';
import { MobileBar } from './components/MobileBar';

export default function App() {
  const {
    documents,
    activeDoc,
    activeDocId,
    setActiveDocId,
    images,
    isLoading,
    saveState,
    updateDocument,
    addDocument,
    removeDocument,
    addImage,
    removeImage,
  } = useDocuments();

  const [isDark, setIsDark] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showImageUploader, setShowImageUploader] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [showUploadedItems, setShowUploadedItems] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showLinkModal, setShowLinkModal] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'md' | 'html'>('md');

  // Responsive breakpoints
  const isMobile = useIsMobile();   // < 768px
  const isTablet = useIsTablet();   // < 1024px

  // Mobile/tablet sidebar drawer state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mobile: toggle format bar visibility
  const [showFormatBar, setShowFormatBar] = useState<boolean>(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = countWords(activeDoc?.content || '');

  const handleInsertAtCursor = useCallback((markdown: string) => {
    if (!activeDoc) return;
    const textarea = textareaRef.current;
    let newContent: string;
    if (textarea) {
      const pos = textarea.selectionStart;
      newContent = activeDoc.content.substring(0, pos) + markdown + activeDoc.content.substring(textarea.selectionEnd);
      setTimeout(() => {
        textarea.focus();
        const newPos = pos + markdown.length;
        textarea.setSelectionRange(newPos, newPos);
      }, 0);
    } else {
      newContent = activeDoc.content + '\n' + markdown;
    }
    updateDocument(activeDoc.id, { content: newContent });
  }, [activeDoc, updateDocument]);

  const handleInsertImage = useCallback((markdown: string) => {
    handleInsertAtCursor('\n' + markdown + '\n');
  }, [handleInsertAtCursor]);

  const handleInsertLink = useCallback((markdown: string) => {
    handleInsertAtCursor(markdown);
  }, [handleInsertAtCursor]);

  const handleFormat = useCallback((type: string) => {
    if (!textareaRef.current || !activeDoc) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const content = activeDoc.content;
    const selected = content.substring(start, end);

    if (type === 'link') {
      setShowLinkModal(true);
      return;
    }

    let newContent = content;
    let cursorOffset = 0;

    switch (type) {
      case 'bold':
        newContent = content.substring(0, start) + '**' + (selected || 'bold text') + '**' + content.substring(end);
        cursorOffset = selected ? selected.length + 4 : 14;
        break;
      case 'italic':
        newContent = content.substring(0, start) + '*' + (selected || 'italic text') + '*' + content.substring(end);
        cursorOffset = selected ? selected.length + 2 : 13;
        break;
      case 'underline':
        newContent = content.substring(0, start) + '<u>' + (selected || 'underlined') + '</u>' + content.substring(end);
        cursorOffset = selected ? selected.length + 7 : 13;
        break;
      case 'bullet':
        newContent = content.substring(0, start) + '\n- ' + (selected || 'list item') + content.substring(end);
        cursorOffset = selected ? selected.length + 3 : 14;
        break;
      case 'number':
        newContent = content.substring(0, start) + '\n1. ' + (selected || 'list item') + content.substring(end);
        cursorOffset = selected ? selected.length + 5 : 16;
        break;
      case 'h2':
        newContent = content.substring(0, start) + '\n## ' + (selected || 'Heading') + content.substring(end);
        cursorOffset = selected ? selected.length + 5 : 12;
        break;
      case 'h3':
        newContent = content.substring(0, start) + '\n### ' + (selected || 'Heading') + content.substring(end);
        cursorOffset = selected ? selected.length + 6 : 13;
        break;
      case 'quote':
        newContent = content.substring(0, start) + '\n> ' + (selected || 'quote text') + content.substring(end);
        cursorOffset = selected ? selected.length + 4 : 14;
        break;
      case 'code':
        newContent = content.substring(0, start) + '\n```\n' + (selected || 'code') + '\n```' + content.substring(end);
        cursorOffset = selected ? selected.length + 8 : 10;
        break;
      default:
        return;
    }

    updateDocument(activeDoc.id, { content: newContent });
    setTimeout(() => {
      textarea.focus();
      const newPos = start + cursorOffset;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  }, [activeDoc, updateDocument]);

  const handleAction = useCallback((type: string) => {
    if (!activeDoc) return;
    switch (type) {
      case 'save':
        break;
      case 'html':
        setExportFormat('html');
        setShowExportModal(true);
        break;
      case 'md':
        setExportFormat('md');
        setShowExportModal(true);
        break;
      case 'delete':
        setShowDeleteConfirm(true);
        break;
    }
  }, [activeDoc]);

  const handleUploadImages = useCallback(async (files: File[]) => {
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result as ArrayBuffer;
        const imageId = crypto.randomUUID();
        await addImage({
          id: imageId,
          documentId: activeDoc.id,
          name: file.name,
          type: file.type,
          size: file.size,
          data,
          createdAt: Date.now()
        });
        handleInsertImage(`![${file.name}](items/${file.name})`);
      };
      reader.readAsArrayBuffer(file);
    }
  }, [activeDoc, addImage, handleInsertImage]);

  if (isLoading || !activeDoc) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ backgroundColor: isDark ? '#0d1117' : '#ffffff' }}>
        <div className="text-sm" style={{ color: isDark ? '#e6edf3' : '#1f2937' }}>Loading...</div>
      </div>
    );
  }

  // --- Hamburger button (tablet + mobile) ---
  const hamburgerBtn = isTablet ? (
    <button
      onClick={() => setSidebarOpen(true)}
      className="flex items-center justify-center"
      style={{
        width: 40,
        height: 40,
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        backgroundColor: 'transparent',
        color: isDark ? '#e6edf3' : '#374151',
        fontSize: 20,
        flexShrink: 0,
      }}
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = isDark ? '#21262d' : '#e5e7eb'; }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
      aria-label="Open sidebar"
    >
      ☰
    </button>
  ) : null;

  // --- Title input with optional hamburger ---
  const titleSection = (
    <div className="px-3 pt-3 space-y-2">
      <div className="flex items-center gap-2">
        {hamburgerBtn}
        <input
          type="text"
          value={activeDoc.title}
          onChange={(e) => updateDocument(activeDoc.id, { title: e.target.value })}
          placeholder="Untitled Document"
          className="flex-1 px-3.5 py-2 rounded-md text-sm outline-none transition-colors"
          style={{
            backgroundColor: isDark ? '#1c2128' : '#f3f4f6',
            color: isDark ? '#e6edf3' : '#1f2937',
            border: '1px solid ' + (isDark ? '#30363d' : '#e5e7eb'),
            fontStyle: activeDoc.title === 'Untitled Document' ? 'italic' : 'normal',
          }}
        />
      </div>
      <TagInput
        tags={activeDoc.tags}
        allDocuments={documents}
        onChange={(tags) => updateDocument(activeDoc.id, { tags })}
        isDark={isDark}
      />
    </div>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ backgroundColor: isDark ? '#0d1117' : '#ffffff' }}>
      {/* Sidebar — desktop: inline always visible, tablet/mobile: drawer */}
      {isTablet ? (
        <Sidebar
          documents={documents}
          activeDocId={activeDocId}
          onSelectDoc={setActiveDocId}
          onNewDoc={addDocument}
          onInfoClick={() => setShowInfoModal(true)}
          isDark={isDark}
          isDrawer
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      ) : (
        <Sidebar
          documents={documents}
          activeDocId={activeDocId}
          onSelectDoc={setActiveDocId}
          onNewDoc={addDocument}
          onInfoClick={() => setShowInfoModal(true)}
          isDark={isDark}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0" style={{ paddingBottom: isMobile ? 60 : 0 }}>
        {titleSection}

        {/* Toolbar — full on desktop/tablet, format-only on mobile (collapsible) */}
        {(!isMobile || showFormatBar) && (
          <Toolbar
            onFormat={handleFormat}
            onAction={handleAction}
            isDark={isDark}
            isPreview={showPreview}
            onTogglePreview={() => setShowPreview((p) => !p)}
            onToggleTheme={() => setIsDark((d) => !d)}
            isLight={!isDark}
            onImageClick={() => setShowImageUploader((p) => !p)}
            saveState={saveState}
            formatOnly={isMobile}
          />
        )}

        {/* Mobile: collapsed format bar indicator — tap to expand */}
        {isMobile && !showFormatBar && (
          <div
            className="flex items-center justify-center py-1.5 cursor-pointer select-none"
            style={{
              backgroundColor: isDark ? '#0d1117' : '#fff',
              borderBottom: '1px solid ' + (isDark ? '#21262d' : '#e5e7eb'),
            }}
            onClick={() => setShowFormatBar(true)}
          >
            <span className="text-xs font-medium" style={{ color: isDark ? '#58a6ff' : '#3b82f6' }}>▲ Format</span>
          </div>
        )}

        {showImageUploader && (
          <div className="px-3 py-2" style={{ borderBottom: '1px solid ' + (isDark ? '#21262d' : '#e5e7eb') }}>
            <ImageUploader
              onUpload={handleUploadImages}
              onViewItems={() => setShowUploadedItems(true)}
              isDark={isDark}
              uploadedImages={images}
            />
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          <textarea
            ref={textareaRef}
            value={activeDoc.content}
            onChange={(e) => updateDocument(activeDoc.id, { content: e.target.value })}
            placeholder="Start writing..."
            className="w-full h-full resize-none outline-none p-4 text-sm leading-relaxed"
            style={{
              backgroundColor: isDark ? '#0d1117' : '#ffffff',
              color: isDark ? '#e6edf3' : '#1f2937',
              caretColor: isDark ? '#58a6ff' : '#3b82f6',
            }}
          />
        </div>

        <StatusBar wordCount={wordCount} isDark={isDark} saveState={saveState} isMobile={isMobile} />
      </div>

      {/* Mobile bottom bar */}
      {isMobile && (
        <MobileBar
          isDark={isDark}
          onNewDoc={addDocument}
          onPreview={() => setShowPreview(true)}
          onToggleTheme={() => setIsDark(d => !d)}
          onToggleFormatBar={() => setShowFormatBar(p => !p)}
          onSave={() => handleAction('save')}
          onExportHtml={() => { setExportFormat('html'); setShowExportModal(true); }}
          onExportMd={() => { setExportFormat('md'); setShowExportModal(true); }}
          onDelete={() => setShowDeleteConfirm(true)}
        />
      )}

      {showPreview && <PreviewModal document={activeDoc} isDark={isDark} onClose={() => setShowPreview(false)} />}
      {showDeleteConfirm && <DeleteConfirmModal documentTitle={activeDoc.title} isDark={isDark} onConfirm={() => { removeDocument(activeDoc.id); setShowDeleteConfirm(false); }} onCancel={() => setShowDeleteConfirm(false)} />}
      {showUploadedItems && <UploadedItemsModal images={images} isDark={isDark} onInsert={handleInsertImage} onDelete={removeImage} onClose={() => setShowUploadedItems(false)} />}
      {showExportModal && <ExportModal document={activeDoc} images={images} format={exportFormat} isDark={isDark} onClose={() => setShowExportModal(false)} />}
      {showLinkModal && <LinkModal isDark={isDark} onInsert={handleInsertLink} onClose={() => setShowLinkModal(false)} />}
      {showInfoModal && <InfoModal isDark={isDark} onClose={() => setShowInfoModal(false)} />}
      {(saveState === 'saving' || saveState === 'saved') && <SaveToast isDark={isDark} />}
    </div>
  );
}