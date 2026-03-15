import React from 'react';
import { ShieldAlert, ShieldX, ShieldCheck, Activity } from 'lucide-react';
const SummaryCards = ({ stats, loading }) => {
  const cards = [
    {
      title: "Total Indicators",
      value: stats?.total_indicators || 0,
      icon: Activity,
      color: "text-primary",
      bgBase: "bg-primary/10",
      bgBorder: "border-primary/20",
      trend: "+12.5%",
      trendUp: true
    },
    {
      title: "Malicious Detected",
      value: stats?.malicious || 0,
      icon: ShieldAlert,
      color: "text-danger",
      bgBase: "bg-danger/10",
      bgBorder: "border-danger/20",
      trend: "+4.2%",
      trendUp: true
    },
    {
      title: "Suspicious",
      value: stats?.suspicious || 0,
      icon: ShieldX,
      color: "text-warning",
      bgBase: "bg-warning/10",
      bgBorder: "border-warning/20",
      trend: "-2.1%",
      trendUp: false
    },
    {
      title: "Safe Indicators",
      value: stats?.safe || 0,
      icon: ShieldCheck,
      color: "text-success",
      bgBase: "bg-success/10",
      bgBorder: "border-success/20",
      trend: "+18.4%",
      trendUp: true
    }
  ];
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-panel p-6 h-32 animate-pulse flex flex-col justify-between">
            <div className="w-1/2 h-4 bg-border rounded"></div>
            <div className="w-1/3 h-8 bg-border rounded"></div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => (
        <div key={idx} className="glass-panel p-6 relative overflow-hidden group hover:border-gray-500/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          {}
          <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${card.bgBase} blur-2xl group-hover:bg-opacity-30 transition-all`}></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-secondary text-sm font-medium">{card.title}</p>
              <h3 className="text-3xl font-bold flex items-baseline mt-1 space-x-2 text-white">
                <span>{card.value.toLocaleString()}</span>
              </h3>
            </div>
            <div className={`p-3 rounded-lg ${card.bgBase} border ${card.bgBorder}`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs relative z-10">
            <span className={`font-medium px-1.5 py-0.5 rounded-sm ${card.trendUp ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
              {card.trend}
            </span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        </div>
      ))}
    </div>
  );
};
export default SummaryCards;