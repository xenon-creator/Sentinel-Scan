import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white/80 border border-border rounded-xl overflow-hidden p-2 shadow-sm">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                activeTab === 'general' ? 'bg-primary/10 text-primary' : 'text-secondary hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              General Configuration
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                activeTab === 'notifications' ? 'bg-primary/10 text-primary' : 'text-secondary hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              Alerts & Notifications
            </button>
            <button
               onClick={() => setActiveTab('account')}
               className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                 activeTab === 'account' ? 'bg-primary/10 text-primary' : 'text-secondary hover:bg-gray-50 hover:text-gray-900'
               }`}
            >
              Account Management
            </button>
          </nav>
        </div>
      </div>
      <div className="flex-1">
        <div className="bg-white/80 border border-border rounded-xl p-6 relative overflow-hidden shadow-sm min-h-[400px]">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mt-10 -mr-10"></div>
           <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, x: 10 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -10 }}
               transition={{ duration: 0.2 }}
               className="relative z-10"
             >
               {activeTab === 'general' && (
                 <div className="space-y-6">
                   <div>
                     <h2 className="text-lg font-bold text-gray-900 mb-4">System Preferences</h2>
                     <div className="space-y-5">
                       <div className="flex items-center justify-between border-b border-border pb-5">
                         <div>
                           <label className="text-sm font-bold text-gray-800">Dark Mode</label>
                           <p className="text-xs text-secondary mt-1 font-medium">Use the dark theme for the interface.</p>
                         </div>
                         <div className="w-11 h-6 bg-gray-200 rounded-full relative cursor-pointer border border-border shadow-inner">
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform shadow"></div>
                         </div>
                       </div>
                       <div className="flex items-center justify-between border-b border-border pb-5">
                         <div>
                           <label className="text-sm font-bold text-gray-800">Auto-refresh Dashboard</label>
                           <p className="text-xs text-secondary mt-1 font-medium">Automatically poll for new scan data every 60s.</p>
                         </div>
                         <div className="w-11 h-6 bg-primary rounded-full relative cursor-pointer shadow-inner">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform shadow"></div>
                         </div>
                       </div>
                       <div className="flex flex-col border-b border-border pb-5">
                         <label className="text-sm font-bold text-gray-800 mb-2">Default Risk Threshold</label>
                         <p className="text-xs text-secondary mb-3 font-medium">Minimum score required to classify a finding as "Suspicious"</p>
                         <input type="range" min="0" max="100" defaultValue="40" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                         <div className="flex justify-between text-xs text-gray-500 font-bold mt-2">
                           <span>Low</span>
                           <span>Medium (40)</span>
                           <span>High</span>
                         </div>
                       </div>
                     </div>
                   </div>
                   <div className="pt-4 flex justify-end">
                      <button className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm transition-colors">
                        Save Changes
                      </button>
                   </div>
                 </div>
               )}
               {activeTab === 'notifications' && (
                  <div className="space-y-6">
                     <h2 className="text-lg font-bold text-gray-900 mb-4">Alert Preferences</h2>
                     <p className="text-secondary text-sm mb-6 font-medium">Configure how you receive security alerts from Sentinel-Scan.</p>
                     <div className="space-y-4">
                        <div className="p-4 border border-border rounded-lg bg-gray-50 flex items-start space-x-4">
                           <input type="checkbox" defaultChecked className="mt-1 flex-shrink-0 w-4 h-4 text-primary rounded border-gray-300" />
                           <div>
                              <p className="text-sm font-bold text-gray-800">Critical Threat Alerts</p>
                              <p className="text-xs text-secondary font-medium">Receive immediate alerts when a Critical risk is detected.</p>
                           </div>
                        </div>
                        <div className="p-4 border border-border rounded-lg bg-gray-50 flex items-start space-x-4">
                           <input type="checkbox" defaultChecked className="mt-1 flex-shrink-0 w-4 h-4 text-primary rounded border-gray-300" />
                           <div>
                              <p className="text-sm font-bold text-gray-800">Daily Digest Email</p>
                              <p className="text-xs text-secondary font-medium">Summary of all scan activity sent at 08:00 UTC.</p>
                           </div>
                        </div>
                        <div className="p-4 border border-border rounded-lg bg-gray-50 flex items-start space-x-4">
                           <input type="checkbox" className="mt-1 flex-shrink-0 w-4 h-4 text-primary rounded border-gray-300" />
                           <div>
                              <p className="text-sm font-bold text-gray-800">Slack Webhook Integration</p>
                              <p className="text-xs text-secondary font-medium">Push notifications directly to SOC channels.</p>
                           </div>
                        </div>
                     </div>
                  </div>
               )}
               {activeTab === 'account' && (
                  <div className="space-y-6">
                     <h2 className="text-lg font-bold text-gray-900 mb-4">Profile & Access</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-secondary mb-1">Display Name</label>
                            <input type="text" defaultValue="Admin User" className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-secondary mb-1">Email Address</label>
                            <input type="email" defaultValue="soc-admin@sentinel.local" className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                        </div>
                     </div>
                     <div className="border-t border-border pt-6">
                        <h3 className="text-sm font-bold text-red-600 mb-2">Danger Zone</h3>
                        <p className="text-xs text-gray-500 font-medium mb-4">Irreversible actions taking destructive effects.</p>
                        <button className="px-4 py-2 bg-red-50 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white font-bold rounded-lg text-sm transition-colors">
                          Purge All Scan Data
                        </button>
                     </div>
                  </div>
               )}
             </motion.div>
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
export default Settings;