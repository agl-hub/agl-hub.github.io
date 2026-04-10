import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface FilterBarProps {
  onFilterChange?: (filters: FilterState) => void;
  showDateRange?: boolean;
  showStatus?: boolean;
  showChannel?: boolean;
  showPaymentMethod?: boolean;
}

export interface FilterState {
  search: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  channel?: string;
  paymentMethod?: string;
}

export default function FilterBar({
  onFilterChange,
  showDateRange = true,
  showStatus = true,
  showChannel = true,
  showPaymentMethod = true,
}: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterState = { search: '' };
    setFilters(clearedFilters);
    onFilterChange?.(clearedFilters);
  };

  const hasActiveFilters =
    filters.search ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.status ||
    filters.channel ||
    filters.paymentMethod;

  return (
    <div className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-lg border-b border-slate-700/50 px-6 py-3 space-y-3">
      {/* Main Filter Row */}
      <div className="flex items-center gap-3 flex-wrap overflow-x-auto">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:border-slate-600 transition-all"
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 bg-red-600/20 text-red-400 rounded-full text-xs font-semibold">
              Active
            </span>
          )}
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm text-slate-400 hover:text-red-400 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-700/50">
          {/* Date Range */}
          {showDateRange && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500/50 transition-all"
                />
              </div>
            </>
          )}

          {/* Status */}
          {showStatus && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500/50 transition-all cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="progress">In Progress</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}

          {/* Channel */}
          {showChannel && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                Channel
              </label>
              <select
                value={filters.channel || ''}
                onChange={(e) => handleFilterChange('channel', e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500/50 transition-all cursor-pointer"
              >
                <option value="">All Channels</option>
                <option value="walk-in">Walk-In</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="phone">Phone</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
              </select>
            </div>
          )}

          {/* Payment Method */}
          {showPaymentMethod && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                Payment Method
              </label>
              <select
                value={filters.paymentMethod || ''}
                onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500/50 transition-all cursor-pointer"
              >
                <option value="">All Methods</option>
                <option value="cash">Cash</option>
                <option value="momo">MoMo</option>
                <option value="bank">Bank Transfer</option>
                <option value="credit">Credit</option>
                <option value="pos">POS</option>
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
