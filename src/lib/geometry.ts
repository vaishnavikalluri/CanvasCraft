import { Point, Bounds, CanvasElement, ResizeHandle, AnchorPosition, ConnectorStyle, AlignmentGuide } from '../types/canvasObjects';
import { Viewport } from '../types/board';

/**
 * Convert screen coordinates (from mouse/touch events) to virtual canvas coordinates
 */
export function screenToCanvas(screenPoint: Point, viewport: Viewport): Point {
  return {
    x: (screenPoint.x - viewport.x) / viewport.zoom,
    y: (screenPoint.y - viewport.y) / viewport.zoom,
  };
}

/**
 * Convert virtual canvas coordinates to screen coordinates
 */
export function canvasToScreen(canvasPoint: Point, viewport: Viewport): Point {
  return {
    x: canvasPoint.x * viewport.zoom + viewport.x,
    y: canvasPoint.y * viewport.zoom + viewport.y,
  };
}

/**
 * Calculate accurate bounding box for any canvas element
 */
export function getElementBounds(element: CanvasElement): Bounds {
  if (element.type === 'pen') {
    if (element.points.length === 0) {
      return { x: element.x ?? 0, y: element.y ?? 0, width: 0, height: 0 };
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const p of element.points) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
    const pad = Math.max(element.strokeWidth / 2, 4);
    return {
      x: minX - pad,
      y: minY - pad,
      width: Math.max(maxX - minX + pad * 2, 10),
      height: Math.max(maxY - minY + pad * 2, 10),
    };
  }

  if (element.type === 'connector') {
    const minX = Math.min(element.startPoint.x, element.endPoint.x);
    const minY = Math.min(element.startPoint.y, element.endPoint.y);
    const maxX = Math.max(element.startPoint.x, element.endPoint.x);
    const maxY = Math.max(element.startPoint.y, element.endPoint.y);
    const pad = Math.max(element.strokeWidth, 8);
    return {
      x: minX - pad,
      y: minY - pad,
      width: Math.max(maxX - minX + pad * 2, 12),
      height: Math.max(maxY - minY + pad * 2, 12),
    };
  }

  if (element.type === 'shape' && (element.shapeType === 'line' || element.shapeType === 'arrow')) {
    const x1 = element.x ?? 0;
    const y1 = element.y ?? 0;
    const x2 = x1 + (element.width ?? 0);
    const y2 = y1 + (element.height ?? 0);
    const minX = Math.min(x1, x2);
    const minY = Math.min(y1, y2);
    const maxX = Math.max(x1, x2);
    const maxY = Math.max(y1, y2);
    const pad = Math.max(element.strokeWidth, 8);
    return {
      x: minX - pad,
      y: minY - pad,
      width: Math.max(maxX - minX + pad * 2, 16),
      height: Math.max(maxY - minY + pad * 2, 16),
    };
  }

  return {
    x: element.x ?? 0,
    y: element.y ?? 0,
    width: element.width ?? 0,
    height: element.height ?? 0,
  };
}

/**
 * Calculate the union bounding box of multiple canvas elements
 */
