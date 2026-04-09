import { useState, useMemo } from "react";
import { Bell } from "lucide-react";
import { getData } from "../lib/dataStore";

interface Notification {
  id: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  type: 'warning' | 'info' | 'success';
}

function generateNotifications(): Notification[] {
  const data = getData();
  const notifications: Notification[] = [];
  const today = new Date().toISOString().slice(0, 10);

  // Check low stock
  const lowStock = data.inventory?.filter(i => i.qty <= (i.reorder || 5)) || [];
  lowStock.slice(0, 3).forEach(item => {
    notifications.push({
      id: `stock_${item.id}`,
      title: 'Low Stock Alert',
      content: `${item.name} is running low (${item.qty} remaining)`,
      isRead: false,
      createdAt: new Date().toISOString(),
      type: 'warning',
    });
  });

  // Check overdue workshop jobs
  const overdueJobs = data.workshop?.filter(j =>
    j.status !== 'Completed' && j.date < today
  ) || [];
  overdueJobs.slice(0, 3).forEach(job => {
    notifications.push({
      id: `job_${job.id}`,
      title: 'Overdue Workshop Job',
      content: `${job.car} — ${job.job} (since ${job.date})`,
      isRead: false,
      createdAt: job.date + 'T00:00:00',
      type: 'warning',
    });
  });

  // Check unpaid creditors
  const unpaidCreditors = data.creditors?.filter(c => (c.amount - (c.paid || 0)) > 0) || [];
  if (unpaidCreditors.length > 0) {
    const totalOwed = unpaidCreditors.reduce((s, c) => s + c.amount, 0);
    notifications.push({
      id: 'creditors_unpaid',
      title: 'Unpaid Creditors',
      content: `${unpaidCreditors.length} creditor(s) with GHS ${totalOwed.toLocaleString()} outstanding`,
      isRead: false,
      createdAt: new Date().toISOString(),
      type: 'warning',
    });
  }

  // Today's sales summary
  const todaySales = data.sales?.filter(s => s.date === today) || [];
  if (todaySales.length > 0) {
    const todayRevenue = todaySales.reduce((s, x) => s + x.total, 0);
    notifications.push({
      id: 'today_sales',
      title: "Today's Sales",
      content: `${todaySales.length} transaction(s) totalling GHS ${todayRevenue.toLocaleString()}`,
      isRead: true,
      createdAt: new Date().toISOString(),
      type: 'success',
    });
  }

  return notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const notifications = useMemo(() => generateNotifications(), [open]);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label="Notifications"
        style={{
          background: "transparent",
          border: "none",
          color: "var(--text)",
          cursor: "pointer",
          position: "relative",
          padding: 6,
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: "absolute",
            top: 0,
            right: 0,
            background: "#ef4444",
            color: "#fff",
            borderRadius: 10,
            fontSize: 10,
            padding: "1px 5px",
            fontWeight: 700,
          }}>
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 6px)",
            width: 320,
            maxHeight: 420,
            overflowY: "auto",
            background: "var(--bg-secondary, #1f2937)",
            border: "1px solid var(--card-border, #374151)",
            borderRadius: 8,
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            zIndex: 1000,
          }}>
            <div style={{
              padding: "10px 12px",
              borderBottom: "1px solid var(--card-border, #374151)",
              fontWeight: 700,
              fontSize: 13,
            }}>
              Notifications
            </div>
            {notifications.length === 0 ? (
              <div style={{ padding: 16, fontSize: 12, opacity: 0.7 }}>No notifications</div>
            ) : (
              notifications.slice(0, 20).map(n => (
                <div key={n.id} style={{
                  padding: "10px 12px",
                  borderBottom: "1px solid var(--card-border, #374151)",
                  fontSize: 12,
                  opacity: n.isRead ? 0.6 : 1,
                  borderLeft: `3px solid ${n.type === 'warning' ? '#F39C12' : n.type === 'success' ? '#1ABC9C' : '#3B82F6'}`,
                }}>
                  <div style={{ fontWeight: 600 }}>{n.title}</div>
                  <div style={{ marginTop: 2, opacity: 0.8 }}>{n.content}</div>
                  <div style={{ marginTop: 4, fontSize: 10, opacity: 0.5 }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
