import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { MousePointer2, CheckCircle, FileCode, Users } from "lucide-react";

export default function InteractiveLaptop() {
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [localMouse, setLocalMouse] = useState({ x: 120, y: 140 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setLocalMouse({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const codeLines = [
    { id: 1, text: "# 🚀 CollabNotes Launch Specs", prefix: "H1", isHeader: true },
    { id: 2, text: "Welcome to the real-time specifications document for the 1.0 release.", isHeader: false, italic: true },
    { id: 3, text: "- [x] High-performance WebSocket architecture", isHeader: false, highlight: "#3b82f6/10" },
    { id: 4, text: "- [x] Notion-inspired productivity canvas", isHeader: false, highlight: "#10b981/10" },
    { id: 5, text: "- [y] Bentolio glassmorphism components", isHeader: false, highlight: "#ea580c/10" },
    { id: 6, text: "- [ ] Global synchronization engine", isHeader: false }
  ];

  // Colors mapping for cursors
  const cursors = [
    { name: "Alex", color: "from-blue-500 to-indigo-600", border: "border-blue-400Bg", textColor: "bg-blue-600", initialX: 70, initialY: 60, delay: 0 },
    { name: "Charlie", color: "from-amber-500 to-amber-600", border: "border-amber-400Bg", textColor: "bg-amber-600", initialX: 240, initialY: 100, delay: 1.5 },
    { name: "Sarah", color: "from-emerald-500 to-teal-600", border: "border-emerald-400Bg", textColor: "bg-emerald-600", initialX: 180, initialY: 160, delay: 0.8 },
  ];

  return (
    <div className="relative w-full max-w-2xl mx-auto py-6">
      {/* Laptop Screen Body */}
      <div className="relative mx-auto w-[90%] sm:w-[540px] md:w-[600px] h-[280px] sm:h-[320px] bg-neutral-900 border-[10px] sm:border-[14px] border-neutral-800 rounded-t-[20px] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Notch & Camera */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-neutral-800 rounded-b-md z-30 flex items-center justify-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 border border-neutral-700" />
          <div className="w-1 h-1 rounded-full bg-blue-500/80" />
        </div>

        {/* Laptop Screen Inner Canvas */}
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredLine(null)}
          className="relative flex-1 bg-[#09090b] p-4 sm:p-6 text-neutral-200 select-none overflow-hidden flex flex-col pt-6 font-sans"
        >
          {/* Editor Header Grid */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] sm:text-xs font-mono font-semibold text-neutral-400 ml-2 bg-neutral-900 px-2 py-0.5 rounded flex items-center gap-1">
                <FileCode className="w-3 h-3 text-neutral-400" />
                shared_launch_specs.md
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-mono font-medium text-emerald-400">3 editing</span>
            </div>
          </div>

          {/* Lines of text that react to layout hover */}
          <div className="space-y-2 flex-1 relative z-10 text-left">
            {codeLines.map((line, idx) => (
              <div
                key={line.id}
                onMouseEnter={() => setHoveredLine(idx)}
                className={`relative px-2 py-1.5 rounded-lg transition-all duration-300 text-[10px] sm:text-xs font-medium cursor-pointer ${
                  hoveredLine === idx 
                    ? 'bg-neutral-900 shadow-sm translate-x-1 border border-neutral-800/50' 
                    : 'border border-transparent'
                }`}
              >
                {/* Background lighting gradient logic */}
                {hoveredLine === idx && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md bg-gradient-to-b from-indigo-500 to-purple-500" />
                )}

                {line.isHeader ? (
                  <span className="font-display font-black text-xs sm:text-sm tracking-tight text-white flex items-center gap-1">
                    {line.text}
                  </span>
                ) : line.italic ? (
                  <span className="text-neutral-400 italic block">{line.text}</span>
                ) : (
                  <span className="text-neutral-300 block whitespace-pre-wrap">{line.text}</span>
                )}
              </div>
            ))}
          </div>

          {/* Interactive floating cursors representing other users (Alex, Sarah, Charlie) */}
          {cursors.map((cursor, index) => {
            // Apply slight interactive offset bias based on mouse relative proximity
            const distanceX = localMouse.x - cursor.initialX;
            const distanceY = localMouse.y - cursor.initialY;
            const dist = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            
            // Cursors drift slightly away from actual user pointer if too close, or glide nicely
            const hoverPullX = dist < 120 ? (distanceX / dist) * 15 : 0;
            const hoverPullY = dist < 120 ? (distanceY / dist) * 15 : 0;

            const finalX = cursor.initialX + hoverPullX;
            const finalY = cursor.initialY + hoverPullY;

            return (
              <motion.div
                key={cursor.name}
                initial={{ x: cursor.initialX, y: cursor.initialY }}
                animate={{
                  x: finalX,
                  y: finalY,
                  transition: { type: "spring", stiffness: 60, damping: 12 }
                }}
                className={`absolute z-30 pointer-events-none flex items-start gap-1`}
              >
                {/* Floating pointer svg with precise theme */}
                <div className="relative">
                  <MousePointer2 className={`w-4 h-4 text-neutral-800 transform rotate-[270deg] drop-shadow`} />
                  
                  {/* Floating username banner */}
                  <div className={`absolute left-3.5 -top-2 rounded-r-lg rounded-tl-lg px-2 py-0.5 text-[8px] sm:text-[9px] font-bold text-white shadow-md flex items-center gap-1 ${cursor.textColor}`}>
                    <span className="w-1 h-1 rounded-full bg-white/75 animate-ping" />
                    {cursor.name}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Real-time background interactive gradient overlay inside the screen */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-neutral-500/5 mix-blend-multiply pointer-events-none" />
        </div>
      </div>

      {/* Laptop Bottom Plate & hinge */}
      <div className="relative mx-auto w-[100%] sm:w-[600px] md:w-[660px] h-[16px] bg-neutral-800 rounded-b-[10px] shadow-lg border-t border-neutral-700 flex justify-center items-start">
        {/* Display notch open grip */}
        <div className="w-[12%] h-[5px] bg-neutral-900 rounded-b-[4px]" />
      </div>

      {/* Under-glow ambient dynamic shadow ring */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[85%] h-5 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
    </div>
  );
}
