import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel px-3 py-2 shadow-2xl">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        <p className="text-red-400 font-bold text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
          {payload[0].value} threats
        </p>
      </div>
    );
  }
  return null;
};

const ThreatChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="glass-panel p-6 h-80 flex items-end space-x-1.5 px-8 pb-8">
        {[20, 50, 35, 80, 45, 90, 60, 30, 70, 55, 85, 40].map((h, i) => (
          <div key={i} className="skeleton flex-1 rounded-t" style={{ height: `${h}%` }} />
        ))}
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 h-80 flex flex-col">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="text-base font-bold text-white">Threat Activity Trends</h3>
          <p className="text-secondary text-xs mt-0.5">Malicious indicators over the last 30 days</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
          <span className="text-xs text-gray-500">Active monitoring</span>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#ef4444" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="rgba(51,65,85,0.4)" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#334155"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v.substring(5)}
              tick={{ fill: '#475569' }}
            />
            <YAxis
              stroke="#334155"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#475569' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#ef4444"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#threatGrad)"
              activeDot={{ r: 5, strokeWidth: 0, fill: '#ef4444', filter: 'url(#glow)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ThreatChart;