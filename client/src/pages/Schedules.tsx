import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAccess } from "@/contexts/AccessContext";
import { Plus, Trash2, Play, Pause, Send } from "lucide-react";
import { toast } from "sonner";

const REPORT_TYPES = ["daily-ceo", "weekly-management", "monthly-financial", "full-operations"] as const;
const FREQUENCIES = ["hourly", "daily", "weekly", "monthly"] as const;

export default function Schedules() {
  const { canEdit } = useAccess();
  const list = trpc.schedules.list.useQuery(undefined, { refetchInterval: 30_000 });
  const create = trpc.schedules.create.useMutation();
  const del = trpc.schedules.delete.useMutation();
  const setEnabled = trpc.schedules.setEnabled.useMutation();
  const runNow = trpc.schedules.runNow.useMutation();

  const [reportType, setReportType] = useState<(typeof REPORT_TYPES)[number]>("daily-ceo");
  const [frequency, setFrequency] = useState<(typeof FREQUENCIES)[number]>("daily");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [hourOfDay, setHourOfDay] = useState(8);

  if (!canEdit) {
    return (
      <div className="card" style={{ padding: 24 }}>
        Sign in as admin to manage report schedules.
      </div>
    );
  }

  const handleCreate = async () => {
    if (!recipientEmail) {
      toast.error("Recipient email required");
      return;
    }
    try {
      await create.mutateAsync({ reportType, frequency, recipientEmail, hourOfDay });
      toast.success("Schedule created");
      setRecipientEmail("");
      list.refetch();
    } catch (e: any) {
      toast.error(e?.message || "Failed");
    }
  };

  const handleDelete = async (id: string) => {
    await del.mutateAsync({ id });
    list.refetch();
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    await setEnabled.mutateAsync({ id, enabled: !enabled });
    list.refetch();
  };

  const handleRun = async (id: string) => {
    await runNow.mutateAsync({ id });
    toast.success("Triggered");
    list.refetch();
  };

  const items = (list.data as any[]) || [];

  return (
    <div className="flex flex-col gap-lg">
      <h2 className="text-2xl font-bold">Scheduled Reports</h2>

      <div className="card" style={{ padding: 16 }}>
        <h3 className="text-lg font-bold mb-md">Create new schedule</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 100px auto", gap: 8, alignItems: "end" }}>
          <Field label="Report">
            <select value={reportType} onChange={(e) => setReportType(e.target.value as any)} style={input}>
              {REPORT_TYPES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Frequency">
            <select value={frequency} onChange={(e) => setFrequency(e.target.value as any)} style={input}>
              {FREQUENCIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Recipient email">
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              style={input}
            />
          </Field>
          <Field label="Hour (0–23)">
            <input
              type="number"
              min={0}
              max={23}
              value={hourOfDay}
              onChange={(e) => setHourOfDay(Number(e.target.value))}
              style={input}
            />
          </Field>
          <button
            onClick={handleCreate}
            disabled={create.isPending}
            style={{
              padding: "8px 14px",
              background: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Plus size={12} /> Add
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {items.length === 0 ? (
          <div style={{ padding: 16, fontSize: 12, opacity: 0.7 }}>No schedules yet.</div>
        ) : (
          <table className="table" style={{ width: "100%", fontSize: 11 }}>
            <thead>
              <tr>
                <th style={th}>Report</th>
                <th style={th}>Frequency</th>
                <th style={th}>Recipient</th>
                <th style={th}>Next run</th>
                <th style={th}>Last run</th>
                <th style={th}>Status</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} style={{ borderTop: "1px solid var(--card-border)", opacity: s.enabled ? 1 : 0.5 }}>
                  <td style={td}>{s.reportType}</td>
                  <td style={td}>{s.frequency} @ {s.hourOfDay}:00</td>
                  <td style={td}>{s.recipientEmail}</td>
                  <td style={td}>{new Date(s.nextRunAt).toLocaleString()}</td>
                  <td style={td}>{s.lastRunAt ? new Date(s.lastRunAt).toLocaleString() : "—"}</td>
                  <td style={td}>
                    {s.lastRunStatus === "ok" ? (
                      <span style={{ color: "#10b981" }}>ok</span>
                    ) : s.lastRunStatus === "error" ? (
                      <span style={{ color: "#ef4444" }}>{s.lastRunMessage || "error"}</span>
                    ) : (
                      <span style={{ opacity: 0.5 }}>—</span>
                    )}
                  </td>
                  <td style={td}>
                    <button onClick={() => handleRun(s.id)} title="Run now" style={iconBtn}>
                      <Send size={12} />
                    </button>
                    <button
                      onClick={() => handleToggle(s.id, s.enabled)}
                      title={s.enabled ? "Pause" : "Resume"}
                      style={iconBtn}
                    >
                      {s.enabled ? <Pause size={12} /> : <Play size={12} />}
                    </button>
                    <button onClick={() => handleDelete(s.id)} title="Delete" style={iconBtn}>
                      <Trash2 size={12} />
                    </button>
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

const input: React.CSSProperties = {
  padding: "6px 8px",
  background: "var(--bg, #111827)",
  color: "var(--text, #fff)",
  border: "1px solid var(--card-border, #374151)",
  borderRadius: 4,
  fontSize: 12,
  width: "100%",
};
const th: React.CSSProperties = { textAlign: "left", padding: 8 };
const td: React.CSSProperties = { padding: 8 };
const iconBtn: React.CSSProperties = {
  background: "transparent",
  border: "1px solid var(--card-border)",
  color: "var(--text)",
  borderRadius: 3,
  padding: 4,
  marginRight: 4,
  cursor: "pointer",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11 }}>
      <span style={{ opacity: 0.8 }}>{label}</span>
      {children}
    </label>
  );
}
