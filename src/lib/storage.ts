import { openDB, IDBPDatabase } from 'idb';
import { BoardData, BoardMetadata } from '../types/board';

const DB_NAME = 'canvascraft_db';
const DB_VERSION = 1;
const BOARDS_STORE = 'boards';
const META_STORE = 'metadata';
const ACTIVE_BOARD_KEY = 'canvascraft_active_board_id';
const THEME_KEY = 'canvascraft_theme';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(BOARDS_STORE)) {
          db.createObjectStore(BOARDS_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(META_STORE)) {
          db.createObjectStore(META_STORE, { keyPath: 'id' });
        }
      },
    }).catch((err) => {
      console.warn('IndexedDB unavailable, falling back to localStorage:', err);
      return null as unknown as IDBPDatabase;
    });
  }
  return dbPromise;
}

/**
 * Save board data and update metadata
 */
export async function saveBoard(board: BoardData): Promise<void> {
  const metadata: BoardMetadata = {
    id: board.id,
    title: board.title,
    createdAt: board.createdAt,
    updatedAt: Date.now(),
    elementCount: board.elements.length,
  };

  const updatedBoard: BoardData = {
    ...board,
    updatedAt: metadata.updatedAt,
  };

  try {
    const db = await getDb();
    if (db) {
      const tx = db.transaction([BOARDS_STORE, META_STORE], 'readwrite');
      await Promise.all([
        tx.objectStore(BOARDS_STORE).put(updatedBoard),
        tx.objectStore(META_STORE).put(metadata),
        tx.done,
      ]);
      return;
    }
  } catch (err) {
    console.warn('IndexedDB write failed, writing to localStorage', err);
  }

  // Fallback to localStorage
  try {
    localStorage.setItem(`board_${board.id}`, JSON.stringify(updatedBoard));
    const allMeta = getLocalStorageMetaList();
    const existingIdx = allMeta.findIndex((m) => m.id === board.id);
    if (existingIdx >= 0) {
      allMeta[existingIdx] = metadata;
    } else {
      allMeta.unshift(metadata);
    }
    localStorage.setItem('boards_meta_index', JSON.stringify(allMeta));
  } catch (e) {
    console.error('LocalStorage save failed:', e);
  }
}

/**
 * Retrieve a specific board by ID
 */
export async function getBoard(id: string): Promise<BoardData | null> {
  try {
    const db = await getDb();
    if (db) {
      const board = await db.get(BOARDS_STORE, id);
      if (board) return board as BoardData;
    }
  } catch (err) {
    console.warn('IndexedDB read failed:', err);
  }

  // LocalStorage fallback
  try {
    const raw = localStorage.getItem(`board_${id}`);
    if (raw) return JSON.parse(raw) as BoardData;
  } catch (e) {
    console.error('LocalStorage read failed:', e);
  }

  return null;
}

/**
 * Get metadata list of all saved boards
 */
export async function getAllBoards(): Promise<BoardMetadata[]> {
  try {
    const db = await getDb();
    if (db) {
      const metaList = await db.getAll(META_STORE);
      if (metaList && metaList.length > 0) {
        return (metaList as BoardMetadata[]).sort((a, b) => b.updatedAt - a.updatedAt);
      }
    }
  } catch (err) {
    console.warn('IndexedDB getAll failed:', err);
  }

  return getLocalStorageMetaList().sort((a, b) => b.updatedAt - a.updatedAt);
}

function getLocalStorageMetaList(): BoardMetadata[] {
  try {
    const raw = localStorage.getItem('boards_meta_index');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Delete a board
 */
export async function deleteBoard(id: string): Promise<void> {
  try {
    const db = await getDb();
    if (db) {
      const tx = db.transaction([BOARDS_STORE, META_STORE], 'readwrite');
      await Promise.all([
        tx.objectStore(BOARDS_STORE).delete(id),
        tx.objectStore(META_STORE).delete(id),
        tx.done,
      ]);
    }
  } catch (err) {
    console.warn('IndexedDB delete failed:', err);
  }

  try {
    localStorage.removeItem(`board_${id}`);
    const metaList = getLocalStorageMetaList().filter((m) => m.id !== id);
    localStorage.setItem('boards_meta_index', JSON.stringify(metaList));
  } catch (e) {
    console.error('LocalStorage delete error:', e);
  }
}

/**
 * Duplicate a board
 */
export async function duplicateBoard(id: string): Promise<BoardData | null> {
  const original = await getBoard(id);
  if (!original) return null;

  const newId = 'board_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const now = Date.now();
  const duplicated: BoardData = {
    ...original,
    id: newId,
    title: `${original.title} (Copy)`,
    createdAt: now,
    updatedAt: now,
  };

  await saveBoard(duplicated);
  return duplicated;
}

/**
 * Manage active board ID
 */
export function getActiveBoardId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_BOARD_KEY) || localStorage.getItem('collabboard_active_board_id');
  } catch {
    return null;
  }
}

export function setActiveBoardId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_BOARD_KEY, id);
  } catch (e) {
    console.error(e);
  }
}

/**
 * Theme settings
 */
export function getSavedTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem(THEME_KEY) || localStorage.getItem('collabboard_theme');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // ignore
  }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function saveThemePreference(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
}
