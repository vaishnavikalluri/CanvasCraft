# 🎨 CanvasCraft — Interactive Vector Whiteboard

A modern, high-performance, frontend-only interactive vector whiteboard built with **React 19**, **TypeScript**, **Tailwind CSS**, and an **SVG-based canvas engine**. 

Designed for brainstorming ideas, sketching diagrams, creating mind maps, organizing sticky notes, and planning projects on an infinite interactive workspace.

---

## 🚀 Live Demo & Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd whiteboard

# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build
```

The application will be running at `http://localhost:5173/`.

---

## 🛠️ Technology Stack & Architecture

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | React 19 + Vite | High-speed HMR, modern component model |
| **Language** | TypeScript | Strong typing for canvas elements, geometry, and store state |
| **Styling** | Tailwind CSS | Sleek glassmorphism, responsive design, dark/light themes |
| **State Management** | Zustand | Global editor state, active tool, selection, and undo/redo stacks |
| **Icons** | Lucide React | Modern, accessible iconography |
| **Persistence** | IndexedDB (`idb`) | Zero-latency local storage with debounced autosaving |
| **Canvas Engine** | Pure SVG Vector Layer | Crisp resolution-independent rendering, interactive DOM events |
| **Export Engine** | HTML5 Canvas + Blob API | Retina-ready 2x/3x supersampled PNG and structured JSON backup |

---

## ✨ Core Features

### 1. Interactive Drawing & Diagramming Tools
- **Freehand Pen**: Silky smooth Bézier curve interpolation for natural drawing and sketching.
- **Eraser**: Click or drag across elements to erase them instantly.
- **Geometric Shapes**: Rectangles (with rounded corners), ellipses/circles, straight lines, and arrows.
- **Rich Sticky Notes**: Multiline in-place text editing, drop shadows, and 7 curated color palettes (*Yellow, Sky Blue, Mint Green, Pink, Lavender Purple, Warm Orange, Clean White*).
- **Text Boxes**: Click anywhere to type headers or notes with customizable font size, weight, and alignment.
- **Smart Connectors**: Dynamic lines and curves that link to anchor points (*top, right, bottom, left, center*) on shapes and sticky notes, staying connected as you move or resize them.
- **Frames & Sections**: Named grouping areas (*e.g., Ideas, High Priority, Action Items*) with a one-click "Focus / Zoom to Section" feature.

### 2. Infinite Canvas Navigation
- **Smooth Panning**: Hold <kbd>Space</kbd> + drag, middle-mouse drag, or use the dedicated Hand tool (<kbd>H</kbd>).
- **Cursor-Centered Zoom**: Smooth mouse wheel zoom (<kbd>Ctrl</kbd> + wheel) centered right under the cursor.
- **Interactive Minimap**: Live bottom-right overview displaying all canvas objects with a viewport bounding rectangle; click or drag on the minimap to jump anywhere.
- **Configurable Grid**: Switch between **Dotted Grid**, **Grid Lines**, or **Clean Canvas**.
- **Smart Snapping**: Real-time alignment guide lines snap elements to nearby object edges and centers. Optional 20px grid snapping.

### 3. Selection & Manipulation
- **Single & Multi-Select**: Click individual items, hold <kbd>Shift</kbd> for multi-selection, or drag a marquee selection box.
- **8-Handle Resizing**: Resize any element from corners or edges; hold <kbd>Shift</kbd> to preserve aspect ratio.
- **Contextual Floating Toolbar**: Instant quick-actions hovering directly above selected elements (*color swatches, layer order, duplicate, delete, lock*).
- **Right Properties Panel**: Granular control over fill, stroke, thickness, stroke style (*solid, dashed, dotted*), opacity, font sizes, alignment, and geometry.
- **Layer Ordering**: Bring to Front, Bring Forward, Send Backward, Send to Back.
- **Grouping & Locking**: Group multi-selected items into logical clusters; lock elements to prevent accidental edits.

### 4. Robust Undo / Redo & Autosave
- **Batch-Committed History**: Granular undo/redo stack (<kbd>Ctrl+Z</kbd> / <kbd>Ctrl+Shift+Z</kbd>) that commits once per user action rather than on every mouse movement.
- **Offline-First Persistence**: Autosaves changes to browser IndexedDB (with graceful `localStorage` fallback) with a visible status indicator (*Saved, Saving...*).
- **Safe State**: Refreshing or closing the browser preserves the exact canvas objects, viewport, and board title.

### 5. Multi-Board Management & Starter Templates
Choose from 5 pre-built templates or start fresh:
1. **Blank Whiteboard** — Clean slate for freeform ideation.
2. **Brainstorming Board** — 3 organized frames with categorized sticky notes.
3. **Mind Map** — Central concept radiating out into subtopics with curved connectors.
4. **Flowchart** — Decision diamonds, process rectangles, start/end terminals, and directional arrows.
5. **Study Planner** — Kanban-style workflow frames for tracking learning goals and milestones.

