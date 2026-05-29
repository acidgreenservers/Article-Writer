import { useEffect, useRef, useCallback } from 'react';
import type { Document } from '../types';

const AUTO_SAVE_DELAY = 3000;

export function useAutoSave(
  documents: Document[],
  onSave: () => void
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>('');

  const getSnapshot = useCallback(() => {
    return JSON.stringify(documents);
  }, [documents]);

  useEffect(() => {
    const snapshot = getSnapshot();

    // Don't trigger if nothing changed since last save
    if (snapshot === lastSavedRef.current) return;

    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set a new timer for autosave
    timerRef.current = setTimeout(() => {
      lastSavedRef.current = snapshot;
      onSave();
    }, AUTO_SAVE_DELAY);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [documents, getSnapshot, onSave]);

  // Mark manual saves in the snapshot tracker
  const markSaved = useCallback(() => {
    lastSavedRef.current = getSnapshot();
  }, [getSnapshot]);

  return { markSaved };
}