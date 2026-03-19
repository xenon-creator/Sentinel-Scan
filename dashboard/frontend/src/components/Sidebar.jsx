import React from 'react';
import { LayoutDashboard, ShieldAlert, Activity, Database, Settings, ActivitySquare, ChevronRight } from 'lucide-react';

const menuItems = [
  { id: 'dashboard',  icon: LayoutDashboard,  label: 'Dashboard',         badge: null },
  { id: 'scans',      icon: ActivitySquare,    label: 'Scan Results',      badge: null },
  { id: 'analytics',  icon: Activity,          label: 'Threat Analytics',  badge: null },
  { id: 'sources',    icon: Database,          label: 'API Sources',       badge: '4'  },
  { id: 'settings',   icon: Settings,          label: 'Settings',          badge: null },
];

const Sidebar = ({ activeTab, setActiveTab }) => (
  <aside
    className="w-64 h-screen flex flex-col fixed left-0 top-0 pt-16 z-20"
    style={{
      background: 'rgba(8, 13, 24, 0.95)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRight: '1px solid rgba(51, 65, 85, 0.4)',
    }}
  >
    <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-3 mb-3">
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
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
              }`}
            style={active ? {
              background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(14,165,233,0.1))',
              border: '1px solid rgba(59,130,246,0.25)',
              boxShadow: '0 0 16px rgba(59,130,246,0.1)',
            } : { border: '1px solid transparent' }}
          >
            {active && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-r-full" />
            )}
            <item.icon className={`w-4.5 h-4.5 flex-shrink-0 transition-colors ${active ? 'text-primary drop-shadow-[0_0_6px_rgba(59,130,246,0.8)]' : 'text-gray-500 group-hover:text-gray-300'}`} style={{ width: '1.1rem', height: '1.1rem' }} />
            <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span className="text-[10px] font-bold bg-primary/20 text-primary border border-primary/30 rounded-full px-1.5 py-0.5 leading-none">
                {item.badge}
              </span>
            )}
            {active && <ChevronRight className="w-3.5 h-3.5 text-primary/50 flex-shrink-0" />}
          </button>
        );
      })}

      <div className="mt-6 pt-5 border-t" style={{ borderColor: 'rgba(51,65,85,0.4)' }}>
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-3 mb-3">
          System Health
        </p>

        <div className="mx-0 p-3 rounded-xl space-y-2.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(51,65,85,0.4)' }}>
          {[
            { label: 'MongoDB', status: 'Online', ok: true },
            { label: 'Redis Cache', status: 'Online', ok: true },
            { label: 'Scanners', status: '5/5 Active', ok: true },
          ].map(({ label, status, ok }) => (
            <div key={label} className="flex items-center justify-between text-xs">
              <span className="text-gray-500">{label}</span>
              <span className={`flex items-center gap-1 font-medium ${ok ? 'text-success' : 'text-danger'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-success animate-pulse' : 'bg-danger'}`} />
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="p-4" style={{ borderTop: '1px solid rgba(51,65,85,0.4)' }}>
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary via-accent to-blue-400 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_12px_rgba(59,130,246,0.4)] flex-shrink-0">
          A
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-gray-100 truncate">Admin User</span>
          <span className="text-xs text-secondary truncate">SOC Analyst</span>
        </div>
      </div>
    </div>
  </aside>
);

export default Sidebar;