import { useEffect, useRef } from 'react';
import { useBoardStore } from '../store/boardStore';
import { saveBoard, getBoard, getActiveBoardId, getAllBoards } from '../lib/storage';

export function useAutosave() {
  const { id, title, createdAt, updatedAt, elements, viewport, setAutoSaveStatus, loadBoard } = useBoardStore();
  const isFirstMount = useRef(true);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initial load on application mount
  useEffect(() => {
    async function initBoard() {
      try {
        const activeId = getActiveBoardId();
        if (activeId) {
          const saved = await getBoard(activeId);
          if (saved) {
            loadBoard(saved);
            return;
          }
        }
        // If no active board saved yet, check if any boards exist in DB
        const all = await getAllBoards();
        if (all && all.length > 0) {
          const first = await getBoard(all[0].id);
          if (first) {
            loadBoard(first);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not restore previous board:', err);
      }
    }
    initBoard();
  }, [loadBoard]);

  // Autosave listener whenever board changes
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    setAutoSaveStatus('saving');

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        await saveBoard({
          id,
          title,
          createdAt,
          updatedAt: Date.now(),
          elements,
          viewport,
        });
        setAutoSaveStatus('saved');
      } catch (e) {
        console.error('Failed to autosave board:', e);
        setAutoSaveStatus('error');
      }
    }, 800);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [id, title, elements, viewport, createdAt, updatedAt, setAutoSaveStatus]);
}
