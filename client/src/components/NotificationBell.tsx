import { useState } from "react";
import { Bell } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data, refetch } = trpc.notifications.list.useQuery(
    { unreadOnly: false },
    { refetchInterval: 30_000 },
  );
  const notifications = (data as any[]) || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) refetch();
        }}
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
          <span
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              background: "#ef4444",
              color: "#fff",
              borderRadius: 10,
              fontSize: 10,
              padding: "1px 5px",
              fontWeight: 700,
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 6px)",
            width: 320,
            maxHeight: 420,
            overflowY: "auto",
            background: "var(--bg-secondary, #1f2937)",
            border: "1px solid var(--border, #374151)",
            borderRadius: 8,
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              padding: "10px 12px",
              borderBottom: "1px solid var(--border, #374151)",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            Notifications
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: 16, fontSize: 12, opacity: 0.7 }}>No notifications</div>
          ) : (
            notifications.slice(0, 20).map((n: any, i: number) => (
              <div
                key={n.id || i}
                style={{
                  padding: "10px 12px",
                  borderBottom: "1px solid var(--border, #374151)",
                  fontSize: 12,
                  opacity: n.isRead ? 0.6 : 1,
                }}
              >
                <div style={{ fontWeight: 600 }}>{n.title}</div>
                <div style={{ marginTop: 2, opacity: 0.8 }}>{n.content}</div>
                {n.createdAt && (
                  <div style={{ marginTop: 4, fontSize: 10, opacity: 0.5 }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
