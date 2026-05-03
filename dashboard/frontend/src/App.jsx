import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ScanResults from './pages/ScanResults';
import ThreatAnalytics from './pages/ThreatAnalytics';
import ApiSources from './pages/ApiSources';
import Settings from './pages/Settings';
import { AnimatePresence, motion } from 'framer-motion';
import Background3D from './components/Background3D';

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

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-background text-gray-800 relative overflow-hidden">
      <Background3D />
      
      <Header toggleSidebar={() => setSidebarOpen(o => !o)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/10 z-10 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-20 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); if (window.innerWidth < 1024) setSidebarOpen(false); }} />
      </div>

      <main className={`transition-all duration-300 pt-16 min-h-screen relative z-10 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'}`}>
        <div className="p-5 md:p-7 pb-24">
          <div className="max-w-screen-2xl mx-auto space-y-6">
            <motion.div 
              key={`${activeTab}-header`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex justify-between items-end"
            >
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
                <p className="text-secondary text-sm mt-1">{sub}</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-secondary px-3 py-1.5 rounded-lg border border-border bg-white/50 backdrop-blur-sm shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                System Healthy&nbsp;·&nbsp;Live
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {activeTab === 'dashboard'  && <Dashboard />}
                {activeTab === 'scans'      && <ScanResults />}
                {activeTab === 'analytics'  && <ThreatAnalytics />}
                {activeTab === 'sources'    && <ApiSources />}
                {activeTab === 'settings'   && <Settings />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;