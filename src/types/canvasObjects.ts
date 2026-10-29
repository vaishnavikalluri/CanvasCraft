export type ToolType = 
  | 'select'
  | 'pan'
  | 'pen'
  | 'eraser'
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'arrow'
  | 'text'
  | 'sticky'
  | 'connector'
  | 'frame';

export type ShapeType = 'rectangle' | 'ellipse' | 'line' | 'arrow' | 'diamond' | 'triangle' | 'star';

export type StrokeStyle = 'solid' | 'dashed' | 'dotted';

export type ConnectorStyle = 'straight' | 'curved' | 'orthogonal';

export type AnchorPosition = 'top' | 'right' | 'bottom' | 'left' | 'center';

export type TextAlign = 'left' | 'center' | 'right';

export type StickyColor = 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'orange' | 'white';

export interface Point {
  x: number;
  y: number;
}

export interface StrokePoint extends Point {
  pressure?: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BaseCanvasObject {
  id: string;
  type: 'shape' | 'pen' | 'text' | 'sticky' | 'connector' | 'frame';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  opacity: number;
  zIndex: number;
  isLocked?: boolean;
  groupId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ShapeElement extends BaseCanvasObject {
  type: 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  shapeType: ShapeType;
  fill: string;
  stroke: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  cornerRadius?: number;
}

export interface FreehandElement extends BaseCanvasObject {
  type: 'pen';
  points: StrokePoint[];
  stroke: string;
  strokeWidth: number;
  smoothing?: boolean;
}

export interface TextElement extends BaseCanvasObject {
  type: 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold' | '500' | '600';
  fontStyle?: 'normal' | 'italic';
  textAlign: TextAlign;
  color: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface StickyNoteElement extends BaseCanvasObject {
  type: 'sticky';
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: StickyColor;
  fontSize: number;
  textAlign: TextAlign;
  fontFamily?: string;
}

export interface ConnectorElement extends BaseCanvasObject {
  type: 'connector';
  startObjectId?: string;
  startAnchor?: AnchorPosition;
  endObjectId?: string;
  endAnchor?: AnchorPosition;
  startPoint: Point;
  endPoint: Point;
  stroke: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  connectorStyle: ConnectorStyle;
  startArrow?: boolean;
  endArrow?: boolean;
  label?: string;
}

export interface FrameElement extends BaseCanvasObject {
  type: 'frame';
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  borderColor: string;
  backgroundColor: string;
}

export type CanvasElement = 
  | ShapeElement 
  | FreehandElement 
  | TextElement 
  | StickyNoteElement 
  | ConnectorElement 
  | FrameElement;

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export interface AlignmentGuide {
  type: 'horizontal' | 'vertical';
  position: number;
  start: number;
  end: number;
}
