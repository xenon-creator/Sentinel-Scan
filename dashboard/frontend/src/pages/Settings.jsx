import React, { useState } from 'react';
const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="bg-panel border border-border rounded-xl overflow-hidden p-2">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'general' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              General Configuration
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'notifications' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              Alerts & Notifications
            </button>
            <button
               onClick={() => setActiveTab('account')}
               className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                 activeTab === 'account' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
               }`}
            >
              Account Management
            </button>
          </nav>
        </div>
      </div>
      {}
      <div className="flex-1">
        <div className="bg-panel border border-border rounded-xl p-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mt-10 -mr-10"></div>
           {activeTab === 'general' && (
             <div className="space-y-6 relative z-10">
               <div>
                 <h2 className="text-lg font-bold text-white mb-4">System Preferences</h2>
                 <div className="space-y-5">
                   <div className="flex items-center justify-between border-b border-border/50 pb-5">
                     <div>
                       <label className="text-sm font-medium text-gray-200">Dark Mode</label>
                       <p className="text-xs text-secondary mt-1">Use the dark theme for the interface.</p>
                     </div>
                     <div className="w-11 h-6 bg-primary rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></div>
                     </div>
                   </div>
                   <div className="flex items-center justify-between border-b border-border/50 pb-5">
                     <div>
                       <label className="text-sm font-medium text-gray-200">Auto-refresh Dashboard</label>
                       <p className="text-xs text-secondary mt-1">Automatically poll for new scan data every 60s.</p>
                     </div>
                     <div className="w-11 h-6 bg-primary rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></div>
                     </div>
                   </div>
                   <div className="flex flex-col border-b border-border/50 pb-5">
                     <label className="text-sm font-medium text-gray-200 mb-2">Default Risk Threshold</label>
                     <p className="text-xs text-secondary mb-3">Minimum score required to classify a finding as "Suspicious"</p>
                     <input type="range" min="0" max="100" defaultValue="40" className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer" />
                     <div className="flex justify-between text-xs text-gray-500 mt-2">
                       <span>Low</span>
                       <span>Medium (40)</span>
                       <span>High</span>
                     </div>
                   </div>
                 </div>
               </div>
               <div className="pt-4 flex justify-end">
                  <button className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm transition-colors">
                    Save Changes
                  </button>
               </div>
             </div>
           )}
           {activeTab === 'notifications' && (
              <div className="space-y-6 relative z-10">
                 <h2 className="text-lg font-bold text-white mb-4">Alert Preferences</h2>
                 <p className="text-secondary text-sm mb-6">Configure how you receive security alerts from Sentinel-Scan.</p>
                 <div className="space-y-4">
                    <div className="p-4 border border-border/50 rounded-lg bg-black/20 flex items-start space-x-4">
                       <input type="checkbox" defaultChecked className="mt-1 flex-shrink-0" />
                       <div>
                          <p className="text-sm font-medium text-gray-200">Critical Threat Alerts</p>
                          <p className="text-xs text-secondary">Receive immediate alerts when a Critical risk is detected.</p>
                       </div>
                    </div>
                    <div className="p-4 border border-border/50 rounded-lg bg-black/20 flex items-start space-x-4">
                       <input type="checkbox" defaultChecked className="mt-1 flex-shrink-0" />
                       <div>
                          <p className="text-sm font-medium text-gray-200">Daily Digest Email</p>
                          <p className="text-xs text-secondary">Summary of all scan activity sent at 08:00 UTC.</p>
                       </div>
                    </div>
                    <div className="p-4 border border-border/50 rounded-lg bg-black/20 flex items-start space-x-4">
                       <input type="checkbox" className="mt-1 flex-shrink-0" />
                       <div>
                          <p className="text-sm font-medium text-gray-200">Slack Webhook Integration</p>
                          <p className="text-xs text-secondary">Push notifications directly to SOC channels.</p>
                       </div>
                    </div>
                 </div>
              </div>
           )}
           {activeTab === 'account' && (
              <div className="space-y-6 relative z-10">
                 <h2 className="text-lg font-bold text-white mb-4">Profile & Access</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-xs text-secondary mb-1">Display Name</label>
                        <input type="text" defaultValue="Admin User" className="w-full bg-black/30 border border-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-primary" />
                    </div>
                    <div>
                        <label className="block text-xs text-secondary mb-1">Email Address</label>
                        <input type="email" defaultValue="soc-admin@sentinel.local" className="w-full bg-black/30 border border-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-primary" />
                    </div>
                 </div>
                 <div className="border-t border-border pt-6">
                    <h3 className="text-sm font-bold text-red-400 mb-2">Danger Zone</h3>
                    <p className="text-xs text-gray-500 mb-4">Irreversible actions taking destructive effects.</p>
                    <button className="px-4 py-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-lg text-sm transition-colors">
                      Purge All Scan Data
                    </button>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};
export default Settings;