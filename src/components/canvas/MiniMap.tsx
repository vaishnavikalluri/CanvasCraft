import React, { useState, useRef } from 'react';
import { useBoardStore } from '../../store/boardStore';
import { getCombinedBounds, getElementBounds } from '../../lib/geometry';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';

export const MiniMap: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const elements = useBoardStore((s) => s.elements);
  const viewport = useBoardStore((s) => s.viewport);
  const setViewport = useBoardStore((s) => s.setViewport);

  const containerRef = useRef<HTMLDivElement>(null);

  const mapWidth = 200;
  const mapHeight = 130;

  // Calculate canvas content bounds + padding
  const contentBounds = getCombinedBounds(elements) || { x: 0, y: 0, width: 1000, height: 800 };
  const pad = 300;
  const worldX = contentBounds.x - pad;
  const worldY = contentBounds.y - pad;
  const worldW = Math.max(contentBounds.width + pad * 2, 1000);
  const worldH = Math.max(contentBounds.height + pad * 2, 800);

  // Scaling factor from world coordinates to mini-map coordinates
  const scale = Math.min(mapWidth / worldW, mapHeight / worldH);

  // Visible screen viewport in world coordinates
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const viewCanvasX = -viewport.x / viewport.zoom;
  const viewCanvasY = -viewport.y / viewport.zoom;
  const viewCanvasW = screenW / viewport.zoom;
  const viewCanvasH = screenH / viewport.zoom;

  // Map to minimap coordinates
  const viewMapX = (viewCanvasX - worldX) * scale;
  const viewMapY = (viewCanvasY - worldY) * scale;
  const viewMapW = viewCanvasW * scale;
  const viewMapH = viewCanvasH * scale;

  const handleMiniMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickMapX = e.clientX - rect.left;
    const clickMapY = e.clientY - rect.top;

    // Convert click back to canvas world coordinates
    const targetCanvasX = worldX + clickMapX / scale;
    const targetCanvasY = worldY + clickMapY / scale;

    // Center viewport on clicked target
    const newViewportX = screenW / 2 - targetCanvasX * viewport.zoom;
    const newViewportY = screenH / 2 - targetCanvasY * viewport.zoom;

    setViewport({ x: newViewportX, y: newViewportY });
  };

  return (
    <div
      ref={containerRef}
      className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl shadow-floating overflow-hidden transition-all duration-200"
    >
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 text-xs font-medium text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-brand-500" />
          Minimap
        </span>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-0.5 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          title={isCollapsed ? 'Expand Minimap' : 'Collapse Minimap'}
        >
          {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-1 cursor-pointer bg-slate-100/40 dark:bg-slate-950/40">
          <svg
            width={mapWidth}
            height={mapHeight}
            onClick={handleMiniMapClick}
            className="w-full h-full rounded border border-slate-200/50 dark:border-slate-800/60 overflow-hidden bg-slate-50 dark:bg-slate-900"
          >
            {/* Miniature objects */}
            {elements.map((el) => {
              const b = getElementBounds(el);
              const mx = (b.x - worldX) * scale;
              const my = (b.y - worldY) * scale;
              const mw = Math.max(b.width * scale, 2);
              const mh = Math.max(b.height * scale, 2);

              if (el.type === 'frame') {
                return (
                  <rect
                    key={el.id}
                    x={mx}
                    y={my}
                    width={mw}
                    height={mh}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth={1}
                    strokeDasharray="2 2"
                    opacity={0.6}
                  />
                );
              }

              return (
                <rect
                  key={el.id}
                  x={mx}
                  y={my}
                  width={mw}
                  height={mh}
                  rx={1}
                  fill={
                    el.type === 'sticky'
                      ? '#facc15'
                      : el.type === 'shape'
                      ? '#8b5cf6'
                      : '#64748b'
                  }
                  opacity={0.7}
                />
              );
            })}

            {/* Viewport indicator rectangle */}
            <rect
              x={viewMapX}
              y={viewMapY}
              width={Math.max(viewMapW, 4)}
              height={Math.max(viewMapH, 4)}
              fill="rgba(139, 92, 246, 0.15)"
              stroke="#8b5cf6"
              strokeWidth={1.5}
              rx={2}
              className="pointer-events-none"
            />
          </svg>
        </div>
      )}
    </div>
  );
};
