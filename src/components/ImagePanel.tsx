import { useRef, useState, useEffect } from 'react';
import type { DocumentImage } from '../types';
import { formatFileSize, validateImageFile } from '../utils/documentUtils';

interface ImagePanelProps {
  images: DocumentImage[];
  onUpload: (file: File) => void;
  onRemove: (imageId: string) => void;
  isDark: boolean;
  documentTitle: string;
}

export function ImagePanel({ images, onUpload, onRemove, isDark, documentTitle }: ImagePanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Generate thumbnail object URLs for each image
  useEffect(() => {
    const newThumbs: Record<string, string> = {};
    images.forEach(img => {
      if (thumbs[img.id]) {
        newThumbs[img.id] = thumbs[img.id];
        return;
      }
      const blob = new Blob([img.data], { type: img.type });
      newThumbs[img.id] = URL.createObjectURL(blob);
    });

    // Revoke old URLs that are no longer in the images list
    const currentIds = new Set(images.map(i => i.id));
    Object.entries(thumbs).forEach(([id, url]) => {
      if (!currentIds.has(id) && !newThumbs[id]) {
        URL.revokeObjectURL(url);
      }
    });

    setThumbs(prev => ({ ...prev, ...newThumbs }));
  }, [images]);

  // Cleanup all object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(thumbs).forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setUploadError(null);

    const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
    if (!file) {
      setUploadError('No image file found in drop');
      return;
    }
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file');
      return;
    }
    onUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    onUpload(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className={isDark
      ? 'border-t border-[#1c2128] bg-[#0a0e14] transition-colors duration-300'
      : 'border-t border-gray-200 bg-gray-50 transition-colors duration-300'}>
      <div className="px-5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={isDark ? 'text-[11px] font-mono uppercase tracking-wider text-[#7d8590]' : 'text-[11px] font-mono uppercase tracking-wider text-gray-500'}>
            Attachments
          </span>
          {images.length > 0 && (
            <span className={isDark
              ? 'text-[10px] font-mono bg-[rgba(59,110,248,0.15)] text-blue-300 px-1.5 py-0.5 rounded'
              : 'text-[10px] font-mono bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded'}>
              {images.length}
            </span>
          )}
          <span className={isDark ? 'text-[10px] font-mono text-[#484f58]' : 'text-[10px] font-mono text-gray-300'}>
            for "{documentTitle}"
          </span>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          className={isDark
            ? 'text-[12px] text-blue-400 hover:text-blue-300 transition-colors cursor-pointer font-medium'
            : 'text-[12px] text-blue-500 hover:text-blue-600 transition-colors cursor-pointer font-medium'}
        >
          + Add Image
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      </div>

      {/* Upload error message */}
      {uploadError && (
        <div className="mx-5 mb-2 px-3 py-1.5 rounded text-[11px] font-mono bg-red-500/10 text-red-400 border border-red-500/20">
          ⚠ {uploadError}
        </div>
      )}

      {images.length === 0 ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={isDark
            ? 'mx-5 mb-3 border-[1.5px] border-dashed border-[rgba(59,110,248,0.25)] hover:border-[rgba(59,110,248,0.5)] rounded-lg py-6 px-4 text-center transition-colors'
            : 'mx-5 mb-3 border-[1.5px] border-dashed border-blue-200 hover:border-blue-400 rounded-lg py-6 px-4 text-center transition-colors'}
        >
          <div className="text-2xl mb-2">📥</div>
          <div className={isDark ? 'text-[#e6edf3] text-sm' : 'text-gray-700 text-sm'}>Drop images here</div>
          <div className={isDark ? 'text-[#6e7681] text-[11px] font-mono mt-1' : 'text-gray-400 text-[11px] font-mono mt-1'}>
            PNG · JPG · GIF · WEBP · SVG (max 10MB)
          </div>
        </div>
      ) : (
        <div className="px-5 pb-3 flex flex-col gap-1.5">
          {images.map((img) => (
            <div key={img.id} className={isDark
              ? 'flex items-center gap-3 p-2 bg-[#161b22] rounded-md border border-[#30363d] group transition-colors'
              : 'flex items-center gap-3 p-2 bg-white rounded-md border border-gray-200 group transition-colors'}>
              <div className={isDark
                ? 'w-9 h-9 rounded bg-[#1c2128] flex items-center justify-center flex-shrink-0 overflow-hidden'
                : 'w-9 h-9 rounded bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden'}>
                {thumbs[img.id] ? (
                  <img src={thumbs[img.id]} alt={img.name} className="w-full h-full object-cover rounded" />
                ) : (
                  <span className="text-lg">📷</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className={isDark ? 'text-[#e6edf3] text-[12px] font-medium truncate' : 'text-gray-800 text-[12px] font-medium truncate'}>
                  {img.name}
                </div>
                <div className={isDark ? 'text-[#6e7681] text-[11px] font-mono' : 'text-gray-400 text-[11px] font-mono'}>
                  {formatFileSize(img.size)} · doc:{img.documentId.slice(0, 6)}
                </div>
              </div>
              <button
                onClick={() => onRemove(img.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all cursor-pointer p-1"
                title="Remove image"
              >
                ✕
              </button>
            </div>
          ))}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileRef.current?.click()}
            className={isDark
              ? 'border-[1px] border-dashed border-[rgba(59,110,248,0.15)] hover:border-[rgba(59,110,248,0.35)] rounded-md py-2 text-center transition-colors cursor-pointer'
              : 'border-[1px] border-dashed border-blue-100 hover:border-blue-300 rounded-md py-2 text-center transition-colors cursor-pointer'}
          >
            <span className={isDark ? 'text-[#6e7681] text-[11px]' : 'text-gray-400 text-[11px]'}>Drop or click to add more</span>
          </div>
        </div>
      )}
    </div>
  );
}