export function getCombinedBounds(elements: CanvasElement[]): Bounds | null {
  if (!elements || elements.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const el of elements) {
    const bounds = getElementBounds(el);
    minX = Math.min(minX, bounds.x);
    minY = Math.min(minY, bounds.y);
    maxX = Math.max(maxX, bounds.x + bounds.width);
    maxY = Math.max(maxY, bounds.y + bounds.height);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Check if a point lies within a bounding box
 */
export function isPointInBounds(p: Point, bounds: Bounds): boolean {
  return (
    p.x >= bounds.x &&
    p.x <= bounds.x + bounds.width &&
    p.y >= bounds.y &&
    p.y <= bounds.y + bounds.height
  );
}

/**
 * Check if two bounding boxes overlap
 */
export function doBoundsIntersect(a: Bounds, b: Bounds): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Calculate anchor points for an element
 */
export function getObjectAnchors(element: CanvasElement): Record<AnchorPosition, Point> {
  const b = getElementBounds(element);
  return {
    top: { x: b.x + b.width / 2, y: b.y },
    right: { x: b.x + b.width, y: b.y + b.height / 2 },
    bottom: { x: b.x + b.width / 2, y: b.y + b.height },
    left: { x: b.x, y: b.y + b.height / 2 },
    center: { x: b.x + b.width / 2, y: b.y + b.height / 2 },
  };
}

/**
 * Find the closest anchor point on an element to a given coordinate
 */
export function getClosestAnchor(
  point: Point,
  element: CanvasElement,
  threshold = 28
): { anchor: AnchorPosition; point: Point; distance: number } | null {
  const anchors = getObjectAnchors(element);
  let closest: { anchor: AnchorPosition; point: Point; distance: number } | null = null;
  let minDistance = threshold;

  (Object.keys(anchors) as AnchorPosition[]).forEach((anchor) => {
    const p = anchors[anchor];
    const dist = Math.hypot(p.x - point.x, p.y - point.y);
    if (dist < minDistance) {
      minDistance = dist;
      closest = { anchor, point: p, distance: dist };
    }
  });

  return closest;
}

/**
 * Generate smooth SVG path string for freehand drawing strokes
 */
export function generateSvgPath(points: Point[]): string {
  if (!points || points.length === 0) return '';
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y} L ${points[0].x + 0.1} ${points[0].y + 0.1}`;
  }
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    path += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`;
  }
  path += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`;
  return path;
}

/**
 * Generate SVG path for connectors: straight, smooth curve, or orthogonal
 */
export function generateConnectorPath(
  start: Point,
  end: Point,
  style: ConnectorStyle,
  startAnchor?: AnchorPosition,
  endAnchor?: AnchorPosition
): string {
  if (style === 'straight') {
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  }

  if (style === 'curved') {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dist = Math.hypot(dx, dy);
    const curvature = Math.min(dist * 0.4, 120);

    let cp1 = { x: start.x, y: start.y };
    let cp2 = { x: end.x, y: end.y };

    if (startAnchor === 'top') cp1.y -= curvature;
    else if (startAnchor === 'bottom') cp1.y += curvature;
    else if (startAnchor === 'left') cp1.x -= curvature;
    else if (startAnchor === 'right') cp1.x += curvature;
    else cp1.x += dx * 0.3;

    if (endAnchor === 'top') cp2.y -= curvature;
    else if (endAnchor === 'bottom') cp2.y += curvature;
    else if (endAnchor === 'left') cp2.x -= curvature;
    else if (endAnchor === 'right') cp2.x += curvature;
    else cp2.x -= dx * 0.3;

    return `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;
  }

  // Orthogonal stepped lines
  const midX = (start.x + end.x) / 2;
  return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
}

/**
 * Calculate arrow head points for lines and connectors
 */
export function getArrowHeadPath(from: Point, to: Point, size = 12): string {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const p1x = to.x - size * Math.cos(angle - Math.PI / 6);
  const p1y = to.y - size * Math.sin(angle - Math.PI / 6);
  const p2x = to.x - size * Math.cos(angle + Math.PI / 6);
  const p2y = to.y - size * Math.sin(angle + Math.PI / 6);
  return `M ${to.x} ${to.y} L ${p1x} ${p1y} L ${p2x} ${p2y} Z`;
}

/**
 * Snap a value to a grid step
 */
export function snapToGrid(value: number, gridSize = 20): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Snap point to grid
 */
export function snapPointToGrid(p: Point, gridSize = 20): Point {
  return {
    x: snapToGrid(p.x, gridSize),
    y: snapToGrid(p.y, gridSize),
  };
}

/**
 * Smart Alignment Guides & Snapping against other canvas elements
 */
