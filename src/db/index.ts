import type { Document, DocumentImage } from '../types';

const DB_NAME = 'article-writer-db';
const DB_VERSION = 3;
const DOC_STORE = 'documents';
const IMG_STORE = 'images';

/**
 * Opens the IndexedDB with a robust migration system.
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      const oldVersion = event.oldVersion;
      const transaction = request.transaction!;

      console.log(`[db] Upgrade triggered: v${oldVersion} → v${DB_VERSION}`);

      // Version 1: Initial schema
      if (oldVersion < 1) {
        if (!db.objectStoreNames.contains(DOC_STORE)) {
          const store = db.createObjectStore(DOC_STORE, { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
          console.log('[db] v1: Created documents store');
        }
      }

      // Version 2: Added image store
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains(IMG_STORE)) {
          const store = db.createObjectStore(IMG_STORE, { keyPath: 'id' });
          store.createIndex('documentId', 'documentId', { unique: false });
          console.log('[db] v2: Created images store');
        } else {
          const store = transaction.objectStore(IMG_STORE);
          if (!store.indexNames.contains('documentId')) {
            store.createIndex('documentId', 'documentId', { unique: false });
            console.log('[db] v2: Added documentId index to images store');
          }
        }
      }

      // Version 3: Future-proofing and ensuring consistency
      if (oldVersion < 3) {
        console.log('[db] v3: Migration complete');
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.error('[db] Failed to open database:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Helper for running transactions.
 */
async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const request = callback(store);

    if (request) {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }

    tx.oncomplete = () => {
      if (!request) resolve(undefined as T);
      db.close();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

// ── Document Operations ────────────────────────────────────────

export async function getAllDocuments(): Promise<Document[]> {
  const docs = await withStore<Document[]>(DOC_STORE, 'readonly', (store) => store.getAll());
  return docs.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getDocument(id: string): Promise<Document | undefined> {
  return withStore<Document | undefined>(DOC_STORE, 'readonly', (store) => store.get(id));
}

export async function saveDocument(doc: Document): Promise<void> {
  await withStore<void>(DOC_STORE, 'readwrite', (store) => {
    store.put(doc);
  });
}

export async function deleteDocument(id: string): Promise<void> {
  // When deleting a document, we should also delete its images for a "smooth topology"
  await deleteImagesByDocument(id);
  await withStore<void>(DOC_STORE, 'readwrite', (store) => {
    store.delete(id);
  });
}

// ── Image Operations ───────────────────────────────────────────

export async function getAllImages(): Promise<DocumentImage[]> {
  return withStore<DocumentImage[]>(IMG_STORE, 'readonly', (store) => store.getAll());
}

export async function getImagesByDocument(documentId: string): Promise<DocumentImage[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMG_STORE, 'readonly');
    const store = tx.objectStore(IMG_STORE);
    const index = store.index('documentId');
    const request = index.getAll(documentId);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

export async function saveImage(image: DocumentImage): Promise<void> {
  await withStore<void>(IMG_STORE, 'readwrite', (store) => {
    store.put(image);
  });
}

export async function deleteImage(id: string): Promise<void> {
  await withStore<void>(IMG_STORE, 'readwrite', (store) => {
    store.delete(id);
  });
}

export async function deleteImagesByDocument(documentId: string): Promise<void> {
  const images = await getImagesByDocument(documentId);
  if (images.length === 0) return;

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMG_STORE, 'readwrite');
    const store = tx.objectStore(IMG_STORE);
    for (const img of images) {
      store.delete(img.id);
    }
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}
