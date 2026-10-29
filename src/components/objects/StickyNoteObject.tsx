import React from 'react';
import { StickyNoteElement, StickyColor } from '../../types/canvasObjects';
import { useBoardStore } from '../../store/boardStore';

interface StickyNoteObjectProps {
  element: StickyNoteElement;
  isSelected: boolean;
  isHovered: boolean;
  isEditing: boolean;
}

const STICKY_THEMES: Record<
  StickyColor,
  { bg: string; border: string; text: string; header: string }
> = {
  yellow: { bg: '#fef08a', border: '#fde047', text: '#713f12', header: '#facc15' },
  blue: { bg: '#bae6fd', border: '#7dd3fc', text: '#0c4a6e', header: '#38bdf8' },
  green: { bg: '#bbf7d0', border: '#86efac', text: '#14532d', header: '#4ade80' },
  pink: { bg: '#fbcfe8', border: '#f472b6', text: '#831843', header: '#f472b6' },
  purple: { bg: '#e9d5ff', border: '#c084fc', text: '#581c87', header: '#c084fc' },
  orange: { bg: '#fed7aa', border: '#fdba74', text: '#7c2d12', header: '#fb923c' },
  white: { bg: '#ffffff', border: '#cbd5e1', text: '#1e293b', header: '#e2e8f0' },
};

export const StickyNoteObject: React.FC<StickyNoteObjectProps> = ({
  element,
  isSelected,
  isHovered,
  isEditing,
}) => {
  const { id, x, y, width, height, text, color, fontSize, textAlign, opacity } = element;
  const { setEditingId, selectElement } = useBoardStore();
  const theme = STICKY_THEMES[color] || STICKY_THEMES.yellow;

  return (
    <g
      id={`object-${id}`}
      className={`cursor-pointer transition-opacity ${
        isHovered && !isSelected ? 'filter drop-shadow-[0_4px_16px_rgba(139,92,246,0.4)]' : ''
      }`}
      opacity={isEditing ? 0.2 : opacity}
      onDoubleClick={(e) => {
        e.stopPropagation();
        selectElement(id, false);
        setEditingId(id);
      }}
    >
      {/* Sticky base card */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={8}
        ry={8}
        fill={theme.bg}
        stroke={isSelected ? '#8b5cf6' : theme.border}
        strokeWidth={isSelected ? 2 : 1.5}
        className="filter drop-shadow-md"
      />

      {/* Top subtle adhesive tape strip */}
      <rect
        x={x + width * 0.25}
        y={y - 4}
        width={width * 0.5}
        height={10}
        rx={2}
        fill="rgba(255,255,255,0.5)"
        stroke="rgba(0,0,0,0.06)"
        strokeWidth={1}
      />

      {/* Rendered multiline content */}
      <foreignObject
        x={x + 12}
        y={y + 14}
        width={Math.max(width - 24, 40)}
        height={Math.max(height - 24, 40)}
        className="pointer-events-none"
      >
        <div
          className="w-full h-full whitespace-pre-wrap break-words overflow-hidden leading-snug font-sans select-none"
          style={{
            fontSize: `${fontSize}px`,
            color: theme.text,
            textAlign,
          }}
        >
          {text || 'Note...'}
        </div>
      </foreignObject>
    </g>
  );
};
