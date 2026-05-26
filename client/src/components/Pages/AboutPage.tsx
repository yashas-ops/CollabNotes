import { Sparkles, Users, GitBranch, Compass, Cpu, Wifi, Edit3, GraduationCap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="relative pt-24 pb-20 min-h-screen flex flex-col items-center overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute top-20 right-40 w-64 h-64 bg-blue-100/30 rounded-full blur-[100px] opacity-65 pointer-events-none" />
      <div className="absolute bottom-20 left-40 w-80 h-80 bg-teal-100/20 rounded-full blur-[100px] opacity-65 pointer-events-none" />

      <div className="w-[92%] max-w-5xl mx-auto space-y-12 relative z-10 pt-10 text-left">
        
        {/* About Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent-bg border border-brand-accent-border text-xs text-brand-primary font-mono font-medium">
            <Compass className="w-3.5 h-3.5" />
            <span>Behind The Workspace</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-black text-[#37352F] tracking-tight">
            About CollabNotes
          </h1>
          <p className="text-sm sm:text-base text-[#7A7A78] max-w-3xl leading-relaxed">
            CollabNotes is a hyper-sync collaborative editor built for teams that need real-time document editing with zero-conflict merging. Powered by <span className="font-semibold text-[#37352F]">CRDTs (Yjs)</span> and sub-millisecond WebSocket broadcast, every keystroke is instantly synchronized across all connected collaborators.
          </p>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Card 1: Core Architecture (7 cols) */}
          <div className="md:col-span-7 glass-card rounded-[24px] p-6 lg:p-8 space-y-4 border-[#E9E9E8] hover:bg-white/90 shadow-sm transition-all duration-300">
            <div className="flex items-center gap-2 text-brand-primary font-mono font-bold text-xs">
              <Cpu className="w-4 h-4 text-brand-primary" />
              <span>CORE ARCHITECTURE</span>
            </div>
            <h3 className="font-display font-bold text-xl text-[#37352F]">CRDT-Powered Real-Time Sync</h3>
            <p className="text-xs sm:text-sm text-[#7A7A78] leading-relaxed">
              At the heart of CollabNotes is <span className="font-semibold text-[#37352F]">Yjs</span>, a conflict-free replicated data type engine that enables multiple users to edit simultaneously without locking or Operational Transformation. Each keystroke produces a granular delta that propagates through WebSocket rooms, merges automatically, and renders instantly.
            </p>
            <div className="grid grid-cols-3 gap-3 pt-4 text-center">
              <div className="p-3 bg-[#F7F6F3] rounded-xl border border-[#E9E9E8]">
                <span className="block font-mono font-bold text-base text-brand-primary">&lt;50ms</span>
                <span className="block text-[9px] text-[#7A7A78]">Avg broadcast latency</span>
              </div>
              <div className="p-3 bg-[#F7F6F3] rounded-xl border border-[#E9E9E8]">
                <span className="block font-mono font-bold text-base text-indigo-600">Unlimited</span>
                <span className="block text-[9px] text-[#7A7A78]">Concurrent editors</span>
              </div>
              <div className="p-3 bg-[#F7F6F3] rounded-xl border border-[#E9E9E8]">
                <span className="block font-mono font-bold text-base text-amber-600">1000ms</span>
                <span className="block text-[9px] text-[#7A7A78]">Auto-save debounce</span>
              </div>
            </div>
          </div>

          {/* Card 2: Key Features (5 cols) */}
          <div className="md:col-span-5 glass-card rounded-[24px] p-6 space-y-4 border-[#E9E9E8] hover:bg-white/90 shadow-sm transition-all duration-300">
            <div className="flex items-center gap-2 text-teal-600 font-mono font-bold text-xs">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>KEY FEATURES</span>
            </div>
            <h3 className="font-display font-bold text-xl text-[#37352F]">What You Get</h3>
            <p className="text-xs text-[#7A7A78] leading-relaxed">
              Real-time cursors, live presence indicators, version history with snapshots, document sharing with granular permissions, and offline-aware editing.
            </p>
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-brand-accent-bg border border-brand-accent-border">
                <div className="flex items-center gap-2">
                  <Wifi className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-xs font-semibold text-[#37352F]">Live Cursors</span>
                </div>
                <span className="text-[10px] font-mono text-indigo-400">Yjs Awareness</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-brand-accent-bg border border-brand-accent-border">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-semibold text-[#37352F]">Version History</span>
                </div>
                <span className="text-[10px] font-mono text-amber-400">50 snapshots</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-brand-accent-bg border border-brand-accent-border">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs font-semibold text-[#37352F]">Collaborators</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">View / Edit roles</span>
              </div>
            </div>
          </div>

          {/* Card 3: Use Cases (Entire width, 12 cols) */}
          <div className="md:col-span-12 glass-card rounded-[24px] p-6 lg:p-8 space-y-6 border-[#E9E9E8]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E9E9E8]">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-600 font-mono font-bold text-xs">
                  <Users className="w-4 h-4" />
                  <span>USE CASES</span>
                </div>
                <h3 className="font-display font-bold text-xl text-[#37352F]">Who Is CollabNotes For</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#F7F6F3] border border-[#E9E9E8] space-y-2">
                <div className="flex items-center gap-2 text-brand-primary">
                  <Users className="w-4 h-4" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Development Teams</span>
                </div>
                <p className="text-xs text-[#7A7A78] leading-relaxed font-sans">
                  Collaborate on technical specs, architecture decisions, and sprint planning in real-time. Share meeting notes that update instantly as discussions evolve.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#F7F6F3] border border-[#E9E9E8] space-y-2">
                <div className="flex items-center gap-2 text-teal-600">
                  <Edit3 className="w-4 h-4" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Content Creators</span>
                </div>
                <p className="text-xs text-[#7A7A78] leading-relaxed font-sans">
                  Write and edit documents with co-authors simultaneously. No more version conflicts or emailing drafts back and forth. See edits appear as they happen.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#F7F6F3] border border-[#E9E9E8] space-y-2">
                <div className="flex items-center gap-2 text-amber-600">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Education & Research</span>
                </div>
                <p className="text-xs text-[#7A7A78] leading-relaxed font-sans">
                  Perfect for study groups, research collaborations, and lab notes. Track changes over time with version history and restore any previous state.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
