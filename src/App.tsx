import React, { useEffect } from 'react';
import { useBoardStore } from './store/boardStore';
import { useAutosave } from './hooks/useAutosave';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { TopBar } from './components/layout/TopBar';
import { Toolbar } from './components/layout/Toolbar';
import { PropertiesPanel } from './components/layout/PropertiesPanel';
import { BottomBar } from './components/layout/BottomBar';
import { WhiteboardCanvas } from './components/canvas/WhiteboardCanvas';
import { BoardManager } from './dialogs/BoardManager';
import { ExportDialog } from './dialogs/ExportDialog';
import { ShortcutsDialog } from './dialogs/ShortcutsDialog';

export function App() {
  const theme = useBoardStore((s) => s.theme);

  // Initialize autosave & global keyboard shortcuts
  useAutosave();
  useKeyboardShortcuts();

  // Keep dark class on html root in sync with theme state
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans select-none antialiased">
      {/* Top Navigation Bar */}
      <TopBar />

      {/* Main Interactive Canvas Workspace Area */}
      <div className="relative flex-1 w-full h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Floating Toolbars & Panels */}
        <Toolbar />
        <PropertiesPanel />
        <BottomBar />

        {/* Core SVG Canvas */}
        <WhiteboardCanvas />
      </div>

      {/* Modals & Dialogs */}
      <BoardManager />
      <ExportDialog />
      <ShortcutsDialog />
    </div>
  );
}

export default App;
