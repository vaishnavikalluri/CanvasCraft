import React from 'react';
import { Bounds, ResizeHandle, CanvasElement } from '../../types/canvasObjects';
import { Lock } from 'lucide-react';

interface SelectionBoxProps {
  bounds: Bounds;
  isLocked?: boolean;
  isMultiSelect?: boolean;
  selectedElements?: CanvasElement[];
  onResizeStart: (e: React.PointerEvent, handle: ResizeHandle) => void;
}

export const SelectionBox: React.FC<SelectionBoxProps> = ({
  bounds,
  isLocked = false,
  isMultiSelect = false,
  selectedElements = [],
  onResizeStart,
}) => {
  const { x, y, width, height } = bounds;
  const handleSize = 12;
  const half = handleSize / 2;

  const isSingleLineOrArrow =
    selectedElements.length === 1 &&
    selectedElements[0].type === 'shape' &&
    (selectedElements[0].shapeType === 'line' || selectedElements[0].shapeType === 'arrow');

  if (isSingleLineOrArrow) {
    const el = selectedElements[0];
    const x1 = el.x ?? 0;
    const y1 = el.y ?? 0;
    const x2 = x1 + (el.width ?? 0);
    const y2 = y1 + (el.height ?? 0);

    return (
      <g className="selection-overlay pointer-events-auto">
        {/* Line highlight halo */}
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#8b5cf6"
          strokeWidth={Math.max((el.type === 'shape' ? el.strokeWidth : 2) + 8, 12)}
          strokeOpacity={0.25}
          strokeLinecap="round"
          className="pointer-events-none"
        />

        {/* Start endpoint handle */}
        {!isLocked && (
          <g className="cursor-move" onPointerDown={(e) => onResizeStart(e, 'nw')}>
            <circle cx={x1} cy={y1} r={16} fill="transparent" />
            <circle
              cx={x1}
              cy={y1}
              r={7}
              fill="#ffffff"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              className="hover:scale-125 transition-transform shadow-sm"
            />
          </g>
        )}

        {/* End endpoint handle */}
        {!isLocked && (
          <g className="cursor-move" onPointerDown={(e) => onResizeStart(e, 'se')}>
            <circle cx={x2} cy={y2} r={16} fill="transparent" />
            <circle
              cx={x2}
              cy={y2}
              r={7}
              fill="#ffffff"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              className="hover:scale-125 transition-transform shadow-sm"
            />
          </g>
        )}
      </g>
    );
  }

  const handles: { handle: ResizeHandle; hx: number; hy: number; cursor: string }[] = [
    { handle: 'nw', hx: x - half, hy: y - half, cursor: 'nwse-resize' },
    { handle: 'n', hx: x + width / 2 - half, hy: y - half, cursor: 'ns-resize' },
    { handle: 'ne', hx: x + width - half, hy: y - half, cursor: 'nesw-resize' },
    { handle: 'e', hx: x + width - half, hy: y + height / 2 - half, cursor: 'ew-resize' },
    { handle: 'se', hx: x + width - half, hy: y + height - half, cursor: 'nwse-resize' },
    { handle: 's', hx: x + width / 2 - half, hy: y + height - half, cursor: 'ns-resize' },
    { handle: 'sw', hx: x - half, hy: y + height - half, cursor: 'nesw-resize' },
    { handle: 'w', hx: x - half, hy: y + height / 2 - half, cursor: 'ew-resize' },
  ];

  return (
    <g className="selection-overlay pointer-events-auto">
      {/* Outer bounding rectangle */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="rgba(139, 92, 246, 0.04)"
        stroke={isLocked ? '#f59e0b' : '#8b5cf6'}
        strokeWidth={1.5}
        strokeDasharray={isLocked ? '4 4' : undefined}
        className="pointer-events-none"
      />

      {/* Resize handles with expanded 24px hit-box */}
      {!isLocked &&
        handles.map(({ handle, hx, hy, cursor }) => (
          <g
            key={handle}
            style={{ cursor }}
            onPointerDown={(e) => onResizeStart(e, handle)}
            className="group"
          >
            {/* Invisible expanded hit area (24px) */}
            <rect
              x={hx - 6}
              y={hy - 6}
              width={24}
              height={24}
              fill="transparent"
            />
            {/* Visible handle */}
            <rect
              x={hx}
              y={hy}
              width={handleSize}
              height={handleSize}
              rx={3}
              ry={3}
              fill="#ffffff"
              stroke="#8b5cf6"
              strokeWidth={2}
              className="group-hover:scale-125 transition-transform filter drop-shadow-sm"
            />
          </g>
        ))}

      {/* Dimension Badge - always pointer-events-none so it never blocks clicks */}
      <g transform={`translate(${x + width / 2}, ${y + height + 16})`} className="pointer-events-none">
        <rect
          x={-42}
          y={-10}
          width={84}
          height={20}
          rx={10}
          fill="#1e1b4b"
          className="shadow-sm"
        />
        <text
          x={0}
          y={4}
          textAnchor="middle"
          fontSize={11}
          fontWeight="500"
          fill="#c4b5fd"
          fontFamily="'Inter', sans-serif"
          className="select-none"
        >
          {Math.round(width)} × {Math.round(height)}
        </text>
      </g>

      {/* Locked Badge if locked */}
      {isLocked && (
        <foreignObject x={x + width - 26} y={y - 28} width={24} height={24} className="pointer-events-none">
          <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </foreignObject>
      )}
    </g>
  );
};
