import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAccess } from "@/contexts/AccessContext";
import { toast } from "sonner";

export default function Settings() {
  const { canEdit } = useAccess();
  const cfgQuery = trpc.config.get.useQuery();
  const update = trpc.config.update.useMutation();
  const reset = trpc.config.reset.useMutation();

  const [form, setForm] = useState<any>({});
  useEffect(() => {
    if (cfgQuery.data) setForm(cfgQuery.data);
  }, [cfgQuery.data]);

  const setField = (k: string, v: string) =>
    setForm((f: any) => ({ ...f, [k]: parseFloat(v) || 0 }));

  const save = async () => {
    try {
      await update.mutateAsync(form);
      toast.success("Settings saved");
      cfgQuery.refetch();
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    }
  };

  const doReset = async () => {
    await reset.mutateAsync();
    cfgQuery.refetch();
    toast.success("Reset to defaults");
  };

  return (
    <div className="flex flex-col gap-lg">
      <h2 className="text-2xl font-bold">Settings</h2>

      <div className="card" style={{ padding: 16 }}>
        <h3 className="text-lg font-bold mb-md">Insight Thresholds</h3>
        <div className="grid grid-2 gap-md">
          <Field label="Daily Revenue Target (GHS)" value={form.dailyRevenueTarget} onChange={(v) => setField("dailyRevenueTarget", v)} disabled={!canEdit} />
          <Field label="Monthly Revenue Target (GHS)" value={form.monthlyRevenueTarget} onChange={(v) => setField("monthlyRevenueTarget", v)} disabled={!canEdit} />
          <Field label="Low Stock Threshold (units)" value={form.lowStockThreshold} onChange={(v) => setField("lowStockThreshold", v)} disabled={!canEdit} />
          <Field label="Overdue Job Hours" value={form.overdueJobHours} onChange={(v) => setField("overdueJobHours", v)} disabled={!canEdit} />
        </div>

        {canEdit && (
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button
              onClick={save}
              disabled={update.isPending}
              style={{
                padding: "8px 14px",
                background: "#10b981",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {update.isPending ? "Saving…" : "Save"}
            </button>
            <button
              onClick={doReset}
              style={{
                padding: "8px 14px",
                background: "transparent",
                color: "var(--text)",
                border: "1px solid var(--card-border)",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Reset to defaults
            </button>
          </div>
        )}
        {!canEdit && (
          <div style={{ marginTop: 12, fontSize: 11, opacity: 0.6 }}>
            Read-only — sign in as admin to edit.
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11 }}>
      <span style={{ opacity: 0.8 }}>{label}</span>
      <input
        type="number"
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "6px 8px",
          background: "var(--bg, #111827)",
          color: "var(--text, #fff)",
          border: "1px solid var(--card-border, #374151)",
          borderRadius: 4,
          fontSize: 12,
        }}
      />
    </label>
  );
}
