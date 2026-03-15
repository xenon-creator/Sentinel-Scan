import React, { useState, useEffect } from 'react';
import { fetchRecentScans } from '../api';
import ScanTable from '../components/ScanTable';
import IndicatorDetails from '../components/IndicatorDetails';
const ScanResults = () => {
  const [loading, setLoading] = useState(true);
  const [scans, setScans] = useState([]);
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const scansData = await fetchRecentScans(100);
        setScans(scansData);
      } catch (error) {
        console.error("Failed to fetch scan results", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  const handleRowClick = (indicatorId) => {
    setSelectedIndicator(indicatorId);
  };
  const closeIndicatorDetails = () => {
    setSelectedIndicator(null);
  };
  return (
    <div className="space-y-6">
      <div className="bg-panel border border-border rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mt-10 -mr-10"></div>
        <h2 className="text-xl font-bold text-white mb-2 relative z-10">Comprehensive Scan History</h2>
        <p className="text-secondary text-sm relative z-10">
          View and analyze all historical scan results and detected threats across your infrastructure.
        </p>
      </div>
      <div className="bg-panel border border-border rounded-xl shadow-lg h-[calc(100vh-280px)] flex flex-col">
        <div className="flex-1 overflow-auto p-4">
            <ScanTable
              scans={scans}
              loading={loading}
              onRowClick={handleRowClick}
            />
        </div>
      </div>
      <IndicatorDetails
        indicatorId={selectedIndicator}
        onClose={closeIndicatorDetails}
      />
    </div>
  );
};
export default ScanResults;