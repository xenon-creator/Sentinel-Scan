import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel px-3 py-2 shadow-2xl flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: payload[0].payload.color }} />
        <div>
          <p className="text-white font-semibold text-xs">{payload[0].name}</p>
          <p className="text-gray-400 text-xs">{payload[0].value.toLocaleString()} indicators</p>
        </div>
      </div>
    );
  }
  return null;
};

const DistributionChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="glass-panel p-6 h-80 flex flex-col items-center justify-center">
        <div className="w-36 h-36 rounded-full skeleton" />
        <div className="mt-6 space-y-2 w-full">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-2">
              <div className="skeleton w-3 h-3 rounded-full" />
              <div className="skeleton h-3 flex-1 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasData = data?.some(d => d.value > 0);
  const displayData = hasData ? data : [{ name: 'No Data', value: 1, color: '#334155' }];

  return (
    <div className="glass-panel p-6 h-80 flex flex-col">
      <div className="mb-4">
        <h3 className="text-base font-bold text-white">Threat Distribution</h3>
        <p className="text-secondary text-xs mt-0.5">Severity classification breakdown</p>
      </div>

      <div className="flex-1 flex items-center gap-4 min-h-0">
        <div className="flex-shrink-0" style={{ width: '55%', height: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {displayData.map((d, i) => (
                  <filter key={i} id={`glow-${i}`}>
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                ))}
              </defs>
              <Pie
                data={displayData}
                cx="50%" cy="50%"
                innerRadius={52} outerRadius={82}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
                labelLine={false}
                label={hasData ? renderCustomLabel : false}
                cornerRadius={5}
              >
                {displayData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} opacity={hasData ? 1 : 0.2} />
                ))}
              </Pie>
              {hasData && <Tooltip content={<CustomTooltip />} />}
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-3">
          {displayData.map((d, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color, boxShadow: `0 0 8px ${d.color}` }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-300 font-medium truncate">{d.name}</p>
                <p className="text-xs text-gray-600 font-mono">{d.value.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DistributionChart;