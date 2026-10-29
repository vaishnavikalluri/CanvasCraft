import React from 'react';
import { useBoardStore } from '../../store/boardStore';
import { StickyColor, StrokeStyle, ConnectorStyle, ShapeElement, StickyNoteElement, TextElement } from '../../types/canvasObjects';
import { getCombinedBounds } from '../../lib/geometry';
import { 
  X, 
  ChevronRight, 
  Sliders, 
  Layers, 
  BringToFront, 
  SendToBack, 
  Copy, 
  Trash2, 
  Lock, 
  Unlock, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Group, 
  Ungroup,
  Maximize2,
  Edit3
} from 'lucide-react';

const PALETTE = [
  '#ffffff', '#f1f5f9', '#94a3b8', '#0f172a',
  '#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4',
  '#10b981', '#84cc16', '#f59e0b', '#ef4444', '#ec4899'
];

const STICKY_THEMES: { id: StickyColor; label: string; color: string }[] = [
  { id: 'yellow', label: 'Yellow', color: '#fef08a' },
  { id: 'blue', label: 'Blue', color: '#bae6fd' },
  { id: 'green', label: 'Green', color: '#bbf7d0' },
  { id: 'pink', label: 'Pink', color: '#fbcfe8' },
  { id: 'purple', label: 'Purple', color: '#e9d5ff' },
  { id: 'orange', label: 'Orange', color: '#fed7aa' },
  { id: 'white', label: 'White', color: '#f8fafc' },
];

