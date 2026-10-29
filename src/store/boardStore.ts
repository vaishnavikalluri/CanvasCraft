import { create } from 'zustand';
import { 
  CanvasElement, 
  ToolType, 
  StickyColor, 
  StrokeStyle, 
  ConnectorStyle,
  Point,
  Bounds
} from '../types/canvasObjects';
import { BoardData, Viewport, GridMode, ThemeMode } from '../types/board';
import { getCombinedBounds, getElementBounds } from '../lib/geometry';
import { TEMPLATES } from '../templates/boardTemplates';
import { getSavedTheme, saveThemePreference, setActiveBoardId } from '../lib/storage';

interface BoardState {
  // Board metadata
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;

  // Canvas elements
  elements: CanvasElement[];
  viewport: Viewport;

  // Tool & Interactions
  tool: ToolType;
  selectedIds: string[];
  editingId: string | null;
  hoveredId: string | null;

  // Active styling presets for new elements
  activeFill: string;
  activeStroke: string;
  activeStrokeWidth: number;
  activeStrokeStyle: StrokeStyle;
  activeFontSize: number;
  activeStickyColor: StickyColor;
  activeConnectorStyle: ConnectorStyle;
  activeOpacity: number;

  // Clipboard & History
  clipboard: CanvasElement[];
  undoStack: CanvasElement[][];
  redoStack: CanvasElement[][];

  // UI & Canvas Settings
  gridMode: GridMode;
  snapToGrid: boolean;
  snapToObjects: boolean;
  theme: ThemeMode;
  autoSaveStatus: 'saved' | 'saving' | 'error';
  isPropertiesOpen: boolean;
  isBoardManagerOpen: boolean;
  isExportOpen: boolean;
  isShortcutsOpen: boolean;
  searchQuery: string;

  // Actions
  setTitle: (title: string) => void;
  setTool: (tool: ToolType) => void;
  setViewport: (viewport: Partial<Viewport> | ((prev: Viewport) => Viewport)) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  zoomTo: (zoom: number, center?: Point) => void;
  fitToContent: (containerWidth?: number, containerHeight?: number) => void;
  fitToFrame: (frameId: string, containerWidth?: number, containerHeight?: number) => void;

  // Element CRUD
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  updateMultipleElements: (updates: { id: string; updates: Partial<CanvasElement> }[]) => void;
  deleteSelected: () => void;
  deleteElements: (ids: string[]) => void;
  duplicateSelected: () => void;
  copySelected: () => void;
  pasteClipboard: () => void;

  // Selection
  selectElement: (id: string, append?: boolean) => void;
  setSelectedIds: (ids: string[]) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setEditingId: (id: string | null) => void;
  setHoveredId: (id: string | null) => void;

  // Styling updates for selected elements
  setSelectedFill: (fill: string) => void;
  setSelectedStroke: (stroke: string) => void;
  setSelectedStrokeWidth: (width: number) => void;
  setSelectedStrokeStyle: (style: StrokeStyle) => void;
  setSelectedOpacity: (opacity: number) => void;
  setSelectedFontSize: (size: number) => void;
  setSelectedStickyColor: (color: StickyColor) => void;
  setSelectedConnectorStyle: (style: ConnectorStyle) => void;

  // Layer ordering & Grouping
  bringForward: () => void;
  sendBackward: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  groupSelected: () => void;
  ungroupSelected: () => void;
  toggleLockSelected: () => void;
  alignSelected: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;

  // History
  commitHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Board persistence & templates
  loadBoard: (board: BoardData) => void;
  loadTemplate: (templateId: string) => void;
  createNewBoard: (title?: string) => void;
  setAutoSaveStatus: (status: 'saved' | 'saving' | 'error') => void;

  // Settings
  setGridMode: (mode: GridMode) => void;
  toggleSnapToGrid: () => void;
  toggleSnapToObjects: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setPropertiesOpen: (open: boolean) => void;
  setBoardManagerOpen: (open: boolean) => void;
  setExportOpen: (open: boolean) => void;
  setShortcutsOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
}

const initialTemplate = TEMPLATES[1]; // Start with Brainstorming Board by default for an impressive initial presentation!
const initialBoard = initialTemplate.createBoard();

