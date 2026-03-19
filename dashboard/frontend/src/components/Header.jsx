import React, { useState, useEffect } from 'react';
import { Shield, Bell, Search, Menu, Zap, Activity } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-6 fixed top-0 right-0 left-0 z-30"
      style={{
        background: 'rgba(8, 13, 24, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
        boxShadow: '0 1px 0 rgba(59,130,246,0.06), 0 4px 16px rgba(0,0,0,0.4)',
      }}>
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
            <Shield className="w-7 h-7 text-primary relative z-10 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-300">
              Sentinel<span className="text-primary">-Scan</span>
            </span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded-full border border-primary/25 uppercase tracking-widest">
            <Zap className="w-2.5 h-2.5" />
            Live
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="hidden md:flex relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-3.5 w-3.5 text-gray-500 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search IPs, domains, CVEs..."
            className="bg-white/[0.04] border border-white/8 text-sm rounded-xl focus:ring-1 focus:ring-primary/60 focus:border-primary/50 w-64 pl-9 pr-3 py-1.5 text-gray-300 placeholder-gray-600 transition-all focus:bg-white/[0.06] focus:w-72 outline-none"
            style={{ borderColor: 'rgba(51,65,85,0.6)' }}
          />
        </div>

        <div className="hidden lg:flex items-center space-x-2 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-1.5">
          <Activity className="w-3.5 h-3.5 text-success animate-pulse" />
          <span className="text-xs font-mono text-gray-400">
            {time.toLocaleTimeString('en-US', { hour12: false })}
          </span>
        </div>

        <button className="relative p-2 text-gray-400 hover:text-white transition-all hover:bg-white/5 rounded-xl group">
          <Bell className="w-5 h-5 group-hover:animate-pulse" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border border-panel shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
        </button>
      </div>
    </header>
  );
};

export default Header;