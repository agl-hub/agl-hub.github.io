import React from 'react';
import { Wrench, Clock, User } from 'lucide-react';

interface VehicleCardProps {
  registration: string;
  model: string;
  mechanic: string;
  jobDescription: string;
  status: 'completed' | 'pending' | 'progress';
  timeSpent?: string;
  onClick?: () => void;
}

export default function VehicleCard({
  registration,
  model,
  mechanic,
  jobDescription,
  status,
  timeSpent,
  onClick,
}: VehicleCardProps) {
  const statusColors = {
    completed: 'bg-teal-500/10 border-teal-500/30 text-teal-400',
    pending: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    progress: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  };

  const statusLabels = {
    completed: 'Completed',
    pending: 'Pending',
    progress: 'In Progress',
  };

  return (
    <div
      onClick={onClick}
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-red-500/30 hover:shadow-lg transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-lg font-bold text-white font-rajdhani">{registration}</h4>
          <p className="text-xs text-slate-400">{model}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${statusColors[status]}`}>
          {statusLabels[status]}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <User className="w-4 h-4 text-amber-500" />
          <span>{mechanic}</span>
        </div>
        <p className="text-sm text-slate-400 line-clamp-2">{jobDescription}</p>
        {timeSpent && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3 h-3" />
            <span>{timeSpent}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-700/50">
        <Wrench className="w-4 h-4 text-red-500" />
        <span className="text-xs text-slate-400">View Details</span>
      </div>
    </div>
  );
}
