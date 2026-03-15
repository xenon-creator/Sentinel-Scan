import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-panel border border-border p-3 rounded-lg shadow-xl shadow-black/50 flex items-center space-x-3">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.color }}></div>
        <div>
          <p className="text-white font-semibold text-sm">{payload[0].name}</p>
          <p className="text-gray-400 text-xs text-right">{payload[0].value}</p>
        </div>
      </div>
    );
  }
  return null;
};
const CustomLegend = ({ payload }) => {
  return (
    <ul className="flex flex-col space-y-2 mt-4 ml-8">
      {payload.map((entry, index) => (
        <li key={`item-${index}`} className="flex items-center text-sm">
          <span 
            className="w-3 h-3 rounded-full mr-3" 
            style={{ backgroundColor: entry.color }}
          ></span>
          <span className="text-gray-300 flex-1">{entry.value}</span>
          <span className="font-semibold text-white ml-2">
            {entry.payload.value}
          </span>
        </li>
      ))}
    </ul>
  );
};
const DistributionChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="glass-panel p-6 h-96 flex flex-col justify-center items-center">
        <div className="w-48 h-48 rounded-full border-8 border-border/30 border-t-primary/50 animate-spin"></div>
      </div>
    );
  }
  const hasData = data && data.some(d => d.value > 0);
  const displayData = hasData ? data : [
    { name: "Safe", value: 100, color: "#10b981" }, 
  ];
  return (
    <div className="glass-panel p-6 h-96 flex flex-col">
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-white">Threat Distribution</h3>
        <p className="text-secondary text-sm">Severity classification breakdown</p>
      </div>
      <div className="flex-1 w-full min-h-0 flex items-center">
        <ResponsiveContainer width="60%" height="100%">
          <PieChart>
            <Pie
              data={displayData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
            >
              {displayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} opacity={hasData ? 1 : 0.3} />
              ))}
            </Pie>
            {hasData && <Tooltip content={<CustomTooltip />} />}
          </PieChart>
        </ResponsiveContainer>
        <div className="w-40%">
           <CustomLegend payload={displayData.map(d => ({ value: d.name, color: d.color, payload: d }))} />
        </div>
      </div>
    </div>
  );
};
export default DistributionChart;