### 6. Export & Import
- **High-Res PNG Export**: Export either the entire canvas content or the visible viewport at 1x, 2x (Retina), or 3x (Ultra HD) with choice of white, dark, or transparent background.
- **JSON Backup & Restore**: Export complete board data as `.canvas.json` and import previously saved files with schema validation and automatic ID collision prevention.

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Action |
| :--- | :--- |
| <kbd>V</kbd> | Select Tool |
| <kbd>H</kbd> | Hand / Pan Tool |
| <kbd>P</kbd> | Freehand Pen Tool |
| <kbd>E</kbd> | Eraser Tool |
| <kbd>R</kbd> | Rectangle Tool |
| <kbd>O</kbd> | Circle / Ellipse Tool |
| <kbd>L</kbd> | Straight Line Tool |
| <kbd>A</kbd> | Arrow Tool |
| <kbd>T</kbd> | Text Tool |
| <kbd>S</kbd> | Sticky Note Tool |
| <kbd>C</kbd> | Smart Connector Tool |
| <kbd>F</kbd> | Frame / Section Tool |
| <kbd>Ctrl</kbd> + <kbd>Z</kbd> | Undo |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> | Redo |
| <kbd>Ctrl</kbd> + <kbd>C</kbd> | Copy selected elements |
| <kbd>Ctrl</kbd> + <kbd>V</kbd> | Paste clipboard |
| <kbd>Ctrl</kbd> + <kbd>D</kbd> | Duplicate selected elements |
| <kbd>Del</kbd> / <kbd>Backspace</kbd> | Delete selected elements |
| <kbd>Ctrl</kbd> + <kbd>A</kbd> | Select All elements |
| <kbd>Esc</kbd> | Clear selection / close modals |
| <kbd>Ctrl</kbd> + <kbd>0</kbd> | Reset zoom to 100% |
| <kbd>Ctrl</kbd> + <kbd>1</kbd> | Fit all content on screen |
| <kbd>Space</kbd> + Drag | Pan canvas |
| <kbd>?</kbd> | Open Keyboard Shortcuts cheatsheet |

---

## 📂 Project Structure

```
src/
├── components/
│   ├── canvas/
│   │   ├── CanvasGrid.tsx           # Dotted / lined SVG background patterns
│   │   ├── CanvasObject.tsx         # Render dispatcher for canvas elements
│   │   ├── ContextualToolbar.tsx    # Micro-toolbar hovering above selected objects
│   │   ├── MiniMap.tsx              # Live interactive bottom-right minimap
│   │   ├── SelectionBox.tsx         # Selection bounding box with 8 resize handles
│   │   └── WhiteboardCanvas.tsx     # Core SVG canvas with event handling & snapping
│   ├── layout/
│   │   ├── BottomBar.tsx            # Zoom slider, fit-to-screen, minimap host
│   │   ├── PropertiesPanel.tsx      # Contextual right inspector panel
│   │   ├── Toolbar.tsx              # 12-tool floating left toolbar with hotkeys
│   │   └── TopBar.tsx               # Board title, manager, undo/redo, theme, export
│   └── objects/
│       ├── ConnectorObject.tsx      # Smart anchor connectors with straight/curved routing
│       ├── FrameObject.tsx          # Section containers with zoom focus
│       ├── FreehandObject.tsx       # Smooth Catmull-Rom Bézier pen strokes
│       ├── ShapeObject.tsx          # Rectangles, ellipses, diamonds, lines, arrows
│       ├── StickyNoteObject.tsx     # Color-themed notes with in-place text editing
│       └── TextObject.tsx           # Freeform text objects with multiline support
├── dialogs/
│   ├── BoardManager.tsx             # Board CRUD, duplicates, and template picker
│   ├── ExportDialog.tsx             # PNG (1x/2x/3x) and JSON export & import
│   └── ShortcutsDialog.tsx          # Keyboard shortcuts cheat sheet
├── hooks/
│   ├── useAutosave.ts               # Debounced persistence to IndexedDB
│   └── useKeyboardShortcuts.ts      # Global keybindings with input safety
├── lib/
│   ├── export.ts                    # Canvas-to-PNG rasterization & JSON export
│   ├── geometry.ts                  # Screen transforms, bounds, Bézier curves, snapping
│   ├── storage.ts                   # IndexedDB wrapper with localStorage fallback
│   └── validation.ts                # JSON schema validation & collision remapping
├── store/
│   └── boardStore.ts                # Zustand global state, selection, and history
├── templates/
│   └── boardTemplates.ts            # 5 starter boards: Blank, Brainstorm, Mind Map, etc.
├── types/
│   ├── board.ts                     # Board, Viewport, History, and UI types
│   └── canvasObjects.ts             # Element discriminated union & geometry interfaces
├── App.tsx                          # App root wiring layout, canvas, and modals
├── index.css                        # Tailwind directives and custom canvas utility styles
└── main.tsx                         # Entry point
```

---

## 🛡️ License

MIT License — Created for portfolio and open-source demonstration.
