import React from 'react';
import { ShapeElement } from '../../types/canvasObjects';
import { getArrowHeadPath } from '../../lib/geometry';

interface ShapeObjectProps {
  element: ShapeElement;
  isSelected: boolean;
  isHovered: boolean;
}

export const ShapeObject: React.FC<ShapeObjectProps> = ({ element, isSelected, isHovered }) => {
  const { shapeType, x, y, width, height, fill, stroke, strokeWidth, strokeStyle, cornerRadius, opacity } = element;

  const strokeDasharray =
    strokeStyle === 'dashed' ? '8 6' : strokeStyle === 'dotted' ? '3 4' : undefined;

  const renderShape = () => {
    switch (shapeType) {
      case 'rectangle':
        return (
          <rect
            x={x}
            y={y}
            width={Math.max(width, 1)}
            height={Math.max(height, 1)}
            rx={cornerRadius || 0}
            ry={cornerRadius || 0}
            fill={fill || 'none'}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            opacity={opacity}
          />
        );

      case 'ellipse': {
        const rx = Math.max(width / 2, 1);
        const ry = Math.max(height / 2, 1);
        const cx = x + rx;
        const cy = y + ry;
        return (
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill={fill || 'none'}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            opacity={opacity}
          />
        );
      }

      case 'line':
        return (
          <g opacity={opacity}>
            <line
              x1={x}
              y1={y}
              x2={x + width}
              y2={y + height}
              stroke="transparent"
              strokeWidth={Math.max(strokeWidth + 14, 18)}
              strokeLinecap="round"
            />
            <line
              x1={x}
              y1={y}
              x2={x + width}
              y2={y + height}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
            />
          </g>
        );

      case 'arrow': {
        const x1 = x;
        const y1 = y;
        const x2 = x + width;
        const y2 = y + height;
        const arrowPath = getArrowHeadPath({ x: x1, y: y1 }, { x: x2, y: y2 }, Math.max(strokeWidth * 4, 14));
        return (
          <g opacity={opacity}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="transparent"
              strokeWidth={Math.max(strokeWidth + 14, 18)}
              strokeLinecap="round"
            />
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
            />
            <path d={arrowPath} fill={stroke} />
          </g>
        );
      }

      case 'diamond': {
        const points = [
          `${x + width / 2},${y}`,
          `${x + width},${y + height / 2}`,
          `${x + width / 2},${y + height}`,
          `${x},${y + height / 2}`,
        ].join(' ');
        return (
          <polygon
            points={points}
            fill={fill || 'none'}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            opacity={opacity}
          />
        );
      }

      case 'triangle': {
        const points = [
          `${x + width / 2},${y}`,
          `${x + width},${y + height}`,
          `${x},${y + height}`,
        ].join(' ');
        return (
          <polygon
            points={points}
            fill={fill || 'none'}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            opacity={opacity}
          />
        );
      }

      case 'star': {
        const cx = x + width / 2;
        const cy = y + height / 2;
        const spikes = 5;
        const outerRadius = Math.min(width, height) / 2;
        const innerRadius = outerRadius * 0.45;
        let rot = (Math.PI / 2) * 3;
        const step = Math.PI / spikes;
        const pointsArr: string[] = [];

        for (let i = 0; i < spikes; i++) {
          let px = cx + Math.cos(rot) * outerRadius;
          let py = cy + Math.sin(rot) * outerRadius;
          pointsArr.push(`${px},${py}`);
          rot += step;

          px = cx + Math.cos(rot) * innerRadius;
          py = cy + Math.sin(rot) * innerRadius;
          pointsArr.push(`${px},${py}`);
          rot += step;
        }

        return (
          <polygon
            points={pointsArr.join(' ')}
            fill={fill || 'none'}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            opacity={opacity}
          />
        );
      }

      default:
        return null;
    }
  };

  return (
    <g
      id={`object-${element.id}`}
      className={`cursor-pointer transition-opacity duration-150 ${
        isHovered && !isSelected ? 'filter drop-shadow-[0_0_4px_rgba(139,92,246,0.5)]' : ''
      }`}
    >
      {renderShape()}
    </g>
  );
};
