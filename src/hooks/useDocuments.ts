import { useState, useEffect, useCallback, useRef } from 'react';
import type { Document, SaveState } from '../types';
import { createNewDocument } from '../utils/documentUtils';
import { getAllDocuments, saveDocument, deleteDocument as dbDelete } from '../db';

const AUTO_SAVE_MS = 2000;

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDocId, setActiveDocId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snapshotRef = useRef('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        console.log('[useDocuments] Loading from IndexedDB...');
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
          console.log(`[useDocuments] Loaded ${docs.length} doc(s)`);
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

  useEffect(() => {
    if (isLoading) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    const current = JSON.stringify(documents);
    if (current === snapshotRef.current) return;

    timerRef.current = setTimeout(async () => {
      console.log('[useDocuments] Auto-saving...');
      setSaveState('saving');

      try {
        for (const doc of documents) {
          await saveDocument(doc);
        }
        snapshotRef.current = JSON.stringify(documents);
        setSaveState('saved');
        console.log('[useDocuments] ✓ Auto-save complete');
        setTimeout(() => setSaveState(prev => prev === 'saved' ? 'idle' : prev), 2000);
      } catch (e) {
        console.error('[useDocuments] ✗ Auto-save failed:', e);
        setSaveState('error');
        setTimeout(() => setSaveState(prev => prev === 'error' ? 'idle' : prev), 3000);
      }
    }, AUTO_SAVE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [documents, isLoading]);

  const manualSave = useCallback(async () => {
    console.log('[useDocuments] Manual save...');
    setSaveState('saving');

    try {
      for (const doc of documents) {
        await saveDocument(doc);
      }
      snapshotRef.current = JSON.stringify(documents);
      setSaveState('saved');
      console.log('[useDocuments] ✓ Manual save complete');
      setTimeout(() => setSaveState(prev => prev === 'saved' ? 'idle' : prev), 2000);
    } catch (e) {
      console.error('[useDocuments] ✗ Manual save failed:', e);
      setSaveState('error');
      setTimeout(() => setSaveState(prev => prev === 'error' ? 'idle' : prev), 3000);
    }
  }, [documents]);

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
    if (documents.length <= 1) return;

    try {
      await dbDelete(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      setActiveDocId(prev => {
        const remaining = documents.filter(d => d.id !== id);
        if (prev === id || !remaining.find(d => d.id === prev)) {
          return remaining[0]?.id || '';
        }
        return prev;
      });
    } catch (e) {
      console.error('[useDocuments] Delete failed:', e);
    }
  }, [documents]);

  const activeDoc = documents.find(d => d.id === activeDocId) || documents[0];

  return {
    documents,
    activeDoc,
    activeDocId,
    setActiveDocId,
    isLoading,
    saveState,
    updateDocument,
    addDocument,
    removeDocument,
    manualSave,
  };
}