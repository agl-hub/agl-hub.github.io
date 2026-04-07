import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAccess } from "@/contexts/AccessContext";
import { Copy, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

const SCOPES = ["dashboard", "kpi", "reports"] as const;

export default function ShareLinks() {
  const { canEdit } = useAccess();
  const list = trpc.share.list.useQuery();
  const create = trpc.share.create.useMutation();
  const revoke = trpc.share.revoke.useMutation();

  const [scope, setScope] = useState<(typeof SCOPES)[number]>("dashboard");
  const [label, setLabel] = useState("");
  const [ttlDays, setTtlDays] = useState<number | "">("");

  const handleCreate = async () => {
    try {
      await create.mutateAsync({
        scope,
        label: label || undefined,
        ttlMs: ttlDays ? Number(ttlDays) * 86400000 : undefined,
      });
      toast.success("Share link created");
      setLabel("");
      setTtlDays("");
      list.refetch();
    } catch (e: any) {
      toast.error(e?.message || "Failed");
    }
  };

  const buildUrl = (token: string) => `${window.location.origin}/public?token=${token}`;

  const copy = (token: string) => {
    navigator.clipboard.writeText(buildUrl(token));
    toast.success("URL copied");
  };

  const handleRevoke = async (token: string) => {
    await revoke.mutateAsync({ token });
    toast.success("Revoked");
    list.refetch();
  };

  if (!canEdit) {
    return (
      <div className="card" style={{ padding: 24 }}>
        Sign in as admin to manage share links.
      </div>
    );
  }

  const links = (list.data as any[]) || [];

  return (
    <div className="flex flex-col gap-lg">
      <h2 className="text-2xl font-bold">Shareable Dashboard Links</h2>

      <div className="card" style={{ padding: 16 }}>
        <h3 className="text-lg font-bold mb-md">Create new link</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, alignItems: "end" }}>
          <Field label="Scope">
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as any)}
              style={inputStyle}
            >
              {SCOPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Label (optional)">
            <input value={label} onChange={(e) => setLabel(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Expires in (days, blank = never)">
            <input
              type="number"
              value={ttlDays}
              onChange={(e) => setTtlDays(e.target.value ? Number(e.target.value) : "")}
              style={inputStyle}
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
            <Plus size={12} /> Create
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {links.length === 0 ? (
          <div style={{ padding: 16, fontSize: 12, opacity: 0.7 }}>No share links yet.</div>
        ) : (
          <table className="table" style={{ width: "100%", fontSize: 11 }}>
            <thead>
              <tr>
                <th style={th}>Label</th>
                <th style={th}>Scope</th>
                <th style={th}>Created</th>
                <th style={th}>Expires</th>
                <th style={th}>URL</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {links.map((l) => (
                <tr key={l.token} style={{ borderTop: "1px solid var(--card-border)" }}>
                  <td style={td}>{l.label || <span style={{ opacity: 0.5 }}>—</span>}</td>
                  <td style={td}>{l.scope}</td>
                  <td style={td}>{new Date(l.createdAt).toLocaleDateString()}</td>
                  <td style={td}>
                    {l.expiresAt ? new Date(l.expiresAt).toLocaleDateString() : "never"}
                  </td>
                  <td style={{ ...td, fontFamily: "monospace", opacity: 0.7 }}>
                    {buildUrl(l.token).slice(0, 40)}…
                  </td>
                  <td style={td}>
                    <button onClick={() => copy(l.token)} title="Copy URL" style={iconBtn}>
                      <Copy size={12} />
                    </button>
                    <button onClick={() => handleRevoke(l.token)} title="Revoke" style={iconBtn}>
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

const inputStyle: React.CSSProperties = {
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
