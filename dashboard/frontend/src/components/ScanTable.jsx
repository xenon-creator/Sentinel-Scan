import React, { useState } from 'react';
import { Search, Filter, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const CLASS_STYLES = {
  Malicious: 'badge badge-danger',
  Suspicious: 'badge badge-warning',
  Safe: 'badge badge-success',
};

const SCORE_COLOR = (s) =>
  s >= 70 ? '#ef4444' : s >= 40 ? '#f59e0b' : '#10b981';

const ScanTable = ({ scans, loading, onRowClick }) => {
  const [search, setSearch] = useState('');

  if (loading) {
    return (
      <div className="glass-panel overflow-hidden bg-white/50">
        <div className="p-4 border-b border-border">
          <div className="skeleton h-5 w-32 rounded mb-1" />
          <div className="skeleton h-3 w-48 rounded" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="flex items-center gap-4">
              <div className="skeleton h-4 flex-1 rounded" />
              <div className="skeleton h-4 w-16 rounded" />
              <div className="skeleton h-5 w-20 rounded-full" />
              <div className="skeleton h-4 w-24 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const filtered = scans?.filter(s =>
    s.indicator?.toLowerCase().includes(search.toLowerCase()) ||
    s.classification?.toLowerCase().includes(search.toLowerCase()) ||
    s.source?.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="glass-panel overflow-hidden flex flex-col bg-white/80" style={{ height: 480 }}>
      <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 flex-shrink-0 bg-gray-50/80 border-b border-border">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Recent Scan Findings</h3>
          <p className="text-xs text-secondary mt-0.5">{filtered.length} results</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Filter indicators..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full text-xs rounded-lg pl-8 pr-3 py-2 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white border border-border"
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-gray-600 hover:text-gray-900 transition-colors bg-white border border-border"
          >
            <Filter className="w-3.5 h-3.5" />
            Filter
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full soc-table">
          <thead>
            <tr>
              <th className="w-1/4">Indicator</th>
              <th className="w-1/8">Type</th>
              <th className="w-1/6">Status</th>
              <th className="w-1/6">Threat Score</th>
              <th className="w-1/5">Source</th>
              <th className="text-right">Detected</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map((scan, i) => (
              <tr
                key={scan.id || `scan-${i}`}
                className="cursor-pointer group hover:bg-gray-50/50 transition-colors"
                onClick={() => onRowClick?.(scan.id)}
              >
                <td className="font-mono text-xs text-gray-800 group-hover:text-primary transition-colors max-w-[160px] truncate font-medium">
                  {scan.indicator}
                </td>
                <td>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-border">
                    {scan.type}
                  </span>
                </td>
                <td>
                  <span className={CLASS_STYLES[scan.classification] || 'badge badge-success'}>
                    {scan.classification}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold w-6 text-gray-700">{scan.threat_score}</span>
                    <div className="threat-bar w-16 bg-gray-100">
                      <div
                        className="threat-bar-fill"
                        style={{ width: `${scan.threat_score}%`, backgroundColor: SCORE_COLOR(scan.threat_score) }}
                      />
                    </div>
                  </div>
                </td>
                <td className="text-xs text-secondary capitalize max-w-[120px] truncate">{scan.source}</td>
                <td className="text-right font-mono text-[11px] text-gray-500">
                  {scan.timestamp ? format(new Date(scan.timestamp), 'MMM dd, HH:mm') : '—'}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="text-center py-16">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <FileText className="w-10 h-10 opacity-50" />
                    <p className="text-sm font-medium text-gray-500">No findings found</p>
                    <p className="text-xs">Try adjusting your search query</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="px-4 py-2.5 flex justify-between items-center text-xs text-gray-600 flex-shrink-0 bg-gray-50/80 border-t border-border">
          <span>Showing {filtered.length} entries</span>
          <div className="flex gap-1">
            {['Prev', '1', 'Next'].map((l, i) => (
              <button key={l} className={`px-2.5 py-1 rounded text-xs ${i === 1 ? 'bg-primary text-white border-primary' : 'text-secondary hover:text-gray-900 bg-white'} border border-border transition-colors`}>
                {l}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanTable;