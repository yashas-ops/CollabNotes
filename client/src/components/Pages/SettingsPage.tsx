import React, { useState } from "react";
import { Settings, Shield, Info, Palette, Keyboard, Sliders, Check, UserCheck } from "lucide-react";
import { ThemeType, UserSession } from "../../types";

interface SettingsPageProps {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  user: UserSession | null;
  onUpdateUser: (updated: UserSession) => void;
}

export default function SettingsPage({ theme, setTheme, user, onUpdateUser }: SettingsPageProps) {
  const [userNameInput, setUserNameInput] = useState(user?.userName || "Charlie");
  const [userColorInput, setUserColorInput] = useState(user?.userColor || "#F59E0B");

  const colors = ["#2383E2", "#06B6D4", "#10B981", "#F59E0B", "#A855F7", "#EC4899"];

  const themes: { id: ThemeType; name: string; desc: string; colors: string }[] = [
    { id: 'cosmic-slate', name: 'Cosmic Slate (Default)', desc: 'Obisidian space dark canvas with vibrant electric indigo gradients', colors: 'from-indigo-900 to-indigo-400' },
    { id: 'amber-sunset', name: 'Amber Sunset', desc: 'Sleek copper-obsidian sheets with warm sunset neon highlights', colors: 'from-orange-950 to-orange-500' },
    { id: 'ocean-breeze', name: 'Ocean Breeze', desc: 'Abyssal teal canvas styled with radiant cyan laser strokes', colors: 'from-cyan-950 to-cyan-400' },
    { id: 'minimalist-gray', name: 'Minimalist Charcoal', desc: 'Sophisticated monochromatic dark slate with silver metallic outlines', colors: 'from-neutral-900 to-neutral-400' },
  ];

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    onUpdateUser({
      ...user,
      userName: userNameInput,
      userColor: userColorInput,
    });
    alert("Profile settings synchronized successfully!");
  };

  return (
    <div className="relative pt-24 pb-20 min-h-screen flex flex-col items-center overflow-hidden">
      
      {/* Background designs */}
      <div className="absolute top-20 left-40 w-64 h-64 bg-blue-100/30 rounded-full blur-[100px] opacity-65 pointer-events-none" />

      <div className="w-[92%] max-w-4xl mx-auto space-y-8 relative z-10 pt-10 text-left">
        
        {/* Settings header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent-bg border border-brand-accent-border text-xs text-brand-primary font-mono font-semibold">
            <Sliders className="w-3.5 h-3.5" />
            <span>Workspace Preferences</span>
          </div>
          <h1 className="text-3xl font-display font-black text-[#37352F] tracking-tight">
            Settings Workspace
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7A78] max-w-lg leading-relaxed">
            Customize appearance values, update your user profile, and review hotkey guidelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Theme & Profile controls (7 cols) */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Theme selector section */}
            <div className="glass-card rounded-[24px] p-6 space-y-4">
              <span className="text-[10px] font-mono font-bold text-[#7A7A78] tracking-wider flex items-center gap-1.5 uppercase">
                <Palette className="w-4 h-4 text-brand-primary" />
                <span>Visual Workspace Theme Palette</span>
              </span>

              <div className="grid grid-cols-1 gap-3 pt-2">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`p-4 rounded-xl text-left border transition-all flex items-center justify-between cursor-pointer ${
                      theme === t.id 
                        ? 'bg-brand-accent-bg border-brand-primary/35 shadow-sm font-semibold' 
                        : 'bg-white border-[#E9E9E8] hover:bg-[#F7F6F3]'
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-[#37352F] block">{t.name}</span>
                      <span className="text-[10px] text-[#7A7A78] block font-sans">{t.desc}</span>
                    </div>
                    {theme === t.id && (
                      <span className="p-1 rounded-full bg-brand-primary text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 font-bold" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile editor card */}
            {user && (
              <div className="glass-card rounded-[24px] p-6 space-y-4">
                <span className="text-[10px] font-mono font-bold text-[#7A7A78] tracking-wider flex items-center gap-1.5 uppercase">
                  <UserCheck className="w-4 h-4 text-brand-primary" />
                  <span>Personal Collaborator Profile</span>
                </span>

                <form onSubmit={handleUpdate} className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold text-brand-primary block uppercase">Name handle</label>
                    <input
                      type="text"
                      required
                      value={userNameInput}
                      onChange={(e) => setUserNameInput(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E9E9E8] rounded-xl text-xs font-sans text-[#37352F] focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono font-bold text-brand-primary block uppercase">Color avatar badge</label>
                    <div className="flex flex-wrap items-center gap-2">
                      {colors.map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setUserColorInput(col)}
                          className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                            userColorInput === col ? 'border-neutral-500 scale-110' : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: col }}
                        >
                          {userColorInput === col && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="py-2.5 px-6 rounded-lg bg-brand-primary hover:bg-brand-hover text-white font-bold text-xs shadow-md cursor-pointer border border-brand-primary/5 font-sans"
                  >
                    Save Changes
                  </button>

                </form>
              </div>
            )}

          </div>

          {/* Key bindings and security alerts (5 cols) */}
          <div className="md:col-span-5 space-y-6">
            
            {/* Keyboard shortcut map */}
            <div className="glass-card rounded-[24px] p-6 space-y-4">
              <span className="text-[10px] font-mono font-bold text-[#7A7A78] tracking-wider flex items-center gap-1.5 uppercase">
                <Keyboard className="w-4 h-4 text-amber-500" />
                <span>Text Helper Hotkeys</span>
              </span>

              <div className="space-y-2 pt-2">
                {[
                  { keys: ["Ctrl", "Alt", "H"], action: "Insert main header H1" },
                  { keys: ["Ctrl", "Alt", "B"], action: "Enclose bold tags" },
                  { keys: ["Ctrl", "Alt", "C"], action: "Enclose inline code" },
                  { keys: ["Ctrl", "Alt", "L"], action: "Append bullet format list" },
                  { keys: ["Ctrl", "Alt", "S"], action: "Divide editor splits" },
                ].map((hk) => (
                  <div key={hk.action} className="flex items-center justify-between text-xs p-2 bg-white border border-[#E9E9E8] rounded-xl">
                    <span className="text-[#37352F] font-sans font-medium">{hk.action}</span>
                    <div className="flex items-center gap-1">
                      {hk.keys.map(k => (
                        <kbd key={k} className="px-1.5 py-0.5 rounded bg-[#F7F6F3] border border-[#E9E9E8] text-[9px] font-mono text-[#37352F] font-bold">
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* In-app security parameters */}
            <div className="glass-card rounded-[24px] p-5 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-teal-600">
                <Shield className="w-4 h-4" />
                <span>WORKSPACE CREDENTIALS</span>
              </div>
              <p className="text-[11px] text-[#7A7A78] leading-relaxed font-sans">
                Permissions mapping automatically restricts document manipulation according to share roles (Owner, Editor, or Viewer). Multi-user room isolation prevents connection cross-talk.
              </p>
              <div className="p-3 bg-[#F7F6F3] border border-[#E9E9E8] rounded-xl flex gap-2">
                <Info className="w-4 h-4 text-[#7A7A78] mt-0.5 flex-shrink-0" />
                <span className="text-[10px] text-[#7A7A78] leading-normal block">
                  Workspace uses local browser memory sandbox. Logouts sweep local state cache securely.
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