export const useBoardStore = create<BoardState>((set, get) => ({
  id: initialBoard.id,
  title: initialBoard.title,
  createdAt: initialBoard.createdAt,
  updatedAt: initialBoard.updatedAt,
  elements: initialBoard.elements,
  viewport: initialBoard.viewport || { x: 50, y: 50, zoom: 0.9 },

  tool: 'select',
  selectedIds: [],
  editingId: null,
  hoveredId: null,

  activeFill: '#8b5cf6',
  activeStroke: '#7c3aed',
  activeStrokeWidth: 2,
  activeStrokeStyle: 'solid',
  activeFontSize: 16,
  activeStickyColor: 'yellow',
  activeConnectorStyle: 'curved',
  activeOpacity: 1,

  clipboard: [],
  undoStack: [],
  redoStack: [],

  gridMode: 'dots',
  snapToGrid: false,
  snapToObjects: true,
  theme: getSavedTheme(),
  autoSaveStatus: 'saved',
  isPropertiesOpen: true,
  isBoardManagerOpen: false,
  isExportOpen: false,
  isShortcutsOpen: false,
  searchQuery: '',

  setTitle: (title) => set({ title, updatedAt: Date.now() }),

  setTool: (tool) => {
    set({ tool });
    if (tool !== 'select') {
      set({ selectedIds: [], editingId: null });
    }
  },

  setViewport: (viewportOrUpdater) => {
    set((state) => ({
      viewport: typeof viewportOrUpdater === 'function' 
        ? viewportOrUpdater(state.viewport) 
        : { ...state.viewport, ...viewportOrUpdater }
    }));
  },

  zoomIn: () => {
    set((state) => {
      const newZoom = Math.min(Math.round((state.viewport.zoom + 0.15) * 100) / 100, 3.0);
      return { viewport: { ...state.viewport, zoom: newZoom } };
    });
  },

  zoomOut: () => {
    set((state) => {
      const newZoom = Math.max(Math.round((state.viewport.zoom - 0.15) * 100) / 100, 0.2);
      return { viewport: { ...state.viewport, zoom: newZoom } };
    });
  },

  resetZoom: () => {
    set((state) => ({
      viewport: { ...state.viewport, zoom: 1 }
    }));
  },

  zoomTo: (zoom, center) => {
    set((state) => {
      const targetZoom = Math.min(Math.max(zoom, 0.2), 3.0);
      if (!center) {
        return { viewport: { ...state.viewport, zoom: targetZoom } };
      }
      const scale = targetZoom / state.viewport.zoom;
      const newX = center.x - (center.x - state.viewport.x) * scale;
      const newY = center.y - (center.y - state.viewport.y) * scale;
      return { viewport: { x: newX, y: newY, zoom: targetZoom } };
    });
  },

  fitToContent: (containerWidth = window.innerWidth, containerHeight = window.innerHeight) => {
    const { elements } = get();
    if (elements.length === 0) {
      set({ viewport: { x: 0, y: 0, zoom: 1 } });
      return;
    }
    const bounds = getCombinedBounds(elements);
    if (!bounds || bounds.width === 0 || bounds.height === 0) return;

    const padding = 100;
    const availableW = Math.max(containerWidth - padding * 2, 200);
    const availableH = Math.max(containerHeight - padding * 2, 200);

    const zoomW = availableW / bounds.width;
    const zoomH = availableH / bounds.height;
    const newZoom = Math.min(Math.max(Math.min(zoomW, zoomH), 0.2), 1.5);

    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;

    const newX = containerWidth / 2 - centerX * newZoom;
    const newY = containerHeight / 2 - centerY * newZoom;

    set({ viewport: { x: newX, y: newY, zoom: Math.round(newZoom * 100) / 100 } });
  },

  fitToFrame: (frameId, containerWidth = window.innerWidth, containerHeight = window.innerHeight) => {
    const { elements } = get();
    const frame = elements.find((el) => el.id === frameId);
    if (!frame || frame.type !== 'frame') return;

    const padding = 80;
    const availableW = Math.max(containerWidth - padding * 2, 200);
    const availableH = Math.max(containerHeight - padding * 2, 200);

    const zoomW = availableW / frame.width;
    const zoomH = availableH / frame.height;
    const newZoom = Math.min(Math.max(Math.min(zoomW, zoomH), 0.3), 1.6);

    const centerX = frame.x + frame.width / 2;
    const centerY = frame.y + frame.height / 2;

    const newX = containerWidth / 2 - centerX * newZoom;
    const newY = containerHeight / 2 - centerY * newZoom;

    set({ viewport: { x: newX, y: newY, zoom: Math.round(newZoom * 100) / 100 } });
  },

  commitHistory: () => {
    const { elements, undoStack } = get();
    // Deep clone elements for snapshot
    const snapshot = JSON.parse(JSON.stringify(elements));
    const nextUndo = [...undoStack.slice(-49), snapshot];
    set({ undoStack: nextUndo, redoStack: [], updatedAt: Date.now() });
  },

  undo: () => {
    const { undoStack, elements, redoStack } = get();
    if (undoStack.length === 0) return;

    const currentSnapshot = JSON.parse(JSON.stringify(elements));
    const previousSnapshot = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);

    set({
      elements: previousSnapshot,
      undoStack: newUndoStack,
      redoStack: [...redoStack, currentSnapshot],
      selectedIds: [],
      editingId: null,
      updatedAt: Date.now(),
    });
  },

  redo: () => {
    const { redoStack, elements, undoStack } = get();
    if (redoStack.length === 0) return;

    const currentSnapshot = JSON.parse(JSON.stringify(elements));
    const nextSnapshot = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);

    set({
      elements: nextSnapshot,
      undoStack: [...undoStack, currentSnapshot],
      redoStack: newRedoStack,
      selectedIds: [],
      editingId: null,
      updatedAt: Date.now(),
    });
  },

  addElement: (element) => {
    get().commitHistory();
    set((state) => ({
      elements: [...state.elements, element],
      selectedIds: [element.id],
      updatedAt: Date.now(),
    }));
  },

  updateElement: (id, updates) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? ({ ...el, ...updates, updatedAt: Date.now() } as CanvasElement) : el
      ),
      updatedAt: Date.now(),
    }));
  },

  updateMultipleElements: (updatesList) => {
    const map = new Map(updatesList.map((u) => [u.id, u.updates]));
    set((state) => ({
      elements: state.elements.map((el) => {
        const u = map.get(el.id);
        return u ? ({ ...el, ...u, updatedAt: Date.now() } as CanvasElement) : el;
      }),
      updatedAt: Date.now(),
    }));
  },

  deleteSelected: () => {
    const { selectedIds } = get();
    if (selectedIds.length === 0) return;
    get().deleteElements(selectedIds);
  },

  deleteElements: (ids) => {
    get().commitHistory();
    const idSet = new Set(ids);
    set((state) => {
      // Remove elements and also remove connectors attached to them or clean connector endpoints
      const filtered = state.elements.filter((el) => {
        if (idSet.has(el.id)) return false;
        if (el.type === 'connector') {
          // If both or either endpoint was connected to deleted object, detach or remove
          if (el.startObjectId && idSet.has(el.startObjectId)) {
            el.startObjectId = undefined;
          }
          if (el.endObjectId && idSet.has(el.endObjectId)) {
            el.endObjectId = undefined;
          }
        }
        return true;
      });

      return {
        elements: filtered,
        selectedIds: state.selectedIds.filter((id) => !idSet.has(id)),
        editingId: state.editingId && idSet.has(state.editingId) ? null : state.editingId,
        updatedAt: Date.now(),
      };
    });
  },

  duplicateSelected: () => {
    const { elements, selectedIds } = get();
    if (selectedIds.length === 0) return;

    get().commitHistory();
    const selected = elements.filter((el) => selectedIds.includes(el.id));
    const offset = 24;
    const newElements: CanvasElement[] = [];
    const newSelectedIds: string[] = [];

    for (const item of selected) {
      const newId = 'obj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const cloned = JSON.parse(JSON.stringify(item)) as CanvasElement;
      cloned.id = newId;
      if (cloned.x !== undefined) cloned.x += offset;
      if (cloned.y !== undefined) cloned.y += offset;
      if (cloned.type === 'pen') {
        cloned.points = cloned.points.map((p) => ({ ...p, x: p.x + offset, y: p.y + offset }));
      }
      if (cloned.type === 'connector') {
        cloned.startPoint.x += offset;
        cloned.startPoint.y += offset;
        cloned.endPoint.x += offset;
        cloned.endPoint.y += offset;
        cloned.startObjectId = undefined;
        cloned.endObjectId = undefined;
      }
      cloned.createdAt = Date.now();
      cloned.updatedAt = Date.now();
      newElements.push(cloned);
      newSelectedIds.push(newId);
    }

    set((state) => ({
      elements: [...state.elements, ...newElements],
      selectedIds: newSelectedIds,
      updatedAt: Date.now(),
    }));
  },

  copySelected: () => {
    const { elements, selectedIds } = get();
    if (selectedIds.length === 0) return;
    const selected = elements.filter((el) => selectedIds.includes(el.id));
    set({ clipboard: JSON.parse(JSON.stringify(selected)) });
  },

  pasteClipboard: () => {
    const { clipboard } = get();
    if (clipboard.length === 0) return;

    get().commitHistory();
    const offset = 32;
    const newElements: CanvasElement[] = [];
    const newSelectedIds: string[] = [];

    for (const item of clipboard) {
      const newId = 'obj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const cloned = JSON.parse(JSON.stringify(item)) as CanvasElement;
      cloned.id = newId;
      if (cloned.x !== undefined) cloned.x += offset;
      if (cloned.y !== undefined) cloned.y += offset;
      if (cloned.type === 'pen') {
        cloned.points = cloned.points.map((p) => ({ ...p, x: p.x + offset, y: p.y + offset }));
      }
      if (cloned.type === 'connector') {
        cloned.startPoint.x += offset;
        cloned.startPoint.y += offset;
        cloned.endPoint.x += offset;
        cloned.endPoint.y += offset;
        cloned.startObjectId = undefined;
        cloned.endObjectId = undefined;
      }
      newElements.push(cloned);
      newSelectedIds.push(newId);
    }

    set((state) => ({
      elements: [...state.elements, ...newElements],
      selectedIds: newSelectedIds,
      updatedAt: Date.now(),
    }));
  },

  selectElement: (id, append = false) => {
    set((state) => {
      if (append) {
        const alreadySelected = state.selectedIds.includes(id);
        const newIds = alreadySelected
          ? state.selectedIds.filter((item) => item !== id)
          : [...state.selectedIds, id];
        return { selectedIds: newIds };
      }
      return { selectedIds: [id], editingId: null };
    });
  },

  setSelectedIds: (ids) => set({ selectedIds: ids }),

  selectAll: () => {
    set((state) => ({
      selectedIds: state.elements.map((el) => el.id),
      editingId: null,
    }));
  },

  clearSelection: () => set({ selectedIds: [], editingId: null }),

  setEditingId: (id) => set({ editingId: id }),

  setHoveredId: (id) => set({ hoveredId: id }),

  // Styling updates
  setSelectedFill: (fill) => {
    get().commitHistory();
    set((state) => ({
      activeFill: fill,
      elements: state.elements.map((el) => {
        if (!state.selectedIds.includes(el.id)) return el;
        if (el.type === 'shape') {
          if (el.shapeType === 'line' || el.shapeType === 'arrow') {
            return { ...el, stroke: fill, updatedAt: Date.now() } as CanvasElement;
          }
          return { ...el, fill, updatedAt: Date.now() } as CanvasElement;
        }
        if (el.type === 'connector' || el.type === 'pen') {
          return { ...el, stroke: fill, updatedAt: Date.now() } as CanvasElement;
        }
        if (el.type === 'text') {
          return { ...el, fill, color: fill, updatedAt: Date.now() } as CanvasElement;
        }
        return el;
      }),
    }));
  },

  setSelectedStroke: (stroke) => {
    get().commitHistory();
    set((state) => ({
      activeStroke: stroke,
      elements: state.elements.map((el) => {
        if (!state.selectedIds.includes(el.id)) return el;
        if (el.type === 'shape' || el.type === 'pen' || el.type === 'connector') {
          return { ...el, stroke, updatedAt: Date.now() } as CanvasElement;
        }
        if (el.type === 'text') {
          return { ...el, color: stroke, updatedAt: Date.now() } as CanvasElement;
        }
        return el;
      }),
    }));
  },

  setSelectedStrokeWidth: (strokeWidth) => {
    get().commitHistory();
    set((state) => ({
      activeStrokeWidth: strokeWidth,
      elements: state.elements.map((el) => {
        if (!state.selectedIds.includes(el.id)) return el;
        if (el.type === 'shape' || el.type === 'pen' || el.type === 'connector') {
          return { ...el, strokeWidth, updatedAt: Date.now() } as CanvasElement;
        }
        return el;
      }),
    }));
  },

  setSelectedStrokeStyle: (strokeStyle) => {
    get().commitHistory();
    set((state) => ({
      activeStrokeStyle: strokeStyle,
      elements: state.elements.map((el) => {
        if (!state.selectedIds.includes(el.id)) return el;
        if (el.type === 'shape' || el.type === 'connector') {
          return { ...el, strokeStyle, updatedAt: Date.now() } as CanvasElement;
        }
        return el;
      }),
    }));
  },

  setSelectedOpacity: (opacity) => {
    get().commitHistory();
    set((state) => ({
      activeOpacity: opacity,
      elements: state.elements.map((el) =>
        state.selectedIds.includes(el.id)
          ? ({ ...el, opacity, updatedAt: Date.now() } as CanvasElement)
          : el
      ),
    }));
  },

  setSelectedFontSize: (fontSize) => {
    get().commitHistory();
    set((state) => ({
      activeFontSize: fontSize,
      elements: state.elements.map((el) => {
        if (!state.selectedIds.includes(el.id)) return el;
        if (el.type === 'text' || el.type === 'sticky') {
          return { ...el, fontSize, updatedAt: Date.now() } as CanvasElement;
        }
        return el;
      }),
    }));
  },

  setSelectedStickyColor: (color) => {
    get().commitHistory();
    set((state) => ({
      activeStickyColor: color,
      elements: state.elements.map((el) => {
        if (!state.selectedIds.includes(el.id)) return el;
        if (el.type === 'sticky') {
          return { ...el, color, updatedAt: Date.now() } as CanvasElement;
        }
        return el;
      }),
    }));
  },

  setSelectedConnectorStyle: (connectorStyle) => {
    get().commitHistory();
    set((state) => ({
      activeConnectorStyle: connectorStyle,
      elements: state.elements.map((el) => {
        if (!state.selectedIds.includes(el.id)) return el;
        if (el.type === 'connector') {
          return { ...el, connectorStyle, updatedAt: Date.now() } as CanvasElement;
        }
        return el;
      }),
    }));
  },

  bringForward: () => {
    const { selectedIds, elements } = get();
    if (selectedIds.length === 0) return;
    get().commitHistory();

    const newElements = [...elements];
    for (let i = newElements.length - 2; i >= 0; i--) {
      if (selectedIds.includes(newElements[i].id) && !selectedIds.includes(newElements[i + 1].id)) {
        const temp = newElements[i];
        newElements[i] = newElements[i + 1];
        newElements[i + 1] = temp;
      }
    }
    set({ elements: newElements });
  },

  sendBackward: () => {
    const { selectedIds, elements } = get();
    if (selectedIds.length === 0) return;
    get().commitHistory();

    const newElements = [...elements];
    for (let i = 1; i < newElements.length; i++) {
      if (selectedIds.includes(newElements[i].id) && !selectedIds.includes(newElements[i - 1].id)) {
        const temp = newElements[i];
        newElements[i] = newElements[i - 1];
        newElements[i - 1] = temp;
      }
    }
    set({ elements: newElements });
  },

  bringToFront: () => {
    const { selectedIds, elements } = get();
    if (selectedIds.length === 0) return;
    get().commitHistory();

    const selected = elements.filter((el) => selectedIds.includes(el.id));
    const unselected = elements.filter((el) => !selectedIds.includes(el.id));
    set({ elements: [...unselected, ...selected] });
  },

  sendToBack: () => {
    const { selectedIds, elements } = get();
    if (selectedIds.length === 0) return;
    get().commitHistory();

    const selected = elements.filter((el) => selectedIds.includes(el.id));
    const unselected = elements.filter((el) => !selectedIds.includes(el.id));
    set({ elements: [...selected, ...unselected] });
  },

  groupSelected: () => {
    const { selectedIds, elements } = get();
    if (selectedIds.length < 2) return;
    get().commitHistory();

    const groupId = 'group_' + Date.now();
    set({
      elements: elements.map((el) =>
        selectedIds.includes(el.id) ? { ...el, groupId, updatedAt: Date.now() } : el
      ),
    });
  },

  ungroupSelected: () => {
    const { selectedIds, elements } = get();
    if (selectedIds.length === 0) return;
    get().commitHistory();

    set({
      elements: elements.map((el) =>
        selectedIds.includes(el.id) ? { ...el, groupId: undefined, updatedAt: Date.now() } : el
      ),
    });
  },

  toggleLockSelected: () => {
    const { selectedIds, elements } = get();
    if (selectedIds.length === 0) return;
    get().commitHistory();

    const isAnyUnlocked = elements
      .filter((el) => selectedIds.includes(el.id))
      .some((el) => !el.isLocked);

    set({
      elements: elements.map((el) =>
        selectedIds.includes(el.id)
          ? { ...el, isLocked: isAnyUnlocked, updatedAt: Date.now() }
          : el
      ),
    });
  },

  alignSelected: (alignment) => {
    const { selectedIds, elements } = get();
    if (selectedIds.length < 2) return;
    get().commitHistory();

    const selected = elements.filter((el) => selectedIds.includes(el.id));
    const combined = getCombinedBounds(selected);
    if (!combined) return;

    const updates = selected.map((el) => {
      const b = getElementBounds(el);
      let newX = el.x ?? b.x;
      let newY = el.y ?? b.y;

      switch (alignment) {
        case 'left':
          newX = combined.x;
          break;
        case 'center':
          newX = combined.x + (combined.width - b.width) / 2;
          break;
        case 'right':
          newX = combined.x + combined.width - b.width;
          break;
        case 'top':
          newY = combined.y;
          break;
        case 'middle':
          newY = combined.y + (combined.height - b.height) / 2;
          break;
        case 'bottom':
          newY = combined.y + combined.height - b.height;
          break;
      }

      return { id: el.id, updates: { x: newX, y: newY } };
    });

    get().updateMultipleElements(updates);
  },

  loadBoard: (board) => {
    setActiveBoardId(board.id);
    set({
      id: board.id,
      title: board.title,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
      elements: board.elements,
      viewport: board.viewport || { x: 50, y: 50, zoom: 1 },
      selectedIds: [],
      editingId: null,
      undoStack: [],
      redoStack: [],
      isBoardManagerOpen: false,
    });
  },

  loadTemplate: (templateId) => {
    const template = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];
    const newBoard = template.createBoard();
    get().loadBoard(newBoard);
  },

  createNewBoard: (title = 'Untitled Whiteboard') => {
    const newBoard: BoardData = {
      id: 'board_' + Date.now(),
      title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      viewport: { x: 0, y: 0, zoom: 1 },
      elements: [],
    };
    get().loadBoard(newBoard);
  },

  setAutoSaveStatus: (status) => set({ autoSaveStatus: status }),

  setGridMode: (mode) => set({ gridMode: mode }),

  toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),

  toggleSnapToObjects: () => set((state) => ({ snapToObjects: !state.snapToObjects })),

  setTheme: (theme) => {
    saveThemePreference(theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },

  toggleTheme: () => {
    const current = get().theme;
    const next = current === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  setPropertiesOpen: (open) => set({ isPropertiesOpen: open }),
  setBoardManagerOpen: (open) => set({ isBoardManagerOpen: open }),
  setExportOpen: (open) => set({ isExportOpen: open }),
  setShortcutsOpen: (open) => set({ isShortcutsOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