export function calculateAlignmentSnapping(
  draggedBounds: Bounds,
  otherElements: CanvasElement[],
  threshold = 8
): { snappedBounds: Bounds; guides: AlignmentGuide[] } {
  let { x, y, width, height } = draggedBounds;
  const guides: AlignmentGuide[] = [];

  const left = x;
  const centerX = x + width / 2;
  const right = x + width;
  const top = y;
  const centerY = y + height / 2;
  const bottom = y + height;

  let snapDiffX = 0;
  let snapDiffY = 0;
  let minDistanceX = threshold;
  let minDistanceY = threshold;

  for (const el of otherElements) {
    const ob = getElementBounds(el);
    const oLeft = ob.x;
    const oCenterX = ob.x + ob.width / 2;
    const oRight = ob.x + ob.width;
    const oTop = ob.y;
    const oCenterY = ob.y + ob.height / 2;
    const oBottom = ob.y + ob.height;

    // Horizontal alignments (X-axis)
    const xAlignments = [
      { diff: oLeft - left, pos: oLeft, desc: 'left-to-left' },
      { diff: oCenterX - centerX, pos: oCenterX, desc: 'center-to-center' },
      { diff: oRight - right, pos: oRight, desc: 'right-to-right' },
      { diff: oLeft - right, pos: oLeft, desc: 'right-to-left' },
      { diff: oRight - left, pos: oRight, desc: 'left-to-right' },
    ];

    for (const align of xAlignments) {
      if (Math.abs(align.diff) < minDistanceX) {
        minDistanceX = Math.abs(align.diff);
        snapDiffX = align.diff;
        guides.push({
          type: 'vertical',
          position: align.pos,
          start: Math.min(top, oTop) - 20,
          end: Math.max(bottom, oBottom) + 20,
        });
      }
    }

    // Vertical alignments (Y-axis)
    const yAlignments = [
      { diff: oTop - top, pos: oTop, desc: 'top-to-top' },
      { diff: oCenterY - centerY, pos: oCenterY, desc: 'center-to-center' },
      { diff: oBottom - bottom, pos: oBottom, desc: 'bottom-to-bottom' },
      { diff: oTop - bottom, pos: oTop, desc: 'bottom-to-top' },
      { diff: oBottom - top, pos: oBottom, desc: 'top-to-bottom' },
    ];

    for (const align of yAlignments) {
      if (Math.abs(align.diff) < minDistanceY) {
        minDistanceY = Math.abs(align.diff);
        snapDiffY = align.diff;
        guides.push({
          type: 'horizontal',
          position: align.pos,
          start: Math.min(left, oLeft) - 20,
          end: Math.max(right, oRight) + 20,
        });
      }
    }
  }

  return {
    snappedBounds: {
      x: x + snapDiffX,
      y: y + snapDiffY,
      width,
      height,
    },
    guides: guides.slice(-4), // keep the most relevant guides
  };
}

/**
 * Resize calculation from handle, initial bounds, and cursor delta (zero jump)
 */
export function calculateResize(
  initialBounds: Bounds,
  handle: ResizeHandle,
  currentPoint: Point,
  startPoint: Point,
  keepRatio = false,
  minSize = 20
): Bounds {
  const dx = currentPoint.x - startPoint.x;
  const dy = currentPoint.y - startPoint.y;

  let { x, y, width, height } = initialBounds;
  const initialRatio = width / (height || 1);

  switch (handle) {
    case 'se': {
      width = Math.max(initialBounds.width + dx, minSize);
      height = Math.max(initialBounds.height + dy, minSize);
      break;
    }
    case 'e': {
      width = Math.max(initialBounds.width + dx, minSize);
      break;
    }
    case 's': {
      height = Math.max(initialBounds.height + dy, minSize);
      break;
    }
    case 'nw': {
      const newWidth = Math.max(initialBounds.width - dx, minSize);
      const newHeight = Math.max(initialBounds.height - dy, minSize);
      x = initialBounds.x + (initialBounds.width - newWidth);
      y = initialBounds.y + (initialBounds.height - newHeight);
      width = newWidth;
      height = newHeight;
      break;
    }
    case 'n': {
      const newHeight = Math.max(initialBounds.height - dy, minSize);
      y = initialBounds.y + (initialBounds.height - newHeight);
      height = newHeight;
      break;
    }
    case 'w': {
      const newWidth = Math.max(initialBounds.width - dx, minSize);
      x = initialBounds.x + (initialBounds.width - newWidth);
      width = newWidth;
      break;
    }
    case 'ne': {
      width = Math.max(initialBounds.width + dx, minSize);
      const newHeight = Math.max(initialBounds.height - dy, minSize);
      y = initialBounds.y + (initialBounds.height - newHeight);
      height = newHeight;
      break;
    }
    case 'sw': {
      const newWidth = Math.max(initialBounds.width - dx, minSize);
      x = initialBounds.x + (initialBounds.width - newWidth);
      width = newWidth;
      height = Math.max(initialBounds.height + dy, minSize);
      break;
    }
  }

  if (keepRatio && initialRatio > 0) {
    if (['nw', 'ne', 'se', 'sw'].includes(handle)) {
      height = Math.max(width / initialRatio, minSize);
      if (handle === 'nw' || handle === 'ne') {
        y = initialBounds.y + (initialBounds.height - height);
      }
    }
  }

  return { x, y, width, height };
}
