import React, { useState, useEffect, useCallback } from 'react';
import { fetchRecentScans } from '../api';
import ScanTable from '../components/ScanTable';
import IndicatorDetails from '../components/IndicatorDetails';
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

const ScanResults = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scans, setScans] = useState([]);
  const [selectedIndicator, setSelectedIndicator] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const scansData = await fetchRecentScans(100);
      setScans(scansData);
    } catch (err) {
      console.error('Failed to fetch scan results', err);
      setError(
        err?.code === 'ERR_NETWORK'
          ? 'Cannot reach the dashboard API. Make sure the backend is running on port 8001.'
          : `Failed to load scan results: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRowClick = (indicatorId) => setSelectedIndicator(indicatorId);
  const closeIndicatorDetails = () => setSelectedIndicator(null);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="bg-white/80 border border-border rounded-xl p-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mt-10 -mr-10" />
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Comprehensive Scan History</h2>
            <p className="text-secondary text-sm font-medium">
              View and analyze all historical scan results and detected threats across your infrastructure.
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-primary hover:bg-gray-50 border border-border shadow-sm transition-colors disabled:opacity-50"
          >
            <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </motion.div>

      {error && (
        <motion.div variants={itemVariants} className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-4 shadow-sm">
          <div className="text-red-500 text-xl mt-0.5">⚠️</div>
          <div className="flex-1">
            <p className="text-red-700 font-bold text-sm">Failed to Load Scans</p>
            <p className="text-red-600/80 text-xs mt-1 font-medium">{error}</p>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 transition-colors"
          >
            Retry
          </button>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="bg-white/80 border border-border rounded-xl shadow-sm h-[calc(100vh-320px)] flex flex-col">
        <div className="flex-1 overflow-auto p-4">
          <ScanTable scans={scans} loading={loading} onRowClick={handleRowClick} />
        </div>
      </motion.div>

      <IndicatorDetails indicatorId={selectedIndicator} onClose={closeIndicatorDetails} />
    </motion.div>
  );
};

export default ScanResults;