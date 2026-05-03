import React from 'react';
import { ShieldAlert, ShieldX, ShieldCheck, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

const cards = [
  {
    title: 'Total Indicators',
    key: 'total_indicators',
    icon: Activity,
    color: 'text-blue-600',
    iconBg: 'rgba(59,130,246,0.1)',
    iconBorder: 'rgba(59,130,246,0.2)',
    trend: '+12.5%',
    trendUp: true,
  },
  {
    title: 'Malicious',
    key: 'malicious',
    icon: ShieldAlert,
    color: 'text-red-600',
    iconBg: 'rgba(239,68,68,0.1)',
    iconBorder: 'rgba(239,68,68,0.2)',
    trend: '+4.2%',
    trendUp: true,
  },
  {
    title: 'Suspicious',
    key: 'suspicious',
    icon: ShieldX,
    color: 'text-amber-600',
    iconBg: 'rgba(245,158,11,0.1)',
    iconBorder: 'rgba(245,158,11,0.2)',
    trend: '-2.1%',
    trendUp: false,
  },
  {
    title: 'Safe',
    key: 'safe',
    icon: ShieldCheck,
    color: 'text-emerald-600',
    iconBg: 'rgba(16,185,129,0.1)',
    iconBorder: 'rgba(16,185,129,0.2)',
    trend: '+18.4%',
    trendUp: true,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const SummaryCards = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-panel p-5 h-36 bg-white/50">
            <div className="flex justify-between mb-4">
              <div className="skeleton h-4 w-28 rounded" />
              <div className="skeleton h-10 w-10 rounded-xl" />
            </div>
            <div className="skeleton h-8 w-20 rounded mb-3" />
            <div className="skeleton h-3 w-24 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        const value = stats?.[card.key] ?? 0;
        const Trend = card.trendUp ? TrendingUp : TrendingDown;
        return (
          <motion.div
            variants={itemVariants}
            key={card.key}
            className="glass-panel glass-panel-hover p-5 relative overflow-hidden bg-white/80"
          >
            <div className="flex justify-between items-start mb-3 relative z-10">
              <p className="text-sm font-semibold text-secondary">{card.title}</p>
              <div className="p-2.5 rounded-xl flex-shrink-0"
                style={{ background: card.iconBg, border: `1px solid ${card.iconBorder}` }}>
                <Icon className={`w-4.5 h-4.5 ${card.color}`} style={{ width: '1.1rem', height: '1.1rem' }} />
              </div>
            </div>

            <div className="stat-value mb-3 relative z-10">{value.toLocaleString()}</div>

            <div className="flex items-center text-xs relative z-10">
              <span className={`flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded ${
                card.trendUp ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
              }`}>
                <Trend className="w-3 h-3" />
                {card.trend}
              </span>
              <span className="text-gray-500 ml-2 font-medium">vs last month</span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default SummaryCards;