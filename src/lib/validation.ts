import { BoardData } from '../types/board';
import { CanvasElement } from '../types/canvasObjects';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  board?: BoardData;
}

export function validateAndSanitizeBoard(data: unknown): ValidationResult {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'File is not a valid JSON object.' };
  }

  const candidate = data as Record<string, unknown>;

  if (typeof candidate.title !== 'string' || candidate.title.trim().length === 0) {
    candidate.title = 'Imported Board';
  }

  if (!Array.isArray(candidate.elements)) {
    return { valid: false, error: 'Invalid board data: missing elements array.' };
  }

  const validElements: CanvasElement[] = [];
  const idMap = new Map<string, string>();

  // Regenerate element IDs to prevent collisions with existing objects
  for (const item of candidate.elements) {
    if (!item || typeof item !== 'object' || typeof item.id !== 'string' || typeof item.type !== 'string') {
      continue;
    }

    const oldId = item.id;
    const newId = 'obj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    idMap.set(oldId, newId);

    const el = { ...item, id: newId } as CanvasElement;
    validElements.push(el);
  }

  // Update connector references with remapped IDs
  for (const el of validElements) {
    if (el.type === 'connector') {
      if (el.startObjectId && idMap.has(el.startObjectId)) {
        el.startObjectId = idMap.get(el.startObjectId);
      }
      if (el.endObjectId && idMap.has(el.endObjectId)) {
        el.endObjectId = idMap.get(el.endObjectId);
      }
    }
  }

  const board: BoardData = {
    id: 'board_' + Date.now(),
    title: candidate.title as string,
    createdAt: typeof candidate.createdAt === 'number' ? candidate.createdAt : Date.now(),
    updatedAt: Date.now(),
    viewport: candidate.viewport && typeof candidate.viewport === 'object'
      ? {
          x: Number((candidate.viewport as Record<string, unknown>).x) || 0,
          y: Number((candidate.viewport as Record<string, unknown>).y) || 0,
          zoom: Number((candidate.viewport as Record<string, unknown>).zoom) || 1,
        }
      : { x: 0, y: 0, zoom: 1 },
    elements: validElements,
  };

  return { valid: true, board };
}
