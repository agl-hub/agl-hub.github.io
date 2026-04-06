import React from 'react';
import { GripVertical } from 'lucide-react';

interface KanbanCard {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  assignee?: string;
  dueDate?: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  count: number;
  cards: KanbanCard[];
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  onCardClick?: (card: KanbanCard) => void;
}

export default function KanbanBoard({ columns, onCardClick }: KanbanBoardProps) {
  const priorityColors = {
    high: 'border-l-red-500',
    medium: 'border-l-amber-500',
    low: 'border-l-teal-500',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {columns.map((column) => (
        <div key={column.id} className="flex flex-col">
          {/* Column Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                {column.title}
              </h3>
              <span className="px-2 py-1 bg-red-600/20 text-red-400 rounded-full text-xs font-bold">
                {column.count}
              </span>
            </div>
            <div className="h-1 bg-gradient-to-r from-red-600 to-red-500 rounded-full" />
          </div>

          {/* Column Cards */}
          <div className="flex-1 space-y-3 min-h-96">
            {column.cards.length > 0 ? (
              column.cards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => onCardClick?.(card)}
                  className={`bg-slate-800/50 border-l-4 border-b border-r border-slate-700 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-lg transition-all group ${
                    priorityColors[card.priority]
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <GripVertical className="w-3 h-3 text-slate-600 group-hover:text-slate-400 flex-shrink-0 mt-0.5" />
                    <h4 className="text-sm font-semibold text-white flex-1 line-clamp-2">
                      {card.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-2">{card.description}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    {card.assignee && <span>{card.assignee}</span>}
                    {card.dueDate && <span>{card.dueDate}</span>}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
                No tasks
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
