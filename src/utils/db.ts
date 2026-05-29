import type { Document, DocumentImage } from '../types';

const DB_NAME = 'article-writer-db';
const DB_VERSION = 2;
const DOC_STORE = 'documents';
const IMG_STORE = 'images';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const oldVersion = event.oldVersion;

      console.log(`[db] Upgrade triggered: v${oldVersion} → v${DB_VERSION}`);

      // Create document store
      if (!db.objectStoreNames.contains(DOC_STORE)) {
        const store = db.createObjectStore(DOC_STORE, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
        console.log('[db] Created documents store with updatedAt index');
      }

      // Create or migrate image store
      if (!db.objectStoreNames.contains(IMG_STORE)) {
        const store = db.createObjectStore(IMG_STORE, { keyPath: 'id' });
        store.createIndex('documentId', 'documentId', { unique: false });
        console.log('[db] Created images store with documentId index');
      } else if (oldVersion < 2) {
        // Migration: ensure documentId index exists on existing store
        const txn = (event.target as IDBOpenDBRequest).transaction;
        if (txn) {
          const store = txn.objectStore(IMG_STORE);
          if (!store.indexNames.contains('documentId')) {
            store.createIndex('documentId', 'documentId', { unique: false });
            console.log('[db] Migrated images store: added documentId index');
          }
        }
      }
    };

    request.onsuccess = () => {
      console.log('[db] Database opened successfully');
      resolve(request.result);
    };
    request.onerror = () => {
      console.error('[db] Failed to open database:', request.error);
      reject(request.error);
    };
  });
}

// ── Document Operations ────────────────────────────────────────

export async function getAllDocuments(): Promise<Document[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DOC_STORE, 'readonly');
    const store = tx.objectStore(DOC_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      const docs = (request.result as Document[]).sort(
        (a, b) => b.updatedAt - a.updatedAt
      );
      console.log(`[db] Loaded ${docs.length} documents`);
      resolve(docs);
    };
    request.onerror = () => {
      console.error('[db] Failed to load documents:', request.error);
      reject(request.error);
    };
  });
}

export async function saveDocument(doc: Document): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DOC_STORE, 'readwrite');
    tx.objectStore(DOC_STORE).put(doc);
    tx.oncomplete = () => {
      console.log(`[db] Saved document: "${doc.title}" (${doc.id})`);
      resolve();
    };
    tx.onerror = () => {
      console.error(`[db] Failed to save document "${doc.id}":`, tx.error);
      reject(tx.error);
    };
  });
}

export async function deleteDocument(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DOC_STORE, 'readwrite');
    tx.objectStore(DOC_STORE).delete(id);
    tx.oncomplete = () => {
      console.log(`[db] Deleted document: ${id}`);
      resolve();
    };
    tx.onerror = () => {
      console.error(`[db] Failed to delete document ${id}:`, tx.error);
      reject(tx.error);
    };
  });
}

// ── Image Operations ───────────────────────────────────────────

export async function getImagesByDocument(documentId: string): Promise<DocumentImage[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMG_STORE, 'readonly');
    const store = tx.objectStore(IMG_STORE);
    const index = store.index('documentId');
    const request = index.getAll(documentId);

    request.onsuccess = () => {
      const images = request.result as DocumentImage[];
      console.log(`[db] Loaded ${images.length} images for document ${documentId}`);
      resolve(images);
    };
    request.onerror = () => {
      console.error(`[db] Failed to load images for document ${documentId}:`, request.error);
      reject(request.error);
    };
  });
}

export async function saveImage(image: DocumentImage): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMG_STORE, 'readwrite');
    tx.objectStore(IMG_STORE).put(image);
    tx.oncomplete = () => {
      console.log(`[db] Saved image: "${image.name}" → doc:${image.documentId} (${image.size} bytes)`);
      resolve();
    };
    tx.onerror = () => {
      console.error(`[db] Failed to save image "${image.name}":`, tx.error);
      reject(tx.error);
    };
  });
}

export async function deleteImage(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMG_STORE, 'readwrite');
    tx.objectStore(IMG_STORE).delete(id);
    tx.oncomplete = () => {
      console.log(`[db] Deleted image: ${id}`);
      resolve();
    };
    tx.onerror = () => {
      console.error(`[db] Failed to delete image ${id}:`, tx.error);
      reject(tx.error);
    };
  });
}

export async function deleteImagesByDocument(documentId: string): Promise<number> {
  const images = await getImagesByDocument(documentId);
  if (images.length === 0) {
    console.log(`[db] No images to delete for document ${documentId}`);
    return 0;
  }

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMG_STORE, 'readwrite');
    const store = tx.objectStore(IMG_STORE);
    for (const img of images) {
      store.delete(img.id);
    }
    tx.oncomplete = () => {
      console.log(`[db] Deleted ${images.length} images for document ${documentId}`);
      resolve(images.length);
    };
    tx.onerror = () => {
      console.error(`[db] Failed to delete images for document ${documentId}:`, tx.error);
      reject(tx.error);
    };
  });
}