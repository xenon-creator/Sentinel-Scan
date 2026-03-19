import React, { useState } from 'react';
import { Search, Filter, FileText } from 'lucide-react';
import { format } from 'date-fns';

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
      <div className="glass-panel overflow-hidden">
        <div className="p-4 border-b" style={{ borderColor: 'rgba(51,65,85,0.4)' }}>
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
    <div className="glass-panel overflow-hidden flex flex-col" style={{ height: 480 }}>
      <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(51,65,85,0.4)', background: 'rgba(8,13,24,0.4)' }}>
        <div>
          <h3 className="text-sm font-bold text-white">Recent Scan Findings</h3>
          <p className="text-xs text-secondary mt-0.5">{filtered.length} results</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
            <input
              type="text"
              placeholder="Filter indicators..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full text-xs rounded-lg pl-8 pr-3 py-2 text-gray-300 placeholder-gray-600 outline-none focus:ring-1 focus:ring-primary/50 transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(51,65,85,0.6)' }}
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-200 transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(51,65,85,0.6)' }}>
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
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
                className="cursor-pointer group"
                onClick={() => onRowClick?.(scan.id)}
              >
                <td className="font-mono text-xs text-gray-300 group-hover:text-blue-300 transition-colors max-w-[160px] truncate">
                  {scan.indicator}
                </td>
                <td>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 bg-white/5 px-2 py-0.5 rounded border"
                    style={{ borderColor: 'rgba(51,65,85,0.5)' }}>
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
                    <span className="text-xs font-bold w-6 text-gray-300">{scan.threat_score}</span>
                    <div className="threat-bar w-16">
                      <div
                        className="threat-bar-fill"
                        style={{ width: `${scan.threat_score}%`, backgroundColor: SCORE_COLOR(scan.threat_score) }}
                      />
                    </div>
                  </div>
                </td>
                <td className="text-xs text-gray-500 capitalize max-w-[120px] truncate">{scan.source}</td>
                <td className="text-right font-mono text-[11px] text-gray-600">
                  {scan.timestamp ? format(new Date(scan.timestamp), 'MMM dd, HH:mm') : '—'}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="text-center py-16">
                  <div className="flex flex-col items-center gap-3 text-gray-600">
                    <FileText className="w-10 h-10 opacity-30" />
                    <p className="text-sm font-medium">No findings found</p>
                    <p className="text-xs">Try adjusting your search query</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="px-4 py-2.5 flex justify-between items-center text-xs text-gray-600 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(51,65,85,0.4)', background: 'rgba(8,13,24,0.4)' }}>
          <span>Showing {filtered.length} entries</span>
          <div className="flex gap-1">
            {['Prev', '1', 'Next'].map((l, i) => (
              <button key={l} className={`px-2.5 py-1 rounded text-xs ${i === 1 ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-300'}`}
                style={i !== 1 ? { border: '1px solid rgba(51,65,85,0.5)' } : {}}>
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