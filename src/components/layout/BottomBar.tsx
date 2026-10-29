import React from 'react';
import { useBoardStore } from '../../store/boardStore';
import { MiniMap } from '../canvas/MiniMap';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  RotateCcw, 
  Compass, 
  Layers
} from 'lucide-react';

export const BottomBar: React.FC = () => {
  const {
    viewport,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToContent,
    elements,
  } = useBoardStore();

  const zoomPercent = Math.round(viewport.zoom * 100);

  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between pointer-events-none select-none">
      {/* Left: Quick Zoom Bar */}
      <div className="pointer-events-auto flex items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-floating text-slate-700 dark:text-slate-200 gap-1 text-xs">
        <button
          onClick={zoomOut}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={resetZoom}
          className="px-2 py-1 font-mono font-medium hover:text-brand-600 rounded transition-colors min-w-[50px] text-center"
          title="Reset Zoom (Ctrl+0)"
        >
          {zoomPercent}%
        </button>

        <button
          onClick={zoomIn}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />

        <button
          onClick={() => fitToContent()}
          className="flex items-center gap-1 px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-slate-600 dark:text-slate-300"
          title="Fit All Content into Screen (Ctrl+1)"
        >
          <Maximize className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Fit Screen</span>
        </button>
      </div>

      {/* Right: Live Interactive MiniMap */}
      <div className="pointer-events-auto">
        <MiniMap />
      </div>
    </div>
  );
};