export const PropertiesPanel: React.FC = () => {
  const {
    elements,
    selectedIds,
    isPropertiesOpen,
    setPropertiesOpen,
    setSelectedFill,
    setSelectedStroke,
    setSelectedStrokeWidth,
    setSelectedStrokeStyle,
    setSelectedOpacity,
    setSelectedFontSize,
    setSelectedStickyColor,
    setSelectedConnectorStyle,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    groupSelected,
    ungroupSelected,
    toggleLockSelected,
    alignSelected,
    duplicateSelected,
    deleteSelected,
    gridMode,
    setGridMode,
    snapToGrid,
    toggleSnapToGrid,
    tool,
    activeFill,
    activeStroke,
    activeStrokeWidth,
    activeStickyColor,
    updateElement,
    setEditingId,
  } = useBoardStore();

  if (!isPropertiesOpen) {
    return (
      <button
        onClick={() => setPropertiesOpen(true)}
        className="absolute right-4 top-20 z-20 p-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl shadow-floating text-slate-600 dark:text-slate-300 hover:text-brand-500 transition-colors"
        title="Open Properties Panel"
      >
        <Sliders className="w-4 h-4" />
      </button>
    );
  }

  const selectedElements = elements.filter((el) => selectedIds.includes(el.id));
  const hasSelection = selectedElements.length > 0;
  const singleElement = selectedElements.length === 1 ? selectedElements[0] : null;
  const combinedBounds = getCombinedBounds(selectedElements);

  const isShape = singleElement?.type === 'shape';
  const isText = singleElement?.type === 'text';
  const isSticky = singleElement?.type === 'sticky';
  const isConnector = singleElement?.type === 'connector';
  const isFrame = singleElement?.type === 'frame';
  const isPen = singleElement?.type === 'pen';
  const isLocked = selectedElements.some((el) => el.isLocked);
  const isLineOrArrow =
    (isShape &&
      singleElement &&
      ((singleElement as ShapeElement).shapeType === 'line' ||
        (singleElement as ShapeElement).shapeType === 'arrow')) ||
    isConnector;

  return (
    <aside className="absolute right-4 top-20 bottom-16 z-20 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-floating flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-brand-500" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {hasSelection
              ? selectedElements.length > 1
                ? `${selectedElements.length} Items Selected`
                : `${singleElement?.type?.toUpperCase()} PROPERTIES`
              : 'CANVAS SETTINGS'}
          </h2>
        </div>
        <button
          onClick={() => setPropertiesOpen(false)}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          title="Close Properties"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {hasSelection ? (
          <>
            {/* Dimensions & Position */}
            {combinedBounds && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Geometry
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                    <span className="text-slate-400">W</span>
                    <span className="font-mono font-medium">{Math.round(combinedBounds.width)}px</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                    <span className="text-slate-400">H</span>
                    <span className="font-mono font-medium">{Math.round(combinedBounds.height)}px</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                    <span className="text-slate-400">X</span>
                    <span className="font-mono font-medium">{Math.round(combinedBounds.x)}</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                    <span className="text-slate-400">Y</span>
                    <span className="font-mono font-medium">{Math.round(combinedBounds.y)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Live Text / Note Content Editor in Properties Panel */}
            {(isText || isSticky) && singleElement && (
              <div className="space-y-2 p-3 bg-brand-50/70 dark:bg-brand-950/40 rounded-xl border border-brand-200/80 dark:border-brand-800/80 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" />
                    {isText ? 'Text Content' : 'Note Content'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingId(singleElement.id)}
                    className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline flex items-center gap-1"
                    title="Open on-canvas editor"
                  >
                    Edit on Canvas
                  </button>
                </div>
                <textarea
                  value={
                    singleElement.type === 'text'
                      ? (singleElement as TextElement).text
                      : (singleElement as StickyNoteElement).text
                  }
                  onChange={(e) => {
                    updateElement(singleElement.id, { text: e.target.value });
                  }}
                  rows={4}
                  placeholder={isText ? 'Type heading or note here...' : 'Write your note here...'}
                  className="w-full text-xs font-sans p-2.5 rounded-lg border border-brand-300 dark:border-brand-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y shadow-inner leading-relaxed"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Type here directly or double-click the item on canvas.
                </p>
              </div>
            )}

            {/* Sticky Note Color Themes */}
            {isSticky && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Note Color
                </span>
                <div className="flex flex-wrap gap-2">
                  {STICKY_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedStickyColor(theme.id)}
                      className="w-7 h-7 rounded-lg border border-black/10 transition-transform hover:scale-110 shadow-sm"
                      style={{ backgroundColor: theme.color }}
                      title={theme.label}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Fill Color (Shapes & Text, excluding lines/arrows) */}
            {((isShape && !isLineOrArrow) || singleElement?.type === 'text') && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Fill Color
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PALETTE.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedFill(color)}
                      className="w-5 h-5 rounded-md border border-slate-300 dark:border-slate-600 transition-transform hover:scale-110"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <button
                    onClick={() => setSelectedFill('none')}
                    className="px-2 py-0.5 text-[11px] border border-dashed border-slate-300 dark:border-slate-600 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    None
                  </button>
                </div>
              </div>
            )}

            {/* Stroke Color & Width */}
            {(isShape || isPen || isConnector) && (
              <>
                <div className="space-y-1.5">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                    {isLineOrArrow ? 'Arrow / Line Color' : 'Stroke Color'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PALETTE.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedStroke(color)}
                        className="w-5 h-5 rounded-md border border-slate-300 dark:border-slate-600 transition-transform hover:scale-110"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Stroke Thickness
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 4, 8].map((w) => (
                      <button
                        key={w}
                        onClick={() => setSelectedStrokeWidth(w)}
                        className="py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono font-medium text-center"
                      >
                        {w}px
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Stroke Style
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['solid', 'dashed', 'dotted'] as StrokeStyle[]).map((style) => (
                      <button
                        key={style}
                        onClick={() => setSelectedStrokeStyle(style)}
                        className="py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-center capitalize"
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Connector Curve Style */}
            {isConnector && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Line Routing
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['straight', 'curved', 'orthogonal'] as ConnectorStyle[]).map((cstyle) => (
                    <button
                      key={cstyle}
                      onClick={() => setSelectedConnectorStyle(cstyle)}
                      className="py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-center capitalize"
                    >
                      {cstyle}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Font Size (Text & Sticky) */}
            {(isText || isSticky) && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Font Size
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[12, 14, 16, 20, 24, 32].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedFontSize(size)}
                      className="py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono font-medium text-center"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Opacity Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                <span>Opacity</span>
                <span className="font-mono">
                  {Math.round((singleElement?.opacity ?? 1) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={singleElement?.opacity ?? 1}
                onChange={(e) => setSelectedOpacity(parseFloat(e.target.value))}
                className="w-full accent-brand-500"
              />
            </div>

            {/* Alignment Controls (when multi-selected) */}
            {selectedElements.length > 1 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Align Objects
                </span>
                <div className="grid grid-cols-6 gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg">
                  <button
                    onClick={() => alignSelected('left')}
                    className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors text-center"
                    title="Align Left"
                  >
                    <AlignLeft className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => alignSelected('center')}
                    className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors text-center"
                    title="Align Center"
                  >
                    <AlignCenter className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => alignSelected('right')}
                    className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors text-center"
                    title="Align Right"
                  >
                    <AlignRight className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => alignSelected('top')}
                    className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors text-center text-xs font-bold"
                    title="Align Top"
                  >
                    ⊤
                  </button>
                  <button
                    onClick={() => alignSelected('middle')}
                    className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors text-center text-xs font-bold"
                    title="Align Middle"
                  >
                    ⊦
                  </button>
                  <button
                    onClick={() => alignSelected('bottom')}
                    className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors text-center text-xs font-bold"
                    title="Align Bottom"
                  >
                    ⊥
                  </button>
                </div>
              </div>
            )}

            {/* Layer Ordering */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                Layer Ordering
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  onClick={bringToFront}
                  className="py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-center"
                  title="Bring to Front"
                >
                  To Front
                </button>
                <button
                  onClick={bringForward}
                  className="py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-center"
                  title="Bring Forward"
                >
                  Forward
                </button>
                <button
                  onClick={sendBackward}
                  className="py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-center"
                  title="Send Backward"
                >
                  Backward
                </button>
                <button
                  onClick={sendToBack}
                  className="py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-center"
                  title="Send to Back"
                >
                  To Back
                </button>
              </div>
            </div>

            {/* Action Buttons: Group, Lock, Duplicate, Delete */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {selectedElements.length > 1 && (
                  <button
                    onClick={groupSelected}
                    className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Group className="w-3.5 h-3.5" />
                    Group
                  </button>
                )}
                <button
                  onClick={toggleLockSelected}
                  className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 transition-colors ${
                    isLocked
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  {isLocked ? 'Unlock' : 'Lock'}
                </button>
                <button
                  onClick={duplicateSelected}
                  className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Duplicate
                </button>
                <button
                  onClick={deleteSelected}
                  className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-lg transition-colors col-span-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Selected
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Canvas Global Settings & Statistics when nothing is selected */
          <div className="space-y-4 text-xs">
            {/* Active Drawing Tool Preset Styling */}
            {['arrow', 'line', 'pen', 'connector'].includes(tool) && (
              <div className="space-y-2 p-3 bg-brand-50/60 dark:bg-brand-950/40 rounded-xl border border-brand-200/50 dark:border-brand-800/50">
                <span className="text-[11px] font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wide">
                  {tool.toUpperCase()} COLOR
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PALETTE.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedStroke(color)}
                      className={`w-5 h-5 rounded-md border transition-transform hover:scale-110 ${
                        activeStroke === color
                          ? 'border-brand-600 ring-2 ring-brand-500 scale-110'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                      style={{ backgroundColor: color }}
                      title={`Draw ${tool} with ${color}`}
                    />
                  ))}
                </div>

                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase mt-2 block">
                  Thickness
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 4, 8].map((w) => (
                    <button
                      key={w}
                      onClick={() => setSelectedStrokeWidth(w)}
                      className={`py-1 px-1.5 rounded-lg border text-xs font-mono font-medium text-center ${
                        activeStrokeWidth === w
                          ? 'border-brand-500 bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {w}px
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tool === 'sticky' && (
              <div className="space-y-2 p-3 bg-amber-50/60 dark:bg-amber-950/40 rounded-xl border border-amber-200/50 dark:border-amber-800/50">
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                  STICKY NOTE COLOR
                </span>
                <div className="flex flex-wrap gap-2">
                  {STICKY_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedStickyColor(theme.id)}
                      className={`w-7 h-7 rounded-lg border border-black/10 transition-transform hover:scale-110 shadow-sm ${
                        activeStickyColor === theme.id ? 'ring-2 ring-brand-500 scale-110' : ''
                      }`}
                      style={{ backgroundColor: theme.color }}
                      title={theme.label}
                    />
                  ))}
                </div>
              </div>
            )}

            {['rectangle', 'ellipse'].includes(tool) && (
              <div className="space-y-2 p-3 bg-slate-100/60 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  SHAPE FILL COLOR
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PALETTE.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedFill(color)}
                      className={`w-5 h-5 rounded-md border transition-transform hover:scale-110 ${
                        activeFill === color ? 'border-brand-600 ring-2 ring-brand-500 scale-110' : 'border-slate-300 dark:border-slate-600'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                Grid Style
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['dots', 'lines', 'none'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setGridMode(mode)}
                    className={`py-1.5 px-2 rounded-lg border capitalize transition-colors ${
                      gridMode === mode
                        ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                Snapping
              </span>
              <button
                onClick={toggleSnapToGrid}
                className={`w-full py-2 px-3 rounded-lg border flex items-center justify-between transition-colors ${
                  snapToGrid
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-medium'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>Snap to 20px Grid</span>
                <span>{snapToGrid ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                Board Statistics
              </span>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Elements</span>
                  <span className="font-semibold">{elements.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sticky Notes</span>
                  <span className="font-semibold">{elements.filter((e) => e.type === 'sticky').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Shapes & Sketches</span>
                  <span className="font-semibold">{elements.filter((e) => e.type === 'shape' || e.type === 'pen').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Connectors</span>
                  <span className="font-semibold">{elements.filter((e) => e.type === 'connector').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Frames / Sections</span>
                  <span className="font-semibold">{elements.filter((e) => e.type === 'frame').length}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
