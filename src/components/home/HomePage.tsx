import React from 'react';
import { useBoardStore } from '../../store/boardStore';
import { TEMPLATES } from '../../templates/boardTemplates';
import { 
  Sparkles, 
  ArrowRight, 
  Compass, 
  PenLine, 
  Spline, 
  StickyNote, 
  Download, 
  ShieldCheck, 
  Keyboard, 
  Layout, 
  Sun, 
  Moon, 
  CheckCircle2, 
  Layers,
  Lightbulb,
  GitBranch,
  CalendarCheck,
  Maximize2,
  ChevronDown
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { currentView, setCurrentView, loadBoard, theme, toggleTheme } = useBoardStore();

  const handleLaunchCanvas = () => {
    setCurrentView('canvas');
  };

  const handleSelectTemplate = (templateId: string) => {
    const template = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];
    loadBoard(template.createBoard());
    setCurrentView('canvas');
  };

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTemplates = () => {
    document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="h-screen w-full overflow-y-auto overflow-x-hidden scroll-smooth select-text touch-auto bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-brand-500 selection:text-white transition-colors">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-fuchsia-600 flex items-center justify-center text-white shadow-glow">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="3" />
              <path d="m9 15 3-3 3 3" />
              <path d="M9 9h.01" />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
            Canvas<span className="text-brand-500">Craft</span>
          </span>
        </div>

        {/* Action Buttons: Theme Toggle & Explore Canvas */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          <button
            onClick={handleLaunchCanvas}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-semibold text-xs rounded-xl shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Explore Canvas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-20 pb-16 px-6 overflow-hidden">
        {/* Background gradient decorative orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-500/20 via-indigo-500/20 to-fuchsia-500/20 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-800/80 text-brand-700 dark:text-brand-300 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Next-Gen Visual Whiteboard & Mind Mapping</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Think Visually. Sketch Freely.
            <br />
            <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-fuchsia-600 dark:from-brand-400 dark:via-indigo-300 dark:to-fuchsia-400 bg-clip-text text-transparent">
              Create Without Limits.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            CanvasCraft is a blazing-fast, vector-powered digital whiteboard for mind mapping, architecture diagrams, sticky notes, and visual brainstorming — 100% client-side and free.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleLaunchCanvas}
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-semibold text-sm rounded-xl shadow-floating hover:shadow-glow transition-all hover:scale-105 active:scale-95"
            >
              <span>Explore Canvas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={scrollToFeatures}
              className="flex items-center gap-1.5 px-5 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm rounded-xl border border-slate-200 dark:border-slate-800 transition-colors shadow-sm"
            >
              <span>See Features Below</span>
              <ChevronDown className="w-4 h-4 text-brand-500" />
            </button>
          </div>

          {/* Quick specs pill bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% Client-Side & Private</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Infinite Zoom & Pan</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> High-Res PNG & JSON Export</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Offline IndexedDB Autosave</span>
          </div>
        </div>

        {/* 3. Interactive Hero Visual Preview */}
        <div className="max-w-5xl mx-auto mt-12 relative z-10">
          <div 
            onClick={handleLaunchCanvas}
            className="group cursor-pointer relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-2xl overflow-hidden p-6 hover:border-brand-500/80 transition-all duration-300"
          >
            {/* Top preview simulated window header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs text-slate-400 font-medium ml-2">CanvasCraft Workspace — Interactive Demo</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-brand-600 dark:text-brand-400 font-medium group-hover:translate-x-1 transition-transform">
                <span>Click anywhere to explore canvas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Simulated Canvas Elements Representation */}
            <div className="relative h-80 sm:h-96 w-full bg-slate-50/60 dark:bg-slate-950/40 rounded-xl overflow-hidden p-6 mt-4 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800">
              {/* Dotted grid background simulation */}
              <div 
                className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none" 
                style={{ backgroundImage: 'radial-gradient(circle, #8b5cf6 1px, transparent 1px)', backgroundSize: '24px 24px' }}
              />

              {/* Sample Floating Card: Frame */}
              <div className="absolute left-6 top-8 w-64 p-4 rounded-xl border border-brand-400/60 bg-brand-50/40 dark:bg-brand-950/30 backdrop-blur-sm shadow-sm space-y-2">
                <span className="text-[11px] font-bold text-brand-600 dark:text-brand-300 uppercase tracking-wider">💡 Project Ideation</span>
                <p className="text-xs text-slate-600 dark:text-slate-300">Organize complex systems into focused, labeled frames with instant zoom focus.</p>
              </div>

              {/* Sample Sticky Note */}
              <div className="absolute right-12 top-10 w-48 p-4 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 shadow-md rotate-2 hover:rotate-0 transition-transform">
                <span className="text-[11px] font-bold">✨ Sticky Note</span>
                <p className="text-xs mt-1 leading-snug">Quick brainstorming ideas and task checklists with pastel themes.</p>
              </div>

              {/* Sample Center Connector Node */}
              <div className="relative z-10 px-6 py-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-brand-500 text-center shadow-floating space-y-1">
                <div className="inline-flex p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 mb-1">
                  <Spline className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Smart Vector Canvas</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Anchor connectors snap automatically to shapes</p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-500 text-white text-xs font-semibold rounded-lg shadow-sm">
                    Launch Interactive Canvas
                  </span>
                </div>
              </div>

              {/* Sample Floating Bottom Sticky */}
              <div className="absolute left-20 bottom-8 w-52 p-3 rounded-xl bg-sky-100 border border-sky-300 text-sky-900 shadow-md -rotate-1">
                <span className="text-[11px] font-bold">🎯 High-Res Export</span>
                <p className="text-xs mt-1">1x, 2x, and 3x Retina PNG export with transparent backgrounds.</p>
              </div>

              {/* Sample Floating Minimap simulation */}
              <div className="absolute right-6 bottom-6 w-32 h-20 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 shadow-sm p-1.5 flex flex-col justify-between hidden sm:flex">
                <span className="text-[9px] font-semibold text-slate-400">Minimap Radar</span>
                <div className="w-12 h-8 rounded border border-brand-500 bg-brand-500/20 self-center" />
              </div>
            </div>
          </div>

          {/* Scroll down indicator */}
          <div className="flex justify-center mt-8">
            <button 
              onClick={scrollToFeatures}
              className="group flex flex-col items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
              title="Scroll down to explore features & templates"
            >
              <span>Scroll down to explore features & templates</span>
              <ChevronDown className="w-4 h-4 text-brand-500 animate-bounce" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. Core Features Grid */}
      <section id="features" className="py-20 px-6 bg-slate-100/50 dark:bg-slate-900/30 border-y border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">Everything You Need</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Built for Visual Thinkers & Engineers</h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              From freehand sketches to structured software architecture diagrams, CanvasCraft gives you complete creative control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <PenLine className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Smooth Freehand & Shapes</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Silky smooth Catmull-Rom Bézier curve interpolation for handwriting and sketching, paired with rounded rectangles, ellipses, lines, and arrows.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Spline className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Smart Magnetic Connectors</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Connect ideas with straight or curved branches that dynamically snap to object anchor points (top, bottom, left, right, center) as elements move.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <StickyNote className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">7-Color Sticky Notes & Text</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Color-coded sticky notes and standalone text boxes with seamless inline editing, customizable typography, and double-click activation.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Retina Vector Export</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Export crisp PNG images in 1x, 2x (High-DPI), or 3x (Ultra HD) resolution with white, dark, or transparent backgrounds, plus full JSON backups.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-10 h-10 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-950/60 text-fuchsia-600 dark:text-fuchsia-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Offline-First & 100% Private</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                All data stays safely on your machine using IndexedDB local storage with debounced autosaving. Zero server tracking, zero telemetry.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Keyboard className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">50-Step Undo & Shortcuts</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Granular undo/redo stack committed per user gesture, 8-handle multi-element resizing, aspect ratio locks, and comprehensive keyboard shortcuts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Starter Templates Section */}
      <section id="templates" className="py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">Jump Right In</h2>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">Pre-Built Starter Templates</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg">
                Choose a pre-configured template to kickstart your brainstorming session, or start from a clean canvas.
              </p>
            </div>
            <button
              onClick={handleLaunchCanvas}
              className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 hover:underline"
            >
              <span>Open Blank Canvas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Template 1: Blank */}
            <div 
              onClick={() => handleSelectTemplate('blank')}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-500 dark:hover:border-brand-500 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-4 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                <Maximize2 className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Blank Whiteboard</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                A clean, infinite slate ready for your creative ideas, freehand sketches, and notes.
              </p>
            </div>

            {/* Template 2: Brainstorming */}
            <div 
              onClick={() => handleSelectTemplate('brainstorming')}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-500 dark:hover:border-brand-500 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                <Lightbulb className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Brainstorming Board</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Structured sections with color-categorized sticky notes for rapid team idea generation.
              </p>
            </div>

            {/* Template 3: Mind Map */}
            <div 
              onClick={() => handleSelectTemplate('mindmap')}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-500 dark:hover:border-brand-500 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                <GitBranch className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Mind Mapping</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                A central core concept radiating outwards into connected subtopic branches.
              </p>
            </div>

            {/* Template 4: Flowchart */}
            <div 
              onClick={() => handleSelectTemplate('flowchart')}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-500 dark:hover:border-brand-500 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                <Spline className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Flowchart & Logic</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Start/end terminals, decision diamonds, and directional arrows for system workflows.
              </p>
            </div>

            {/* Template 5: Study Planner */}
            <div 
              onClick={() => handleSelectTemplate('study_planner')}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-500 dark:hover:border-brand-500 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group"
            >
              <div className="w-9 h-9 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-950/60 text-fuchsia-600 dark:text-fuchsia-400 flex items-center justify-center mb-4 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Study & Sprint Planner</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Kanban-style frames for planning sprints, weekly goals, and academic milestones.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* 7. Bottom Call-To-Action Banner */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-fuchsia-600 p-8 sm:p-12 text-center text-white space-y-6 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Ready to bring your ideas to life?</h3>
            <p className="text-sm sm:text-base text-white/90 max-w-xl mx-auto">
              Launch CanvasCraft now. No account required, no installation, and completely free.
            </p>
            <div className="pt-2">
              <button
                onClick={handleLaunchCanvas}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-brand-700 hover:bg-slate-100 font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                <span>Explore Canvas Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">CanvasCraft</span>
            <span>— Interactive Vector Whiteboard</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={handleLaunchCanvas} className="hover:underline hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Explore Canvas</button>
            <button onClick={scrollToFeatures} className="hover:underline hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Features</button>
            <button onClick={scrollToTemplates} className="hover:underline hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Templates</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
