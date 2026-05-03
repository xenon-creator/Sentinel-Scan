import React, { useState, useEffect } from 'react';
import { fetchApiStatus } from '../api';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const ApiSources = () => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApiStatus()
      .then(data => { setSources(data); setLoading(false); })
      .catch(() => {
        setSources([
          { id: 'abuseipdb', name: 'AbuseIPDB', description: 'IP reputation & crowdsourced abuse reporting.', logo: '🛡️', endpoint: 'https://api.abuseipdb.com/api/v2/check', configured: true, api_key_env: 'ABUSEIPDB_API_KEY' },
          { id: 'virustotal', name: 'VirusTotal', description: 'Analyze IPs, domains, files and URLs with 70+ AV engines.', logo: '🔍', endpoint: 'https://www.virustotal.com/api/v3/', configured: true, api_key_env: 'VIRUSTOTAL_API_KEY' },
          { id: 'nvd', name: 'NVD (NIST)', description: 'National Vulnerability Database — CVE detail & CVSS scores.', logo: '📜', endpoint: 'https://services.nvd.nist.gov/rest/json/cves/2.0', configured: true, api_key_env: 'NVD_API_KEY' },
          { id: 'osv', name: 'OSV (Google)', description: 'Open-source vulnerability database — no key required.', logo: '🧬', endpoint: 'https://api.osv.dev/v1/query', configured: true, api_key_env: null },
        ]);
        setLoading(false);
      });
  }, []);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="bg-white/80 border border-border rounded-xl p-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mt-10 -mr-10" />
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Threat Intelligence Integrations</h2>
            <p className="text-secondary text-sm font-medium">
              Active OSINT & API feeds enriching scan findings automatically.
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
            {sources.filter(s => s.configured).length} / {sources.length} Active
          </div>
        </div>
      </motion.div>

      {loading ? (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-60 bg-white/50 border border-border rounded-xl" />
          ))}
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {sources.map(source => (
            <motion.div 
              whileHover={{ y: -5 }}
              key={source.id} 
              className="bg-white/80 border border-border rounded-xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="text-3xl bg-gray-50 w-12 h-12 rounded-xl flex items-center justify-center border border-border">
                    {source.logo}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${
                    source.configured
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    : 'bg-red-50 text-red-600 border border-red-100'
                  }`}>
                    {source.configured ? 'Active' : 'Not Configured'}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{source.name}</h3>
                <p className="text-sm text-secondary mb-4 font-medium">{source.description}</p>
              </div>
              <div className="border-t border-border pt-4 mt-auto space-y-3">
                <div className="text-xs text-gray-500 font-mono truncate bg-gray-50 p-1.5 rounded" title={source.endpoint}>
                  {source.endpoint}
                </div>
                {source.api_key_env && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <code className="text-gray-600 font-medium">{source.api_key_env}</code>
                    <span className="text-emerald-600 font-bold ml-auto">Loaded ✓</span>
                  </div>
                )}
                {!source.api_key_env && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    No API key needed
                  </div>
                )}
                <a
                  href={source.endpoint}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-2 rounded-lg text-sm font-bold text-center transition-colors bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-100"
                >
                  View API Docs →
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="bg-white/80 border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4">How Enrichment Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: '1', label: 'Scan Runs', desc: 'A target is scanned and findings are saved to the database.' },
            { step: '2', label: 'Auto-Enrich', desc: 'Each finding\'s IP, domain or CVE is sent to all configured APIs.' },
            { step: '3', label: 'Data Cached', desc: 'Enrichment results are stored in MongoDB against the finding.' },
            { step: '4', label: 'Dashboard', desc: 'Click any finding to see live abuse scores, VT votes & CVE details.' },
          ].map(item => (
            <div key={item.step} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                {item.step}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{item.label}</p>
                <p className="text-xs text-secondary mt-0.5 font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ApiSources;