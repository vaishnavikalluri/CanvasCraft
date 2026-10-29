import { CanvasElement, AlignmentGuide } from './canvasObjects';

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface BoardMetadata {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  elementCount: number;
  thumbnail?: string;
}

export interface BoardData {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  elements: CanvasElement[];
  viewport: Viewport;
}

export type GridMode = 'dots' | 'lines' | 'none';
export type ThemeMode = 'light' | 'dark';

export interface HistoryEntry {
  elements: CanvasElement[];
  description?: string;
}

export interface CanvasInteractionState {
  mode: 'idle' | 'drawing' | 'dragging' | 'resizing' | 'panning' | 'selecting' | 'connecting';
  startPoint: { x: number; y: number };
  currentPoint: { x: number; y: number };
  activeHandle?: string;
  draggedIds?: string[];
  selectionBox?: { x: number; y: number; width: number; height: number };
  connectingFrom?: { objectId: string; anchor: string; point: { x: number; y: number } };
  guides?: AlignmentGuide[];
}
