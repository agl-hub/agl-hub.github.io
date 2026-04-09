import { useState } from "react";
import { Plus } from "lucide-react";
import { Drawer } from "vaul";
import { updateData } from "../lib/dataStore";
import { useLayout } from "./MainLayout";

type Tab = "sale" | "expense" | "po";

export default function QuickEntryDrawer() {
  const { showToast } = useLayout();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("sale");
  const [form, setForm] = useState<any>({});
  const update = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const submit = () => {
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    try {
      if (tab === "sale") {
        updateData(d => {
          d.sales.push({
            id: `s_${Date.now()}`,
            date: today,
            time: now,
            channel: form.channel || "POS",
            item: form.partService || "Item",
            customer: form.customer || "Walk-in",
            contact: "",
            rep: form.rep || "Staff",
            qty: 1,
            price: parseFloat(form.totalAmount) || 0,
            total: parseFloat(form.totalAmount) || 0,
            payment: form.paymentMethod || "Cash",
            receipt: `RCP-${Date.now()}`,
            vehicle: "",
            status: "Completed",
            notes: "",
          });
        });
      } else if (tab === "expense") {
        updateData(d => {
          d.expenses.push({
            id: `e_${Date.now()}`,
            date: today,
            item: form.category || "General",
            supplier: form.description || "General",
            amount: parseFloat(form.amount) || 0,
            purpose: form.description || "",
          });
        });
      } else {
        updateData(d => {
          d.purchaseOrders.push({
            id: `po_${Date.now()}`,
            poNumber: form.poNumber || `PO-${Date.now()}`,
            date: today,
            supplier: form.vendor || "",
            amount: parseFloat(form.amount) || 0,
            items: form.description || "",
            notes: "",
          });
        });
      }
      showToast(`${tab} saved`, "success");
      setOpen(false);
      setForm({});
    } catch (e: any) {
      showToast(e?.message || "Save failed", "error");
    }
  };

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
          <Drawer.Trigger asChild>
        <button
          type="button"
          title="Quick Entry"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "5px 10px",
            background: "var(--primary, #E30613)",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          <Plus size={14} /> Quick Add
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000 }} />
        <Drawer.Content
          style={{
            position: "fixed",
            right: 0,
            top: 0,
            bottom: 0,
            width: "min(420px, 95vw)",
            background: "var(--bg-secondary, #1f2937)",
            color: "var(--text, #fff)",
            padding: 16,
            zIndex: 1001,
            overflowY: "auto",
            borderLeft: "1px solid var(--border, #374151)",
          }}
        >
          <Drawer.Title style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
            Quick Entry
          </Drawer.Title>
          <Drawer.Description style={{ fontSize: 11, opacity: 0.7, marginBottom: 12 }}>
            Add a sale, expense, or purchase order in a few clicks.
          </Drawer.Description>

          <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
            {(["sale", "expense", "po"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  background: tab === t ? "var(--primary, #E30613)" : "transparent",
                  color: "#fff",
                  border: "1px solid var(--card-border, #374151)",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 11,
                  textTransform: "capitalize",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tab === "sale" && (
              <>
                <Field label="Channel" value={form.channel || ""} onChange={(v) => update("channel", v)} />
                <Field label="Item / Service" value={form.partService || ""} onChange={(v) => update("partService", v)} />
                <Field label="Customer" value={form.customer || ""} onChange={(v) => update("customer", v)} />
                <Field label="Amount (GHS)" type="number" value={form.totalAmount || ""} onChange={(v) => update("totalAmount", v)} />
                <Field label="Payment Method" value={form.paymentMethod || ""} onChange={(v) => update("paymentMethod", v)} />
              </>
            )}
            {tab === "expense" && (
              <>
                <Field label="Category" value={form.category || ""} onChange={(v) => update("category", v)} />
                <Field label="Description" value={form.description || ""} onChange={(v) => update("description", v)} />
                <Field label="Amount (GHS)" type="number" value={form.amount || ""} onChange={(v) => update("amount", v)} />
              </>
            )}
            {tab === "po" && (
              <>
                <Field label="PO Number" value={form.poNumber || ""} onChange={(v) => update("poNumber", v)} />
                <Field label="Vendor" value={form.vendor || ""} onChange={(v) => update("vendor", v)} />
                <Field label="Description" value={form.description || ""} onChange={(v) => update("description", v)} />
                <Field label="Amount (GHS)" type="number" value={form.amount || ""} onChange={(v) => update("amount", v)} />
              </>
            )}
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button
              onClick={submit}
              style={{
                flex: 1,
                padding: "8px 12px",
                background: "#10b981",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Save
            </button>
            <button
              onClick={() => setOpen(false)}
              style={{
                padding: "8px 12px",
                background: "transparent",
                color: "var(--text, #fff)",
                border: "1px solid var(--border, #374151)",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Cancel
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11 }}>
      <span style={{ opacity: 0.8 }}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "6px 8px",
          background: "var(--bg, #111827)",
          color: "var(--text, #fff)",
          border: "1px solid var(--border, #374151)",
          borderRadius: 4,
          fontSize: 12,
        }}
      />
    </label>
  );
}
