import { renderHook, act, waitFor } from '@testing-library/react';
import { useDocuments } from '../src/hooks/useDocuments';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as db from '../src/db';

vi.mock('../src/db', () => ({
  getAllDocuments: vi.fn(),
  saveDocument: vi.fn(),
  deleteDocument: vi.fn(),
  getImagesByDocument: vi.fn().mockResolvedValue([]),
  saveImage: vi.fn(),
  deleteImage: vi.fn(),
}));

describe('useDocuments Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load documents on mount', async () => {
    const mockDocs = [{ id: '1', title: 'Test', content: '', tags: [], createdAt: 1, updatedAt: 1 }];
    (db.getAllDocuments as any).mockResolvedValue(mockDocs);

    const { result } = renderHook(() => useDocuments());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.documents).toEqual(mockDocs);
    expect(result.current.activeDoc.id).toBe('1');
  });

  it('should create a new document if none exist', async () => {
    (db.getAllDocuments as any).mockResolvedValue([]);

    const { result } = renderHook(() => useDocuments());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.documents).toHaveLength(1);
    expect(result.current.activeDoc.title).toBe('Untitled Document');
  });

  it('should add a new document', async () => {
    (db.getAllDocuments as any).mockResolvedValue([]);
    const { result } = renderHook(() => useDocuments());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.addDocument();
    });

    expect(result.current.documents).toHaveLength(2);
  });

  it('should update a document', async () => {
    const mockDoc = { id: '1', title: 'Test', content: 'Initial', tags: [], createdAt: 1, updatedAt: 1 };
    (db.getAllDocuments as any).mockResolvedValue([mockDoc]);
    const { result } = renderHook(() => useDocuments());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.updateDocument('1', { content: 'Updated' });
    });

    expect(result.current.activeDoc.content).toBe('Updated');
  });
});
