import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ScanResults from './pages/ScanResults';
import ThreatAnalytics from './pages/ThreatAnalytics';
import ApiSources from './pages/ApiSources';
import Settings from './pages/Settings';
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  return (
    <div className="min-h-screen bg-background text-gray-200">
      <Header toggleSidebar={toggleSidebar} />
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : ''}`}>
        <div className={`fixed inset-0 bg-black/50 z-10 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
        <div className={`fixed inset-y-0 left-0 z-20 w-64 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
           <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <main className="p-4 md:p-6 lg:p-8 mt-16 pb-20">
          <div className="max-w-screen-2xl mx-auto space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-bold text-white capitalize">
                  {activeTab === 'dashboard' ? 'Overview' : activeTab.replace('-', ' ')}
                </h1>
                <p className="text-secondary text-sm mt-1">
                  Monitor and analyze threat intelligence data
                </p>
              </div>
              <div className="hidden sm:flex text-sm text-secondary bg-panel px-4 py-2 rounded-lg border border-border">
                <span className="w-2 h-2 rounded-full bg-success mr-2 mt-1.5 animate-pulse"></span>
                System Healthy • Last updated: Just now
              </div>
            </div>
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'scans' && <ScanResults />}
            {activeTab === 'analytics' && <ThreatAnalytics />}
            {activeTab === 'sources' && <ApiSources />}
            {activeTab === 'settings' && <Settings />}
          </div>
        </main>
      </div>
    </div>
  );
}
export default App;