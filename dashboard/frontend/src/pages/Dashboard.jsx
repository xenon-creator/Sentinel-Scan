import React, { useState, useEffect, useCallback } from 'react';
import { fetchStats, fetchThreatTrends, fetchThreatDistribution, fetchRecentScans, fetchTopThreats } from '../api';
import SummaryCards from '../components/SummaryCards';
import ThreatChart from '../components/ThreatChart';
import DistributionChart from '../components/DistributionChart';
import ScanTable from '../components/ScanTable';
import TopThreatsWidget from '../components/TopThreatsWidget';
import IndicatorDetails from '../components/IndicatorDetails';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [stats, setStats] = useState(null);
  const [trendsData, setTrendsData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);
  const [recentScans, setRecentScans] = useState([]);
  const [topThreats, setTopThreats] = useState([]);
  const [selectedIndicator, setSelectedIndicator] = useState(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, trends, distribution, scans, threats] = await Promise.all([
        fetchStats(),
        fetchThreatTrends(30),
        fetchThreatDistribution(),
        fetchRecentScans(20),
        fetchTopThreats(5),
      ]);
      setStats(statsData);
      setTrendsData(trends);
      setDistributionData(distribution);
      setRecentScans(scans);
      setTopThreats(threats);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard failed to load data', err);
      setError(
        err?.code === 'ERR_NETWORK'
          ? 'Cannot reach dashboard API. Make sure the dashboard backend is running on port 8001.'
          : err?.response?.status === 404
          ? 'API endpoint not found (404). Check that the dashboard backend is correctly configured.'
          : `Failed to load dashboard data: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    const intervalId = setInterval(loadDashboardData, 60000);
    return () => clearInterval(intervalId);
  }, [loadDashboardData]);

  const handleIndicatorClick = (indicatorId) => setSelectedIndicator(indicatorId);
  const closeIndicatorDetails = () => setSelectedIndicator(null);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Error Banner */}
      {error && (
        <motion.div variants={itemVariants} className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-4 shadow-sm">
          <div className="text-red-500 text-xl mt-0.5">⚠️</div>
          <div className="flex-1">
            <p className="text-red-700 font-semibold text-sm">Dashboard API Unreachable</p>
            <p className="text-red-600/80 text-xs mt-1">{error}</p>
          </div>
          <button
            onClick={loadDashboardData}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 transition-colors"
          >
            Retry
          </button>
        </motion.div>
      )}

      {/* Header row with refresh */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          {lastUpdated && (
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          )}
        </div>
        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-primary hover:bg-gray-50 border border-border shadow-sm transition-colors disabled:opacity-50"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <SummaryCards stats={stats} loading={loading} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <ThreatChart data={trendsData} loading={loading} />
        </motion.div>
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <DistributionChart data={distributionData} loading={loading} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <ScanTable scans={recentScans} loading={loading} onRowClick={handleIndicatorClick} />
        </motion.div>
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <TopThreatsWidget threats={topThreats} loading={loading} onThreatClick={handleIndicatorClick} />
        </motion.div>
      </div>

      <IndicatorDetails indicatorId={selectedIndicator} onClose={closeIndicatorDetails} />
    </motion.div>
  );
};

export default Dashboard;