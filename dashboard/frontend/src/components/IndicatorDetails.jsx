import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Shield, Server, Box, Globe, Activity } from 'lucide-react';
import { fetchIndicatorDetails } from '../api';
import { format } from 'date-fns';
const IndicatorDetails = ({ indicatorId, onClose }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (indicatorId) {
      setLoading(true);
      fetchIndicatorDetails(indicatorId)
        .then(data => {
          setDetails(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to load indicator details:", err);
          setLoading(false);
        });
    }
  }, [indicatorId]);
  if (!indicatorId) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={onClose}></div>
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-panel border-l border-border shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out">
        {}
        <div className="sticky top-0 bg-panel/95 backdrop-blur z-10 border-b border-border p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center">
              <Shield className="w-6 h-6 mr-2 text-primary" />
              Indicator Analysis
            </h2>
            <p className="text-sm text-secondary mt-1 tracking-wide uppercase font-semibold">
              ID: {indicatorId.substring(0, 8)}...
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-black/20 hover:bg-white/10 rounded-full transition-colors border border-border"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="space-y-6 animate-pulse">
               <div className="h-24 bg-border/50 rounded-xl"></div>
               <div className="h-64 bg-border/30 rounded-xl"></div>
               <div className="h-40 bg-border/30 rounded-xl"></div>
            </div>
          ) : details ? (
            <>
              {}
              <div className="glass-panel p-6 relative overflow-hidden flex flex-col items-center justify-center border-t-4 border-t-primary">
                {}
                <div className={`absolute inset-0 bg-gradient-to-b ${
                  details.classification === 'Malicious' ? 'from-danger/20' : 
                  details.classification === 'Suspicious' ? 'from-warning/20' : 'from-success/20'
                } to-transparent opacity-50`}></div>
                <div className="relative z-10 text-center">
                  <h1 className="text-4xl font-mono font-bold text-white mb-2">{details.indicator}</h1>
                  <div className="flex items-center justify-center space-x-3 mb-4">
                     <span className={`badge ${
                        details.classification === 'Malicious' ? 'badge-danger' : 
                        details.classification === 'Suspicious' ? 'badge-warning' : 'badge-success'
                      } px-3 py-1.5 text-sm`}>
                        {details.classification.toUpperCase()}
                      </span>
                     <span className="text-white font-semibold flex items-center bg-black/30 px-3 py-1.5 rounded-full border border-border text-sm">
                       Score: {details.threat_score}/100
                     </span>
                  </div>
                  <p className="text-secondary">{details.title}</p>
                </div>
              </div>
              {}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 p-4 rounded-xl border border-border flex items-start space-x-3">
                  <Activity className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="block text-xs text-secondary uppercase tracking-wider mb-1">Time Detected</span>
                    <span className="text-gray-200 text-sm font-medium">
                      {details.timestamp ? format(new Date(details.timestamp), 'MMM dd, yyyy HH:mm:ss') : 'Unknown'}
                    </span>
                  </div>
                </div>
                <div className="bg-black/20 p-4 rounded-xl border border-border flex items-start space-x-3">
                  <Box className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="block text-xs text-secondary uppercase tracking-wider mb-1">Severity / Scan Status</span>
                    <span className="text-gray-200 text-sm font-medium capitalize flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                          details.severity === 'critical' || details.severity === 'high' ? 'bg-danger' : 
                          details.severity === 'medium' || details.severity === 'low' ? 'bg-warning' : 'bg-success'
                      }`}></span>
                      {details.severity} / {details.scan_status}
                    </span>
                  </div>
                </div>
                {details.port && (
                  <div className="bg-black/20 p-4 rounded-xl border border-border flex items-start space-x-3 col-span-2">
                    <Server className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <span className="block text-xs text-secondary uppercase tracking-wider mb-1">Service Analysis</span>
                      <span className="text-gray-200 text-sm font-medium">
                        Port {details.port}/{details.protocol || 'tcp'} detected open.
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {}
              {details.description && (
                <div className="glass-panel p-5 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                  <h3 className="text-sm font-semibold text-white mb-2 flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-primary" />
                    Finding Description
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {details.description}
                  </p>
                </div>
              )}
              {}
              {details.raw_data && (
                <div className="glass-panel overflow-hidden">
                  <div className="p-4 border-b border-border bg-black/40 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-white flex items-center">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Raw API Responses
                    </h3>
                  </div>
                  <div className="p-4 bg-[#0a0f18] overflow-x-auto max-h-96">
                    <pre className="text-xs text-gray-300 font-mono">
                      {JSON.stringify(details.raw_data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Shield className="w-16 h-16 mb-4 opacity-20" />
              <p>Details not available</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default IndicatorDetails;