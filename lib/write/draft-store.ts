import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "blog-drafts";
const DB_VERSION = 1;
const STORE_NAME = "drafts";
const DRAFT_KEY = "current";

export interface DraftData {
  langContents: Record<string, { title: string; markdown: string }>;
  activeLang: string;
  classification: string;
  category: string;
  slug: string;
  thumbnailUrl: string;
  updatedAt: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

export async function saveDraft(data: DraftData): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, { ...data, updatedAt: Date.now() }, DRAFT_KEY);
}

export async function loadDraft(): Promise<DraftData | undefined> {
  const db = await getDB();
  return db.get(STORE_NAME, DRAFT_KEY);
}

export async function clearDraft(): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, DRAFT_KEY);
}
