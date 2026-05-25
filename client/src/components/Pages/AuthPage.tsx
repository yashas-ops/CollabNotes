import React, { useState } from "react";
import { User, Mail, ShieldCheck, Sparkles, UserCheck, KeySquare } from "lucide-react";
import { UserSession } from "../../types";

interface AuthPageProps {
  onSuccess: (session: UserSession) => void;
}

export default function AuthPage({ onSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'guest'>('guest');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickName, setNickName] = useState("");
  const [error, setError] = useState("");

  const guestAvatars = [
    { name: "Sunny Amber", color: "#F59E0B" },
    { name: "Cyan Spark", color: "#06B6D4" },
    { name: "Aero Blue", color: "#3B82F6" },
    { name: "Sarah Forest", color: "#10B981" },
    { name: "Purple Dream", color: "#A855F7" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === 'guest') {
      const nameToSubmit = nickName.trim();
      if (!nameToSubmit) {
        setError("Please pick a guest nickname or name");
        return;
      }
      
      const randomAvatar = guestAvatars[Math.floor(Math.random() * guestAvatars.length)];

      onSuccess({
        userId: "usr-guest-" + Math.random().toString(36).substr(2, 6),
        userName: nameToSubmit,
        userColor: randomAvatar.color,
      });
    } else {
      if (!email.trim() || !password.trim()) {
        setError("Please complete all requested input parameters");
        return;
      }

      onSuccess({
        userId: "usr-member-" + Math.random().toString(36).substr(2, 6),
        userName: email.split('@')[0],
        userColor: "#2383E2", 
        email: email,
      });
    }
  };

  return (
    <div className="relative pt-24 pb-20 min-h-screen flex flex-col items-center justify-center overflow-hidden">
      
      {/* Background radial overlays */}
      <div className="absolute top-20 left-40 w-64 h-64 bg-blue-100/30 rounded-full blur-[100px] opacity-65 pointer-events-none" />
      <div className="absolute bottom-20 right-40 w-80 h-80 bg-orange-100/20 rounded-full blur-[100px] opacity-65 pointer-events-none" />

      <div className="w-[92%] max-w-md relative z-10">
        
        {/* Page title inside */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-display font-black text-[#37352F] tracking-tight">
            Secure Member Sync
          </h1>
          <p className="text-xs text-[#7A7A78] font-sans">
            Choose to sign in as an active member or enter immediately via guest nickname credentials.
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-[#F7F6F3] rounded-full p-1 border border-[#E9E9E8] mb-6 font-semibold text-xs text-[#7A7A78]">
          {[
            { id: 'guest', label: 'Guest Access' },
            { id: 'login', label: 'Email Sign In' },
            { id: 'register', label: 'New Register' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setError("");
                setMode(tab.id as any);
              }}
              className={`flex-1 py-1.5 rounded-full text-center transition-all duration-300 cursor-pointer ${
                mode === tab.id 
                  ? 'bg-brand-primary text-white font-bold shadow-sm' 
                  : 'text-[#7A7A78] hover:text-[#37352F] hover:bg-black/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Auth form Card */}
        <div className="glass-card rounded-[28px] border-[#E9E9E8] p-6 md:p-8 text-left shadow-sm relative overflow-hidden bg-white">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === 'guest' ? (
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-brand-primary block uppercase tracking-wider">
                  Guest Nickname
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#7A7A78]" />
                  <input
                    type="text"
                    required
                    maxLength={16}
                    placeholder="Enter nickname (e.g., Alex, Guest Sarah)"
                    value={nickName}
                    onChange={(e) => setNickName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#E9E9E8] rounded-xl text-sm font-sans text-[#37352F] focus:outline-none focus:border-brand-primary transition-all"
                  />
                </div>
                <span className="text-[10px] text-[#7A7A78] block pt-1 leading-normal font-sans">
                  Guest avatars randomly select bright accent colors. No passwords required.
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Email line */}
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold text-brand-primary block uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#7A7A78]" />
                    <input
                      type="email"
                      required
                      placeholder="you@collabnotes.io"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-[#E9E9E8] rounded-xl text-sm font-sans text-[#37352F] focus:outline-none focus:border-brand-primary transition-all"
                    />
                  </div>
                </div>

                {/* Password line */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold text-brand-primary block uppercase tracking-wider">
                      Password Code
                    </label>
                    {mode === 'login' && (
                      <button type="button" className="text-[10px] text-brand-primary hover:underline font-sans font-medium">
                        Forgot key?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <KeySquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#7A7A78]" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-[#E9E9E8] rounded-xl text-sm font-sans text-[#37352F] focus:outline-none focus:border-brand-primary transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-xs text-red-700 italic font-medium p-2.5 rounded bg-red-50 border border-red-100 font-sans">
                {error}
              </div>
            )}

            {/* Submit handle button */}
            <button
              type="submit"
              className="w-full mt-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-hover text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 border border-brand-primary/5 font-sans"
            >
              <UserCheck className="w-4 h-4" />
              <span>{mode === 'guest' ? 'Join Workspace Guest' : mode === 'login' ? 'Proceed Member Login' : 'Register Free Account'}</span>
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}
