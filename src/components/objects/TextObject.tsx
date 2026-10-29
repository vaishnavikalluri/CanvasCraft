import React from 'react';
import { TextElement } from '../../types/canvasObjects';
import { useBoardStore } from '../../store/boardStore';

interface TextObjectProps {
  element: TextElement;
  isSelected: boolean;
  isHovered: boolean;
  isEditing: boolean;
}

export const TextObject: React.FC<TextObjectProps> = ({
  element,
  isSelected,
  isHovered,
  isEditing,
}) => {
  const { id, x, y, width, height, text, fontSize, color, textAlign, fontWeight, opacity } = element;
  const { theme, setEditingId, selectElement } = useBoardStore();

  const textColor =
    color && color !== 'currentColor'
      ? color
      : theme === 'dark'
      ? '#f8fafc'
      : '#0f172a';

  const boxW = Math.max(width, 140);
  const boxH = Math.max(height, 50);

  return (
    <g
      id={`object-${id}`}
      className={`cursor-pointer transition-opacity ${
        isHovered && !isSelected ? 'filter drop-shadow-[0_0_6px_rgba(139,92,246,0.6)]' : ''
      }`}
      opacity={isEditing ? 0 : opacity}
      onDoubleClick={(e) => {
        e.stopPropagation();
        selectElement(id, false);
        setEditingId(id);
      }}
    >
      {/* Invisible hit-area rect ensuring effortless click-to-select */}
      <rect
        x={x}
        y={y}
        width={boxW}
        height={boxH}
        fill="transparent"
        style={{ pointerEvents: 'all' }}
      />

      <foreignObject
        x={x}
        y={y}
        width={boxW}
        height={boxH}
        className="overflow-visible pointer-events-none"
      >
        <div
          className="w-full h-full p-2 leading-snug font-sans whitespace-pre-wrap break-words select-none"
          style={{
            fontSize: `${fontSize}px`,
            color: textColor,
            textAlign,
            fontWeight: fontWeight || 'normal',
            lineHeight: 1.35,
          }}
        >
          {text || 'Heading or text'}
        </div>
      </foreignObject>
    </g>
  );
};
