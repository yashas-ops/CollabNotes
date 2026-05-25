import React, { useEffect, useState } from "react";
import { ThemeType } from "../types";

interface InteractiveBgProps {
  theme?: ThemeType;
}

export default function InteractiveBg({ theme = "cosmic-slate" }: InteractiveBgProps) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize values to fraction range [-0.5, 0.5]
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      setMouse({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Compute rotational and translation transforms for true 3D visual perspective
  const rotateX = mouse.y * -14; 
  const rotateY = mouse.x * 14;  
  const translate3dX = mouse.x * -40; 
  const translate3dY = mouse.y * -40;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none [perspective:1200px]">
      {/* Scope Keyframe Animations Dynamic Tag */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(12px) rotate(-6deg); }
        }
        @keyframes orbit-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbit-spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes sun-pulse {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.05); opacity: 0.95; }
        }
        @keyframes laser-sweep {
          0%, 100% { transform: rotate(-15deg) scaleX(1); opacity: 0.15; }
          50% { transform: rotate(15deg) scaleX(1.1); opacity: 0.4; }
        }
        @keyframes ember-drift-1 {
          0% { transform: translateY(100vh) translateX(0px) scale(0.5); opacity: 0; }
          15% { opacity: 0.8; }
          100% { transform: translateY(-10vh) translateX(40px) scale(1.2); opacity: 0; }
        }
        @keyframes ember-drift-2 {
          0% { transform: translateY(100vh) translateX(20px) scale(0.8); opacity: 0; }
          25% { opacity: 0.9; }
          100% { transform: translateY(-10vh) translateX(-60px) scale(0.6); opacity: 0; }
        }
        @keyframes geo-spin {
          from { transform: rotateX(20deg) rotateY(0deg) rotateZ(0deg); }
          to { transform: rotateX(20deg) rotateY(360deg) rotateZ(360deg); }
        }
        @keyframes neon-glow-pulse {
          0%, 100% { opacity: 0.45; filter: blur(40px); }
          50% { opacity: 0.65; filter: blur(55px); }
        }
      `}</style>

      {/* Primary 3D Space */}
      <div 
        className="absolute inset-x-[-15%] inset-y-[-15%] transition-transform duration-700 ease-out"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(${translate3dX}px, ${translate3dY}px, -45px) scale(1.1)`,
          transformStyle: "preserve-3d",
        }}
      >
        
        {/* ====================================================
            THEME 1: COSMIC SLATE (Default - Obsidian & Indigo)
            ==================================================== */}
        {theme === 'cosmic-slate' && (
          <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
            {/* Grid base with beautiful glowing intersection nodes */}
            <div 
              className="absolute inset-0 opacity-[0.14]" 
              style={{
                backgroundImage: `
                  radial-gradient(var(--brand-primary) 1.2px, transparent 1.2px), 
                  linear-gradient(to right, rgba(129, 140, 248, 0.04) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(129, 140, 248, 0.04) 1px, transparent 1px)
                `,
                backgroundSize: "40px 40px, 40px 40px, 40px 40px"
              }}
            />

            {/* Glowing Nebulae Orbs */}
            <div 
              className="absolute top-[10%] left-[15%] w-[60vw] h-[60vw] rounded-full"
              style={{ 
                background: "radial-gradient(circle, rgba(129, 140, 248, 0.28) 0%, rgba(99, 102, 241, 0.05) 50%, transparent 80%)",
                transform: "translateZ(30px)",
                animation: "neon-glow-pulse 8s ease-in-out infinite"
              }}
            />
            <div 
              className="absolute bottom-[8%] right-[10%] w-[50vw] h-[50vw] rounded-full"
              style={{ 
                background: "radial-gradient(circle, rgba(168, 85, 247, 0.22) 0%, rgba(129, 140, 248, 0.03) 60%, transparent 80%)",
                transform: "translateZ(60px)",
                animation: "neon-glow-pulse 10s ease-in-out infinite reverse"
              }}
            />

            {/* Orbit paths and 3D stellar layout */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] flex items-center justify-center"
              style={{ transform: "translateZ(80px)", transformStyle: "preserve-3d" }}
            >
              {/* Giant Outer Cosmic Orbit */}
              <div 
                className="absolute w-full h-full border border-indigo-500/20 rounded-full flex items-center justify-center"
                style={{ 
                  animation: "orbit-spin 16s linear infinite",
                  transformStyle: "preserve-3d"
                }}
              >
                <div className="absolute top-0 w-3.5 h-3.5 rounded-full bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.8)]" />
                <div className="absolute bottom-1/4 left-1/12 w-2 h-2 rounded-full bg-indigo-300" />
                <div className="absolute top-1/3 right-0 w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
              </div>

              {/* Mid Celestial Orbit */}
              <div 
                className="absolute w-[340px] h-[340px] border border-purple-500/15 rounded-full flex items-center justify-center"
                style={{ 
                  animation: "orbit-spin-reverse 12s linear infinite",
                  transformStyle: "preserve-3d"
                }}
              >
                <div className="absolute top-1/3 left-0 w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.6)]" />
                <div className="absolute bottom-0 right-10 w-2 h-2 rounded-full bg-sky-450" />
              </div>

              {/* Inner Cosmic Gyroscope 3D Construct */}
              <div 
                className="absolute w-[180px] h-[180px] flex items-center justify-center"
                style={{ 
                  animation: "geo-spin 20s linear infinite",
                  transformStyle: "preserve-3d"
                }}
              >
                {/* Horizontal ring */}
                <div className="absolute inset-0 border-[2px] border-indigo-400/35 rounded-full shadow-[0_0_15px_rgba(129,140,248,0.2)]" />
                {/* Vertical Ring 1 */}
                <div className="absolute inset-0 border-[2px] border-purple-400/30 rounded-full" style={{ transform: "rotateY(90deg)" }} />
                {/* Vertical Ring 2 */}
                <div className="absolute inset-0 border-[2px] border-sky-400/25 rounded-full" style={{ transform: "rotateX(90deg)" }} />
                {/* Glowing Core Star */}
                <div 
                  className="w-4 h-4 rounded-full bg-[#FFFFFF] shadow-[0_0_25px_8px_rgba(129,140,248,0.9)] flex items-center justify-center"
                  style={{ transform: "translateZ(0px)" }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-200" />
                </div>
              </div>
            </div>

            {/* 3D Floating Particle Constellations */}
            <div className="absolute inset-0 overflow-hidden" style={{ transformStyle: "preserve-3d" }}>
              <div className="absolute top-[20%] right-[25%] p-3 border border-indigo-500/15 bg-indigo-950/40 rounded-xl text-center text-[10px] font-mono text-indigo-300 shadow-lg"
                   style={{ transform: "translate3d(150px, 120px, 80px) rotateY(-15deg)", animation: "float-slow 6s ease-in-out infinite" }}>
                <span>NODE_CORE: ACTIVE</span>
              </div>
              <div className="absolute bottom-[35%] left-[20%] p-2 border border-purple-500/15 bg-purple-950/40 rounded-xl text-center text-[9px] font-mono text-purple-300 shadow-md"
                   style={{ transform: "translate3d(-200px, 200px, 60px) rotateY(20deg)", animation: "float-reverse 5s ease-in-out infinite" }}>
                <span>DELTA_SYNC_STABLE</span>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            THEME 2: AMBER SUNSET (Copper-Obsidian & Radiant Gold)
            ==================================================== */}
        {theme === 'amber-sunset' && (
          <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
            {/* Retro synthwave grid floor */}
            <div 
              className="absolute inset-x-[-15%] bottom-[-5%] h-[60%] opacity-[0.25]" 
              style={{
                background: `
                  linear-gradient(to top, rgba(255, 122, 0, 0.15) 0%, transparent 100%),
                  linear-gradient(to right, rgba(255, 122, 0, 0.08) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255, 122, 0, 0.08) 1px, transparent 1px)
                `,
                backgroundSize: "100% 100%, 35px 35px, 35px 35px",
                transform: "perspective(300px) rotateX(65deg) scaleY(1.5)",
                transformOrigin: "bottom center"
              }}
            />

            {/* Giant Retro Sun in the Horizon */}
            <div 
              className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[38vw] h-[38vw] rounded-full flex flex-col justify-between overflow-hidden"
              style={{
                background: "linear-gradient(to bottom, #FF8A00, #E52E20)",
                boxShadow: "0 0 80px rgba(255, 122, 0, 0.4), 0 0 160px rgba(229, 46, 32, 0.2)",
                transform: "translateZ(-100px)",
                animation: "sun-pulse 6s ease-in-out infinite"
              }}
            >
              <div className="w-full h-1 bg-black/40 mt-[30%]" />
              <div className="w-full h-1.5 bg-black/50" />
              <div className="w-full h-2 bg-black/60" />
              <div className="w-full h-3 bg-black/70" />
              <div className="w-full h-4 bg-black/80" />
              <div className="w-full h-6 bg-black/90" />
              <div className="w-full h-12 bg-black/95 mb-0" />
            </div>

            {/* Glowing Nebulae Orbs */}
            <div 
              className="absolute top-[15%] left-[10%] w-[55vw] h-[55vw] rounded-full"
              style={{ 
                background: "radial-gradient(circle, rgba(234, 88, 12, 0.2) 0%, rgba(220, 38, 38, 0.03) 60%, transparent 80%)",
                transform: "translateZ(20px)",
                animation: "neon-glow-pulse 9s ease-in-out infinite"
              }}
            />
            <div 
              className="absolute bottom-[10%] right-[15%] w-[45vw] h-[45vw] rounded-full"
              style={{ 
                background: "radial-gradient(circle, rgba(251, 146, 60, 0.16) 0%, rgba(146, 64, 14, 0.02) 60%, transparent 80%)",
                transform: "translateZ(50px)",
                animation: "neon-glow-pulse 7s ease-in-out infinite reverse"
              }}
            />

            {/* Parallax drifting warm embers / sparks */}
            <div className="absolute inset-x-0 bottom-[-10%] h-[120%] pointer-events-none" style={{ transformStyle: "preserve-3d" }}>
              <div className="absolute w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_12px_#FF8A00] opacity-80"
                   style={{ left: "15%", top: "80%", animation: "ember-drift-1 12s linear infinite" }} />
              <div className="absolute w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_15px_#FF7A00] opacity-90"
                   style={{ left: "45%", top: "90%", animation: "ember-drift-2 15s linear infinite" }} />
              <div className="absolute w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_10px_#EF4444] opacity-70"
                   style={{ left: "75%", top: "75%", animation: "ember-drift-1 9s linear infinite" }} />
              <div className="absolute w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_12px_#F59E0B]"
                   style={{ left: "30%", top: "70%", animation: "ember-drift-2 11s linear infinite" }} />
              <div className="absolute w-3 h-3 rounded-full bg-red-500 shadow-[0_0_18px_#DC2626] opacity-85"
                   style={{ left: "85%", top: "85%", animation: "ember-drift-1 16s linear infinite" }} />
            </div>

            {/* Rotating 3D wireframe cylinder disk elements */}
            <div className="absolute left-[8%] bottom-[25%] flex items-center justify-center"
                 style={{ transform: "translate3d(0, 0, 70px) rotateX(15deg) rotateY(-20deg)", transformStyle: "preserve-3d" }}>
              <div className="w-[160px] h-[160px] border border-orange-500/25 rounded-full flex items-center justify-center animate-[orbit-spin_10s_linear_infinite]"
                   style={{ transformStyle: "preserve-3d" }}>
                <div className="w-[120px] h-[120px] border border-dashed border-amber-500/20 rounded-full" />
                <div className="absolute top-2 w-3.5 h-3.5 bg-orange-500 rounded-full shadow-[0_0_10px_#FFA500]" />
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            THEME 3: OCEAN BREEZE (Abyssal Teal & Glowing Cyan)
            ==================================================== */}
        {theme === 'ocean-breeze' && (
          <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
            {/* Deep Seafloor radar and virtual lines */}
            <div 
              className="absolute inset-0 opacity-[0.14]" 
              style={{
                backgroundImage: `
                  radial-gradient(circle at center, rgb(56, 189, 248) 1.5px, transparent 1.5px),
                  linear-gradient(rgba(56, 189, 248, 0.03) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(56, 189, 248, 0.03) 1px, transparent 1px)
                `,
                backgroundSize: "60px 60px, 60px 60px, 60px 60px"
              }}
            />

            {/* Oceanic light shafts / Laser sweeps */}
            <div 
              className="absolute top-[-20%] left-[20%] w-[40vw] h-[140vh] origin-top bg-gradient-to-b from-cyan-500/15 via-teal-500/5 to-transparent pointer-events-none blur-[40px]"
              style={{
                animation: "laser-sweep 11s ease-in-out infinite",
                transform: "translateZ(-20px)"
              }}
            />
            <div 
              className="absolute top-[-20%] right-[15%] w-[45vw] h-[140vh] origin-top bg-gradient-to-b from-teal-500/12 via-cyan-500/5 to-transparent pointer-events-none blur-[50px]"
              style={{
                animation: "laser-sweep 14s ease-in-out infinite reverse",
                transform: "translateZ(-30px)"
              }}
            />

            {/* Floating Deep Blue orbs */}
            <div 
              className="absolute top-[25%] right-[20%] w-[58vw] h-[58vw] rounded-full blur-[140px] opacity-[0.24] bg-cyan-600/20"
              style={{ transform: "translateZ(10px)" }}
            />
            <div 
              className="absolute bottom-[5%] left-[10%] w-[55vw] h-[55vw] rounded-full blur-[120px] opacity-[0.18] bg-teal-600/15"
              style={{ transform: "translateZ(40px)" }}
            />

            {/* Ocean Depths rising bubbles/particles */}
            <div className="absolute inset-0 overflow-hidden" style={{ transformStyle: "preserve-3d" }}>
              <div className="absolute w-4 h-4 rounded-full border border-cyan-400/30 bg-cyan-500/5 shadow-[0_0_8px_rgba(56,189,248,0.2)]"
                   style={{ left: "25%", top: "70%", transform: "translateZ(80px)", animation: "float-reverse 6s ease-in-out infinite" }} />
              <div className="absolute w-6 h-6 rounded-full border border-teal-400/20 bg-teal-500/5 shadow-[0_0_10px_rgba(20,184,166,0.15)]"
                   style={{ left: "70%", top: "40%", transform: "translateZ(100px)", animation: "float-slow 8s ease-in-out infinite" }} />
              <div className="absolute w-3 h-3 rounded-full border border-cyan-300/30 bg-cyan-400/8"
                   style={{ left: "80%", top: "75%", transform: "translateZ(40px)", animation: "float-slow 5s ease-in-out infinite" }} />
              <div className="absolute w-5 h-5 rounded-full border border-cyan-500/25 bg-cyan-600/5"
                   style={{ left: "15%", top: "30%", transform: "translateZ(60px)", animation: "float-reverse 7s ease-in-out infinite" }} />
            </div>

            {/* Rotating Marine Gyro depth scope */}
            <div className="absolute right-[12%] bottom-[20%] flex items-center justify-center"
                 style={{ transform: "translate3d(0, 0, 80px) rotateX(25deg) rotateY(15deg)", transformStyle: "preserve-3d" }}>
              <div className="w-[180px] h-[180px] border border-cyan-500/25 rounded-full flex items-center justify-center animate-[orbit-spin_15s_linear_infinite]"
                   style={{ transformStyle: "preserve-3d" }}>
                <div className="absolute w-full h-[1px] bg-cyan-500/20" />
                <div className="absolute h-full w-[1px] bg-cyan-500/20" />
                <div className="w-[140px] h-[140px] border border-dotted border-teal-500/20 rounded-full" />
                <div className="w-[100px] h-[100px] border border-dashed border-cyan-500/30 rounded-full animate-[orbit-spin-reverse_9s_linear_infinite]" />
                <span className="absolute text-[9px] font-mono font-bold text-cyan-400 tracking-wider" style={{ transform: "translateY(-45px)" }}>SEALOCK_OK</span>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            THEME 4: MINIMALIST CHARCOAL (Silver & Dark Slate)
            ==================================================== */}
        {theme === 'minimalist-gray' && (
          <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
            {/* Architectural Double-Line Grid Draft Layout */}
            <div 
              className="absolute inset-0 opacity-[0.06]" 
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px),
                  linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px),
                  linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
                `,
                backgroundSize: "120px 120px, 120px 120px, 30px 30px, 30px 30px"
              }}
            />

            {/* Glowing Pure Soft Platinum/Charcoal Ambient Orbs */}
            <div 
              className="absolute top-[20%] left-[25%] w-[50vw] h-[50vw] rounded-full blur-[100px] opacity-[0.08] bg-white"
              style={{ transform: "translateZ(10px)" }}
            />
            <div 
              className="absolute bottom-[15%] right-[20%] w-[45vw] h-[45vw] rounded-full blur-[120px] opacity-[0.06] bg-neutral-450"
              style={{ transform: "translateZ(30px)" }}
            />

            {/* Geometric Crosshair coordinates & Constellation lines */}
            <div className="absolute inset-0 pointer-events-none" style={{ transformStyle: "preserve-3d" }}>
              <div className="absolute top-[25%] left-[20%] flex flex-col gap-1 items-start text-[9px] font-mono text-neutral-400 opacity-60 border-l border-neutral-700 pl-2"
                   style={{ transform: "translateZ(50px)" }}>
                <span className="font-bold text-neutral-200">COORD_SYS: GR.V4</span>
                <span>R: 194.25 / T: 0.125</span>
              </div>
              
              <div className="absolute bottom-[30%] right-[20%] flex flex-col gap-1 items-end text-[9px] font-mono text-neutral-400 opacity-60 border-r border-neutral-700 pr-2 animate-pulse"
                   style={{ transform: "translateZ(60px)" }}>
                <span className="font-bold text-neutral-200">METAL_METRIC: OK</span>
                <span>L-IDX: 24.11 / P-01</span>
              </div>

              <span className="absolute text-sm font-mono text-neutral-600 font-light" style={{ left: "40%", top: "35%", transform: "translateZ(90px) rotate(45deg)" }}>+</span>
              <span className="absolute text-sm font-mono text-neutral-600 font-light" style={{ left: "65%", top: "60%", transform: "translateZ(40px)" }}>+</span>
              <span className="absolute text-sm font-mono text-neutral-600 font-light" style={{ left: "20%", top: "70%", transform: "translateZ(120px) rotate(90deg)" }}>+</span>
            </div>

            {/* Architectural Gyroscopic wireframe rings */}
            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                 style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }}>
              <div className="w-[280px] h-[280px] border border-neutral-800 rounded-full flex items-center justify-center opacity-35 animate-[orbit-spin_25s_linear_infinite]"
                   style={{ transformStyle: "preserve-3d" }}>
                <div className="w-[220px] h-[220px] border border-neutral-700 rounded-full animate-[orbit-spin-reverse_15s_linear_infinite]" />
                <div className="absolute inset-0 border border-dashed border-neutral-700/60 rounded-full" style={{ transform: "rotateY(45deg)" }} />
                <div className="absolute inset-0 border border-neutral-600/45 rounded-full" style={{ transform: "rotateX(65deg)" }} />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
