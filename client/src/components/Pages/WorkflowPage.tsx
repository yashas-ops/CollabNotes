import { useState } from "react";
import { Send, Server, Network, ShieldCheck, Cpu, Code, Info, Play, Check } from "lucide-react";

export default function WorkflowPage() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [pulseActive, setPulseActive] = useState<boolean>(false);
  const [selectedSchema, setSelectedSchema] = useState<'edit' | 'presence' | 'cursor'>('edit');

  const triggerPulse = () => {
    if (pulseActive) return;
    setPulseActive(true);
    
    // Cycle active steps to animate the packet transfer
    const steps = [1, 2, 3, 4];
    steps.forEach((step, i) => {
      setTimeout(() => {
        setActiveStep(step);
        if (step === 4) {
          setTimeout(() => {
            setPulseActive(false);
          }, 800);
        }
      }, i * 600);
    });
  };

  const schemaPayloads = {
    edit: {
      type: "edit",
      noteId: "launch-specs",
      content: "# 🚀 CollabNotes Launch Specs\n- [x] High-performance WebSockets",
      userId: "usr-guest-102",
      userName: "Alex Glass",
      timestamp: Date.now()
    },
    presence: {
      type: "presence",
      noteId: "launch-specs",
      users: [
        { userId: "usr-01", userName: "Alex", userColor: "#2383E2", x: 120, y: 80 },
        { userId: "usr-02", userName: "Sarah", userColor: "#10B981", x: 230, y: 150 }
      ]
    },
    cursor: {
      type: "cursor_move",
      userId: "usr-guest-102",
      userName: "Alex Glass",
      userColor: "#a855f7",
      x: 185,
      y: 112,
      lineIndex: 2,
      charIndex: 12
    }
  };

  return (
    <div className="relative pt-24 pb-20 min-h-screen flex flex-col items-center overflow-hidden">
      
      {/* Background radial effects */}
      <div className="absolute top-20 left-40 w-64 h-64 bg-blue-100/30 rounded-full blur-[100px] opacity-65 pointer-events-none" />
      <div className="absolute bottom-20 right-40 w-80 h-80 bg-orange-100/20 rounded-full blur-[100px] opacity-65 pointer-events-none" />

      <div className="w-[92%] max-w-5xl mx-auto space-y-10 relative z-10 pt-10 text-left">
        
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent-bg border border-brand-accent-border text-xs text-brand-primary font-mono font-medium">
            <Cpu className="w-3.5 h-3.5" />
            <span>Operational Mechanics</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-black text-[#37352F] tracking-tight">
            Real-Time Broadcast Loop
          </h1>
          <p className="text-sm sm:text-base text-[#7A7A78] max-w-2xl leading-relaxed">
            Every keystroke or cursor movement creates a message payload. Watch how it streams, authenticates, matches rooms, and broadcasts to other active collaborators.
          </p>
        </div>

        {/* Sync Animation stage */}
        <div className="glass-card rounded-[28px] border-[#E9E9E8] p-6 md:p-8 flex flex-col items-center justify-center relative shadow-sm overflow-hidden min-h-[300px]">
          
          {/* Connection Lines (Simulated Paths) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block">
            {/* Path Client A to Server (Horizontal Split) */}
            <path 
              d="M 150 150 L 512 150" 
              className={`stroke-2 fill-none transition-all duration-350 ${
                activeStep === 1 && pulseActive ? 'stroke-brand-primary stroke-[3px]' : 'stroke-gray-200'
              }`} 
            />
            {/* Path Server to Client B */}
            <path 
              d="M 512 150 L 800 100" 
              className={`stroke-2 fill-none transition-all duration-351 ${
                activeStep === 3 && pulseActive ? 'stroke-teal-500 stroke-[3px]' : 'stroke-gray-200'
              }`} 
            />
            {/* Path Server to Client C */}
            <path 
              d="M 512 150 L 800 200" 
              className={`stroke-2 fill-none transition-all duration-352 ${
                activeStep === 3 && pulseActive ? 'stroke-amber-500 stroke-[3px]' : 'stroke-gray-200'
              }`} 
            />
          </svg>

          {/* Horizontal layout of Nodes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full pt-4 relative z-10">
            
            {/* Client A (Left) */}
            <div className={`flex flex-col items-center justify-center p-5 rounded-2xl transition-all duration-300 ${
              activeStep === 1 
                ? 'bg-brand-accent-bg/40 border-2 border-brand-primary shadow-sm' 
                : 'bg-white border border-[#E9E9E8]'
            }`}>
              <span className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 font-semibold text-xs ${
                activeStep === 1 ? 'bg-brand-primary text-white' : 'bg-gray-100 text-[#7A7A78]'
              }`}>
                A
              </span>
              <span className="font-display font-medium text-sm text-[#37352F]">Guest (You)</span>
              <span className="text-[10px] font-mono text-[#7A7A78] mt-1">Keystroke change</span>
              {activeStep === 1 && pulseActive && (
                <span className="mt-2 text-[9px] font-mono text-brand-primary font-semibold animate-pulse">Emitting delta...</span>
              )}
            </div>

            {/* Hyper-Sync Server (Middle) */}
            <div className={`flex flex-col items-center justify-center p-5 rounded-2xl transition-all duration-300 ${
              activeStep === 2 
                ? 'bg-purple-50 border-2 border-purple-500 shadow-sm' 
                : 'bg-white border border-[#E9E9E8]'
            }`}>
              <Server className={`w-10 h-10 mb-3 ${
                activeStep === 2 ? 'text-purple-600 scale-110 duration-300' : 'text-[#7A7A78]'
              }`} />
              <span className="font-display font-medium text-sm text-[#37352F]">Collab Server</span>
              <span className="text-[10px] font-mono text-[#7A7A78] mt-1">Room: launch-specs</span>
              {activeStep === 2 && pulseActive && (
                <span className="mt-2 text-[9px] font-mono text-purple-600 font-semibold animate-pulse">Processing delta...</span>
              )}
            </div>

            {/* Observers (Right) */}
            <div className="flex flex-col gap-4">
              
              {/* Client B */}
              <div className={`flex items-center gap-3 p-3.5 rounded-xl text-left transition-all duration-300 ${
                activeStep === 3 
                  ? 'bg-teal-50 border border-teal-500' 
                  : 'bg-white border border-[#E9E9E8]'
              }`}>
                <span className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center text-[10px] font-bold">
                  S
                </span>
                <div>
                  <span className="font-semibold text-xs text-[#37352F] block">Sarah</span>
                  <span className="text-[9px] font-mono text-[#7A7A78]">Receives & merges update</span>
                </div>
              </div>

              {/* Client C */}
              <div className={`flex items-center gap-3 p-3.5 rounded-xl text-left transition-all duration-300 ${
                activeStep === 3 
                  ? 'bg-amber-50 border border-amber-500' 
                  : 'bg-white border border-[#E9E9E8]'
              }`}>
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">
                  C
                </span>
                <div>
                  <span className="font-semibold text-xs text-[#37352F] block">Charlie</span>
                  <span className="text-[9px] font-mono text-[#7A7A78]">Receives count sync</span>
                </div>
              </div>

            </div>

          </div>

          {/* Pulse Command Center */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 relative z-10 w-full justify-between pt-4 border-t border-[#E9E9E8]">
            <span className="text-xs text-[#7A7A78] font-sans flex items-center gap-1.5 text-left">
              <Info className="w-3.5 h-3.5 text-brand-primary flex-shrink-0" />
              Click trigger to send a mock WebSocket action across the pipeline.
            </span>
            <button
              onClick={triggerPulse}
              disabled={pulseActive}
              className={`px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all outline-none ${
                pulseActive 
                  ? 'bg-gray-100 text-gray-400 border border-gray-250 cursor-not-allowed' 
                  : 'bg-brand-primary hover:bg-brand-hover text-white shadow-md active:scale-95 cursor-pointer'
              }`}
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Trigger Test Pulse</span>
            </button>
          </div>

        </div>

        {/* Schema payload list and Terminal representation */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6">
          
          {/* Schema selections (4 cols) */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <span className="text-xs font-mono font-bold text-[#7A7A78] tracking-wider">SCHEMAS</span>
            
            {[
              { id: 'edit', label: 'edit', desc: 'Sync text deltas' },
              { id: 'presence', label: 'presence', desc: 'Sync joined user pools' },
              { id: 'cursor', label: 'cursor_move', desc: 'Broadcasting mouse location' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedSchema(item.id as any)}
                className={`p-4 rounded-xl text-left transition-all hover:bg-[#F7F6F3] border text-xs cursor-pointer ${
                  selectedSchema === item.id 
                    ? 'bg-brand-accent-bg border border-brand-accent-border shadow-sm font-semibold' 
                    : 'bg-white border-[#E9E9E8]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    selectedSchema === item.id ? 'bg-brand-primary' : 'bg-gray-400'
                  }`} />
                  <span className="font-mono font-bold text-[#37352F]">{item.label}</span>
                </div>
                <p className="text-[10px] text-[#7A7A78] mt-1 font-sans">{item.desc}</p>
              </button>
            ))}
          </div>

          {/* Code Schema display (8 cols) */}
          <div className="md:col-span-8 glass-card rounded-[24px] overflow-hidden border-[#E9E9E8] flex flex-col h-[280px] shadow-sm bg-white">
            {/* Terminal Top bar */}
            <div className="px-4 py-2 bg-[#F7F6F3] flex items-center justify-between border-b border-[#E9E9E8]">
              <span className="text-[10px] font-mono text-[#7A7A78] font-semibold">WebSocket JSON Message Format</span>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                <span className="w-2 h-2 rounded-full bg-green-400" />
              </div>
            </div>
            
            {/* Actual code details */}
            <div className="p-4 bg-white flex-1 overflow-auto font-mono text-xs text-brand-text text-left leading-relaxed">
              <pre>{JSON.stringify(schemaPayloads[selectedSchema], null, 2)}</pre>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
