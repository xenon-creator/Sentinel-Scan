import React, { useState, useEffect } from 'react';
import { Shield, Bell, Search, Menu, Zap, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const Header = ({ toggleSidebar }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 flex items-center justify-between px-6 fixed top-0 right-0 left-0 z-30 bg-white/80 backdrop-blur-md border-b border-border shadow-sm"
    >
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-1 rounded-lg text-secondary hover:text-gray-900 hover:bg-gray-100 transition-all lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-md rounded-full" />
            <Shield className="w-7 h-7 text-primary relative z-10" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-gray-900">
              Sentinel<span className="text-primary">-Scan</span>
            </span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded-full border border-primary/20 uppercase tracking-widest">
            <Zap className="w-2.5 h-2.5" />
            Live
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="hidden md:flex relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-3.5 w-3.5 text-secondary group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search IPs, domains, CVEs..."
            className="bg-gray-50/50 border border-border text-sm rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary w-64 pl-9 pr-3 py-1.5 text-gray-700 placeholder-gray-400 transition-all focus:bg-white focus:w-72 outline-none"
          />
        </div>

        <div className="hidden lg:flex items-center space-x-2 bg-gray-50 border border-border rounded-lg px-3 py-1.5 shadow-sm">
          <Activity className="w-3.5 h-3.5 text-success animate-pulse" />
          <span className="text-xs font-mono text-secondary font-medium">
            {time.toLocaleTimeString('en-US', { hour12: false })}
          </span>
        </div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 text-secondary hover:text-gray-900 transition-all hover:bg-gray-100 rounded-xl group"
        >
          <Bell className="w-5 h-5 group-hover:animate-pulse" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border border-white" />
        </motion.button>
      </div>
    </motion.header>
  );
};

export default Header;