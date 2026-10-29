import { useEffect } from 'react';
import { useBoardStore } from '../store/boardStore';
import { ToolType } from '../types/canvasObjects';

export function useKeyboardShortcuts() {
  const {
    tool,
    setTool,
    undo,
    redo,
    deleteSelected,
    duplicateSelected,
    copySelected,
    pasteClipboard,
    selectAll,
    clearSelection,
    selectedIds,
    setEditingId,
    resetZoom,
    fitToContent,
    setShortcutsOpen,
    isShortcutsOpen,
    isBoardManagerOpen,
    setBoardManagerOpen,
    isExportOpen,
    setExportOpen,
    currentView,
  } = useBoardStore();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Only execute canvas shortcuts when the user is inside the canvas view
      if (currentView !== 'canvas') {
        return;
      }

      // Check if user is typing into input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Undo / Redo
      if (cmdOrCtrl && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
        return;
      }
      if ((cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'z') || (cmdOrCtrl && e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        redo();
        return;
      }

      // Selection & Clipboard
      if (cmdOrCtrl && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        selectAll();
        return;
      }
      if (cmdOrCtrl && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        copySelected();
        return;
      }
      if (cmdOrCtrl && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        pasteClipboard();
        return;
      }
      if (cmdOrCtrl && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelected();
        return;
      }

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
        return;
      }

      // Enter or F2 to edit selected item
      if ((e.key === 'Enter' || e.key === 'F2') && selectedIds.length === 1) {
        e.preventDefault();
        setEditingId(selectedIds[0]);
        return;
      }

      // Escape
      if (e.key === 'Escape') {
        if (isShortcutsOpen) setShortcutsOpen(false);
        if (isBoardManagerOpen) setBoardManagerOpen(false);
        if (isExportOpen) setExportOpen(false);
        clearSelection();
        setTool('select');
        return;
      }

      // View shortcuts
      if (cmdOrCtrl && e.key === '0') {
        e.preventDefault();
        resetZoom();
        return;
      }
      if (cmdOrCtrl && e.key === '1') {
        e.preventDefault();
        fitToContent();
        return;
      }

      // Shortcuts modal help
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShortcutsOpen(!isShortcutsOpen);
        return;
      }

      // Tool switches without modifier keys
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const key = e.key.toLowerCase();
        const toolMap: Record<string, ToolType> = {
          v: 'select',
          h: 'pan',
          p: 'pen',
          e: 'eraser',
          r: 'rectangle',
          o: 'ellipse',
          l: 'line',
          a: 'arrow',
          t: 'text',
          s: 'sticky',
          c: 'connector',
          f: 'frame',
        };

        if (toolMap[key]) {
          e.preventDefault();
          setTool(toolMap[key]);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    tool,
    setTool,
    undo,
    redo,
    deleteSelected,
    duplicateSelected,
    copySelected,
    pasteClipboard,
    selectAll,
    clearSelection,
    selectedIds,
    setEditingId,
    resetZoom,
    fitToContent,
    isShortcutsOpen,
    setShortcutsOpen,
    isBoardManagerOpen,
    setBoardManagerOpen,
    isExportOpen,
    setExportOpen,
  ]);
}
