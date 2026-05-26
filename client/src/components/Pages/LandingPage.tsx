import { motion } from "motion/react";
import { Sparkles, ArrowRight, Zap, Shield, Users, Edit3, Keyboard } from "lucide-react";
import InteractiveLaptop from "../InteractiveLaptop";

interface LandingPageProps {
  onStartFree: () => void;
  onExploreWorkflow: () => void;
  onExploreAbout: () => void;
}

export default function LandingPage({ onStartFree, onExploreWorkflow, onExploreAbout }: LandingPageProps) {
  return (
    <div className="relative pt-24 pb-20 min-h-screen flex flex-col items-center justify-center overflow-hidden">
      
      {/* Background Decorative Elements (Bentolio inspired) */}
      <div className="absolute top-20 left-40 w-64 h-64 bg-blue-100/40 rounded-full blur-[100px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-20 right-40 w-80 h-80 bg-orange-100/40 rounded-full blur-[100px] opacity-60 pointer-events-none" />

      {/* Hero Display Frame */}
      <div className="w-[92%] max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 pt-8">
        
        {/* Left column text copy & actions (5 cols) */}
        <div className="lg:col-span-5 text-left flex flex-col justify-center space-y-6">
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-accent-bg border border-brand-accent-border text-xs text-brand-primary font-mono font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
            <span>Introducing Real-Time Delta Blending</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-display font-black tracking-tight leading-[1.05] text-[#37352F]"
          >
            The workspace for <span className="text-brand-primary">synchronized</span> ideas.
          </motion.h1>

          {/* Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-[#7A7A78] leading-relaxed font-sans font-normal max-w-lg"
          >
            Collaborate in real-time with your team in a Notion-inspired environment with enhanced glassmorphic clarity. Experience synchronous editing, shared cursors, and instant updates.
          </motion.p>

          {/* Interactive buttons with visual reactive properties */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <button
              onClick={onStartFree}
              className="px-6 py-3.5 rounded-full bg-brand-primary text-white font-semibold text-sm shadow-lg shadow-brand-primary/15 hover:bg-brand-hover hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 group cursor-pointer border border-brand-primary/10"
              id="btn-hero-start"
            >
              <span>Try Now</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onExploreWorkflow}
              className="px-6 py-3.5 rounded-full bg-white/80 text-[#37352F] font-semibold text-sm border border-[#E9E9E8] shadow-sm hover:bg-[#F7F6F3] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              id="btn-hero-workflow"
            >
              <span>Watch Workflow</span>
            </button>
          </motion.div>

          <div className="flex items-center gap-6 pt-4 border-t border-[#E9E9E8]">
            <div>
              <span className="block font-bold text-lg text-[#37352F]">15ms</span>
              <span className="block text-[10px] font-mono text-[#7A7A78] font-medium">Sync Latency</span>
            </div>
            <div className="w-px h-8 bg-[#E9E9E8]" />
            <div>
              <span className="block font-bold text-lg text-[#37352F]">99.9%</span>
              <span className="block text-[10px] font-mono text-[#7A7A78] font-medium">Uptime Rate</span>
            </div>
            <div className="w-px h-8 bg-[#E9E9E8]" />
            <div>
              <span className="block font-bold text-lg text-[#37352F]">Instant</span>
              <span className="block text-[10px] font-mono text-[#7A7A78] font-medium">Conflict Resolve</span>
            </div>
          </div>

        </div>

        {/* Right column (7 cols) holding the magnificent interactive mockup laptop */}
        <div className="lg:col-span-7 flex justify-center items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 40, damping: 15, delay: 0.3 }}
            className="w-full"
          >
            <InteractiveLaptop />
          </motion.div>
        </div>

      </div>

      {/* Bentolio Glassmorphism Features Bento Grid */}
      <section className="w-[92%] max-w-7xl mx-auto mt-20 relative z-10 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#37352F] tracking-tight">
            Designed for Instant Production Workflow
          </h2>
          <p className="text-xs sm:text-sm text-[#7A7A78] font-sans">
            Minimal workspace overhead. Powerful sub-millisecond data synchronization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Glass Bento Cell 1 */}
          <div className="glass-card glass-card-hover rounded-[24px] p-6 text-left border-[#E9E9E8] shadow-sm flex flex-col justify-between group h-full">
            <div className="space-y-4">
              <div className="p-3 w-fit rounded-xl bg-brand-accent-bg border border-brand-accent-border text-brand-primary group-hover:scale-105 duration-300">
                <Zap className="w-5 h-5 text-blue-500" />
               </div>
              <h3 className="font-display font-bold text-lg text-[#37352F]">Real-Time Sync Engine</h3>
              <p className="text-xs text-[#7A7A78] leading-relaxed font-sans">
                Sub-millisecond events broadcast edits instantly. Experience no lagged cursor drifts or delayed letter inserts.
              </p>
            </div>
            <button 
              onClick={onExploreWorkflow} 
              className="text-xs font-mono font-semibold text-blue-500 hover:text-blue-700 flex items-center gap-1 mt-6 group select-none cursor-pointer"
            >
              <span>View workflow map</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Glass Bento Cell 2 */}
          <div className="glass-card glass-card-hover rounded-[24px] p-6 text-left border-[#E9E9E8] shadow-sm flex flex-col justify-between group h-full">
            <div className="space-y-4">
              <div className="p-3 w-fit rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-600 group-hover:scale-105 duration-300">
                <Users className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="font-display font-bold text-lg text-[#37352F]">Collaborator Presence</h3>
              <p className="text-xs text-[#7A7A78] leading-relaxed font-sans">
                Never second guess who is editing what. Cursors are clearly defined, colored, and track exact caret line-character highlights.
              </p>
            </div>
            <button 
              onClick={onExploreAbout}
              className="text-xs font-mono font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 mt-6 group select-none cursor-pointer"
            >
              <span>Learn user mechanics</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Glass Bento Cell 3 */}
          <div className="glass-card glass-card-hover rounded-[24px] p-6 text-left border-[#E9E9E8] shadow-sm flex flex-col justify-between group h-full">
            <div className="space-y-4">
              <div className="p-3 w-fit rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 group-hover:scale-105 duration-300">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-display font-bold text-lg text-[#37352F]">Version Control & Safety</h3>
              <p className="text-xs text-[#7A7A78] leading-relaxed font-sans">
                Accidental overrides are history. Easily inspect past version blocks, see line differences, and restore files to specific prior states.
              </p>
            </div>
            <button 
              onClick={onStartFree}
              className="text-xs font-mono font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 mt-6 group select-none cursor-pointer"
            >
              <span>Try document sharing</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}
