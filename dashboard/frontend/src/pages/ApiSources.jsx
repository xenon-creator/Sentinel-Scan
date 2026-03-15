import React, { useState } from 'react';
const ApiSources = () => {
  const [sources, setSources] = useState([
    {
      id: 'virustotal',
      name: 'VirusTotal',
      description: 'Analyze suspicious files, domains, IPs, and URLs.',
      status: 'connected',
      lastSync: '10 mins ago',
      apiKey: '••••••••••••••••••••••••••••58f2',
      logo: '🛡️'
    },
    {
      id: 'abuseipdb',
      name: 'AbuseIPDB',
      description: 'Check IP addresses against crowdsourced blocklists.',
      status: 'connected',
      lastSync: '1 hour ago',
      apiKey: '••••••••••••••••••••••••••••a1b9',
      logo: '🌐'
    },
    {
      id: 'shodan',
      name: 'Shodan',
      description: 'Discover vulnerabilities for Internet-connected devices.',
      status: 'disconnected',
      lastSync: 'Never',
      apiKey: '',
      logo: '👁️'
    },
    {
      id: 'alienvault',
      name: 'AlienVault OTX',
      description: 'Open Threat Exchange community-driven intelligence.',
      status: 'connected',
      lastSync: '5 mins ago',
      apiKey: '••••••••••••••••••••••••••••d90c',
      logo: '👽'
    }
  ]);
  const toggleStatus = (id) => {
    setSources(sources.map(s => {
      if (s.id === id) {
        return { ...s, status: s.status === 'connected' ? 'disconnected' : 'connected' };
      }
      return s;
    }));
  };
  return (
    <div className="space-y-6">
      <div className="bg-panel border border-border rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -mt-10 -mr-10"></div>
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Threat Intelligence Integrations</h2>
            <p className="text-secondary text-sm">
               Configure External OSINT and API feeds to enrich scan data automatically.
            </p>
          </div>
          <button className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm transition-colors shadow-lg">
             Add Custom Feed
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
         {sources.map(source => (
           <div key={source.id} className="bg-panel border border-border rounded-xl p-6 flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-xl group">
             <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="text-3xl bg-black/20 w-12 h-12 rounded-xl flex items-center justify-center border border-white/5">
                    {source.logo}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-semibold ${
                    source.status === 'connected' 
                    ? 'bg-success/20 text-success border border-success/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {source.status === 'connected' ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-100 mb-2">{source.name}</h3>
                <p className="text-sm text-secondary mb-6">{source.description}</p>
             </div>
             <div className="border-t border-border pt-4 mt-auto">
               <div className="flex justify-between items-center text-xs mb-3">
                 <span className="text-gray-500">API Key</span>
                 <span className="text-gray-400 font-mono">{source.apiKey || 'Not configured'}</span>
               </div>
               <div className="flex justify-between items-center text-xs mb-4">
                 <span className="text-gray-500">Last Sync</span>
                 <span className="text-gray-400">{source.lastSync}</span>
               </div>
               <button 
                onClick={() => toggleStatus(source.id)}
                className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                 source.status === 'connected'
                 ? 'bg-black/30 text-gray-400 hover:bg-red-500/20 hover:text-red-400 border border-transparent hover:border-red-500/30'
                 : 'bg-primary/20 text-primary hover:bg-primary hover:text-white border border-primary/30'
               }`}>
                 {source.status === 'connected' ? 'Disconnect' : 'Connect'}
               </button>
             </div>
           </div>
         ))}
      </div>
    </div>
  );
};
export default ApiSources;