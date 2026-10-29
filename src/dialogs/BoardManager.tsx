import React, { useState, useEffect } from 'react';
import { useBoardStore } from '../store/boardStore';
import { BoardMetadata } from '../types/board';
import { getAllBoards, getBoard, deleteBoard, duplicateBoard } from '../lib/storage';
import { TEMPLATES } from '../templates/boardTemplates';
import { 
  X, 
  Plus, 
  Trash2, 
  Copy, 
  ExternalLink, 
  Calendar, 
  Layers, 
  Sparkles, 
  Folder,
  LayoutTemplate
} from 'lucide-react';

export const BoardManager: React.FC = () => {
  const {
    id: currentBoardId,
    isBoardManagerOpen,
    setBoardManagerOpen,
    loadBoard,
    loadTemplate,
    createNewBoard,
  } = useBoardStore();

  const [activeTab, setActiveTab] = useState<'saved' | 'templates'>('saved');
  const [savedBoards, setSavedBoards] = useState<BoardMetadata[]>([]);
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBoards = async () => {
    setIsLoading(true);
    try {
      const list = await getAllBoards();
      setSavedBoards(list);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isBoardManagerOpen) {
      fetchBoards();
    }
  }, [isBoardManagerOpen]);

  if (!isBoardManagerOpen) return null;

  const handleOpenBoard = async (id: string) => {
    const board = await getBoard(id);
    if (board) {
      loadBoard(board);
      setBoardManagerOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteBoard(id);
    setBoardToDelete(null);
    fetchBoards();
  };

  const handleDuplicate = async (id: string) => {
    await duplicateBoard(id);
    fetchBoards();
  };

  const handleCreateNew = () => {
    createNewBoard('Untitled Whiteboard');
    setBoardManagerOpen(false);
  };

  const handleSelectTemplate = (templateId: string) => {
    loadTemplate(templateId);
    setBoardManagerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-50 dark:bg-brand-950/60 text-brand-600 rounded-xl">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Board Manager</h2>
              <p className="text-xs text-slate-500">Manage your saved whiteboards or choose a starter template</p>
            </div>
          </div>
          <button
            onClick={() => setBoardManagerOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs & New Board Button */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'saved'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Saved Boards ({savedBoards.length})
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'templates'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              Starter Templates ({TEMPLATES.length})
            </button>
          </div>

          <button
            onClick={handleCreateNew}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Blank Board
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'saved' ? (
            savedBoards.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No saved boards yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Your boards are automatically saved as you sketch. Click "New Blank Board" or choose a template to get started!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedBoards.map((b) => {
                  const isCurrent = b.id === currentBoardId;
                  const dateStr = new Date(b.updatedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={b.id}
                      className={`group relative p-4 rounded-xl border transition-all duration-150 flex flex-col justify-between ${
                        isCurrent
                          ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/20 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850 hover:shadow-md'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                            <Layers className="w-3 h-3" /> {b.elementCount} elements
                          </span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold bg-brand-500 text-white rounded-full">
                              Active
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-brand-600 transition-colors">
                          {b.title}
                        </h3>

                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{dateStr}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => handleOpenBoard(b.id)}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDuplicate(b.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Duplicate Board"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setBoardToDelete(b.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete Board"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Templates Tab */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl.id)}
                  className="group cursor-pointer p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 bg-white dark:bg-slate-850 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 rounded">
                      {tmpl.category}
                    </span>
                    <Sparkles className="w-4 h-4 text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                    {tmpl.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {tmpl.description}
                  </p>
                  <div className="mt-3 text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1 group-hover:underline">
                    Use Template →
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {boardToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Delete Board?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete this board? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2 mt-5">
                <button
                  onClick={() => setBoardToDelete(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(boardToDelete)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
                >
                  Delete Board
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
