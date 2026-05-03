import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel px-3 py-2 shadow-xl bg-white/90">
        <p className="text-secondary text-xs mb-1 font-medium">{label}</p>
        <p className="text-red-600 font-bold text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 shadow-sm" />
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
      <div className="glass-panel p-6 h-80 flex items-end space-x-1.5 px-8 pb-8 bg-white/50">
        {[20, 50, 35, 80, 45, 90, 60, 30, 70, 55, 85, 40].map((h, i) => (
          <div key={i} className="skeleton flex-1 rounded-t" style={{ height: `${h}%` }} />
        ))}
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 h-80 flex flex-col bg-white/80">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="text-base font-bold text-gray-900">Threat Activity Trends</h3>
          <p className="text-secondary text-xs mt-0.5 font-medium">Malicious indicators over the last 30 days</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 shadow-sm animate-pulse" />
          <span className="text-xs text-gray-500 font-medium">Active monitoring</span>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#cbd5e1"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v.substring(5)}
              tick={{ fill: '#64748b' }}
            />
            <YAxis
              stroke="#cbd5e1"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#ef4444"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#threatGrad)"
              activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff', fill: '#ef4444' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ThreatChart;