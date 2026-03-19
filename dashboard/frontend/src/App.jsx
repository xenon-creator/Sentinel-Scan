import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ScanResults from './pages/ScanResults';
import ThreatAnalytics from './pages/ThreatAnalytics';
import ApiSources from './pages/ApiSources';
import Settings from './pages/Settings';

const PAGE_TITLES = {
  dashboard:  { title: 'Overview',              sub: 'Real-time threat intelligence at a glance' },
  scans:      { title: 'Scan Results',           sub: 'Comprehensive history of all scan findings' },
  analytics:  { title: 'Threat Analytics',       sub: '90-day threat landscape & risk posture analysis' },
  sources:    { title: 'API Sources',            sub: 'Manage OSINT & threat intelligence integrations' },
  settings:   { title: 'Settings',              sub: 'System preferences, alerts, and account management' },
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab]     = useState('dashboard');

  const { title, sub } = PAGE_TITLES[activeTab] ?? PAGE_TITLES.dashboard;

  return (
    <div className="min-h-screen bg-background text-gray-200">
      <Header toggleSidebar={() => setSidebarOpen(o => !o)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-20 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); if (window.innerWidth < 1024) setSidebarOpen(false); }} />
      </div>

      <main className={`transition-all duration-300 pt-16 min-h-screen ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'}`}>
        <div className="p-5 md:p-7 pb-24">
          <div className="max-w-screen-2xl mx-auto space-y-6">
            <div className="flex justify-between items-end animate-fade-in-up">
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">{title}</h1>
                <p className="text-secondary text-sm mt-1">{sub}</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-secondary px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.5)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                System Healthy&nbsp;·&nbsp;Live
              </div>
            </div>

            {activeTab === 'dashboard'  && <Dashboard />}
            {activeTab === 'scans'      && <ScanResults />}
            {activeTab === 'analytics'  && <ThreatAnalytics />}
            {activeTab === 'sources'    && <ApiSources />}
            {activeTab === 'settings'   && <Settings />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;