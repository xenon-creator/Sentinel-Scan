import React, { useState, useEffect } from 'react';
import { fetchStats, fetchThreatTrends, fetchThreatDistribution, fetchRecentScans, fetchTopThreats } from '../api';
import SummaryCards from '../components/SummaryCards';
import ThreatChart from '../components/ThreatChart';
import DistributionChart from '../components/DistributionChart';
import ScanTable from '../components/ScanTable';
import TopThreatsWidget from '../components/TopThreatsWidget';
import IndicatorDetails from '../components/IndicatorDetails';
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [trendsData, setTrendsData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);
  const [recentScans, setRecentScans] = useState([]);
  const [topThreats, setTopThreats] = useState([]);
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [
          statsData, 
          trends, 
          distribution, 
          scans, 
          threats
        ] = await Promise.all([
          fetchStats(),
          fetchThreatTrends(30),
          fetchThreatDistribution(),
          fetchRecentScans(20),
          fetchTopThreats(5)
        ]);
        setStats(statsData);
        setTrendsData(trends);
        setDistributionData(distribution);
        setRecentScans(scans);
        setTopThreats(threats);
      } catch (error) {
        console.error("Dashboard failed to load data", error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
    const intervalId = setInterval(loadDashboardData, 60000);
    return () => clearInterval(intervalId);
  }, []);
  const handleIndicatorClick = (indicatorId) => {
    setSelectedIndicator(indicatorId);
  };
  const closeIndicatorDetails = () => {
    setSelectedIndicator(null);
  };
  return (
    <div className="space-y-6">
      <SummaryCards stats={stats} loading={loading} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <ThreatChart data={trendsData} loading={loading} />
        </div>
        <div className="lg:col-span-1">
           <DistributionChart data={distributionData} loading={loading} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <ScanTable 
            scans={recentScans} 
            loading={loading} 
            onRowClick={handleIndicatorClick} 
          />
        </div>
        <div className="lg:col-span-1">
          <TopThreatsWidget 
            threats={topThreats} 
            loading={loading} 
            onThreatClick={handleIndicatorClick} 
          />
        </div>
      </div>
      {}
      <IndicatorDetails 
        indicatorId={selectedIndicator} 
        onClose={closeIndicatorDetails} 
      />
    </div>
  );
};
export default Dashboard;