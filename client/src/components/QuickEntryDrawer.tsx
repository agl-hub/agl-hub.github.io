import { useState } from "react";
import { Plus } from "lucide-react";
import { Drawer } from "vaul";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Tab = "sale" | "expense" | "po";

export default function QuickEntryDrawer() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("sale");

  const createSale = trpc.sales.create.useMutation();
  const createExpense = trpc.expenses.create.useMutation();
  const createPO = trpc.purchaseOrders.create.useMutation();

  const [form, setForm] = useState<any>({});
  const update = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const submit = async () => {
    try {
      if (tab === "sale") {
        await createSale.mutateAsync({
          transactionDate: new Date(),
          channel: form.channel || "POS",
          partService: form.partService || "Item",
          totalAmount: parseFloat(form.totalAmount) || 0,
          paymentMethod: form.paymentMethod || "Cash",
          status: "Completed",
        });
      } else if (tab === "expense") {
        await createExpense.mutateAsync({
          expenseDate: new Date(),
          category: form.category || "General",
          description: form.description || "",
          amount: parseFloat(form.amount) || 0,
        });
      } else {
        await createPO.mutateAsync({
          poNumber: form.poNumber || `PO-${Date.now()}`,
          poDate: new Date(),
          vendor: form.vendor || "",
          description: form.description || "",
          amount: parseFloat(form.amount) || 0,
          status: "Pending",
        });
      }
      toast.success(`${tab} saved`);
      setOpen(false);
      setForm({});
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    }
  };

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <button
          type="button"
          aria-label="Quick entry"
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "6px 10px",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          <Plus size={14} /> Quick Entry
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
                  background: tab === t ? "#2563eb" : "transparent",
                  color: tab === t ? "#fff" : "var(--text, #fff)",
                  border: "1px solid var(--border, #374151)",
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
