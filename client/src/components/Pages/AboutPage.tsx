import { useState } from "react";
import { HelpCircle, Sparkles, Sliders, Type, Palette, Compass, Star } from "lucide-react";

export default function AboutPage() {
  const [fontSize, setFontSize] = useState<number>(14);
  const [tracking, setTracking] = useState<string>("tracking-normal");
  const [activeContrast, setActiveContrast] = useState<boolean>(true);

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
            The Philosophy of CollabNotes
          </h1>
          <p className="text-sm sm:text-base text-[#7A7A78] max-w-3xl leading-relaxed">
            We believe productivity tools shouldn't just be utilities, they should be beautiful. By fusing the spatial clarity of <span className="font-semibold text-[#37352F]">Notion</span> with the high-aesthetic premium layouts of <span className="font-semibold text-brand-primary">Bentolio</span>, we created an ecosystem where teams sync ideas smoothly.
          </p>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Card 1: Core Design Architecture (7 cols) */}
          <div className="md:col-span-7 glass-card rounded-[24px] p-6 lg:p-8 space-y-4 border-[#E9E9E8] hover:bg-white/90 shadow-sm transition-all duration-300">
            <div className="flex items-center gap-2 text-brand-primary font-mono font-bold text-xs">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              <span>CORE ARCHITECTURE</span>
            </div>
            <h3 className="font-display font-bold text-xl text-[#37352F]">Pixel-Perfect Glassmorphism</h3>
            <p className="text-xs sm:text-sm text-[#7A7A78] leading-relaxed">
              Every card, popover, and indicator employs soft-frosted backdrop blur, delicate borders, and high contrast typography. It maximizes visual attention on markdown text while conveying a stunning premium sensation.
            </p>
            <div className="grid grid-cols-3 gap-3 pt-4 text-center">
              <div className="p-3 bg-[#F7F6F3] rounded-xl border border-[#E9E9E8]">
                <span className="block font-mono font-bold text-base text-brand-primary">12px</span>
                <span className="block text-[9px] text-[#7A7A78]">Backdrop blur</span>
              </div>
              <div className="p-3 bg-[#F7F6F3] rounded-xl border border-[#E9E9E8]">
                <span className="block font-mono font-bold text-base text-indigo-600">85%</span>
                <span className="block text-[9px] text-[#7A7A78]">Glass opacity</span>
              </div>
              <div className="p-3 bg-[#F7F6F3] rounded-xl border border-[#E9E9E8]">
                <span className="block font-mono font-bold text-base text-amber-600">0.3s</span>
                <span className="block text-[9px] text-[#7A7A78]">Smooth morph</span>
              </div>
            </div>
          </div>

          {/* Card 2: Aesthetic Color Swatches (5 cols) */}
          <div className="md:col-span-5 glass-card rounded-[24px] p-6 space-y-4 border-[#E9E9E8] hover:bg-white/90 shadow-sm transition-all duration-300">
            <div className="flex items-center gap-2 text-teal-600 font-mono font-bold text-xs">
              <Palette className="w-4 h-4 text-teal-600" />
              <span>COLOR STRATEGY</span>
            </div>
            <h3 className="font-display font-bold text-xl text-[#37352F]">Color Harmony</h3>
            <p className="text-xs text-[#7A7A78] leading-relaxed">
              Carefully calibrated colors map presence smoothly, maintaining clear readability values.
            </p>
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 border border-blue-100 text-blue-700">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-xs font-semibold">Alex Slate</span>
                </div>
                <span className="text-[10px] font-mono">#3B82F6</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold">Sarah Forest</span>
                </div>
                <span className="text-[10px] font-mono">#10B981</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-100 text-amber-700">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-xs font-semibold">Charlie Amber</span>
                </div>
                <span className="text-[10px] font-mono">#F59E0B</span>
              </div>
            </div>
          </div>

          {/* Card 3: Interactive Font Tester (Entire width, 12 cols) */}
          <div className="md:col-span-12 glass-card rounded-[24px] p-6 lg:p-8 space-y-6 border-[#E9E9E8]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E9E9E8]">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-600 font-mono font-bold text-xs">
                  <Type className="w-4 h-4" />
                  <span>INTERACTIVE RENDERING</span>
                </div>
                <h3 className="font-display font-bold text-xl text-[#37352F]">Dynamic Letterform Scale</h3>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                
                {/* Font range slider */}
                <div className="flex items-center gap-2 bg-[#F7F6F3] px-3 py-1 rounded-lg border border-[#E9E9E8]">
                  <span className="text-xs text-[#7A7A78] font-mono">Size:</span>
                  <input 
                    type="range" 
                    min={12} 
                    max={22} 
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-20 sm:w-28 accent-brand-primary h-1 cursor-pointer"
                  />
                  <span className="text-xs text-[#37352F] font-mono">{fontSize}px</span>
                </div>

                {/* Tracking selection */}
                <div className="flex items-center gap-1.5 bg-[#F7F6F3] py-1 px-1.5 rounded-lg border border-[#E9E9E8]">
                  {['tracking-tight', 'tracking-normal', 'tracking-wide'].map(t => (
                    <button
                      key={t}
                      onClick={() => setTracking(t)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono capitalize cursor-pointer ${
                        tracking === t ? 'bg-brand-primary text-white' : 'text-[#7A7A78] hover:bg-black/5'
                      }`}
                    >
                      {t.split('-')[1]}
                    </button>
                  ))}
                </div>

                {/* Contrast Toggle */}
                <button
                  onClick={() => setActiveContrast(!activeContrast)}
                  className={`px-3 py-1 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                    activeContrast 
                      ? 'bg-brand-primary border-brand-primary/5 text-white shadow-md' 
                      : 'bg-[#F7F6F3] border-[#E9E9E8] text-[#37352F]'
                  }`}
                >
                  High Contrast
                </button>

              </div>
            </div>

            {/* Test Text Canvas */}
            <div 
              className={`p-6 rounded-2xl transition-all duration-300 text-left ${
                activeContrast 
                  ? 'bg-white text-[#37352F] border border-[#E9E9E8] shadow-sm' 
                  : 'bg-[#F7F6F3]/50 text-[#7A7A78] border border-[#E9E9E8]/40'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-black/5">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-mono font-semibold text-[#7A7A78]">Live Typography Preview Mode</span>
                </div>
                <h4 className="font-display font-medium tracking-tight text-[#37352F] mb-1.5" style={{ fontSize: `${fontSize + 4}px` }}>
                  Space Grotesk Heading 1
                </h4>
                <p 
                  className={`font-sans leading-relaxed ${tracking}`} 
                  style={{ fontSize: `${fontSize}px` }}
                >
                  This text block shifts synchronously as you adjust fonts and contrast parameters, displaying how we maintain visual balance. Our team uses beautiful typographic contrast so your notes feel neat and easy to read.
                </p>
                <div className="text-[10px] font-mono text-brand-primary mt-4 pt-2 border-t border-black/5 font-semibold">
                  Style System: Inter Sans | Space Grotesk Display | JetBrains Mono indicators
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
