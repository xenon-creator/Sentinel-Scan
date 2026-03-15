import React, { useState } from 'react';
import { Search, ChevronDown, Filter, FileText } from 'lucide-react';
import { format } from 'date-fns';
const ScanTable = ({ scans, loading, onRowClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  if (loading) {
    return (
      <div className="glass-panel overflow-hidden">
        <div className="p-4 border-b border-border animate-pulse w-full h-16 bg-panel/50"></div>
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="animate-pulse w-full h-10 bg-border/30 rounded"></div>
          ))}
        </div>
      </div>
    );
  }
  const filteredScans = scans?.filter(scan => 
    scan.indicator.toLowerCase().includes(searchTerm.toLowerCase()) || 
    scan.classification.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  return (
    <div className="glass-panel overflow-hidden flex flex-col h-[500px]">
      <div className="p-4 border-b border-border bg-panel/50 backdrop-blur-md flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 relative z-10">
        <div>
          <h3 className="text-lg font-semibold text-white">Recent Scans</h3>
          <p className="text-secondary text-sm">Latest threat intelligence findings</p>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search indicators..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/20 border border-border text-sm rounded-lg pl-9 p-2 focus:ring-1 focus:ring-primary focus:border-primary text-gray-200 transition-colors"
            />
          </div>
          <button className="flex items-center px-3 py-2 bg-black/20 border border-border rounded-lg text-sm text-gray-300 hover:bg-white/5 transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto relative">
        <table className="w-full soc-table">
          <thead>
            <tr>
              <th className="w-1/4">Indicator</th>
              <th className="w-1/6">Type</th>
              <th className="w-1/6">Classification</th>
              <th className="w-1/6">Score</th>
                  <td>
                    <span className="text-xs uppercase font-semibold text-secondary bg-black/20 px-2 py-1 rounded border border-border">
                      {scan.type}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      scan.classification === 'Malicious' ? 'badge-danger' : 
                      scan.classification === 'Suspicious' ? 'badge-warning' : 
                      'badge-success'
                    }`}>
                      {scan.classification}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-300 w-6">{scan.threat_score}</span>
                      <div className="w-16 h-1.5 bg-black/50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            scan.threat_score >= 70 ? 'bg-danger' : 
                            scan.threat_score >= 40 ? 'bg-warning' : 'bg-success'
                          }`}
                          style={{ width: `${scan.threat_score}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="text-gray-400 capitalize">{scan.source}</td>
                  <td className="text-right text-gray-500 font-mono text-xs">
                    {scan.timestamp ? format(new Date(scan.timestamp), 'MMM dd, HH:mm:ss') : '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="w-12 h-12 mb-4 text-border" />
                    <p className="text-lg font-medium text-gray-400">No findings found</p>
                    <p className="text-sm">Try adjusting your search criteria</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filteredScans.length > 0 && (
         <div className="p-3 border-t border-border bg-panel flex items-center justify-between text-xs text-secondary">
           <span>Showing 1 to {filteredScans.length} of {filteredScans.length} entries</span>
           <div className="flex space-x-1">
             <button className="px-2 py-1 border border-border rounded cursor-not-allowed opacity-50">Prev</button>
             <button className="px-2 py-1 bg-primary border-primary rounded text-white">1</button>
             <button className="px-2 py-1 border border-border rounded cursor-not-allowed opacity-50">Next</button>
           </div>
         </div>
      )}
    </div>
  );
};
export default ScanTable;