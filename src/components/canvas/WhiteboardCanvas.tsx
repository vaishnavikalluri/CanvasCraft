import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useBoardStore } from '../../store/boardStore';
import { 
  Point, 
  Bounds, 
  CanvasElement, 
  ShapeElement, 
  FreehandElement, 
  TextElement, 
  StickyNoteElement, 
  ConnectorElement, 
  FrameElement,
  ShapeType,
  ResizeHandle,
  AnchorPosition,
  AlignmentGuide
} from '../../types/canvasObjects';
import { 
  screenToCanvas, 
  getElementBounds, 
  getCombinedBounds, 
  doBoundsIntersect, 
  calculateResize, 
  calculateAlignmentSnapping,
  snapPointToGrid,
  getObjectAnchors,
  getClosestAnchor,
  generateSvgPath,
  generateConnectorPath,
  getArrowHeadPath
} from '../../lib/geometry';
import { CanvasGrid } from './CanvasGrid';
import { CanvasObject } from './CanvasObject';
import { SelectionBox } from './SelectionBox';
import { ContextualToolbar } from './ContextualToolbar';
import { CanvasTextEditor } from './CanvasTextEditor';

export const WhiteboardCanvas: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  const {
    elements,
    viewport,
    tool,
    selectedIds,
    editingId,
    hoveredId,
    gridMode,
    snapToGrid,
    snapToObjects,
    activeFill,
    activeStroke,
    activeStrokeWidth,
    activeStrokeStyle,
    activeFontSize,
    activeStickyColor,
    activeConnectorStyle,
    activeOpacity,
    setViewport,
    zoomTo,
    selectElement,
    setSelectedIds,
    clearSelection,
    setHoveredId,
    setEditingId,
    addElement,
    updateMultipleElements,
    deleteElements,
    commitHistory,
    setTool,
  } = useBoardStore();

  // Spacebar pan tracking
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Active interaction state
  const [interaction, setInteraction] = useState<{
    mode: 'none' | 'pan' | 'pen' | 'shape' | 'frame' | 'drag' | 'resize' | 'marquee' | 'connector' | 'eraser';
    startScreen: Point;
    startCanvas: Point;
    currentCanvas: Point;
    resizeHandle?: ResizeHandle;
    initialBoundsMap?: Map<string, Bounds>;
    initialPointsMap?: Map<string, Point[]>;
    initialConnectorsMap?: Map<string, { start: Point; end: Point }>;
    combinedInitialBounds?: Bounds;
    inProgressStroke?: Point[];
    connectorSource?: { objectId?: string; anchor?: AnchorPosition; point: Point };
    guides?: AlignmentGuide[];
    selectionMarquee?: Bounds;
  }>({
    mode: 'none',
    startScreen: { x: 0, y: 0 },
    startCanvas: { x: 0, y: 0 },
    currentCanvas: { x: 0, y: 0 },
  });

  // Track spacebar for quick panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Wheel zoom centered around cursor & two-finger trackpad panning
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (!svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const cursorScreen = { x: e.clientX - rect.left, y: e.clientY - rect.top };

      if (e.ctrlKey || e.metaKey) {
        // Zooming
        const zoomDelta = -e.deltaY * 0.002;
        const newZoom = Math.min(Math.max(viewport.zoom + zoomDelta, 0.2), 3.0);
        zoomTo(newZoom, cursorScreen);
      } else {
        // Panning
        setViewport({
          x: viewport.x - e.deltaX,
          y: viewport.y - e.deltaY,
        });
      }
    },
    [viewport, zoomTo, setViewport]
  );

  // Helper to reliably compute screen and virtual canvas coordinates relative to SVG canvas rect
  const getCanvasPointFromEvent = (e: React.PointerEvent | React.MouseEvent): { screenPoint: Point; canvasPoint: Point } => {
    const rect = svgRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    const screenPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    return {
      screenPoint,
      canvasPoint: screenToCanvas(screenPoint, viewport),
    };
  };

  // Resize handle starting
  const handleResizeStart = (e: React.PointerEvent, handle: ResizeHandle) => {
    e.stopPropagation();
    if (selectedIds.length === 0) return;
    if (svgRef.current) {
      svgRef.current.setPointerCapture(e.pointerId);
    }

    const { screenPoint, canvasPoint } = getCanvasPointFromEvent(e);
    const selectedElements = elements.filter((el) => selectedIds.includes(el.id));
    const combined = getCombinedBounds(selectedElements);
    if (!combined) return;

    const boundsMap = new Map<string, Bounds>();
    const pointsMap = new Map<string, Point[]>();
    const connectorsMap = new Map<string, { start: Point; end: Point }>();

    selectedElements.forEach((el) => {
      boundsMap.set(el.id, getElementBounds(el));
      if (el.type === 'pen') {
        pointsMap.set(el.id, JSON.parse(JSON.stringify(el.points)));
      }
      if (el.type === 'connector') {
        connectorsMap.set(el.id, {
          start: { ...el.startPoint },
          end: { ...el.endPoint },
        });
      }
    });

    setInteraction({
      mode: 'resize',
      resizeHandle: handle,
      startScreen: screenPoint,
      startCanvas: canvasPoint,
      currentCanvas: canvasPoint,
      combinedInitialBounds: combined,
      initialBoundsMap: boundsMap,
      initialPointsMap: pointsMap,
      initialConnectorsMap: connectorsMap,
    });
  };

  // Pointer Down
  const handlePointerDown = (e: React.PointerEvent) => {
    // If the click is inside an active textarea, input, or UI overlay, DO NOT capture pointer or initiate canvas drag
    const target = e.target as HTMLElement;
    if (target && target.closest('textarea, input, foreignObject, [data-canvas-ui], .contextual-toolbar')) {
      return;
    }

    const { screenPoint, canvasPoint } = getCanvasPointFromEvent(e);

    // Identify hit element early
    const targetEl = (e.target as Element).closest('[id^="object-"]');
    const clickedId = targetEl ? targetEl.id.replace('object-', '') : null;

    // Dismiss active text/sticky editing ONLY when clicking elsewhere (not on the same element)
    if (editingId && clickedId !== editingId) {
      setEditingId(null);
    }

    // Text tool: Create immediately, select it, and open inline editor
    if (tool === 'text') {
      const snapped = snapToGrid ? snapPointToGrid(canvasPoint) : canvasPoint;
      const textId = 'text_' + Date.now();
      const newText: TextElement = {
        id: textId,
        type: 'text',
        x: snapped.x,
        y: snapped.y,
        width: 220,
        height: 60,
        text: '',
        fontSize: activeFontSize,
        fontFamily: 'Inter',
        fontWeight: 'normal',
        textAlign: 'left',
        color: activeStroke || '#1e293b',
        opacity: activeOpacity,
        zIndex: elements.length + 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      commitHistory();
      addElement(newText);
      selectElement(textId, false);
      setEditingId(textId);
      setTool('select');
      return;
    }

    // Sticky note tool: Create immediately, select it, and open inline editor
    if (tool === 'sticky') {
      const snapped = snapToGrid ? snapPointToGrid(canvasPoint) : canvasPoint;
      const stickyId = 'sticky_' + Date.now();
      const newSticky: StickyNoteElement = {
        id: stickyId,
        type: 'sticky',
        x: snapped.x - 90,
        y: snapped.y - 80,
        width: 180,
        height: 160,
        text: '',
        color: activeStickyColor,
        fontSize: activeFontSize,
        textAlign: 'left',
        opacity: activeOpacity,
        zIndex: elements.length + 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      commitHistory();
      addElement(newSticky);
      selectElement(stickyId, false);
      setEditingId(stickyId);
      setTool('select');
      return;
    }

    // If clicking an already-selected text or sticky note, directly enter editing mode without pointer capture
    if (tool === 'select' && clickedId && e.button === 0 && !e.shiftKey) {
      const clickedElement = elements.find((el) => el.id === clickedId);
      if (clickedElement && (clickedElement.type === 'text' || clickedElement.type === 'sticky')) {
        const isAlreadySelected = selectedIds.includes(clickedId);
        if (isAlreadySelected) {
          setInteraction({
            mode: 'none',
            startScreen: screenPoint,
            startCanvas: canvasPoint,
            currentCanvas: canvasPoint,
          });
          setEditingId(clickedId);
          return;
        }
      }
    }

    if (!svgRef.current) return;
    svgRef.current.setPointerCapture(e.pointerId);

    // Middle click or Spacebar held or Pan tool active -> Pan canvas
    if (e.button === 1 || isSpacePressed || tool === 'pan') {
      setInteraction({
        mode: 'pan',
        startScreen: screenPoint,
        startCanvas: canvasPoint,
        currentCanvas: canvasPoint,
      });
      return;
    }

    // Left click handling
    if (e.button !== 0) return;

    if (tool === 'eraser') {
      setInteraction({
        mode: 'eraser',
        startScreen: screenPoint,
        startCanvas: canvasPoint,
        currentCanvas: canvasPoint,
      });
      if (clickedId) {
        deleteElements([clickedId]);
      }
      return;
    }

    if (tool === 'pen') {
      const snapped = snapToGrid ? snapPointToGrid(canvasPoint) : canvasPoint;
      setInteraction({
        mode: 'pen',
        startScreen: screenPoint,
        startCanvas: snapped,
        currentCanvas: snapped,
        inProgressStroke: [snapped],
      });
      return;
    }

    if (['rectangle', 'ellipse', 'line', 'arrow'].includes(tool)) {
      const snapped = snapToGrid ? snapPointToGrid(canvasPoint) : canvasPoint;
      setInteraction({
        mode: 'shape',
        startScreen: screenPoint,
        startCanvas: snapped,
        currentCanvas: snapped,
      });
      return;
    }

    if (tool === 'frame') {
      const snapped = snapToGrid ? snapPointToGrid(canvasPoint) : canvasPoint;
      setInteraction({
        mode: 'frame',
        startScreen: screenPoint,
        startCanvas: snapped,
        currentCanvas: snapped,
      });
      return;
    }

    if (tool === 'connector') {
      let sourceInfo: { objectId?: string; anchor?: AnchorPosition; point: Point } = {
        point: canvasPoint,
      };

      if (clickedId) {
        const obj = elements.find((el) => el.id === clickedId);
        if (obj) {
          const closest = getClosestAnchor(canvasPoint, obj);
          if (closest) {
            sourceInfo = { objectId: clickedId, anchor: closest.anchor, point: closest.point };
          }
        }
      }

      setInteraction({
        mode: 'connector',
        startScreen: screenPoint,
        startCanvas: sourceInfo.point,
        currentCanvas: canvasPoint,
        connectorSource: sourceInfo,
      });
      return;
    }

    // Default: 'select' tool
    if (clickedId) {
      const clickedElement = elements.find((el) => el.id === clickedId);
      if (!clickedElement) return;

      const isAlreadySelected = selectedIds.includes(clickedId);

      // Single-click on already-selected text or sticky note enters editing mode immediately
      if (isAlreadySelected && !e.shiftKey && (clickedElement.type === 'text' || clickedElement.type === 'sticky')) {
        setEditingId(clickedId);
        return;
      }

      if (e.shiftKey) {
        selectElement(clickedId, true);
      } else if (!isAlreadySelected) {
        selectElement(clickedId, false);
      }

      // Prepare dragging
      const currentSelected = e.shiftKey
        ? isAlreadySelected
          ? selectedIds.filter((id) => id !== clickedId)
          : [...selectedIds, clickedId]
        : isAlreadySelected
        ? selectedIds
        : [clickedId];

      const boundsMap = new Map<string, Bounds>();
      const pointsMap = new Map<string, Point[]>();
      const connectorsMap = new Map<string, { start: Point; end: Point }>();

      elements
        .filter((el) => currentSelected.includes(el.id))
        .forEach((el) => {
          boundsMap.set(el.id, getElementBounds(el));
          if (el.type === 'pen') {
            pointsMap.set(el.id, JSON.parse(JSON.stringify(el.points)));
          }
          if (el.type === 'connector') {
            connectorsMap.set(el.id, {
              start: { ...el.startPoint },
              end: { ...el.endPoint },
            });
          }
        });

      setInteraction({
        mode: 'drag',
        startScreen: screenPoint,
        startCanvas: canvasPoint,
        currentCanvas: canvasPoint,
        initialBoundsMap: boundsMap,
        initialPointsMap: pointsMap,
        initialConnectorsMap: connectorsMap,
        combinedInitialBounds: getCombinedBounds(
          elements.filter((el) => currentSelected.includes(el.id))
        ) || undefined,
      });
    } else {
      // Clicked on empty canvas -> clear selection and initiate marquee selection
      clearSelection();
      setInteraction({
        mode: 'marquee',
        startScreen: screenPoint,
        startCanvas: canvasPoint,
        currentCanvas: canvasPoint,
        selectionMarquee: { x: canvasPoint.x, y: canvasPoint.y, width: 0, height: 0 },
      });
    }
  };

  // Pointer Move
  const handlePointerMove = (e: React.PointerEvent) => {
    const { screenPoint, canvasPoint } = getCanvasPointFromEvent(e);

    // Hover detection when idle
    if (interaction.mode === 'none') {
      const targetEl = (e.target as Element).closest('[id^="object-"]');
      const hovered = targetEl ? targetEl.id.replace('object-', '') : null;
      if (hovered !== hoveredId) {
        setHoveredId(hovered);
      }
      return;
    }

    if (interaction.mode === 'pan') {
      const dx = screenPoint.x - interaction.startScreen.x;
      const dy = screenPoint.y - interaction.startScreen.y;
      setViewport({
        x: viewport.x + dx,
        y: viewport.y + dy,
      });
      setInteraction((prev) => ({ ...prev, startScreen: screenPoint }));
      return;
    }

    if (interaction.mode === 'pen') {
      const point = snapToGrid ? snapPointToGrid(canvasPoint) : canvasPoint;
      setInteraction((prev) => ({
        ...prev,
        currentCanvas: point,
        inProgressStroke: [...(prev.inProgressStroke || []), point],
      }));
      return;
    }

    if (interaction.mode === 'eraser') {
      const targetEl = (e.target as Element).closest('[id^="object-"]');
      if (targetEl) {
        const id = targetEl.id.replace('object-', '');
        deleteElements([id]);
      }
      return;
    }

    if (interaction.mode === 'shape' || interaction.mode === 'frame' || interaction.mode === 'connector') {
      const point = snapToGrid ? snapPointToGrid(canvasPoint) : canvasPoint;
      setInteraction((prev) => ({
        ...prev,
        currentCanvas: point,
      }));
      return;
    }

    if (interaction.mode === 'marquee') {
      const x = Math.min(interaction.startCanvas.x, canvasPoint.x);
      const y = Math.min(interaction.startCanvas.y, canvasPoint.y);
      const width = Math.abs(canvasPoint.x - interaction.startCanvas.x);
      const height = Math.abs(canvasPoint.y - interaction.startCanvas.y);
      const marqueeBounds = { x, y, width, height };

      // Live select elements intersecting marquee
      const intersectedIds = elements
        .filter((el) => doBoundsIntersect(getElementBounds(el), marqueeBounds))
        .map((el) => el.id);

      setSelectedIds(intersectedIds);
      setInteraction((prev) => ({
        ...prev,
        currentCanvas: canvasPoint,
        selectionMarquee: marqueeBounds,
      }));
      return;
    }

    if (interaction.mode === 'drag' && interaction.initialBoundsMap && interaction.combinedInitialBounds) {
      let dx = canvasPoint.x - interaction.startCanvas.x;
      let dy = canvasPoint.y - interaction.startCanvas.y;

      let guides: AlignmentGuide[] = [];

      // Alignment snapping against other unselected objects
      if (snapToObjects) {
        const unselected = elements.filter((el) => !selectedIds.includes(el.id));
        const draggedBounds: Bounds = {
          x: interaction.combinedInitialBounds.x + dx,
          y: interaction.combinedInitialBounds.y + dy,
          width: interaction.combinedInitialBounds.width,
          height: interaction.combinedInitialBounds.height,
        };

        const snapResult = calculateAlignmentSnapping(draggedBounds, unselected);
        dx = snapResult.snappedBounds.x - interaction.combinedInitialBounds.x;
        dy = snapResult.snappedBounds.y - interaction.combinedInitialBounds.y;
        guides = snapResult.guides;
      } else if (snapToGrid) {
        const snappedCombinedX = Math.round((interaction.combinedInitialBounds.x + dx) / 20) * 20;
        const snappedCombinedY = Math.round((interaction.combinedInitialBounds.y + dy) / 20) * 20;
        dx = snappedCombinedX - interaction.combinedInitialBounds.x;
        dy = snappedCombinedY - interaction.combinedInitialBounds.y;
      }

      // Update positions
      const updates = elements
        .filter((el) => selectedIds.includes(el.id) && !el.isLocked)
        .map((el) => {
          const initB = interaction.initialBoundsMap?.get(el.id);
          if (!initB) return null;

          if (el.type === 'pen') {
            const initPoints = interaction.initialPointsMap?.get(el.id);
            if (!initPoints) return null;
            return {
              id: el.id,
              updates: {
                points: initPoints.map((p) => ({ x: p.x + dx, y: p.y + dy })),
              },
            };
          }

          if (el.type === 'connector') {
            const initConn = interaction.initialConnectorsMap?.get(el.id);
            if (!initConn) return null;
            return {
              id: el.id,
              updates: {
                startPoint: { x: initConn.start.x + dx, y: initConn.start.y + dy },
                endPoint: { x: initConn.end.x + dx, y: initConn.end.y + dy },
              },
            };
          }

          return {
            id: el.id,
            updates: {
              x: initB.x + dx,
              y: initB.y + dy,
            },
          };
        })
        .filter(Boolean) as { id: string; updates: Partial<CanvasElement> }[];

      updateMultipleElements(updates);
      setInteraction((prev) => ({ ...prev, currentCanvas: canvasPoint, guides }));
      return;
    }

    if (interaction.mode === 'resize' && interaction.resizeHandle && interaction.combinedInitialBounds) {
      const resizedBounds = calculateResize(
        interaction.combinedInitialBounds,
        interaction.resizeHandle,
        canvasPoint,
        interaction.startCanvas,
        e.shiftKey
      );

      if (selectedIds.length === 1) {
        const el = elements.find((item) => item.id === selectedIds[0]);
        if (el && !el.isLocked) {
          if (el.type === 'shape' && (el.shapeType === 'line' || el.shapeType === 'arrow')) {
            const initX = el.x ?? 0;
            const initY = el.y ?? 0;
            const initW = el.width ?? 0;
            const initH = el.height ?? 0;
            const dx = canvasPoint.x - interaction.startCanvas.x;
            const dy = canvasPoint.y - interaction.startCanvas.y;

            if (['nw', 'w', 'n', 'sw'].includes(interaction.resizeHandle)) {
              updateMultipleElements([
                {
                  id: el.id,
                  updates: {
                    x: initX + dx,
                    y: initY + dy,
                    width: initW - dx,
                    height: initH - dy,
                  },
                },
              ]);
            } else {
              updateMultipleElements([
                {
                  id: el.id,
                  updates: {
                    width: initW + dx,
                    height: initH + dy,
                  },
                },
              ]);
            }
          } else if (el.type === 'pen') {
            const initPoints = interaction.initialPointsMap?.get(el.id);
            const initB = interaction.initialBoundsMap?.get(el.id);
            if (initPoints && initB && initB.width > 0 && initB.height > 0) {
              const scaleX = resizedBounds.width / initB.width;
              const scaleY = resizedBounds.height / initB.height;
              const newPoints = initPoints.map((p) => ({
                x: resizedBounds.x + (p.x - initB.x) * scaleX,
                y: resizedBounds.y + (p.y - initB.y) * scaleY,
              }));
              updateMultipleElements([{ id: el.id, updates: { points: newPoints } }]);
            }
          } else if (el.type === 'connector') {
            const initConn = interaction.initialConnectorsMap?.get(el.id);
            if (initConn) {
              const dx = canvasPoint.x - interaction.startCanvas.x;
              const dy = canvasPoint.y - interaction.startCanvas.y;
              if (['nw', 'w', 'n', 'sw'].includes(interaction.resizeHandle)) {
                updateMultipleElements([
                  {
                    id: el.id,
                    updates: {
                      startPoint: { x: initConn.start.x + dx, y: initConn.start.y + dy },
                    },
                  },
                ]);
              } else {
                updateMultipleElements([
                  {
                    id: el.id,
                    updates: {
                      endPoint: { x: initConn.end.x + dx, y: initConn.end.y + dy },
                    },
                  },
                ]);
              }
            }
          } else {
            updateMultipleElements([
              {
                id: el.id,
                updates: {
                  x: resizedBounds.x,
                  y: resizedBounds.y,
                  width: resizedBounds.width,
                  height: resizedBounds.height,
                },
              },
            ]);
          }
        }
      } else {
        const scaleX = resizedBounds.width / (interaction.combinedInitialBounds.width || 1);
        const scaleY = resizedBounds.height / (interaction.combinedInitialBounds.height || 1);

        const updates = elements
          .filter((el) => selectedIds.includes(el.id) && !el.isLocked)
          .map((el) => {
            const initB = interaction.initialBoundsMap?.get(el.id);
            if (!initB) return null;

            const relX = initB.x - interaction.combinedInitialBounds!.x;
            const relY = initB.y - interaction.combinedInitialBounds!.y;

            if (el.type === 'pen') {
              const initPoints = interaction.initialPointsMap?.get(el.id);
              if (initPoints && initB.width > 0 && initB.height > 0) {
                const newPoints = initPoints.map((p) => ({
                  x: resizedBounds.x + (p.x - initB.x) * scaleX,
                  y: resizedBounds.y + (p.y - initB.y) * scaleY,
                }));
                return { id: el.id, updates: { points: newPoints } };
              }
            }

            return {
              id: el.id,
              updates: {
                x: resizedBounds.x + relX * scaleX,
                y: resizedBounds.y + relY * scaleY,
                width: Math.max(initB.width * scaleX, 10),
                height: Math.max(initB.height * scaleY, 10),
              },
            };
          })
          .filter(Boolean) as { id: string; updates: Partial<CanvasElement> }[];

        updateMultipleElements(updates);
      }

      setInteraction((prev) => ({ ...prev, currentCanvas: canvasPoint }));
      return;
    }
  };

  // Pointer Up
  const handlePointerUp = (e: React.PointerEvent) => {
    if (svgRef.current && svgRef.current.hasPointerCapture(e.pointerId)) {
      svgRef.current.releasePointerCapture(e.pointerId);
    }

    const { mode, inProgressStroke, startCanvas, currentCanvas, connectorSource } = interaction;

    if (mode === 'pen' && inProgressStroke && inProgressStroke.length > 0) {
      commitHistory();
      const freehandId = 'pen_' + Date.now();
      const newStroke: FreehandElement = {
        id: freehandId,
        type: 'pen',
        points: inProgressStroke,
        stroke: activeStroke || '#7c3aed',
        strokeWidth: activeStrokeWidth || 3,
        smoothing: true,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        opacity: activeOpacity,
        zIndex: elements.length + 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      addElement(newStroke);
    } else if (mode === 'shape') {
      commitHistory();
      const shapeId = 'shape_' + Date.now();

      let x = Math.min(startCanvas.x, currentCanvas.x);
      let y = Math.min(startCanvas.y, currentCanvas.y);
      let width = Math.abs(currentCanvas.x - startCanvas.x);
      let height = Math.abs(currentCanvas.y - startCanvas.y);

      if (tool === 'line' || tool === 'arrow') {
        x = startCanvas.x;
        y = startCanvas.y;
        width = currentCanvas.x - startCanvas.x;
        height = currentCanvas.y - startCanvas.y;
        if (Math.hypot(width, height) < 8) {
          width = 100;
          height = 0;
        }
      } else {
        width = Math.max(width, 20);
        height = Math.max(height, 20);
      }

      const newShape: ShapeElement = {
        id: shapeId,
        type: 'shape',
        shapeType: tool as ShapeType,
        x,
        y,
        width,
        height,
        fill: tool === 'line' || tool === 'arrow' ? 'none' : activeFill,
        stroke: activeStroke,
        strokeWidth: activeStrokeWidth,
        strokeStyle: activeStrokeStyle,
        cornerRadius: tool === 'rectangle' ? 8 : 0,
        opacity: activeOpacity,
        zIndex: elements.length + 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      addElement(newShape);
      setTool('select');
    } else if (mode === 'frame') {
      const x = Math.min(startCanvas.x, currentCanvas.x);
      const y = Math.min(startCanvas.y, currentCanvas.y);
      const width = Math.max(Math.abs(currentCanvas.x - startCanvas.x), 100);
      const height = Math.max(Math.abs(currentCanvas.y - startCanvas.y), 80);

      commitHistory();
      const frameId = 'frame_' + Date.now();
      const newFrame: FrameElement = {
        id: frameId,
        type: 'frame',
        title: 'New Section',
        x,
        y,
        width,
        height,
        borderColor: '#8b5cf6',
        backgroundColor: '#faf5ff',
        opacity: 0.95,
        zIndex: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      addElement(newFrame);
      setTool('select');
    } else if (mode === 'connector' && connectorSource) {
      commitHistory();
      // Target object check under cursor
      const targetEl = (e.target as Element).closest('[id^="object-"]');
      const targetId = targetEl ? targetEl.id.replace('object-', '') : undefined;
      let targetAnchor: AnchorPosition | undefined;
      let finalEndPoint = currentCanvas;

      if (targetId) {
        const targetObj = elements.find((el) => el.id === targetId);
        if (targetObj) {
          const closest = getClosestAnchor(currentCanvas, targetObj);
          if (closest) {
            targetAnchor = closest.anchor;
            finalEndPoint = closest.point;
          }
        }
      }

      const connectorId = 'conn_' + Date.now();
      const newConnector: ConnectorElement = {
        id: connectorId,
        type: 'connector',
        startObjectId: connectorSource.objectId,
        startAnchor: connectorSource.anchor,
        endObjectId: targetId,
        endAnchor: targetAnchor,
        startPoint: connectorSource.point,
        endPoint: finalEndPoint,
        stroke: activeStroke || '#64748b',
        strokeWidth: activeStrokeWidth || 2,
        strokeStyle: activeStrokeStyle || 'solid',
        connectorStyle: activeConnectorStyle || 'curved',
        endArrow: true,
        opacity: activeOpacity,
        zIndex: elements.length + 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      addElement(newConnector);
      setTool('select');
    } else if (mode === 'drag' || mode === 'resize') {
      commitHistory();
    }

    setInteraction({
      mode: 'none',
      startScreen: { x: 0, y: 0 },
      startCanvas: { x: 0, y: 0 },
      currentCanvas: { x: 0, y: 0 },
    });
  };

  // Double click to edit text or sticky note or frame title
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const targetEl = (e.target as Element).closest('[id^="object-"]');
    const id = targetEl ? targetEl.id.replace('object-', '') : selectedIds.length === 1 ? selectedIds[0] : null;
    if (!id) return;
    const element = elements.find((el) => el.id === id);
    if (element && (element.type === 'text' || element.type === 'sticky' || element.type === 'frame')) {
      selectElement(id, false);
      setInteraction({
        mode: 'none',
        startScreen: { x: 0, y: 0 },
        startCanvas: { x: 0, y: 0 },
        currentCanvas: { x: 0, y: 0 },
      });
      setEditingId(id);
    }
  };

  // Compute selected elements bounding box
  const selectedElements = elements.filter((el) => selectedIds.includes(el.id));
  const selectionBounds = getCombinedBounds(selectedElements);

  // Separate frames to render them behind all other elements (z-order)
  const frameElements = elements.filter((el) => el.type === 'frame');
  const normalElements = elements.filter((el) => el.type !== 'frame');

  // Canvas cursor style based on tool and interaction
  const getCursorClass = () => {
    if (interaction.mode === 'pan' || isSpacePressed || tool === 'pan') return 'cursor-grab active:cursor-grabbing';
    if (interaction.mode === 'resize' && interaction.resizeHandle) {
      const cursorMap: Record<ResizeHandle, string> = {
        nw: 'cursor-nwse-resize',
        se: 'cursor-nwse-resize',
        ne: 'cursor-nesw-resize',
        sw: 'cursor-nesw-resize',
        n: 'cursor-ns-resize',
        s: 'cursor-ns-resize',
        e: 'cursor-ew-resize',
        w: 'cursor-ew-resize',
      };
      return cursorMap[interaction.resizeHandle] || 'cursor-default';
    }
    if (tool === 'pen') return 'cursor-crosshair';
    if (tool === 'eraser') return 'cursor-not-allowed';
    if (['rectangle', 'ellipse', 'line', 'arrow', 'frame', 'connector', 'sticky', 'text'].includes(tool)) {
      return 'cursor-crosshair';
    }
    return 'cursor-default';
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none bg-slate-50 dark:bg-slate-950 ${getCursorClass()}`}
      onWheel={handleWheel}
    >
      <svg
        ref={svgRef}
        id="whiteboard-svg-canvas"
        className="w-full h-full touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
      >
        {/* Background Grid Pattern */}
        <CanvasGrid viewport={viewport} gridMode={gridMode} />
        {gridMode !== 'none' && (
          <rect width="100%" height="100%" fill="url(#canvas-grid-pattern)" className="pointer-events-none" />
        )}

        {/* Canvas World Layer (Zoom & Pan transformed) */}
        <g id="canvas-world-layer" transform={`matrix(${viewport.zoom} 0 0 ${viewport.zoom} ${viewport.x} ${viewport.y})`}>
          {/* Layer 1: Frame / Section containers */}
          {frameElements.map((el) => (
            <CanvasObject
              key={el.id}
              element={el}
              isSelected={selectedIds.includes(el.id)}
              isHovered={hoveredId === el.id}
              isEditing={editingId === el.id}
            />
          ))}

          {/* Layer 2: Shapes, Connectors, Text, Sticky Notes, Freehand */}
          {normalElements.map((el) => (
            <CanvasObject
              key={el.id}
              element={el}
              isSelected={selectedIds.includes(el.id)}
              isHovered={hoveredId === el.id}
              isEditing={editingId === el.id}
            />
          ))}

          {/* In-progress drawing / rubberband previews */}
          {interaction.mode === 'pen' && interaction.inProgressStroke && (
            <path
              d={generateSvgPath(interaction.inProgressStroke)}
              fill="none"
              stroke={activeStroke}
              strokeWidth={activeStrokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={activeOpacity}
            />
          )}

          {interaction.mode === 'shape' && (
            <>
              {tool === 'arrow' && (
                <g>
                  <line
                    x1={interaction.startCanvas.x}
                    y1={interaction.startCanvas.y}
                    x2={interaction.currentCanvas.x}
                    y2={interaction.currentCanvas.y}
                    stroke={activeStroke}
                    strokeWidth={activeStrokeWidth}
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                  />
                  <path
                    d={getArrowHeadPath(
                      interaction.startCanvas,
                      interaction.currentCanvas,
                      Math.max(activeStrokeWidth * 4, 14)
                    )}
                    fill={activeStroke}
                  />
                </g>
              )}
              {tool === 'line' && (
                <line
                  x1={interaction.startCanvas.x}
                  y1={interaction.startCanvas.y}
                  x2={interaction.currentCanvas.x}
                  y2={interaction.currentCanvas.y}
                  stroke={activeStroke}
                  strokeWidth={activeStrokeWidth}
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
              )}
              {tool === 'ellipse' && (
                <ellipse
                  cx={(interaction.startCanvas.x + interaction.currentCanvas.x) / 2}
                  cy={(interaction.startCanvas.y + interaction.currentCanvas.y) / 2}
                  rx={Math.max(Math.abs(interaction.currentCanvas.x - interaction.startCanvas.x) / 2, 2)}
                  ry={Math.max(Math.abs(interaction.currentCanvas.y - interaction.startCanvas.y) / 2, 2)}
                  fill="rgba(139, 92, 246, 0.15)"
                  stroke={activeStroke}
                  strokeWidth={activeStrokeWidth}
                  strokeDasharray="4 4"
                />
              )}
              {tool === 'rectangle' && (
                <rect
                  x={Math.min(interaction.startCanvas.x, interaction.currentCanvas.x)}
                  y={Math.min(interaction.startCanvas.y, interaction.currentCanvas.y)}
                  width={Math.abs(interaction.currentCanvas.x - interaction.startCanvas.x)}
                  height={Math.abs(interaction.currentCanvas.y - interaction.startCanvas.y)}
                  rx={8}
                  fill="rgba(139, 92, 246, 0.15)"
                  stroke={activeStroke}
                  strokeWidth={activeStrokeWidth}
                  strokeDasharray="4 4"
                />
              )}
            </>
          )}

          {interaction.mode === 'frame' && (
            <rect
              x={Math.min(interaction.startCanvas.x, interaction.currentCanvas.x)}
              y={Math.min(interaction.startCanvas.y, interaction.currentCanvas.y)}
              width={Math.abs(interaction.currentCanvas.x - interaction.startCanvas.x)}
              height={Math.abs(interaction.currentCanvas.y - interaction.startCanvas.y)}
              rx={12}
              fill="rgba(139, 92, 246, 0.08)"
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="6 6"
            />
          )}

          {interaction.mode === 'connector' && (
            <path
              d={generateConnectorPath(interaction.startCanvas, interaction.currentCanvas, activeConnectorStyle)}
              fill="none"
              stroke={activeStroke || '#64748b'}
              strokeWidth={activeStrokeWidth || 2}
              strokeDasharray="4 4"
            />
          )}

          {/* Marquee Multi-selection Box */}
          {interaction.mode === 'marquee' && interaction.selectionMarquee && (
            <rect
              x={interaction.selectionMarquee.x}
              y={interaction.selectionMarquee.y}
              width={interaction.selectionMarquee.width}
              height={interaction.selectionMarquee.height}
              fill="rgba(139, 92, 246, 0.1)"
              stroke="#8b5cf6"
              strokeWidth={1}
              strokeDasharray="3 3"
              className="pointer-events-none"
            />
          )}

          {/* Alignment Snapping Guides */}
          {interaction.guides &&
            interaction.guides.map((guide, idx) =>
              guide.type === 'vertical' ? (
                <line
                  key={`guide-v-${idx}`}
                  x1={guide.position}
                  y1={guide.start}
                  x2={guide.position}
                  y2={guide.end}
                  stroke="#ec4899"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  className="pointer-events-none"
                />
              ) : (
                <line
                  key={`guide-h-${idx}`}
                  x1={guide.start}
                  y1={guide.position}
                  x2={guide.end}
                  y2={guide.position}
                  stroke="#ec4899"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  className="pointer-events-none"
                />
              )
            )}

          {/* Active Selection Box & Contextual Toolbar (hidden while editing) */}
          {selectionBounds && selectedIds.length > 0 && tool === 'select' && !editingId && (
            <>
              <SelectionBox
                bounds={selectionBounds}
                isLocked={selectedElements.some((el) => el.isLocked)}
                isMultiSelect={selectedIds.length > 1}
                selectedElements={selectedElements}
                onResizeStart={handleResizeStart}
              />
              <ContextualToolbar
                bounds={selectionBounds}
                elements={selectedElements}
              />
            </>
          )}

          {/* Target object anchor points highlight when drawing connectors */}
          {tool === 'connector' &&
            elements.map((el) => {
              if (el.type === 'pen' || el.type === 'connector') return null;
              const anchors = getObjectAnchors(el);
              return (
                <g key={`anchors-${el.id}`} className="pointer-events-none">
                  {(Object.keys(anchors) as AnchorPosition[]).map((anchorKey) => {
                    const pt = anchors[anchorKey];
                    return (
                      <circle
                        key={anchorKey}
                        cx={pt.x}
                        cy={pt.y}
                        r={4}
                        fill="#ffffff"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        className="animate-pulse"
                      />
                    );
                  })}
                </g>
              );
            })}
        </g>
      </svg>

      {/* Real-time HTML text & sticky note editor overlay */}
      {editingId && elements.some((el) => el.id === editingId) && (
        <CanvasTextEditor
          element={elements.find((el) => el.id === editingId)!}
          viewport={viewport}
        />
      )}
    </div>
  );
};
