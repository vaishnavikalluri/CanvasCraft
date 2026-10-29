import React from 'react';
import { Viewport, GridMode } from '../../types/board';

interface CanvasGridProps {
  viewport: Viewport;
  gridMode: GridMode;
}

export const CanvasGrid: React.FC<CanvasGridProps> = ({ viewport, gridMode }) => {
  if (gridMode === 'none') return null;

  const baseSize = 24;
  const scaledSize = baseSize * viewport.zoom;
  const offsetX = ((viewport.x % scaledSize) + scaledSize) % scaledSize;
  const offsetY = ((viewport.y % scaledSize) + scaledSize) % scaledSize;

  if (gridMode === 'dots') {
    return (
      <defs>
        <pattern
          id="canvas-grid-pattern"
          x={offsetX}
          y={offsetY}
          width={scaledSize}
          height={scaledSize}
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx={scaledSize / 2}
            cy={scaledSize / 2}
            r={Math.max(1.1 * Math.min(viewport.zoom, 1.2), 0.8)}
            className="fill-slate-300 dark:fill-slate-700/80"
          />
        </pattern>
      </defs>
    );
  }

  // Lines grid mode
  return (
    <defs>
      <pattern
        id="canvas-grid-pattern"
        x={offsetX}
        y={offsetY}
        width={scaledSize}
        height={scaledSize}
        patternUnits="userSpaceOnUse"
      >
        <path
          d={`M ${scaledSize} 0 L 0 0 0 ${scaledSize}`}
          fill="none"
          strokeWidth={0.75}
          className="stroke-slate-200/70 dark:stroke-slate-800/60"
        />
      </pattern>
    </defs>
  );
};
