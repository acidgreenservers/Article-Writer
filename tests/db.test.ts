import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as db from '../src/db';
import type { Document, DocumentImage } from '../src/types';

describe('Database Layer', () => {
  beforeEach(async () => {
    // Clear the database before each test
    const dbs = await indexedDB.databases();
    dbs.forEach(dbInfo => {
      if (dbInfo.name) indexedDB.deleteDatabase(dbInfo.name);
    });
  });

  it('should save and retrieve a document', async () => {
    const doc: Document = {
      id: 'test-doc',
      title: 'Test Title',
      content: 'Test Content',
      tags: ['test'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.saveDocument(doc);
    const retrieved = await db.getDocument('test-doc');
    expect(retrieved).toEqual(doc);
  });

  it('should list all documents', async () => {
    const doc1: Document = { id: 'doc1', title: 'T1', content: 'C1', tags: [], createdAt: 1, updatedAt: 2 };
    const doc2: Document = { id: 'doc2', title: 'T2', content: 'C2', tags: [], createdAt: 3, updatedAt: 4 };

    await db.saveDocument(doc1);
    await db.saveDocument(doc2);

    const all = await db.getAllDocuments();
    expect(all).toHaveLength(2);
    // Should be sorted by updatedAt descending
    expect(all[0].id).toBe('doc2');
    expect(all[1].id).toBe('doc1');
  });

  it('should delete a document and its images', async () => {
    const doc: Document = { id: 'doc1', title: 'T1', content: 'C1', tags: [], createdAt: 1, updatedAt: 2 };
    const image: DocumentImage = {
      id: 'img1',
      documentId: 'doc1',
      name: 'test.png',
      type: 'image/png',
      size: 100,
      data: new ArrayBuffer(100),
      createdAt: 1,
    };

    await db.saveDocument(doc);
    await db.saveImage(image);

    await db.deleteDocument('doc1');

    const retrievedDoc = await db.getDocument('doc1');
    const images = await db.getImagesByDocument('doc1');

    expect(retrievedDoc).toBeUndefined();
    expect(images).toHaveLength(0);
  });

  it('should handle image CRUD', async () => {
    const image: DocumentImage = {
      id: 'img1',
      documentId: 'doc1',
      name: 'test.png',
      type: 'image/png',
      size: 100,
      data: new ArrayBuffer(100),
      createdAt: 1,
    };

    await db.saveImage(image);
    const images = await db.getImagesByDocument('doc1');
    expect(images).toHaveLength(1);
    expect(images[0].id).toBe('img1');

    await db.deleteImage('img1');
    const imagesAfterDelete = await db.getImagesByDocument('doc1');
    expect(imagesAfterDelete).toHaveLength(0);
  });
});
