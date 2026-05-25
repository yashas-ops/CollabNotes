import { motion } from "motion/react";
import { Layers, HelpCircle, GitFork, User, Settings, LogOut } from "lucide-react";
import { ActivePage, ThemeType } from "../types";

interface NavbarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  user: { _id: string; username: string; email: string } | null;
  logout: () => void;
  theme: ThemeType;
}

export default function Navbar({ activePage, setActivePage, user, logout, theme }: NavbarProps) {
  const getThemeText = () => {
    switch (theme) {
      case 'amber-sunset': return 'from-[#ea580c] to-[#f97316]';
      case 'ocean-breeze': return 'from-[#0284c7] to-[#0ea5e9]';
      case 'minimalist-gray': return 'from-gray-600 to-gray-400';
      default: return 'from-[#2383E2] to-[#2563EB]';
    }
  };

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl z-50">
      <div className="glass-card rounded-[24px] px-6 py-4 flex items-center justify-between border-[#E9E9E8] shadow-lg">
        
        {/* Cool Logo on Top Left (Matches theme, functions as a Home Button) */}
        <button
          onClick={() => setActivePage('landing')}
          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-brand-primary/20 rounded-xl px-2 py-1 transition-all duration-300"
          id="btn-home-logo"
        >
          <div className={`p-2 rounded-xl bg-gradient-to-tr ${getThemeText()} text-white shadow-md shadow-brand-primary/10 group-hover:scale-105 duration-300 flex items-center justify-center`}>
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div className="text-left hidden xs:block">
            <span className="font-display font-bold text-lg leading-none block tracking-tight text-[#37352F] group-hover:text-black">
              Collab<span className="font-bold text-brand-primary">Notes</span>
            </span>
            <span className="text-[10px] font-mono font-medium text-gray-400 block leading-none tracking-wider uppercase mt-0.5">
              Hyper-Sync v1.0
            </span>
          </div>
        </button>

        {/* Navigation Middle Options */}
        <div className="flex items-center gap-1 sm:gap-2">
          {[
            { id: 'about', label: 'About', icon: HelpCircle },
            { id: 'workflow', label: 'Workflow', icon: GitFork },
            { id: 'dashboard', label: 'Workspace', icon: Layers },
          ].map((item) => {
            const IconComponent = item.icon;
            const isActive = activePage === item.id || (item.id === 'dashboard' && activePage === 'editor');
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'dashboard' && !user) {
                    setActivePage('auth');
                  } else {
                    setActivePage(item.id as ActivePage);
                  }
                }}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full font-semibold text-xs transition-all duration-300 relative ${
                  isActive
                    ? 'text-brand-primary bg-brand-accent-bg shadow-sm border border-brand-accent-border'
                    : 'text-[#7A7A78] hover:text-[#37352F] hover:bg-black/4'
                }`}
                id={`navbar-item-${item.id}`}
              >
                <IconComponent className="w-4 h-4" />
                <span className="hidden md:inline">{item.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="active-nav-dot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-primary"
                    transition={{ type: "spring", stiffness: 300, damping: 300 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Section Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePage('settings')}
            className={`p-2 rounded-full text-[#7A7A78] hover:text-[#37352F] hover:bg-[#F7F6F3] transition-all outline-none ${
              activePage === 'settings' ? 'bg-[#E9E9E8] text-[#37352F]' : ''
            }`}
            title="Settings"
            id="btn-nav-settings"
          >
            <Settings className="w-[18px] h-[18px]" />
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <div 
                className="hidden sm:flex flex-col items-end cursor-pointer"
                onClick={() => setActivePage('dashboard')}
              >
                <span className="text-xs font-semibold text-[#37352F] leading-none">{user.username}</span>
                <span className="text-[10px] text-emerald-600 font-mono mt-0.5 leading-none font-semibold">Online</span>
              </div>
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-md border border-black/5 select-none cursor-pointer"
                style={{ backgroundColor: '#6366f1' }}
                onClick={() => setActivePage('dashboard')}
                title={user.username}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-full text-red-500 hover:text-red-650 hover:bg-red-50 transition-all cursor-pointer"
                title="Log Out"
                id="btn-nav-logout"
              >
                <LogOut className="w-[18px] h-[18px]" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActivePage('auth')}
              className="relative group overflow-hidden rounded-full py-2 px-5 font-semibold text-xs sm:text-sm tracking-wide bg-brand-primary hover:bg-brand-hover text-white transition-all shadow-md active:scale-95 cursor-pointer border border-brand-primary/10"
              id="btn-nav-signin"
            >
              <div className="flex items-center gap-1.5 relative z-10">
                <User className="w-[14px] h-[14px]" />
                <span>Sign In</span>
              </div>
            </button>
          )}
        </div>

      </div>
    </nav>
  );
}
