# 🎨 CanvasCraft — Interactive Whiteboard

CanvasCraft is a browser-based interactive whiteboard built with React and TypeScript. It provides a flexible workspace for drawing, brainstorming, organizing ideas, creating diagrams, and planning visually.

Designed with a focus on usability and frontend engineering, CanvasCraft combines an interactive canvas, intuitive editing tools, smart object manipulation, and flexible import/export options.

## ✨ Features

### 🎨 Drawing & Creation
- **Freehand Drawing** — Draw naturally using smooth Bézier curve interpolation.
- **Shape Tools** — Create rectangles, ellipses, lines, and arrows.
- **Text Boxes** — Add and edit text directly on the canvas.
- **Sticky Notes** — Organize ideas using sticky notes in seven colors.
- **Smart Connectors** — Connect objects using anchor points on the top, right, bottom, left, or center.
- **Frames & Sections** — Group related content into organized sections with focus and zoom support.

### 🖱️ Canvas Interaction
- **Infinite Canvas** — Navigate a flexible workspace with panning and zooming.
- **Cursor-Centered Zoom** — Zoom toward the pointer position for precise navigation.
- **Selection & Editing** — Select individual or multiple objects, resize, duplicate, group, and lock them.
- **Smart Snapping** — Align objects to edges, centers, and an optional grid.
- **Customizable Grid** — Switch between dotted, lined, and clean canvas views.
- **MiniMap** — Navigate large boards using a compact overview.
- **Contextual Toolbar** — Access relevant editing actions based on the current selection.
- **Layer Management** — Reorder objects to control their visual stacking.

### ⚡ Productivity
- **Undo & Redo** — Reverse or restore editing actions.
- **Keyboard Shortcuts** — Speed up drawing, selection, navigation, and editing.
- **Multiple Boards** — Create and manage separate whiteboards.
- **Ready-to-Use Templates** — Start with Blank, Brainstorming, Mind Map, Flowchart, or Study Planner layouts.
- **Automatic Saving** — Save changes locally with debounced autosaving.

### 📤 Import & Export
- **PNG Export** — Export the entire board or current viewport.
- **Flexible Export Settings** — Choose 1×, 2×, or 3× scale and white, dark, or transparent backgrounds.
- **JSON Backup & Import** — Export boards as `.canvas.json` files and import them with schema validation and ID collision prevention.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | Component-based user interface |
| TypeScript | Type-safe development |
| Vite | Development server and build tooling |
| Tailwind CSS | Styling and responsive layouts |
| SVG | Interactive vector-based canvas rendering |
| Zustand | Application and canvas state management |
| Lucide React | Icons |
| IndexedDB (`idb`) | Persistent local board storage |
| `localStorage` | Fallback storage |
| HTML5 Canvas & Blob API | PNG and JSON export functionality |

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or later
- npm

### Installation

1. Clone the repository:

   ```bash
   git clone <YOUR_GITHUB_REPOSITORY_URL>
   ```

2. Navigate to the project directory:

   ```bash
   cd CanvasCraft
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL shown in your terminal. Vite typically uses:

   ```text
   http://localhost:5173/
   ```

### Production Build

To create an optimized production build:

```bash
npm run build
```

## 📁 Project Structure

```text
src/
├── components/
│   ├── canvas/
│   │   ├── CanvasGrid.tsx
│   │   ├── CanvasObject.tsx
│   │   ├── ContextualToolbar.tsx
│   │   ├── MiniMap.tsx
│   │   ├── SelectionBox.tsx
│   │   └── WhiteboardCanvas.tsx
│   ├── layout/
│   │   ├── BottomBar.tsx
│   │   ├── PropertiesPanel.tsx
│   │   ├── Toolbar.tsx
│   │   └── TopBar.tsx
│   └── objects/
│       ├── ConnectorObject.tsx
│       ├── FrameObject.tsx
│       ├── FreehandObject.tsx
│       ├── ShapeObject.tsx
│       ├── StickyNoteObject.tsx
│       └── TextObject.tsx
├── dialogs/
│   ├── BoardManager.tsx
│   ├── ExportDialog.tsx
│   └── ShortcutsDialog.tsx
├── hooks/
│   ├── useAutosave.ts
│   └── useKeyboardShortcuts.ts
├── lib/
│   ├── export.ts
│   ├── geometry.ts
│   ├── storage.ts
│   └── validation.ts
├── store/
│   └── boardStore.ts
├── templates/
│   └── boardTemplates.ts
├── types/
│   ├── board.ts
│   └── canvasObjects.ts
├── App.tsx
├── index.css
└── main.tsx
```

## 🧠 Engineering Highlights

- **Vector-Based Rendering** — Use SVG elements to represent and manipulate interactive canvas objects.
- **State Management** — Centralize board state and editing operations with Zustand.
- **Efficient Autosaving** — Debounce save operations to reduce unnecessary storage writes.
- **Persistent Local Storage** — Use IndexedDB with a `localStorage` fallback.
- **Reusable Components** — Separate canvas rendering, object types, layout, dialogs, and utilities.
- **Data Validation** — Validate imported board data before adding it to the workspace.
- **Export Functionality** — Support image exports and portable JSON board files.
- **Keyboard-Driven Workflow** — Support faster interaction through dedicated shortcuts.

## 🔮 Future Enhancements

Potential improvements include:

- Collaborative real-time editing
- Cloud-based board synchronization
- Additional drawing and diagramming tools
- More customizable templates
- Enhanced accessibility
- Version history and board recovery

## 📄 License

This project is intended for portfolio and educational purposes. Add a `LICENSE` file if you choose to distribute it under an open-source license, such as MIT.

## Deployed link 

https://canvascraft-rust.vercel.app/
