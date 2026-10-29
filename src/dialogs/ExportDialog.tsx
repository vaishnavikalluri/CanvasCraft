import React, { useState } from 'react';
import { useBoardStore } from '../store/boardStore';
import { exportCanvasAsPng, exportBoardAsJson, ExportPngOptions } from '../lib/export';
import { validateAndSanitizeBoard } from '../lib/validation';
import { 
  X, 
  Image, 
  FileJson, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';

export const ExportDialog: React.FC = () => {
  const {
    id,
    title,
    elements,
    viewport,
    createdAt,
    updatedAt,
    isExportOpen,
    setExportOpen,
    loadBoard,
  } = useBoardStore();

  const [activeTab, setActiveTab] = useState<'png' | 'json'>('png');
  const [pngOptions, setPngOptions] = useState<ExportPngOptions>({
    mode: 'all',
    background: 'white',
    scale: 2,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  if (!isExportOpen) return null;

  const handleExportPng = async () => {
    const svgEl = document.getElementById('whiteboard-svg-canvas') as SVGSVGElement | null;
    if (!svgEl) return;

    setIsExporting(true);
    try {
      await exportCanvasAsPng(svgEl, elements, viewport, pngOptions, title);
      setExportOpen(false);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJson = () => {
    exportBoardAsJson({
      id,
      title,
      createdAt,
      updatedAt,
      elements,
      viewport,
    });
  };

  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const result = validateAndSanitizeBoard(parsed);
        if (!result.valid || !result.board) {
          setImportError(result.error || 'Invalid board JSON structure.');
          return;
        }

        loadBoard(result.board);
        setImportSuccess(`Successfully imported "${result.board.title}" with ${result.board.elements.length} elements!`);
        setTimeout(() => {
          setExportOpen(false);
        }, 1200);
      } catch (err) {
        setImportError('Failed to parse file: Invalid JSON syntax.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-brand-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Export & Backup</h2>
          </div>
          <button
            onClick={() => setExportOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('png')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'png'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Image className="w-4 h-4" />
            PNG Image
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'json'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileJson className="w-4 h-4" />
            JSON Backup / Import
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'png' ? (
            <div className="space-y-4">
              {/* Scope */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Export Area
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setPngOptions({ ...pngOptions, mode: 'all' })}
                    className={`py-2 px-3 rounded-lg border text-left flex flex-col transition-colors ${
                      pngOptions.mode === 'all'
                        ? 'border-brand-500 bg-brand-50/70 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-medium'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-semibold text-xs">All Canvas Content</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Fits all drawings & notes with padding
                    </span>
                  </button>
                  <button
                    onClick={() => setPngOptions({ ...pngOptions, mode: 'visible' })}
                    className={`py-2 px-3 rounded-lg border text-left flex flex-col transition-colors ${
                      pngOptions.mode === 'visible'
                        ? 'border-brand-500 bg-brand-50/70 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-medium'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-semibold text-xs">Current Full Screen</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Captures entire visible screen viewport
                    </span>
                  </button>
                </div>
              </div>

              {/* Background Color */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Background
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {(['white', 'dark', 'transparent'] as const).map((bg) => (
                    <button
                      key={bg}
                      onClick={() => setPngOptions({ ...pngOptions, background: bg })}
                      className={`py-2 px-3 rounded-lg border text-center capitalize transition-colors ${
                        pngOptions.background === bg
                          ? 'border-brand-500 bg-brand-50/70 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-medium'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution Scale */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Quality & Scale
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {([1, 2, 3] as const).map((scale) => (
                    <button
                      key={scale}
                      onClick={() => setPngOptions({ ...pngOptions, scale })}
                      className={`py-2 px-3 rounded-lg border text-center transition-colors ${
                        pngOptions.scale === scale
                          ? 'border-brand-500 bg-brand-50/70 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-medium'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {scale}x {scale === 2 ? '(High-DPI)' : scale === 3 ? '(Ultra HD)' : '(Standard)'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleExportPng}
                disabled={isExporting}
                className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-md transition-all disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Rendering High-Res PNG...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download PNG Image
                  </>
                )}
              </button>
            </div>
          ) : (
            /* JSON Import / Export Tab */
            <div className="space-y-5">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">Export Board File</h3>
                    <p className="text-[11px] text-slate-500">Save complete editable board structure as a .canvas.json file</p>
                  </div>
                  <button
                    onClick={handleExportJson}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-600 bg-brand-50 dark:bg-brand-950/60 dark:text-brand-300 hover:bg-brand-100 rounded-lg transition-colors border border-brand-200 dark:border-brand-800"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export JSON
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Import Board File (.json)
                </label>
                <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-brand-500 dark:hover:border-brand-500 transition-colors cursor-pointer bg-slate-50/50 dark:bg-slate-800/20">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleJsonFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Click or drag & drop a .json board file here
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Validates objects and protects against ID collisions
                  </p>
                </div>
              </div>

              {/* Feedback messages */}
              {importError && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {importSuccess && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{importSuccess}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
