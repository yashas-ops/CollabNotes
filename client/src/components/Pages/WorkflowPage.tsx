import { useState } from "react";
import { Server, Cpu, Info, Play, HelpCircle, Wifi, Users, Database, Workflow, Lock } from "lucide-react";

export default function WorkflowPage() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [pulseActive, setPulseActive] = useState<boolean>(false);

  const triggerPulse = () => {
    if (pulseActive) return;
    setPulseActive(true);
    
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

        {/* Application Workflow & Tech Stack */}
        <div className="space-y-8 pb-6">
          
          {/* Section Header */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent-bg border border-brand-accent-border text-xs text-brand-primary font-mono font-medium">
              <Cpu className="w-3.5 h-3.5" />
              <span>Application Flow & Stack</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#37352F] tracking-tight">
              How CollabNotes Works
            </h2>
            <p className="text-xs sm:text-sm text-[#7A7A78] max-w-2xl leading-relaxed">
              From authentication to real-time sync, here's the full lifecycle of a collaborative session.
            </p>
          </div>

          {/* Workflow Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { step: 1, icon: HelpCircle, title: 'Authentication', desc: 'Users register or login via JWT-based auth. Tokens persist in localStorage for 7 days. Every API request carries the token in Authorization headers.', color: 'text-brand-primary', border: 'border-brand-primary/35' },
              { step: 2, icon: Server, title: 'Document Management', desc: 'Authenticated users create, list, and open documents. Each document is stored in MongoDB with Yjs binary state. Owners can invite collaborators with view or edit permissions.', color: 'text-teal-600', border: 'border-teal-500/35' },
              { step: 3, icon: Wifi, title: 'Real-Time Session', desc: 'Opening a document establishes a WebSocket connection via Socket.io. The client joins a room (document:{id}) and initializes a Yjs document. All edits produce CRDT-based sync-update events broadcast to the room.', color: 'text-amber-600', border: 'border-amber-500/35' },
              { step: 4, icon: Users, title: 'Collaboration & Persistence', desc: 'Collaborators see live cursors, presence indicators, and receive instant deltas. The server auto-saves the Yjs state to MongoDB every 1000ms. Version snapshots are taken and capped at 50 per document.', color: 'text-purple-600', border: 'border-purple-500/35' },
            ].map((item) => {
              const IconComponent = item.icon;
              return (
                <div key={item.step} className={`glass-card rounded-[20px] p-5 border-[#E9E9E8] space-y-3`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${item.color}`}>
                      <IconComponent className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-[#7A7A78] uppercase">Step {item.step}</span>
                      <h3 className="font-display font-bold text-sm text-[#37352F]">{item.title}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-[#7A7A78] leading-relaxed pl-1">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Tech Stack Summary */}
          <div className="glass-card rounded-[24px] p-6 border-[#E9E9E8]">
            <div className="flex items-center gap-2 mb-4 text-xs font-mono font-bold text-brand-primary">
              <Cpu className="w-4 h-4" />
              <span>TECHNOLOGY STACK</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'React 19', sub: 'UI Framework', color: 'text-brand-primary' },
                { label: 'TypeScript', sub: 'Type Safety', color: 'text-brand-primary' },
                { label: 'Tailwind CSS v4', sub: 'Styling', color: 'text-teal-600' },
                { label: 'Vite', sub: 'Bundler', color: 'text-teal-600' },
                { label: 'Node.js + Express', sub: 'API Server', color: 'text-amber-600' },
                { label: 'Socket.io', sub: 'WebSocket', color: 'text-amber-600' },
                { label: 'MongoDB + Mongoose', sub: 'Database', color: 'text-purple-600' },
                { label: 'Yjs', sub: 'CRDT Engine', color: 'text-purple-600' },
              ].map((tech) => (
                <div key={tech.label} className="p-3 rounded-xl bg-[#F7F6F3] border border-[#E9E9E8]">
                  <span className={`block text-xs font-bold ${tech.color}`}>{tech.label}</span>
                  <span className="block text-[10px] text-[#7A7A78] font-mono mt-0.5">{tech.sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sync Pipeline Architecture */}
          <div className="glass-card rounded-[24px] p-6 border-[#E9E9E8] space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-teal-600">
              <Workflow className="w-4 h-4" />
              <span>SYNC PIPELINE</span>
            </div>
            <h3 className="font-display font-bold text-lg text-[#37352F]">End-to-End Data Flow</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#F7F6F3] border border-[#E9E9E8] space-y-2">
                <div className="flex items-center gap-2 text-brand-primary">
                  <Wifi className="w-4 h-4" />
                  <span className="text-xs font-bold text-[#37352F]">1. Capture</span>
                </div>
                <p className="text-[11px] text-[#7A7A78] leading-relaxed font-sans">
                  Keystrokes and cursor movements are captured by the Yjs document binding. Each event produces a granular delta operation that encodes only what changed.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F7F6F3] border border-[#E9E9E8] space-y-2">
                <div className="flex items-center gap-2 text-amber-600">
                  <Server className="w-4 h-4" />
                  <span className="text-xs font-bold text-[#37352F]">2. Broadcast</span>
                </div>
                <p className="text-[11px] text-[#7A7A78] leading-relaxed font-sans">
                  Deltas are sent via WebSocket to the server, which identifies the document room and broadcasts the update to all other connected clients in that room.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F7F6F3] border border-[#E9E9E8] space-y-2">
                <div className="flex items-center gap-2 text-purple-600">
                  <Database className="w-4 h-4" />
                  <span className="text-xs font-bold text-[#37352F]">3. Persist</span>
                </div>
                <p className="text-[11px] text-[#7A7A78] leading-relaxed font-sans">
                  The server debounces persistence to MongoDB every 1000ms. Document state is stored as Yjs binary, enabling full history reconstruction and version rollback.
                </p>
              </div>
            </div>
          </div>

          {/* Security & Permissions */}
          <div className="glass-card rounded-[24px] p-6 border-[#E9E9E8] space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-600">
              <Lock className="w-4 h-4" />
              <span>ACCESS CONTROL</span>
            </div>
            <h3 className="font-display font-bold text-lg text-[#37352F]">Permission Model</h3>
            <p className="text-xs text-[#7A7A78] leading-relaxed max-w-3xl">
              Document owners can invite collaborators with granular permissions. Viewers can see content in real-time but cannot edit. Editors have full write access with their changes synced via CRDT merging. Room isolation prevents cross-document data leakage.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              {[
                { role: 'Owner', perms: 'Full control — delete, share, edit, view history', color: 'text-brand-primary border-brand-primary/35' },
                { role: 'Editor', perms: 'Read and write — changes sync to all', color: 'text-teal-600 border-teal-500/35' },
                { role: 'Viewer', perms: 'Read-only — live cursor following', color: 'text-amber-600 border-amber-500/35' },
              ].map((r) => (
                <div key={r.role} className={`flex-1 min-w-[140px] p-3 rounded-xl bg-[#F7F6F3] border border-[#E9E9E8]`}>
                  <span className={`block text-xs font-bold ${r.color.split(' ')[0]}`}>{r.role}</span>
                  <span className="block text-[10px] text-[#7A7A78] font-sans mt-1">{r.perms}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
