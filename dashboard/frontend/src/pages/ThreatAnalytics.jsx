import React, { useState, useEffect, useCallback } from 'react';
import { fetchThreatTrends, fetchThreatDistribution, fetchStats } from '../api';
import ThreatChart from '../components/ThreatChart';
import DistributionChart from '../components/DistributionChart';
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

const StatBadge = ({ label, value, color }) => (
  <div className="bg-white/80 border border-border rounded-xl p-5 shadow-sm">
    <p className="text-secondary text-xs uppercase tracking-wider mb-1 font-bold">{label}</p>
    <p className={`text-3xl font-extrabold ${color}`}>{value ?? '—'}</p>
  </div>
);

const ThreatAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trendsData, setTrendsData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);
  const [stats, setStats] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [trends, distribution, statsData] = await Promise.all([
        fetchThreatTrends(90),
        fetchThreatDistribution(),
        fetchStats(),
      ]);
      setTrendsData(trends);
      setDistributionData(distribution);
      setStats(statsData);
    } catch (err) {
      console.error('Analytics failed to load data', err);
      setError(
        err?.code === 'ERR_NETWORK'
          ? 'Cannot reach the dashboard API. Make sure the backend is running on port 8001.'
          : `Failed to load analytics: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="bg-white/80 border border-border rounded-xl p-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mt-10 -mr-10" />
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Threat Landscape Analytics</h2>
            <p className="text-secondary text-sm font-medium">
              Deep dive into historical threat trends, distribution, and overall risk posture spanning 90 days.
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
            <p className="text-red-700 font-bold text-sm">Failed to Load Analytics</p>
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

      {/* Summary badges */}
      {!loading && stats && (
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBadge label="Total Scans" value={stats.total_scans?.toLocaleString()} color="text-gray-900" />
          <StatBadge label="Total Indicators" value={stats.total_indicators?.toLocaleString()} color="text-blue-600" />
          <StatBadge label="Malicious" value={stats.malicious?.toLocaleString()} color="text-red-600" />
          <StatBadge label="Suspicious" value={stats.suspicious?.toLocaleString()} color="text-amber-600" />
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="xl:col-span-2 flex flex-col h-[500px]">
          <ThreatChart data={trendsData} loading={loading} />
        </motion.div>
        <motion.div variants={itemVariants} className="xl:col-span-1 flex flex-col h-[500px]">
          <DistributionChart data={distributionData} loading={loading} />
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="glass-panel p-6 min-h-[200px] flex items-center justify-center border-dashed border-2 border-border/50 bg-white/50">
          <div className="text-center">
            <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-gray-700 font-bold pb-1">Geographic Origin Map</h3>
            <p className="text-gray-500 text-sm font-medium">Feature arriving in next update</p>
          </div>
        </div>
        <div className="glass-panel p-6 min-h-[200px] flex items-center justify-center border-dashed border-2 border-border/50 bg-white/50">
          <div className="text-center">
            <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="text-gray-700 font-bold pb-1">Attack Matrix Correlation</h3>
            <p className="text-gray-500 text-sm font-medium">Requires advanced MITRE ATT&amp;CK integration</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ThreatAnalytics;