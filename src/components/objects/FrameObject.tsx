import React, { useRef, useEffect } from 'react';
import { FrameElement } from '../../types/canvasObjects';
import { useBoardStore } from '../../store/boardStore';
import { Maximize2 } from 'lucide-react';

interface FrameObjectProps {
  element: FrameElement;
  isSelected: boolean;
  isHovered: boolean;
  isEditing: boolean;
}

export const FrameObject: React.FC<FrameObjectProps> = ({ element, isSelected, isHovered, isEditing }) => {
  const { id, x, y, width, height, title, borderColor, backgroundColor, opacity } = element;
  const fitToFrame = useBoardStore((s) => s.fitToFrame);
  const updateElement = useBoardStore((s) => s.updateElement);
  const setEditingId = useBoardStore((s) => s.setEditingId);
  const commitHistory = useBoardStore((s) => s.commitHistory);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    commitHistory();
    updateElement(id, { title: e.target.value });
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.stopPropagation();
      inputRef.current?.blur();
    }
  };

  return (
    <g
      id={`object-${id}`}
      className={`cursor-pointer ${
        isHovered && !isSelected ? 'filter drop-shadow-[0_0_6px_rgba(139,92,246,0.4)]' : ''
      }`}
      opacity={opacity}
    >
      {/* Frame body background */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={12}
        ry={12}
        fill={backgroundColor || '#f8fafc'}
        stroke={borderColor || '#cbd5e1'}
        strokeWidth={2}
        strokeDasharray="6 6"
        className="dark:fill-slate-900/60"
      />

      {/* Frame title header badge */}
      <g transform={`translate(${x + 12}, ${y - 18})`}>
        <rect
          x={0}
          y={0}
          width={Math.max(title.length * 10 + 60, 160)}
          height={32}
          rx={8}
          fill={borderColor || '#6366f1'}
          className="filter drop-shadow-sm"
        />

        {isEditing ? (
          <foreignObject x={10} y={4} width={Math.max(title.length * 10 + 40, 140)} height={26}>
            <input
              ref={inputRef}
              defaultValue={title}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full h-full bg-white/20 text-white font-medium text-sm rounded px-1.5 outline-none font-sans"
            />
          </foreignObject>
        ) : (
          <text
            x={14}
            y={20}
            fontSize={13}
            fontWeight="600"
            fill="#ffffff"
            fontFamily="'Inter', sans-serif"
            className="select-none"
          >
            {title || 'Untitled Section'}
          </text>
        )}

        {/* Quick focus zoom icon button */}
        {!isEditing && (
          <g
            transform={`translate(${Math.max(title.length * 10 + 36, 136)}, 7)`}
            className="cursor-pointer hover:opacity-80"
            onClick={(e) => {
              e.stopPropagation();
              fitToFrame(id);
            }}
          >
            <circle cx={9} cy={9} r={9} fill="rgba(255,255,255,0.25)" />
            <foreignObject x={2} y={2} width={14} height={14}>
              <Maximize2 className="w-3.5 h-3.5 text-white" />
            </foreignObject>
          </g>
        )}
      </g>
    </g>
  );
};
