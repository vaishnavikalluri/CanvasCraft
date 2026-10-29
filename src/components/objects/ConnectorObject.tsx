import React from 'react';
import { ConnectorElement } from '../../types/canvasObjects';
import { generateConnectorPath, getArrowHeadPath, getObjectAnchors } from '../../lib/geometry';
import { useBoardStore } from '../../store/boardStore';

interface ConnectorObjectProps {
  element: ConnectorElement;
  isSelected: boolean;
  isHovered: boolean;
}

export const ConnectorObject: React.FC<ConnectorObjectProps> = ({ element, isSelected, isHovered }) => {
  const {
    id,
    startObjectId,
    startAnchor,
    endObjectId,
    endAnchor,
    startPoint,
    endPoint,
    stroke,
    strokeWidth,
    strokeStyle,
    connectorStyle,
    endArrow = true,
    startArrow = false,
    label,
    opacity,
  } = element;

  const elements = useBoardStore((s) => s.elements);

  // Dynamically resolve attached coordinates if objects exist
  let start = { ...startPoint };
  let end = { ...endPoint };

  if (startObjectId) {
    const startObj = elements.find((el) => el.id === startObjectId);
    if (startObj) {
      const anchors = getObjectAnchors(startObj);
      start = startAnchor ? anchors[startAnchor] : anchors.center;
    }
  }

  if (endObjectId) {
    const endObj = elements.find((el) => el.id === endObjectId);
    if (endObj) {
      const anchors = getObjectAnchors(endObj);
      end = endAnchor ? anchors[endAnchor] : anchors.center;
    }
  }

  const pathData = generateConnectorPath(start, end, connectorStyle, startAnchor, endAnchor);
  const strokeDasharray =
    strokeStyle === 'dashed' ? '8 6' : strokeStyle === 'dotted' ? '3 4' : undefined;

  const arrowSize = Math.max(strokeWidth * 4, 12);
  const endArrowPath = endArrow ? getArrowHeadPath(start, end, arrowSize) : null;
  const startArrowPath = startArrow ? getArrowHeadPath(end, start, arrowSize) : null;

  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  return (
    <g
      id={`object-${id}`}
      className={`cursor-pointer ${
        isHovered && !isSelected ? 'filter drop-shadow-[0_0_4px_rgba(139,92,246,0.6)]' : ''
      }`}
      opacity={opacity}
    >
      {/* Invisible wider stroke for easy click selection */}
      <path
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth={Math.max(strokeWidth + 14, 18)}
        strokeLinecap="round"
      />

      {/* Main connector line */}
      <path
        d={pathData}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        strokeLinecap="round"
      />

      {/* Arrow heads */}
      {endArrowPath && <path d={endArrowPath} fill={stroke} />}
      {startArrowPath && <path d={startArrowPath} fill={stroke} />}

      {/* Optional text label */}
      {label && (
        <g transform={`translate(${midX}, ${midY})`}>
          <rect
            x={-30}
            y={-12}
            width={60}
            height={24}
            rx={4}
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth={1}
            className="filter drop-shadow-sm dark:fill-slate-800 dark:stroke-slate-600"
          />
          <text
            x={0}
            y={4}
            textAnchor="middle"
            fontSize={12}
            fontWeight="500"
            fill="#334155"
            className="dark:fill-slate-200 select-none font-sans"
          >
            {label}
          </text>
        </g>
      )}
    </g>
  );
};
