import React from 'react';
import { LayoutDashboard, ShieldAlert, Activity, Database, Settings, ActivitySquare } from 'lucide-react';
const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'scans', icon: ActivitySquare, label: 'Scan Results' },
    { id: 'analytics', icon: Activity, label: 'Threat Analytics' },
    { id: 'sources', icon: Database, label: 'API Sources' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];
  return (
    <aside className="w-64 bg-panel border-r border-border h-screen flex flex-col fixed left-0 top-0 pt-16 z-10 transition-all duration-300">
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        <div className="text-xs font-semibold text-secondary uppercase tracking-wider mb-4 px-2">
          Operations
        </div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200 group
              ${activeTab === item.id 
                ? 'bg-primary/20 text-primary' 
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
          >
            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-primary' : 'text-gray-500 group-hover:text-gray-300'}`} />
            <span className="font-medium">{item.label}</span>
            {item.id === 'dashboard' && (
               <span className="ml-auto w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
            )}
          </button>
        ))}
        <div className="mt-8 mb-4 border-t border-border pt-6">
          <div className="text-xs font-semibold text-secondary uppercase tracking-wider mb-4 px-2">
            System Status
          </div>
          <div className="px-3 py-2 bg-black/20 rounded-lg border border-border/50">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-400">Database</span>
              <span className="text-success flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-success mr-1.5 animate-pulse"></span>Online</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Scanners</span>
              <span className="text-success">5/5 Active</span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-border bg-black/10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold text-sm shadow-lg">
            A
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-200">Admin User</span>
            <span className="text-xs text-secondary">SOC Analyst</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;