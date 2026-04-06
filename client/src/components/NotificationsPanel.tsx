import React from 'react';
import { X, AlertCircle, CheckCircle, Info, Clock } from 'lucide-react';

interface Notification {
  id: string;
  type: 'alert' | 'success' | 'info' | 'pending';
  title: string;
  message: string;
  timestamp: Date;
  icon?: React.ReactNode;
}

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: Notification[];
}

export default function NotificationsPanel({ isOpen, onClose, notifications = [] }: NotificationsPanelProps) {
  const defaultNotifications: Notification[] = [
    {
      id: '1',
      type: 'alert',
      title: 'Revenue Target Alert',
      message: 'Daily target not met. Current: ₵45.2K vs Target: ₵50k',
      timestamp: new Date(),
    },
    {
      id: '2',
      type: 'success',
      title: 'Vehicle Completed',
      message: 'Toyota Corolla (GN-2024-001) service completed',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
    {
      id: '3',
      type: 'info',
      title: 'New Staff Member',
      message: 'Kofi Mensah has been added to the system',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '4',
      type: 'pending',
      title: 'Pending Payment',
      message: 'Invoice #INV-2024-156 awaiting payment',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
  ];

  const displayNotifications = notifications.length > 0 ? notifications : defaultNotifications;

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-teal-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'alert':
        return 'border-l-red-500 bg-red-500/5';
      case 'success':
        return 'border-l-teal-500 bg-teal-500/5';
      case 'pending':
        return 'border-l-amber-500 bg-amber-500/5';
      default:
        return 'border-l-blue-500 bg-blue-500/5';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 w-96 h-screen bg-slate-900/95 backdrop-blur-2xl border-l border-slate-700/50 z-50 transform transition-transform duration-300 flex flex-col shadow-2xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h3 className="text-lg font-semibold text-white">Notifications</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {displayNotifications.length > 0 ? (
            displayNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-lg cursor-pointer ${getNotificationColor(
                  notif.type
                )}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">{getIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-sm mb-1">{notif.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{notif.message}</p>
                    <p className="text-xs text-slate-500 mt-2">{formatTime(notif.timestamp)}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              <p>No notifications</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700/50 p-4">
          <button className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-sm font-medium">
            Clear All
          </button>
        </div>
      </div>
    </>
  );
}
