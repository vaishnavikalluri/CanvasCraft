import React, { useRef, useEffect, useState } from 'react';
import { CanvasElement, TextElement, StickyNoteElement, StickyColor } from '../../types/canvasObjects';
import { Viewport } from '../../types/board';
import { useBoardStore } from '../../store/boardStore';
import { Check } from 'lucide-react';

interface CanvasTextEditorProps {
  element: CanvasElement;
  viewport: Viewport;
}

const STICKY_THEMES: Record<
  StickyColor,
  { bg: string; border: string; text: string }
> = {
  yellow: { bg: '#fef08a', border: '#fde047', text: '#713f12' },
  blue: { bg: '#bae6fd', border: '#7dd3fc', text: '#0c4a6e' },
  green: { bg: '#bbf7d0', border: '#86efac', text: '#14532d' },
  pink: { bg: '#fbcfe8', border: '#f472b6', text: '#831843' },
  purple: { bg: '#e9d5ff', border: '#c084fc', text: '#581c87' },
  orange: { bg: '#fed7aa', border: '#fdba74', text: '#7c2d12' },
  white: { bg: '#ffffff', border: '#cbd5e1', text: '#1e293b' },
};

export const CanvasTextEditor: React.FC<CanvasTextEditorProps> = ({ element, viewport }) => {
  const { updateElement, setEditingId, commitHistory, theme } = useBoardStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const initialText =
    element.type === 'text'
      ? (element as TextElement).text
      : element.type === 'sticky'
      ? (element as StickyNoteElement).text
      : '';

  const [val, setVal] = useState(initialText);

  const elX = element.x ?? 0;
  const elY = element.y ?? 0;
  const elW = element.width ?? 180;
  const elH = element.height ?? 60;

  // Compute screen coordinates relative to canvas wrapper
  const screenX = elX * viewport.zoom + viewport.x;
  const screenY = elY * viewport.zoom + viewport.y;
  const screenWidth = Math.max(elW * viewport.zoom, 160);
  const screenHeight = Math.max(elH * viewport.zoom, 80);

  const fontSize =
    element.type === 'text' || element.type === 'sticky'
      ? Math.max(Math.round((element.fontSize || 16) * viewport.zoom), 13)
      : 16;

  const mountTimeRef = useRef(Date.now());

  // Multi-step focus guarantee to prevent browser mouseup/pointerup from stealing focus
  useEffect(() => {
    const focusEditor = () => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        // If it's a default placeholder, select it so typing replaces it seamlessly
        if (val === 'Heading or note' || val === 'Heading or text' || val === 'Note...') {
          textareaRef.current.select();
        }
      }
    };
    focusEditor();
    const t1 = setTimeout(focusEditor, 40);
    const t2 = setTimeout(focusEditor, 120);
    const t3 = setTimeout(focusEditor, 250);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const handleSaveAndClose = () => {
    commitHistory();
    const clean = val.trim();
    if (element.type === 'text') {
      updateElement(element.id, { text: clean || 'Heading or note' });
    } else if (element.type === 'sticky') {
      updateElement(element.id, { text: clean || 'Note...' });
    }
    setEditingId(null);
  };

  const handleBackdropClick = (e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
    // Guard against double-click release accidentally triggering backdrop dismiss within 250ms of mount
    if (Date.now() - mountTimeRef.current < 250) return;
    handleSaveAndClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    if (e.key === 'Escape') {
      handleSaveAndClose();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSaveAndClose();
    }
  };

  return (
    <>
      {/* Outside click detector backdrop */}
      <div
        className="fixed inset-0 z-40 bg-transparent cursor-default"
        onPointerDown={handleBackdropClick}
        onClick={handleBackdropClick}
      />

      {/* Sticky Note Editor */}
      {element.type === 'sticky' && (() => {
        const stickyEl = element as StickyNoteElement;
        const stickyTheme = STICKY_THEMES[stickyEl.color] || STICKY_THEMES.yellow;

        return (
          <div
            className="absolute z-50 rounded-xl shadow-lg flex flex-col p-3 transition-none select-text"
            style={{
              left: `${screenX}px`,
              top: `${screenY}px`,
              width: `${screenWidth}px`,
              height: `${screenHeight}px`,
              backgroundColor: stickyTheme.bg,
              border: `2px solid ${stickyTheme.border}`,
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Subtle floating Done badge above the top-right corner */}
            <div className="absolute -top-7 right-0 flex items-center gap-1 select-none pointer-events-auto">
              <button
                type="button"
                onClick={handleSaveAndClose}
                className="flex items-center gap-1 px-2.5 py-0.5 bg-slate-800/80 hover:bg-slate-900 text-white font-medium text-[11px] rounded-full shadow-sm transition-colors cursor-pointer"
                title="Finish editing (or click outside)"
              >
                <Check className="w-3 h-3" />
                <span>Done</span>
              </button>
            </div>

            <textarea
              ref={textareaRef}
              value={val}
              onChange={(e) => {
                setVal(e.target.value);
                updateElement(element.id, { text: e.target.value });
              }}
              onKeyDown={handleKeyDown}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder="Write your note here..."
              className="w-full flex-1 bg-transparent border-none outline-none resize-none p-0 font-sans leading-snug overflow-y-auto select-text text-left"
              style={{
                fontSize: `${fontSize}px`,
                color: stickyTheme.text,
                textAlign: stickyEl.textAlign || 'left',
              }}
            />
          </div>
        );
      })()}

      {/* Text Box Editor: Clean normal box */}
      {element.type === 'text' && (() => {
        const textEl = element as TextElement;
        const textColor =
          textEl.color && textEl.color !== 'currentColor'
            ? textEl.color
            : theme === 'dark'
            ? '#f8fafc'
            : '#0f172a';

        return (
          <div
            className="absolute z-50 rounded-lg border-2 border-brand-500 bg-white/95 dark:bg-slate-900/95 shadow-md flex flex-col transition-none select-text"
            style={{
              left: `${screenX}px`,
              top: `${screenY}px`,
              width: `${screenWidth}px`,
              height: `${screenHeight}px`,
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Subtle floating Done badge above the top-right corner */}
            <div className="absolute -top-7 right-0 flex items-center gap-1 select-none pointer-events-auto">
              <button
                type="button"
                onClick={handleSaveAndClose}
                className="flex items-center gap-1 px-2.5 py-0.5 bg-brand-500 hover:bg-brand-600 text-white font-medium text-[11px] rounded-full shadow-sm transition-colors cursor-pointer"
                title="Finish editing (or click outside)"
              >
                <Check className="w-3 h-3" />
                <span>Done</span>
              </button>
            </div>

            <textarea
              ref={textareaRef}
              value={val}
              onChange={(e) => {
                setVal(e.target.value);
                updateElement(element.id, { text: e.target.value });
              }}
              onKeyDown={handleKeyDown}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder="Type text here..."
              className="w-full h-full bg-transparent border-none outline-none resize-none p-2 font-sans overflow-auto select-text leading-snug"
              style={{
                fontSize: `${fontSize}px`,
                color: textColor,
                textAlign: textEl.textAlign || 'left',
                fontWeight: textEl.fontWeight || 'normal',
                lineHeight: 1.35,
              }}
            />
          </div>
        );
      })()}
    </>
  );
};
