import { useRef, useState } from 'react';

interface ImageUploaderProps {
  onUpload: (files: File[]) => void;
  onViewItems: () => void;
  isDark: boolean;
  uploadedImages: { id: string; name: string }[];
}

export function ImageUploader({ onUpload, onViewItems, isDark, uploadedImages }: ImageUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length > 0) {
      onUpload(imageFiles);
    }
  };

  return (
    <div className="space-y-2">
      <div
        onClick={() => fileRef.current?.click()}
        onDrop={e => { e.preventDefault(); setIsDragOver(false); handleFiles(e.dataTransfer.files); }}
        onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={e => { e.preventDefault(); setIsDragOver(false); }}
        className="relative flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200"
        style={{
          backgroundColor: isDragOver ? (isDark ? '#1a3a5c' : '#dbeafe') : (isDark ? '#0d2847' : '#eff6ff'),
          borderColor: isDragOver ? '#3b82f6' : (isDark ? '#1e4a7a' : '#93c5fd'),
        }}
      >
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => { handleFiles(e.target.files); if (fileRef.current) fileRef.current.value = ''; }} />
        <div className="flex items-center justify-center w-10 h-10 rounded-full" style={{ backgroundColor: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: isDark ? '#58a6ff' : '#2563eb' }}>{isDragOver ? 'Drop images here' : 'Click or drag images to upload'}</p>
          <p className="text-xs mt-0.5" style={{ color: isDark ? '#6e7681' : '#9ca3af' }}>Stored as items/filename references</p>
        </div>
      </div>

      {uploadedImages.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2 rounded-md" style={{ backgroundColor: isDark ? '#161b22' : '#f3f4f6', border: '1px solid ' + (isDark ? '#21262d' : '#e5e7eb') }}>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-5 h-5 rounded-full" style={{ backgroundColor: isDark ? '#238636' : '#10b981' }}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <span className="text-xs font-medium" style={{ color: isDark ? '#c9d1d9' : '#4b5563' }}>{uploadedImages.length} uploaded item{uploadedImages.length !== 1 ? 's' : ''}</span>
          </div>
          <button onClick={onViewItems} className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium" style={{ backgroundColor: isDark ? '#21262d' : '#e5e7eb', color: isDark ? '#58a6ff' : '#2563eb', border: '1px solid ' + (isDark ? '#30363d' : '#d1d5db') }}>View Items</button>
        </div>
      )}
    </div>
  );
}
