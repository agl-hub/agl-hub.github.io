import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarDay {
  date: number;
  revenue: number;
  transactions: number;
  isToday: boolean;
  isEmpty: boolean;
}

interface CalendarGridProps {
  month?: number;
  year?: number;
  onDateClick?: (date: number) => void;
}

export default function CalendarGrid({ month = 3, year = 2026, onDateClick }: CalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(month);
  const [currentYear, setCurrentYear] = useState(year);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const today = new Date();

  const days: CalendarDay[] = [];

  // Empty days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push({ date: 0, revenue: 0, transactions: 0, isToday: false, isEmpty: true });
  }

  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday =
      i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
    days.push({
      date: i,
      revenue: Math.floor(Math.random() * 50000) + 10000,
      transactions: Math.floor(Math.random() * 20) + 5,
      isToday,
      isEmpty: false,
    });
  }

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">
          {monthNames[currentMonth]} {currentYear}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-slate-400 uppercase py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => (
          <div
            key={idx}
            onClick={() => !day.isEmpty && onDateClick?.(day.date)}
            className={`aspect-square p-2 rounded-lg border transition-all ${
              day.isEmpty
                ? 'bg-transparent border-transparent'
                : day.isToday
                  ? 'bg-red-600/20 border-red-500/50 cursor-pointer hover:border-red-500'
                  : 'bg-slate-700/30 border-slate-700 cursor-pointer hover:border-slate-600 hover:bg-slate-700/50'
            }`}
          >
            {!day.isEmpty && (
              <div className="flex flex-col h-full justify-between text-xs">
                <span className="font-semibold text-white">{day.date}</span>
                <div className="text-slate-400">
                  <p className="text-teal-400 font-semibold">₵{(day.revenue / 1000).toFixed(0)}K</p>
                  <p className="text-slate-500">{day.transactions} txn</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
