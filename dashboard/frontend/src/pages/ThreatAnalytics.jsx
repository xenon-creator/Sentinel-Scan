import React, { useState, useEffect } from 'react';
import { fetchThreatTrends, fetchThreatDistribution } from '../api';
import ThreatChart from '../components/ThreatChart';
import DistributionChart from '../components/DistributionChart';
const ThreatAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [trendsData, setTrendsData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [trends, distribution] = await Promise.all([
          fetchThreatTrends(90), 
          fetchThreatDistribution()
        ]);
        setTrendsData(trends);
        setDistributionData(distribution);
      } catch (error) {
        console.error("Analytics failed to load data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  return (
    <div className="space-y-6">
      <div className="bg-panel border border-border rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mt-10 -mr-10"></div>
        <h2 className="text-xl font-bold text-white mb-2 relative z-10">Threat Landscape Analytics</h2>
        <p className="text-secondary text-sm relative z-10">
          Deep dive into historical threat trends, distribution, and overall risk posture spanning 90 days.
        </p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col h-[500px]">
           <ThreatChart data={trendsData} loading={loading} />
        </div>
        <div className="xl:col-span-1 flex flex-col h-[500px]">
           <DistributionChart data={distributionData} loading={loading} />
        </div>
      </div>
      {}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="glass-panel p-6 min-h-[200px] flex items-center justify-center border-dashed border-2 border-border/50">
             <div className="text-center">
                <svg className="w-10 h-10 text-gray-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-gray-300 font-medium pb-1">Geographic Origin Map</h3>
                <p className="text-gray-500 text-sm">Feature arriving in next update</p>
             </div>
          </div>
          <div className="glass-panel p-6 min-h-[200px] flex items-center justify-center border-dashed border-2 border-border/50">
             <div className="text-center">
                <svg className="w-10 h-10 text-gray-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="text-gray-300 font-medium pb-1">Attack Matrix Correlation</h3>
                <p className="text-gray-500 text-sm">Requires advanced MITRE ATT&CK integration</p>
             </div>
          </div>
      </div>
    </div>
  );
};
export default ThreatAnalytics;