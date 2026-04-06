import { trpc } from "@/lib/trpc";
import { useAccess } from "@/contexts/AccessContext";
import { Shield, RefreshCw } from "lucide-react";

export default function AuditLog() {
  const { role } = useAccess();
  const { data, isLoading, refetch, isFetching } = trpc.audit.list.useQuery(
    { limit: 200 },
    { refetchInterval: 30_000 },
  );

  if (role !== "admin" && role !== "viewer") {
    return (
      <div className="card" style={{ padding: 24 }}>
        <Shield size={20} /> Sign in to view the audit log.
      </div>
    );
  }

  const entries = (data as any[]) || [];

  return (
    <div className="flex flex-col gap-lg">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 className="text-2xl font-bold">Audit Log</h2>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 10px",
            background: "transparent",
            border: "1px solid var(--card-border)",
            borderRadius: 4,
            color: "var(--text)",
            cursor: "pointer",
            fontSize: 11,
          }}
        >
          <RefreshCw size={12} className={isFetching ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ padding: 16, fontSize: 12, opacity: 0.7 }}>Loading audit entries…</div>
        ) : entries.length === 0 ? (
          <div style={{ padding: 16, fontSize: 12, opacity: 0.7 }}>
            No audit entries yet. Mutations will appear here as they happen.
          </div>
        ) : (
          <table className="table" style={{ width: "100%", fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 8 }}>Time</th>
                <th style={{ textAlign: "left", padding: 8 }}>User</th>
                <th style={{ textAlign: "left", padding: 8 }}>Action</th>
                <th style={{ textAlign: "left", padding: 8 }}>Category</th>
                <th style={{ textAlign: "left", padding: 8 }}>IP</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e: any) => (
                <tr key={e.id} style={{ borderTop: "1px solid var(--card-border)" }}>
                  <td style={{ padding: 8, whiteSpace: "nowrap" }}>
                    {new Date(e.at).toLocaleString()}
                  </td>
                  <td style={{ padding: 8 }}>
                    {e.userName || e.userId || <span style={{ opacity: 0.5 }}>anon</span>}
                  </td>
                  <td style={{ padding: 8, fontFamily: "monospace" }}>{e.action}</td>
                  <td style={{ padding: 8 }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "1px 6px",
                        borderRadius: 3,
                        fontSize: 10,
                        background:
                          e.category === "auth"
                            ? "rgba(99,102,241,0.2)"
                            : e.category === "mutation"
                            ? "rgba(16,185,129,0.2)"
                            : "rgba(245,158,11,0.2)",
                      }}
                    >
                      {e.category}
                    </span>
                  </td>
                  <td style={{ padding: 8, fontFamily: "monospace", opacity: 0.7 }}>
                    {e.ip || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
