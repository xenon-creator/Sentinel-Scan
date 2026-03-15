import React from 'react';
import { Shield, Bell, Search, Menu } from 'lucide-react';
const Header = ({ toggleSidebar }) => {
  return (
    <header className="h-16 bg-panel border-b border-border flex items-center justify-between px-6 fixed top-0 right-0 left-0 z-20 transition-all duration-300">
      <div className="flex items-center space-x-4">
        <button onClick={toggleSidebar} className="p-2 -ml-2 text-gray-400 hover:text-white lg:hidden">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-2">
          <Shield className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">
            Sentinel-Scan
          </span>
          <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 border border-primary/30 uppercase tracking-widest">
            Dashboard
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {}
        <div className="hidden md:flex relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Search IPs, Domains..." 
            className="bg-black/20 border border-border text-sm rounded-lg focus:ring-1 focus:ring-primary focus:border-primary block w-64 pl-10 p-2 text-gray-200 placeholder-gray-500 transition-all focus:bg-black/40"
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
             <span className="text-[10px] text-gray-500 font-mono bg-border px-1.5 py-0.5 rounded">/</span>
          </div>
        </div>
        {}
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors hover:bg-white/5 rounded-full">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border border-panel"></span>
        </button>
      </div>
    </header>
  );
};
export default Header;