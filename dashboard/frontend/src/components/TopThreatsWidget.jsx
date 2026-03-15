import React from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
const TopThreatsWidget = ({ threats, loading, onThreatClick }) => {
  if (loading) {
    return (
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Top Threats</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="animate-pulse flex justify-between items-center">
               <div className="w-1/2 h-4 bg-border rounded"></div>
               <div className="w-8 h-4 bg-border/50 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="glass-panel p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <AlertTriangle className="w-5 h-5 text-danger mr-2" />
            Top Malicious Targets
          </h3>
          <p className="text-secondary text-sm">Most frequently detected</p>
        </div>
        <button className="text-xs text-primary hover:text-white transition-colors">View All</button>
      </div>
      <div className="flex-1 space-y-4">
        {threats && threats.length > 0 ? (
          threats.map((threat, idx) => (
            <div 
              key={idx} 
              onClick={() => onThreatClick && threat.finding_id && onThreatClick(threat.finding_id)}
              className="group flex items-center justify-between p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-border transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-3 w-full">
                <div className="w-8 h-8 rounded-full bg-danger/10 text-danger flex items-center justify-center font-bold text-xs border border-danger/20">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm text-gray-200 truncate group-hover:text-primary transition-colors">
                    {threat.indicator}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mt-0.5 space-x-2">
                    <span className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-danger mr-1"></span>
                      Score: {Math.round(threat.threat_score)}
                    </span>
                    <span>•</span>
                    <span>{threat.times_detected} hits</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>No major threats detected.</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default TopThreatsWidget;