import { useState, useCallback, useRef } from 'react';
import type { Document, UploadedImage } from './types';
import { createNewDocument, countWords } from './utils/documentUtils';
import { useAutoSave } from './utils/useAutoSave';
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

const initialDoc = createNewDocument();

export default function App() {
  const [documents, setDocuments] = useState<Document[]>([initialDoc]);
  const [activeDocId, setActiveDocId] = useState<string>(initialDoc.id);
  const [isDark, setIsDark] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [showUploadedItems, setShowUploadedItems] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'md' | 'html'>('md');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeDoc = documents.find((d) => d.id === activeDocId) || documents[0];
  const wordCount = countWords(activeDoc?.content || '');

  const flashSaveToast = useCallback(() => {
    setShowSaveToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setShowSaveToast(false), 2000);
  }, []);

  const handleAutoSave = useCallback(() => { flashSaveToast(); }, [flashSaveToast]);
  const { markSaved } = useAutoSave(documents, handleAutoSave);

  const updateDoc = useCallback((id: string, updates: Partial<Document>) => {
    setDocuments((prev) => prev.map((d) => d.id === id ? { ...d, ...updates, updatedAt: Date.now() } : d));
  }, []);

  const handleNewDoc = useCallback(() => {
    const newDoc = createNewDocument();
    setDocuments((prev) => [...prev, newDoc]);
    setActiveDocId(newDoc.id);
  }, []);

  const handleDeleteDoc = useCallback(() => {
    if (documents.length <= 1) return;
    setDocuments((prev) => {
      const filtered = prev.filter((d) => d.id !== activeDocId);
      if (filtered.length > 0) setActiveDocId(filtered[0].id);
      return filtered;
    });
    setShowDeleteConfirm(false);
  }, [activeDocId, documents.length]);

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
    updateDoc(activeDoc.id, { content: newContent });
  }, [activeDoc, updateDoc]);

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

    updateDoc(activeDoc.id, { content: newContent });
    setTimeout(() => {
      textarea.focus();
      const newPos = start + cursorOffset;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  }, [activeDoc, updateDoc]);

  const handleAction = useCallback((type: string) => {
    if (!activeDoc) return;
    switch (type) {
      case 'save':
        markSaved();
        flashSaveToast();
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
  }, [activeDoc, flashSaveToast, markSaved]);

  const handleDeleteUploadedImage = useCallback((id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  if (!activeDoc) return null;

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ backgroundColor: isDark ? '#0d1117' : '#ffffff' }}>
      <Sidebar documents={documents} activeDocId={activeDocId} onSelectDoc={setActiveDocId} onNewDoc={handleNewDoc} isDark={isDark} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Title & Tags */}
        <div className="px-3 pt-3 space-y-2">
          <input
            type="text"
            value={activeDoc.title}
            onChange={(e) => updateDoc(activeDoc.id, { title: e.target.value })}
            placeholder="Untitled Document"
            className="w-full px-3.5 py-2 rounded-md text-sm outline-none transition-colors"
            style={{
              backgroundColor: isDark ? '#1c2128' : '#f3f4f6',
              color: isDark ? '#e6edf3' : '#1f2937',
              border: '1px solid ' + (isDark ? '#30363d' : '#e5e7eb'),
              fontStyle: activeDoc.title === 'Untitled Document' ? 'italic' : 'normal',
            }}
          />
          <input
            type="text"
            value={activeDoc.tags.join(', ')}
            onChange={(e) => {
              const tags = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
              updateDoc(activeDoc.id, { tags });
            }}
            placeholder="Tags (comma separated)"
            className="w-full px-3.5 py-2 rounded-md text-sm outline-none transition-colors"
            style={{
              backgroundColor: isDark ? '#1c2128' : '#f3f4f6',
              color: isDark ? '#e6edf3' : '#1f2937',
              border: '1px solid ' + (isDark ? '#30363d' : '#e5e7eb'),
            }}
          />
        </div>

        {/* Toolbar */}
        <Toolbar
          onFormat={handleFormat}
          onAction={handleAction}
          isDark={isDark}
          isPreview={showPreview}
          onTogglePreview={() => setShowPreview((p) => !p)}
          onToggleTheme={() => setIsDark((d) => !d)}
          isLight={!isDark}
          onImageClick={() => setShowImageUploader((p) => !p)}
        />

        {/* Image Uploader Accordion */}
        {showImageUploader && (
          <div className="px-3 py-2" style={{ borderBottom: '1px solid ' + (isDark ? '#21262d' : '#e5e7eb') }}>
            <ImageUploader
              onUpload={setUploadedImages}
              onViewItems={() => setShowUploadedItems(true)}
              isDark={isDark}
              uploadedImages={uploadedImages}
            />
          </div>
        )}

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <textarea
            ref={textareaRef}
            value={activeDoc.content}
            onChange={(e) => updateDoc(activeDoc.id, { content: e.target.value })}
            placeholder="Start writing..."
            className="w-full h-full resize-none outline-none p-4 text-sm leading-relaxed"
            style={{
              backgroundColor: isDark ? '#0d1117' : '#ffffff',
              color: isDark ? '#e6edf3' : '#1f2937',
              caretColor: isDark ? '#58a6ff' : '#3b82f6',
            }}
          />
        </div>

        <StatusBar wordCount={wordCount} isDark={isDark} />
      </div>

      {/* Modals */}
      {showPreview && <PreviewModal document={activeDoc} isDark={isDark} onClose={() => setShowPreview(false)} />}
      {showDeleteConfirm && <DeleteConfirmModal documentTitle={activeDoc.title} isDark={isDark} onConfirm={handleDeleteDoc} onCancel={() => setShowDeleteConfirm(false)} />}
      {showUploadedItems && <UploadedItemsModal images={uploadedImages} isDark={isDark} onInsert={handleInsertImage} onDelete={handleDeleteUploadedImage} onClose={() => setShowUploadedItems(false)} />}
      {showExportModal && <ExportModal document={activeDoc} images={uploadedImages} format={exportFormat} isDark={isDark} onClose={() => setShowExportModal(false)} />}
      {showLinkModal && <LinkModal isDark={isDark} onInsert={handleInsertLink} onClose={() => setShowLinkModal(false)} />}
      {showSaveToast && <SaveToast isDark={isDark} />}
    </div>
  );
}