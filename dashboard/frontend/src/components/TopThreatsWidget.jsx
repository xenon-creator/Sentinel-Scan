import React from 'react';
import { AlertTriangle, ChevronRight, Flame } from 'lucide-react';

const TopThreatsWidget = ({ threats, loading, onThreatClick }) => {
  if (loading) {
    return (
      <div className="glass-panel p-5 bg-white/50">
        <div className="skeleton h-5 w-40 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton w-8 h-8 rounded-full" />
              <div className="flex-1">
                <div className="skeleton h-3.5 w-32 rounded mb-1.5" />
                <div className="skeleton h-2.5 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-5 flex flex-col bg-white/80" style={{ minHeight: 380 }}>
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Flame className="w-4 h-4 text-danger" />
            Top Malicious Targets
          </h3>
          <p className="text-xs text-secondary mt-0.5 font-medium">Most frequently detected</p>
        </div>
        <button className="text-[11px] text-primary hover:text-blue-600 transition-colors font-bold">View All →</button>
      </div>

      <div className="flex-1 space-y-2">
        {threats && threats.length > 0 ? (
          threats.map((threat, idx) => (
            <div
              key={idx}
              onClick={() => onThreatClick?.(threat.finding_id)}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer group transition-all hover:bg-gray-50/80"
              style={{ border: '1px solid transparent' }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626' }}>
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs text-gray-800 font-medium truncate group-hover:text-primary transition-colors">
                  {threat.indicator}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-red-600 font-bold">Score {Math.round(threat.threat_score)}</span>
                  <span className="text-gray-300 text-[10px]">•</span>
                  <span className="text-[10px] text-gray-500 font-medium">{threat.times_detected}× detected</span>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </div>
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-10 text-gray-400">
            <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm font-medium">No major threats detected</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopThreatsWidget;