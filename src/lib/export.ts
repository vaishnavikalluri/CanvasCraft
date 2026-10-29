import { BoardData, Viewport } from '../types/board';
import { CanvasElement, TextElement, StickyNoteElement, StickyColor } from '../types/canvasObjects';
import { getCombinedBounds } from './geometry';

export interface ExportPngOptions {
  mode: 'all' | 'visible';
  background: 'white' | 'dark' | 'transparent';
  scale: 1 | 2 | 3;
}

const STICKY_TEXT_COLORS: Record<StickyColor, string> = {
  yellow: '#713f12',
  blue: '#0c4a6e',
  green: '#14532d',
  pink: '#831843',
  purple: '#581c87',
  orange: '#7c2d12',
  white: '#1e293b',
};

export function exportBoardAsJson(board: BoardData): void {
  const data = JSON.stringify(board, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeTitle = board.title.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
  link.download = `${safeTitle || 'canvascraft'}.canvas.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportCanvasAsPng(
  svgElement: SVGSVGElement,
  elements: CanvasElement[],
  viewport: Viewport,
  options: ExportPngOptions,
  boardTitle: string
): Promise<void> {
  const { mode, background, scale } = options;

  let exportW = 1200;
  let exportH = 800;

  // Clone SVG element to manipulate without affecting live canvas DOM
  const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
  clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

  // Locate the world layer that contains all drawing elements
  const worldLayer = (clonedSvg.querySelector('#canvas-world-layer') ||
    clonedSvg.querySelector('g[transform*="matrix"]') ||
    clonedSvg.querySelector('g[transform*="translate"]')) as SVGGElement | null;

  if (mode === 'all') {
    // Mode A: Entire Canvas Content (fit all objects with comfortable 60px padding)
    const combined = getCombinedBounds(elements);
    if (combined && combined.width > 0 && combined.height > 0) {
      const padding = 60;
      const minX = combined.x - padding;
      const minY = combined.y - padding;
      exportW = Math.max(Math.round(combined.width + padding * 2), 240);
      exportH = Math.max(Math.round(combined.height + padding * 2), 160);

      if (worldLayer) {
        // Shift world layer so all elements start at (padding, padding) with 1x scale
        worldLayer.setAttribute('transform', `translate(${-minX}, ${-minY})`);
      }
    } else {
      exportW = 1200;
      exportH = 800;
      if (worldLayer) {
        worldLayer.setAttribute('transform', 'none');
      }
    }
  } else {
    // Mode B: Current Viewport Only (Full Screen as visible right now)
    const svgRect = svgElement.getBoundingClientRect();
    exportW = Math.max(Math.round(svgRect.width), 320);
    exportH = Math.max(Math.round(svgRect.height), 240);

    if (worldLayer) {
      // Keep exact screen transformation matrix as seen by the user
      worldLayer.setAttribute(
        'transform',
        `matrix(${viewport.zoom} 0 0 ${viewport.zoom} ${viewport.x} ${viewport.y})`
      );
    }
  }

  clonedSvg.setAttribute('viewBox', `0 0 ${exportW} ${exportH}`);
  clonedSvg.setAttribute('width', `${exportW}`);
  clonedSvg.setAttribute('height', `${exportH}`);

  // 1. Remove non-exportable UI overlays, handles, toolbars, and guide lines
  const uiSelectors = [
    '.contextual-toolbar',
    '[data-canvas-ui]',
    '.selection-overlay',
    'g.selection-overlay',
    'g[id^="selection-"]',
    'circle.animate-pulse',
    'rect[fill="url(#canvas-grid-pattern)"]',
    'pattern#canvas-grid-pattern',
    'line[stroke="#ec4899"]',
    '[id^="anchors-"]',
  ];
  uiSelectors.forEach((selector) => {
    clonedSvg.querySelectorAll(selector).forEach((el) => el.remove());
  });

  // 2. Convert <foreignObject> elements (text & sticky notes) to pure vector SVG <text>
  // This guarantees 100% reliable rendering across all browsers without XML/XHTML security errors
  elements.forEach((el) => {
    const objGroup = clonedSvg.querySelector(`#object-${el.id}`) as SVGGElement | null;
    if (!objGroup) return;

    if (el.type === 'text') {
      const textEl = el as TextElement;
      const fo = objGroup.querySelector('foreignObject');
      if (fo) fo.remove();

      const lines = (textEl.text || 'Heading or text').split('\n');
      const fontSize = textEl.fontSize || 16;
      const lineHeight = fontSize * 1.35;
      const textColor =
        textEl.color && textEl.color !== 'currentColor'
          ? textEl.color
          : background === 'dark'
          ? '#f8fafc'
          : '#0f172a';

      const boxW = Math.max(textEl.width, 140);
      let anchorX = (textEl.x ?? 0) + 8;
      let textAnchor: 'start' | 'middle' | 'end' = 'start';

      if (textEl.textAlign === 'center') {
        anchorX = (textEl.x ?? 0) + boxW / 2;
        textAnchor = 'middle';
      } else if (textEl.textAlign === 'right') {
        anchorX = (textEl.x ?? 0) + boxW - 8;
        textAnchor = 'end';
      }

      const svgText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      svgText.setAttribute('x', `${anchorX}`);
      svgText.setAttribute('y', `${(textEl.y ?? 0) + fontSize + 6}`);
      svgText.setAttribute('fill', textColor);
      svgText.setAttribute('font-size', `${fontSize}px`);
      svgText.setAttribute('font-family', 'Inter, -apple-system, BlinkMacSystemFont, sans-serif');
      svgText.setAttribute('font-weight', textEl.fontWeight || 'normal');
      svgText.setAttribute('text-anchor', textAnchor);

      lines.forEach((line, idx) => {
        const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan.textContent = line || ' ';
        if (idx > 0) {
          tspan.setAttribute('x', `${anchorX}`);
          tspan.setAttribute('dy', `${lineHeight}px`);
        }
        svgText.appendChild(tspan);
      });

      objGroup.appendChild(svgText);
    } else if (el.type === 'sticky') {
      const stickyEl = el as StickyNoteElement;
      const fo = objGroup.querySelector('foreignObject');
      if (fo) fo.remove();

      const lines = (stickyEl.text || 'Note...').split('\n');
      const fontSize = stickyEl.fontSize || 16;
      const lineHeight = fontSize * 1.35;
      const textColor = STICKY_TEXT_COLORS[stickyEl.color] || '#713f12';

      const anchorX = (stickyEl.x ?? 0) + 16;
      const svgText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      svgText.setAttribute('x', `${anchorX}`);
      svgText.setAttribute('y', `${(stickyEl.y ?? 0) + fontSize + 20}`);
      svgText.setAttribute('fill', textColor);
      svgText.setAttribute('font-size', `${fontSize}px`);
      svgText.setAttribute('font-family', 'Inter, -apple-system, BlinkMacSystemFont, sans-serif');

      lines.forEach((line, idx) => {
        const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan.textContent = line || ' ';
        if (idx > 0) {
          tspan.setAttribute('x', `${anchorX}`);
          tspan.setAttribute('dy', `${lineHeight}px`);
        }
        svgText.appendChild(tspan);
      });

      objGroup.appendChild(svgText);
    }
  });

  // 3. Embed font-family and basic CSS styles for SVG
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    text, tspan {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
  `;
  clonedSvg.prepend(styleEl);

  // 4. Serialize to SVG Blob
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clonedSvg);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = (e) => {
      console.error('Failed to load SVG into Image element:', e);
      reject(new Error('Failed to render SVG image'));
    };
    img.src = url;
  });

  // 5. Draw onto High-Res HTML5 Canvas
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(exportW * scale);
  canvas.height = Math.round(exportH * scale);
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    URL.revokeObjectURL(url);
    throw new Error('Failed to create canvas 2D rendering context');
  }

  // Draw background
  if (background === 'white') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (background === 'dark') {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Draw scaled image
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  URL.revokeObjectURL(url);

  // 6. Download PNG image
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const safeTitle = boardTitle.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
        link.download = `${safeTitle || 'canvascraft'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      }
      resolve();
    }, 'image/png');
  });
}
