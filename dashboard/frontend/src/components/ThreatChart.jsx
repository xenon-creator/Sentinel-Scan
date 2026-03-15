import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-panel border border-border p-3 rounded-lg shadow-xl shadow-black/50">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        <p className="text-danger font-bold text-sm flex items-center">
          <span className="w-2 h-2 rounded-full bg-danger mr-2"></span>
          {payload[0].value} Malicious Indicators
        </p>
      </div>
    );
  }
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">Threat Activity Trends</h3>
        <p className="text-secondary text-sm">Malicious indicators detected over the last 30 days</p>
      </div>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorThreat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => val.substring(5)} 
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="#ef4444" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorThreat)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: '#ef4444' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default ThreatChart;