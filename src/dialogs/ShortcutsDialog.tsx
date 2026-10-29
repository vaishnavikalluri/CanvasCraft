import React from 'react';
import { useBoardStore } from '../store/boardStore';
import { X, Keyboard, Command } from 'lucide-react';

interface ShortcutCategory {
  title: string;
  items: { key: string; description: string }[];
}

const SHORTCUTS: ShortcutCategory[] = [
  {
    title: 'Tools',
    items: [
      { key: 'V', description: 'Select tool' },
      { key: 'H', description: 'Hand / Pan tool' },
      { key: 'P', description: 'Freehand pen tool' },
      { key: 'E', description: 'Eraser tool' },
      { key: 'R', description: 'Rectangle shape' },
      { key: 'O', description: 'Circle / Ellipse' },
      { key: 'L', description: 'Straight line' },
      { key: 'A', description: 'Arrow line' },
      { key: 'T', description: 'Text box tool' },
      { key: 'S', description: 'Sticky note tool' },
      { key: 'C', description: 'Smart connector' },
      { key: 'F', description: 'Frame / Section tool' },
    ],
  },
  {
    title: 'Editing & Selection',
    items: [
      { key: 'Ctrl + Z', description: 'Undo last action' },
      { key: 'Ctrl + Shift + Z', description: 'Redo action' },
      { key: 'Ctrl + C', description: 'Copy selected' },
      { key: 'Ctrl + V', description: 'Paste clipboard' },
      { key: 'Ctrl + D', description: 'Duplicate selected' },
      { key: 'Del / Backspace', description: 'Delete selected' },
      { key: 'Ctrl + A', description: 'Select all elements' },
      { key: 'Esc', description: 'Clear selection / cancel' },
      { key: 'Shift + Click', description: 'Toggle multi-select' },
      { key: 'Shift + Resize', description: 'Keep aspect ratio' },
      { key: 'Double Click', description: 'Edit text in place' },
    ],
  },
  {
    title: 'Canvas Navigation',
    items: [
      { key: 'Space + Drag', description: 'Pan canvas' },
      { key: 'Scroll Wheel', description: 'Pan vertically' },
      { key: 'Ctrl + Wheel', description: 'Zoom centered at cursor' },
      { key: 'Ctrl + 0', description: 'Reset zoom to 100%' },
      { key: 'Ctrl + 1', description: 'Fit all content on screen' },
      { key: '?', description: 'Toggle this shortcuts modal' },
    ],
  },
];

export const ShortcutsDialog: React.FC = () => {
  const { isShortcutsOpen, setShortcutsOpen } = useBoardStore();

  if (!isShortcutsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-50 dark:bg-brand-950/60 text-brand-600 rounded-xl">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Keyboard Shortcuts</h2>
              <p className="text-xs text-slate-500">Speed up your diagramming and brainstorming workflow</p>
            </div>
          </div>
          <button
            onClick={() => setShortcutsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SHORTCUTS.map((category) => (
              <div key={category.title} className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                  <Command className="w-3.5 h-3.5" />
                  {category.title}
                </h3>
                <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                  {category.items.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/60 last:border-none"
                    >
                      <span className="text-slate-600 dark:text-slate-300">{item.description}</span>
                      <kbd className="px-2 py-0.5 font-mono text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-xs text-slate-700 dark:text-slate-200">
                        {item.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center text-xs text-slate-500">
          <span>Press <kbd className="px-1.5 py-0.5 font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded">Esc</kbd> anytime to close dialogs</span>
          <button
            onClick={() => setShortcutsOpen(false)}
            className="px-3.5 py-1.5 font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
