import React from 'react';
import { useBoardStore } from '../../store/boardStore';
import { ToolType } from '../../types/canvasObjects';
import { 
  MousePointer, 
  Hand, 
  PenLine, 
  Eraser, 
  Square, 
  Circle, 
  Minus, 
  ArrowUpRight, 
  Type, 
  StickyNote, 
  Spline, 
  Layout
} from 'lucide-react';

interface ToolItem {
  id: ToolType;
  label: string;
  icon: React.FC<{ className?: string }>;
  hotkey: string;
}

const TOOLS: ToolItem[] = [
  { id: 'select', label: 'Select', icon: MousePointer, hotkey: 'V' },
  { id: 'pan', label: 'Hand / Pan', icon: Hand, hotkey: 'H' },
  { id: 'pen', label: 'Freehand Pen', icon: PenLine, hotkey: 'P' },
  { id: 'eraser', label: 'Eraser', icon: Eraser, hotkey: 'E' },
  { id: 'rectangle', label: 'Rectangle', icon: Square, hotkey: 'R' },
  { id: 'ellipse', label: 'Circle / Ellipse', icon: Circle, hotkey: 'O' },
  { id: 'line', label: 'Straight Line', icon: Minus, hotkey: 'L' },
  { id: 'arrow', label: 'Arrow', icon: ArrowUpRight, hotkey: 'A' },
  { id: 'text', label: 'Text Box', icon: Type, hotkey: 'T' },
  { id: 'sticky', label: 'Sticky Note', icon: StickyNote, hotkey: 'S' },
  { id: 'connector', label: 'Smart Connector', icon: Spline, hotkey: 'C' },
  { id: 'frame', label: 'Frame / Section', icon: Layout, hotkey: 'F' },
];

export const Toolbar: React.FC = () => {
  const { tool, setTool } = useBoardStore();

  return (
    <aside className="absolute left-4 top-20 z-20 flex flex-col items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-floating">
      <div className="flex flex-col gap-1">
        {TOOLS.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = tool === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTool(item.id)}
              className={`relative group p-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-brand-500 text-white shadow-glow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={`${item.label} (${item.hotkey})`}
            >
              <Icon className="w-4 h-4" />
              {/* Tooltip */}
              <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-30 shadow-md">
                {item.label} <span className="text-slate-400 font-mono">({item.hotkey})</span>
              </div>
            </button>
          );
        })}

        <div className="h-[1px] w-6 bg-slate-200 dark:bg-slate-800 my-1 mx-auto" />

        {TOOLS.slice(4, 8).map((item) => {
          const Icon = item.icon;
          const isActive = tool === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTool(item.id)}
              className={`relative group p-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-brand-500 text-white shadow-glow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={`${item.label} (${item.hotkey})`}
            >
              <Icon className="w-4 h-4" />
              <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-30 shadow-md">
                {item.label} <span className="text-slate-400 font-mono">({item.hotkey})</span>
              </div>
            </button>
          );
        })}

        <div className="h-[1px] w-6 bg-slate-200 dark:bg-slate-800 my-1 mx-auto" />

        {TOOLS.slice(8).map((item) => {
          const Icon = item.icon;
          const isActive = tool === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTool(item.id)}
              className={`relative group p-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-brand-500 text-white shadow-glow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={`${item.label} (${item.hotkey})`}
            >
              <Icon className="w-4 h-4" />
              <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-30 shadow-md">
                {item.label} <span className="text-slate-400 font-mono">({item.hotkey})</span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
