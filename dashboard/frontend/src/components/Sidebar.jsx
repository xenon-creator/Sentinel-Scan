import React from 'react';
import { LayoutDashboard, ShieldAlert, Activity, Database, Settings, ActivitySquare, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const menuItems = [
  { id: 'dashboard',  icon: LayoutDashboard,  label: 'Dashboard',         badge: null },
  { id: 'scans',      icon: ActivitySquare,    label: 'Scan Results',      badge: null },
  { id: 'analytics',  icon: Activity,          label: 'Threat Analytics',  badge: null },
  { id: 'sources',    icon: Database,          label: 'API Sources',       badge: '4'  },
  { id: 'settings',   icon: Settings,          label: 'Settings',          badge: null },
];

const Sidebar = ({ activeTab, setActiveTab }) => (
  <motion.aside
    initial={{ x: -50, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    className="w-64 h-screen flex flex-col fixed left-0 top-0 pt-16 z-20 bg-white/90 backdrop-blur-xl border-r border-border shadow-sm"
  >
    <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-3">
        Navigation
      </p>

      {menuItems.map((item) => {
        const active = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden
              ${active
                ? 'text-primary bg-primary/5 border border-primary/10 shadow-sm'
                : 'text-secondary hover:text-gray-900 hover:bg-gray-50 border border-transparent'
              }`}
          >
            {active && (
              <motion.span layoutId="active-pill" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
            )}
            <item.icon className={`w-4.5 h-4.5 flex-shrink-0 transition-colors ${active ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'}`} style={{ width: '1.1rem', height: '1.1rem' }} />
            <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 rounded-full px-1.5 py-0.5 leading-none shadow-sm">
                {item.badge}
              </span>
            )}
            {active && <ChevronRight className="w-3.5 h-3.5 text-primary/50 flex-shrink-0" />}
          </button>
        );
      })}

      <div className="mt-6 pt-5 border-t border-border">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-3">
          System Health
        </p>

        <div className="mx-0 p-3 rounded-xl space-y-2.5 bg-gray-50 border border-border shadow-sm">
          {[
            { label: 'MongoDB', status: 'Online', ok: true },
            { label: 'Redis Cache', status: 'Online', ok: true },
            { label: 'Scanners', status: '5/5 Active', ok: true },
          ].map(({ label, status, ok }) => (
            <div key={label} className="flex items-center justify-between text-xs">
              <span className="text-secondary font-medium">{label}</span>
              <span className={`flex items-center gap-1 font-medium ${ok ? 'text-success' : 'text-danger'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-success animate-pulse' : 'bg-danger'}`} />
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="p-4 border-t border-border bg-gray-50/50">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
          A
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-gray-900 truncate">Admin User</span>
          <span className="text-xs text-secondary truncate font-medium">SOC Analyst</span>
        </div>
      </div>
    </div>
  </motion.aside>
);

export default Sidebar;