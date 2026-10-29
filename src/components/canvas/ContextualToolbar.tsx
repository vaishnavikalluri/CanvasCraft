import React from 'react';
import { Bounds, CanvasElement, StickyColor } from '../../types/canvasObjects';
import { useBoardStore } from '../../store/boardStore';
import { 
  Copy, 
  Trash2, 
  Lock, 
  Unlock, 
  Layers, 
  BringToFront, 
  SendToBack,
  Palette,
  Edit3
} from 'lucide-react';

interface ContextualToolbarProps {
  bounds: Bounds;
  elements: CanvasElement[];
}

const QUICK_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#0f172a'];
const STICKY_COLORS: StickyColor[] = ['yellow', 'blue', 'green', 'pink', 'purple', 'orange'];

export const ContextualToolbar: React.FC<ContextualToolbarProps> = ({ bounds, elements }) => {
  const {
    duplicateSelected,
    deleteSelected,
    toggleLockSelected,
    bringForward,
    sendBackward,
    setSelectedFill,
    setSelectedStroke,
    setSelectedStickyColor,
    setEditingId,
    selectedIds,
  } = useBoardStore();

  const isLocked = elements.some((el) => el.isLocked);
  const isSticky = elements.length === 1 && elements[0].type === 'sticky';
  const isText = elements.length === 1 && elements[0].type === 'text';
  const isConnector = elements.some((el) => el.type === 'connector');
  const isPen = elements.some((el) => el.type === 'pen');
  const isLineOrArrow = elements.some(
    (el) =>
      el.type === 'connector' ||
      (el.type === 'shape' && (el.shapeType === 'line' || el.shapeType === 'arrow'))
  );
  const isShape = elements.some((el) => el.type === 'shape');

  const handleColorChange = (c: string) => {
    if (isLineOrArrow || isConnector || isPen) {
      setSelectedStroke(c);
    } else {
      setSelectedFill(c);
      setSelectedStroke(c);
    }
  };

  // Calculate position centered above the bounds
  const x = bounds.x + bounds.width / 2;
  const y = bounds.y - 48;

  return (
    <foreignObject
      x={x - 170}
      y={y}
      width={340}
      height={44}
      className="overflow-visible pointer-events-auto contextual-toolbar"
      data-canvas-ui="true"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="flex items-center gap-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-floating text-slate-700 dark:text-slate-200 text-xs mx-auto w-max"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Quick Edit button for text & sticky notes */}
        {(isText || isSticky) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setEditingId(elements[0].id);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium text-xs shadow-sm transition-all mr-1"
            title="Edit text"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        )}

        {/* Quick color options for shapes, arrows, connectors, freehand */}
        {(isShape || isConnector || isPen) && (
          <div className="flex items-center gap-1 pr-1.5 border-r border-slate-200 dark:border-slate-800">
            {QUICK_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleColorChange(c);
                }}
                className="w-4 h-4 rounded-full border border-black/10 transition-transform hover:scale-125 focus:ring-2 focus:ring-brand-500"
                style={{ backgroundColor: c }}
                title={isLineOrArrow ? `Set arrow color to ${c}` : `Set color to ${c}`}
              />
            ))}
          </div>
        )}

        {/* Sticky quick color options */}
        {isSticky && (
          <div className="flex items-center gap-1 pr-1.5 border-r border-slate-200 dark:border-slate-800">
            {STICKY_COLORS.map((sc) => (
              <button
                key={sc}
                onClick={() => setSelectedStickyColor(sc)}
                className={`w-4 h-4 rounded-full border border-black/10 transition-transform hover:scale-125 ${
                  sc === 'yellow' ? 'bg-yellow-200' :
                  sc === 'blue' ? 'bg-sky-200' :
                  sc === 'green' ? 'bg-green-200' :
                  sc === 'pink' ? 'bg-pink-200' :
                  sc === 'purple' ? 'bg-purple-200' : 'bg-orange-200'
                }`}
                title={`Set note color to ${sc}`}
              />
            ))}
          </div>
        )}

        {/* Layer order buttons */}
        <button
          onClick={bringForward}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Bring Forward"
        >
          <BringToFront className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={sendBackward}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Send Backward"
        >
          <SendToBack className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* Lock toggle */}
        <button
          onClick={toggleLockSelected}
          className={`p-1.5 rounded-lg transition-colors ${
            isLocked
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title={isLocked ? 'Unlock element' : 'Lock element'}
        >
          {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
        </button>

        {/* Duplicate */}
        <button
          onClick={duplicateSelected}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Duplicate (Ctrl+D)"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        {/* Delete */}
        <button
          onClick={deleteSelected}
          className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
          title="Delete (Del)"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </foreignObject>
  );
};
