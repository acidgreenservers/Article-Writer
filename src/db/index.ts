import type { Document } from '../types';

const DB_NAME = 'article-writer-db';
const DB_VERSION = 1;
const DOC_STORE = 'documents';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      console.log(`[db] Schema upgrade: v${event.oldVersion} → v${DB_VERSION}`);
      if (!db.objectStoreNames.contains(DOC_STORE)) {
        const store = db.createObjectStore(DOC_STORE, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
        console.log('[db] ✓ Created "documents" store');
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      console.log('[db] ✓ Database opened. Stores:', Array.from(db.objectStoreNames).join(', '));
      resolve(db);
    };

    request.onerror = () => {
      console.error('[db] ✗ Open failed:', request.error);
      reject(request.error);
    };
  });
}

function closeDB(db: IDBDatabase) {
  try { db.close(); } catch (_) { /* already closed */ }
}

export async function getAllDocuments(): Promise<Document[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DOC_STORE, 'readonly');
    const store = tx.objectStore(DOC_STORE);
    const req = store.getAll();

    req.onsuccess = () => {
      const docs = (req.result as Document[]).sort((a, b) => b.updatedAt - a.updatedAt);
      console.log(`[db] → Loaded ${docs.length} document(s)`);
      docs.forEach(d => console.log(`[db]   "${d.title}" id=${d.id.slice(0,8)} ${d.content.length} chars`));
      resolve(docs);
    };

    req.onerror = () => { reject(req.error); };
    tx.oncomplete = () => closeDB(db);
  });
}

export async function getDocument(id: string): Promise<Document | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DOC_STORE, 'readonly');
    const store = tx.objectStore(DOC_STORE);
    const req = store.get(id);

    req.onsuccess = () => resolve(req.result as Document | undefined);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => closeDB(db);
  });
}

export async function saveDocument(doc: Document): Promise<Document> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DOC_STORE, 'readwrite');
    const store = tx.objectStore(DOC_STORE);
    const putReq = store.put(doc);

    putReq.onsuccess = () => {
      console.log(`[db] → PUT ok: "${doc.title}" id=${doc.id.slice(0,8)}`);
    };

    putReq.onerror = () => {
      console.error(`[db] ✗ PUT failed:`, putReq.error);
      reject(putReq.error);
    };

    tx.oncomplete = async () => {
      closeDB(db);
      try {
        const verified = await getDocument(doc.id);
        if (verified) {
          console.log(`[db] ✓ Verified: "${verified.title}" ${verified.content.length} chars`);
          resolve(verified);
        } else {
          console.error(`[db] ✗ VERIFY FAILED: ${doc.id} not found after save`);
          reject(new Error('Document not found after save'));
        }
      } catch (e) {
        console.error('[db] ✗ VERIFY error:', e);
        reject(e);
      }
    };

    tx.onerror = () => { reject(tx.error); };
  });
}

export async function deleteDocument(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DOC_STORE, 'readwrite');
    const store = tx.objectStore(DOC_STORE);
    store.delete(id);

    tx.oncomplete = () => {
      console.log(`[db] → DELETE ok: id=${id.slice(0,8)}`);
      closeDB(db);
      resolve();
    };

    tx.onerror = () => { reject(tx.error); };
  });
}