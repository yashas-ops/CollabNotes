import React, { useState } from "react";
import { User, Mail, KeySquare, UserCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface AuthPageProps {
  onSuccess: () => void;
}

export default function AuthPage({ onSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      let result;
      if (mode === 'login') {
        if (!email.trim() || !password.trim()) {
          setError("Please fill in all fields");
          setSubmitting(false);
          return;
        }
        result = await login(email, password);
      } else {
        if (!username.trim() || !email.trim() || !password.trim()) {
          setError("Please fill in all fields");
          setSubmitting(false);
          return;
        }
        result = await register(username, email, password);
      }

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Authentication failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative pt-24 pb-20 min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute top-20 left-40 w-64 h-64 bg-blue-100/30 rounded-full blur-[100px] opacity-65 pointer-events-none" />
      <div className="absolute bottom-20 right-40 w-80 h-80 bg-orange-100/20 rounded-full blur-[100px] opacity-65 pointer-events-none" />

      <div className="w-[92%] max-w-md relative z-10">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-display font-black text-[#37352F] tracking-tight">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-xs text-[#7A7A78] font-sans">
            {mode === 'login'
              ? 'Sign in to access your documents'
              : 'Register to start collaborating'}
          </p>
        </div>

        <div className="flex bg-[#F7F6F3] rounded-full p-1 border border-[#E9E9E8] mb-6 font-semibold text-xs text-[#7A7A78]">
          {[
            { id: 'login', label: 'Sign In' },
            { id: 'register', label: 'Register' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setError(""); setMode(tab.id as any); }}
              className={`flex-1 py-1.5 rounded-full text-center transition-all duration-300 cursor-pointer ${
                mode === tab.id
                  ? 'bg-brand-primary text-white font-bold shadow-sm'
                  : 'text-[#7A7A78] hover:text-[#37352F]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="glass-card rounded-[28px] border-[#E9E9E8] p-6 md:p-8 text-left shadow-sm bg-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-brand-primary block uppercase tracking-wider">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#7A7A78]" />
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={30}
                    placeholder="Your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#E9E9E8] rounded-xl text-sm font-sans text-[#37352F] focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-brand-primary block uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#7A7A78]" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#E9E9E8] rounded-xl text-sm font-sans text-[#37352F] focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-brand-primary block uppercase tracking-wider">Password</label>
              <div className="relative">
                <KeySquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#7A7A78]" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#E9E9E8] rounded-xl text-sm font-sans text-[#37352F] focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-700 italic font-medium p-2.5 rounded bg-red-50 border border-red-100 font-sans">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-hover text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 border border-brand-primary/5 font-sans"
            >
              <UserCheck className="w-4 h-4" />
              <span>{submitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
