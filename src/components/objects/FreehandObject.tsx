import React from 'react';
import { FreehandElement } from '../../types/canvasObjects';
import { generateSvgPath } from '../../lib/geometry';

interface FreehandObjectProps {
  element: FreehandElement;
  isSelected: boolean;
  isHovered: boolean;
}

export const FreehandObject: React.FC<FreehandObjectProps> = ({ element, isSelected, isHovered }) => {
  const { points, stroke, strokeWidth, opacity } = element;
  const pathData = generateSvgPath(points);

  if (!pathData) return null;

  return (
    <g
      id={`object-${element.id}`}
      className={`cursor-pointer ${
        isHovered && !isSelected ? 'filter drop-shadow-[0_0_4px_rgba(139,92,246,0.6)]' : ''
      }`}
    >
      {/* Invisible thicker hit-box path for easier clicking/selecting */}
      <path
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth={Math.max(strokeWidth + 14, 18)}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={pathData}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={opacity}
      />
    </g>
  );
};
