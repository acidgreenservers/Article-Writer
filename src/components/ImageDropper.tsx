import { useState, useRef, useCallback } from 'react';
import { createImageFromFile, generateMarkdownReference } from '../utils/imageStore';
import type { ThemeColors } from '../utils/theme';
import type { UploadedImage } from '../types';

interface ImageDropperProps {
  images: UploadedImage[];
  onAddImages: (newImages: UploadedImage[]) => void;
  onInsertMarkdown: (markdown: string) => void;
  onViewItems: () => void;
  theme: ThemeColors;
}

export function ImageDropper({ images, onAddImages, onInsertMarkdown, onViewItems, theme }: ImageDropperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      console.warn('[ImageDropper] No valid image files in drop');
      return;
    }
    const newImages: UploadedImage[] = imageFiles.map(f => createImageFromFile(f));
    onAddImages(newImages);
    newImages.forEach(img => {
      onInsertMarkdown(generateMarkdownReference(img));
    });
    console.log(`[ImageDropper] Processed ${newImages.length} image(s)`);
  }, [onAddImages, onInsertMarkdown]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [handleFiles]);

  const dropZoneBg = isDragOver
    ? (theme.mainBg === '#0d1117' ? '#1a3a6a' : '#dbeafe')
    : (theme.mainBg === '#0d1117' ? '#1c2d4a' : '#e0ecff');

  const dropZoneBorder = isDragOver
    ? theme.accentBlue
    : (theme.mainBg === '#0d1117' ? '#2a4a7a' : '#93c5fd');

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Upload Items"
        className="flex items-center justify-center h-8 px-2 rounded text-sm transition-colors"
        style={{
          backgroundColor: isOpen ? theme.toolbarBtnHoverBg : theme.toolbarBtnBg,
          color: theme.primaryText,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.toolbarBtnHoverBg; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isOpen ? theme.toolbarBtnHoverBg : theme.toolbarBtnBg; }}
      >
        🖼️
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-full mt-1 rounded-lg overflow-hidden shadow-xl z-50"
          style={{
            backgroundColor: theme.modalBg,
            border: `1px solid ${theme.borderColor}`,
            width: 280,
          }}
        >
          <div
            className="px-3 py-2 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${theme.borderColor}` }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.mutedText }}>
              Upload Items
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs px-1.5 py-0.5 rounded transition-colors"
              style={{ color: theme.mutedText }}
              onMouseEnter={(e) => { e.currentTarget.style.color = theme.primaryText; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = theme.mutedText; }}
            >
              ✕
            </button>
          </div>

          <div
            className="mx-3 mt-2 mb-2 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all"
            style={{
              backgroundColor: dropZoneBg,
              borderColor: dropZoneBorder,
              padding: '20px 16px',
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="text-2xl mb-1.5">📁</span>
            <span className="text-sm font-medium" style={{ color: theme.primaryText }}>
              {isDragOver ? 'Drop files here' : 'Drop files or click to browse'}
            </span>
            <span className="text-xs mt-1" style={{ color: theme.mutedText }}>
              Images will be referenced as items/filename
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileInput}
            />
          </div>

          {images.length > 0 && (
            <div
              className="mx-3 mb-2 px-3 py-2 rounded-md flex items-center justify-between"
              style={{
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.borderColor}`,
              }}
            >
              <span className="text-xs" style={{ color: theme.secondaryText }}>
                📎 Uploaded items: <strong style={{ color: theme.primaryText }}>{images.length}</strong>
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onViewItems(); setIsOpen(false); }}
                className="text-xs px-2 py-1 rounded font-medium transition-colors"
                style={{
                  backgroundColor: theme.accentBlue,
                  color: '#ffffff',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.accentBlue; }}
              >
                View Items
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}