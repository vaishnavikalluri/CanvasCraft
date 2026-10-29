import React, { useState, useRef, useEffect } from 'react';
import { useBoardStore } from '../../store/boardStore';
import { 
  Undo2, 
  Redo2, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Sun, 
  Moon, 
  Download, 
  FolderOpen, 
  Grid, 
  Magnet, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  HelpCircle,
  Edit2,
  Check,
  Home
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    title,
    setTitle,
    viewport,
    undoStack,
    redoStack,
    undo,
    redo,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToContent,
    theme,
    toggleTheme,
    gridMode,
    setGridMode,
    snapToGrid,
    toggleSnapToGrid,
    autoSaveStatus,
    setBoardManagerOpen,
    setExportOpen,
    setShortcutsOpen,
    setCurrentView,
  } = useBoardStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTempTitle(title);
  }, [title]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleSubmit = () => {
    if (tempTitle.trim().length > 0) {
      setTitle(tempTitle.trim());
    } else {
      setTempTitle(title);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setTempTitle(title);
      setIsEditingTitle(false);
    }
  };

  const cycleGridMode = () => {
    if (gridMode === 'dots') setGridMode('lines');
    else if (gridMode === 'lines') setGridMode('none');
    else setGridMode('dots');
  };

  const zoomPercent = Math.round(viewport.zoom * 100);

  return (
    <header className="h-14 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 flex items-center justify-between z-30 select-none transition-colors">
      {/* Left Section: Logo, Title, Board Manager */}
      <div className="flex items-center gap-3">
        {/* Logo & Brand (Click to go Home) */}
        <button 
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-2 cursor-pointer group text-left focus:outline-none"
          title="Return to CanvasCraft Home"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 via-indigo-600 to-fuchsia-600 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="3" />
              <path d="m9 15 3-3 3 3" />
              <path d="M9 9h.01" />
            </svg>
          </div>
          <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white hidden sm:inline group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            Canvas<span className="text-brand-500">Craft</span>
          </span>
        </button>

        <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Home Button */}
        <button
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200/60 dark:border-slate-700/60 shadow-sm"
          title="Return to Home Page"
        >
          <Home className="w-3.5 h-3.5 text-brand-500" />
          <span className="hidden md:inline">Home</span>
        </button>

        {/* Board Manager Button */}
        <button
          onClick={() => setBoardManagerOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200/60 dark:border-slate-700/60 shadow-sm"
          title="Open Boards & Templates"
        >
          <FolderOpen className="w-3.5 h-3.5 text-brand-500" />
          <span className="hidden md:inline">Boards</span>
        </button>

        {/* Editable Title */}
        <div className="flex items-center gap-1.5">
          {isEditingTitle ? (
            <div className="flex items-center gap-1">
              <input
                ref={titleInputRef}
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={handleTitleKeyDown}
                className="px-2 py-0.5 text-sm font-semibold rounded border border-brand-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none shadow-sm max-w-[200px]"
              />
              <button
                onClick={handleTitleSubmit}
                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="group flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
              title="Click to rename board"
            >
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 max-w-[180px] sm:max-w-[240px] truncate">
                {title}
              </span>
              <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}

          {/* Autosave Status Indicator */}
          <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 pl-1">
            {autoSaveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400" title="All changes saved in local storage">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px] font-medium">Saved</span>
              </span>
            )}
            {autoSaveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-amber-500" title="Saving changes...">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden lg:inline text-[11px] font-medium">Saving...</span>
              </span>
            )}
            {autoSaveStatus === 'error' && (
              <span className="flex items-center gap-1 text-rose-500" title="Failed to save">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px] font-medium">Save error</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Center Section: Undo / Redo & Zoom Controls */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 rounded-lg p-0.5 border border-slate-200/50 dark:border-slate-700/50">
          <button
            onClick={undo}
            disabled={undoStack.length === 0}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:hover:text-slate-600 dark:disabled:hover:text-slate-300 rounded hover:bg-white dark:hover:bg-slate-700 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={redoStack.length === 0}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:hover:text-slate-600 dark:disabled:hover:text-slate-300 rounded hover:bg-white dark:hover:bg-slate-700 transition-colors"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        <div className="hidden md:flex items-center bg-slate-100/80 dark:bg-slate-800/80 rounded-lg p-0.5 border border-slate-200/50 dark:border-slate-700/50">
          <button
            onClick={zoomOut}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded hover:bg-white dark:hover:bg-slate-700 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetZoom}
            className="px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-brand-600 rounded transition-colors"
            title="Reset Zoom to 100% (Ctrl+0)"
          >
            {zoomPercent}%
          </button>
          <button
            onClick={zoomIn}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded hover:bg-white dark:hover:bg-slate-700 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => fitToContent()}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded hover:bg-white dark:hover:bg-slate-700 transition-colors"
            title="Fit Content to Screen (Ctrl+1)"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right Section: Canvas settings, Theme, Export, Shortcuts */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Grid Mode Toggle */}
        <button
          onClick={cycleGridMode}
          className={`p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
            gridMode !== 'none' ? 'text-brand-600 dark:text-brand-400' : ''
          }`}
          title={`Canvas Grid: ${gridMode.toUpperCase()} (Click to change)`}
        >
          <Grid className="w-4 h-4" />
        </button>

        {/* Snap to Grid Toggle */}
        <button
          onClick={toggleSnapToGrid}
          className={`p-2 rounded-lg transition-colors ${
            snapToGrid
              ? 'bg-brand-100 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title={`Snap to Grid: ${snapToGrid ? 'ON' : 'OFF'}`}
        >
          <Magnet className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Export Dialog Trigger */}
        <button
          onClick={() => setExportOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 rounded-lg shadow-sm transition-all hover:shadow"
          title="Export as PNG or JSON"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Shortcuts Cheat Sheet Button */}
        <button
          onClick={() => setShortcutsOpen(true)}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Keyboard Shortcuts (?)"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
