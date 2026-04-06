import React from 'react';
import { TrendingUp, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface InsightCardProps {
  type: 'positive' | 'negative' | 'info' | 'warning';
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export default function InsightCard({
  type,
  title,
  description,
  icon,
}: InsightCardProps) {
  const getStyles = () => {
    switch (type) {
      case 'positive':
        return {
          bg: 'bg-teal-500/10',
          border: 'border-teal-500/30',
          iconColor: 'text-teal-400',
          defaultIcon: <CheckCircle className="w-5 h-5" />,
        };
      case 'negative':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          iconColor: 'text-red-400',
          defaultIcon: <AlertTriangle className="w-5 h-5" />,
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          iconColor: 'text-amber-400',
          defaultIcon: <AlertTriangle className="w-5 h-5" />,
        };
      default:
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          iconColor: 'text-blue-400',
          defaultIcon: <Info className="w-5 h-5" />,
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border ${styles.bg} ${styles.border} transition-all hover:border-opacity-50`}
    >
      <div className={`flex-shrink-0 mt-0.5 ${styles.iconColor}`}>
        {icon || styles.defaultIcon}
      </div>
      <div className="flex-1 min-w-0">
        <h5 className="text-sm font-semibold text-white mb-1">{title}</h5>
        <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
