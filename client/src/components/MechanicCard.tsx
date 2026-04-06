import React from 'react';
import { Star, TrendingUp, Clock } from 'lucide-react';

interface MechanicCardProps {
  name: string;
  role: string;
  jobsCompleted: number;
  averageTime: string;
  efficiency: number;
  rating: number;
  onClick?: () => void;
}

export default function MechanicCard({
  name,
  role,
  jobsCompleted,
  averageTime,
  efficiency,
  rating,
  onClick,
}: MechanicCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 hover:border-red-500/30 hover:shadow-lg transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="text-center mb-4">
        <h4 className="text-lg font-bold text-white font-rajdhani mb-1">{name}</h4>
        <p className="text-xs text-slate-400 uppercase tracking-wider">{role}</p>
      </div>

      {/* Stats */}
      <div className="space-y-3 mb-4 pb-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Jobs Completed</span>
          <span className="font-semibold text-white">{jobsCompleted}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Avg. Time per Job</span>
          <span className="font-semibold text-white">{averageTime}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Efficiency</span>
          <span className="font-semibold text-teal-400">{efficiency}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">Performance</span>
          <span className="text-xs font-semibold text-white">{efficiency}%</span>
        </div>
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all"
            style={{ width: `${efficiency}%` }}
          />
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center justify-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
            }`}
          />
        ))}
        <span className="text-xs text-slate-400 ml-2">{rating.toFixed(1)}</span>
      </div>
    </div>
  );
}
