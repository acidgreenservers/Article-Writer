import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Document, DocumentImage, SaveState } from '../types';
import { createNewDocument } from '../utils/documentUtils';
import {
  getAllDocuments,
  saveDocument,
  deleteDocument as dbDelete,
  getImagesByDocument,
  saveImage as dbSaveImage,
  deleteImage as dbDeleteImage
} from '../db';

const AUTO_SAVE_MS = 2000;

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDocId, setActiveDocId] = useState('');
  const [images, setImages] = useState<DocumentImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('idle');

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snapshotRef = useRef('');

  // Initial load
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const docs = await getAllDocuments();
        if (cancelled) return;

        if (docs.length === 0) {
          const newDoc = createNewDocument();
          setDocuments([newDoc]);
          setActiveDocId(newDoc.id);
          snapshotRef.current = JSON.stringify([newDoc]);
        } else {
          setDocuments(docs);
          setActiveDocId(docs[0].id);
          snapshotRef.current = JSON.stringify(docs);
        }
      } catch (e) {
        console.error('[useDocuments] Load failed:', e);
        if (!cancelled) {
          const newDoc = createNewDocument();
          setDocuments([newDoc]);
          setActiveDocId(newDoc.id);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Load images when active document changes
  useEffect(() => {
    if (!activeDocId) return;
    let cancelled = false;

    (async () => {
      try {
        const docImages = await getImagesByDocument(activeDocId);
        if (!cancelled) {
          setImages(docImages);
        }
      } catch (e) {
        console.error('[useDocuments] Failed to load images:', e);
      }
    })();

    return () => { cancelled = true; };
  }, [activeDocId]);

  // Auto-save documents
  useEffect(() => {
    if (isLoading) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    const current = JSON.stringify(documents);
    if (current === snapshotRef.current) return;

    timerRef.current = setTimeout(async () => {
      setSaveState('saving');
      try {
        const prevDocs = JSON.parse(snapshotRef.current) as Document[];
        for (const doc of documents) {
          const prevDoc = prevDocs.find(d => d.id === doc.id);
          if (JSON.stringify(doc) !== JSON.stringify(prevDoc)) {
            await saveDocument(doc);
          }
        }
        snapshotRef.current = current;
        setSaveState('saved');
        setTimeout(() => setSaveState(prev => prev === 'saved' ? 'idle' : prev), 2000);
      } catch (e) {
        console.error('[useDocuments] Auto-save failed:', e);
        setSaveState('error');
      }
    }, AUTO_SAVE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [documents, isLoading]);

  const updateDocument = useCallback((id: string, updates: Partial<Document>) => {
    setDocuments(prev => prev.map(d =>
      d.id === id ? { ...d, ...updates, updatedAt: Date.now() } : d
    ));
  }, []);

  const addDocument = useCallback(() => {
    const newDoc = createNewDocument();
    setDocuments(prev => [...prev, newDoc]);
    setActiveDocId(newDoc.id);
  }, []);

  const removeDocument = useCallback(async (id: string) => {
    try {
      await dbDelete(id);
      setDocuments(prev => {
        const remaining = prev.filter(d => d.id !== id);
        if (remaining.length === 0) {
          const newDoc = createNewDocument();
          setActiveDocId(newDoc.id);
          return [newDoc];
        }
        if (activeDocId === id) {
          setActiveDocId(remaining[0].id);
        }
        return remaining;
      });
    } catch (e) {
      console.error('[useDocuments] Delete failed:', e);
    }
  }, [activeDocId]);

  const addImage = useCallback(async (image: DocumentImage) => {
    try {
      await dbSaveImage(image);
      if (image.documentId === activeDocId) {
        setImages(prev => [...prev, image]);
      }
    } catch (e) {
      console.error('[useDocuments] Save image failed:', e);
    }
  }, [activeDocId]);

  const removeImage = useCallback(async (id: string) => {
    try {
      await dbDeleteImage(id);
      setImages(prev => prev.filter(img => img.id !== id));
    } catch (e) {
      console.error('[useDocuments] Delete image failed:', e);
    }
  }, []);

  const activeDoc = documents.find(d => d.id === activeDocId) || documents[0];

  // Memoize mapped images to avoid memory leaks with createObjectURL
  const mappedImages = useMemo(() => {
    return images.map(img => {
      const url = URL.createObjectURL(new Blob([img.data], { type: img.type }));
      return {
        id: img.id,
        name: img.name,
        url,
        type: img.type,
        size: img.size
      };
    });
  }, [images]);

  // Cleanup Blob URLs
  useEffect(() => {
    return () => {
      mappedImages.forEach(img => URL.revokeObjectURL(img.url));
    };
  }, [mappedImages]);

  return {
    documents,
    activeDoc,
    activeDocId,
    setActiveDocId,
    images: mappedImages,
    isLoading,
    saveState,
    updateDocument,
    addDocument,
    removeDocument,
    addImage,
    removeImage,
  };
}
