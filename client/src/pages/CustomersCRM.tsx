import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  AlertTriangle,
  Car,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageCircle,
  Phone,
  Search,
  UserPlus,
  X,
} from "lucide-react";
import { trpc } from "../lib/trpc";
import { toast } from "sonner";

type SortField = "name" | "vehicles" | "plan";

interface CustomerVehicle {
  id: number;
  registration: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
}

interface CustomerRecord {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  vehicles: CustomerVehicle[];
  planLabel: string;
}

interface NewCustomerForm {
  name: string;
  phone: string;
  email: string;
}

const aglThemeVars: React.CSSProperties = {
  "--agl-primary": "#dc2626",
  "--agl-primary-hover": "#b91c1c",
  "--agl-secondary": "#991b1b",
  "--agl-accent": "#f59e0b",
  "--agl-bg-dark": "#0f172a",
  "--agl-bg-card": "#1e293b",
  "--agl-bg-elevated": "#334155",
  "--agl-text": "#f1f5f9",
  "--agl-text-muted": "#94a3b8",
  "--agl-border": "rgba(255,255,255,0.08)",
  "--agl-success": "#22c55e",
  "--agl-warning": "#f59e0b",
  "--agl-danger": "#ef4444",
  "--agl-info": "#3b82f6",
} as React.CSSProperties;

function planBadgeClass(planLabel: string): string {
  const plan = planLabel.toLowerCase();
  if (plan.includes("fleet")) return "bg-[color:var(--agl-accent)]/20 text-[color:var(--agl-accent)]";
  if (plan.includes("premium")) return "bg-[color:var(--agl-success)]/20 text-[color:var(--agl-success)]";
  if (plan.includes("basic")) return "bg-blue-500/20 text-blue-400";
  return "bg-slate-500/20 text-slate-400";
}

function CrmSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl animate-pulse" />
      <div className="bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 shadow-lg animate-pulse">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={`crm-skeleton-${idx}`} className="h-14 bg-[var(--agl-bg-elevated)] rounded-lg mb-3 last:mb-0" />
        ))}
      </div>
    </div>
  );
}

export const CustomersCRM: React.FC = () => {
  const utils = trpc.useUtils();
  const [search, setSearch] = React.useState("");
  const [sortField, setSortField] = React.useState<SortField>("name");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");
  const [expandedCustomerIds, setExpandedCustomerIds] = React.useState<Set<number>>(new Set());
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [form, setForm] = React.useState<NewCustomerForm>({ name: "", phone: "", email: "" });

  const customersQuery = trpc.customers.list.useQuery({ search: search || undefined });
  const subscriptionsQuery = trpc.subscriptions.listSubscriptions.useQuery(undefined, {
    retry: false,
  });

  const createCustomer = trpc.customers.create.useMutation({
    onSuccess: () => {
      void utils.customers.list.invalidate();
      toast.success("Customer created");
      setForm({ name: "", phone: "", email: "" });
      setCreateModalOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to create customer: ${error.message}`);
    },
  });

  const planByCustomerId = React.useMemo(() => {
    const lookup = new Map<number, string>();
    const data = subscriptionsQuery.data?.subscriptions ?? [];
    data.forEach((row) => {
      lookup.set(row.subscription.customerId, row.plan.name);
    });
    return lookup;
  }, [subscriptionsQuery.data]);

  const customers: CustomerRecord[] = React.useMemo(() => {
    const rows = customersQuery.data?.customers ?? [];
    return rows.map((customer) => ({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email ?? null,
      vehicles: (customer.vehicles ?? []).map((vehicle) => ({
        id: vehicle.id,
        registration: vehicle.registration ?? null,
        make: vehicle.make ?? null,
        model: vehicle.model ?? null,
        year: vehicle.year ?? null,
      })),
      planLabel: planByCustomerId.get(customer.id) ?? "No Plan",
    }));
  }, [customersQuery.data, planByCustomerId]);

  const sortedCustomers = React.useMemo(() => {
    const sorted = [...customers];
    sorted.sort((a, b) => {
      let left: string | number = "";
      let right: string | number = "";
      if (sortField === "name") {
        left = a.name.toLowerCase();
        right = b.name.toLowerCase();
      } else if (sortField === "vehicles") {
        left = a.vehicles.length;
        right = b.vehicles.length;
      } else {
        left = a.planLabel.toLowerCase();
        right = b.planLabel.toLowerCase();
      }
      if (left < right) return sortDirection === "asc" ? -1 : 1;
      if (left > right) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [customers, sortDirection, sortField]);

  const onSort = React.useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        return;
      }
      setSortField(field);
      setSortDirection("asc");
    },
    [sortField]
  );

  const onToggleExpanded = React.useCallback((customerId: number) => {
    setExpandedCustomerIds((prev) => {
      const next = new Set(prev);
      if (next.has(customerId)) {
        next.delete(customerId);
      } else {
        next.add(customerId);
      }
      return next;
    });
  }, []);

  const onSubmitNewCustomer = React.useCallback(() => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }
    createCustomer.mutate({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() ? form.email.trim() : undefined,
      preferredContact: "whatsapp",
      notificationsEnabled: true,
    });
  }, [createCustomer, form.email, form.name, form.phone]);

  const isLoading = customersQuery.isLoading;
  const hasError = customersQuery.error;

  return (
    <main className="min-h-full bg-[var(--agl-bg-dark)] text-[var(--agl-text)] p-6 space-y-4" style={aglThemeVars}>
      <header className="bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 shadow-lg">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-base md:text-xl font-semibold">Customers CRM</h1>
            <p className="text-sm text-[var(--agl-text-muted)]">
              Search customers, review vehicles, monitor plan coverage, and trigger WhatsApp contact.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="bg-[var(--agl-primary)] hover:bg-[var(--agl-primary-hover)] text-white px-4 py-2 rounded-lg font-medium transition inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
          >
            <UserPlus className="h-4 w-4" />
            New Customer
          </button>
        </div>
      </header>

      <section className="bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 shadow-lg">
        <div className="relative">
          <Search className="h-4 w-4 text-[var(--agl-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by customer name or phone"
            className="w-full bg-[var(--agl-bg-elevated)] border border-[var(--agl-border)] rounded-lg pl-10 pr-3 py-2 text-[var(--agl-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
          />
        </div>
      </section>

      {hasError ? (
        <section className="bg-[var(--agl-bg-card)] border border-[var(--agl-danger)]/50 rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-[var(--agl-danger)]" />
            <div>
              <p className="text-sm font-medium">Failed to load customer records</p>
              <p className="text-xs text-[var(--agl-text-muted)]">{hasError.message}</p>
            </div>
          </div>
        </section>
      ) : null}

      {isLoading ? (
        <CrmSkeleton />
      ) : (
        <section className="bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-0 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--agl-border)] text-[var(--agl-text-muted)]">
                  <th scope="col" className="text-left py-3 px-4 font-medium">
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="text-left py-3 px-4 font-medium cursor-pointer"
                    onClick={() => onSort("vehicles")}
                  >
                    <span className="inline-flex items-center gap-1">
                      Vehicles
                      {sortField === "vehicles" ? (
                        sortDirection === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                      ) : null}
                    </span>
                  </th>
                  <th
                    scope="col"
                    className="text-left py-3 px-4 font-medium cursor-pointer"
                    onClick={() => onSort("plan")}
                  >
                    <span className="inline-flex items-center gap-1">
                      Subscription
                      {sortField === "plan" ? (
                        sortDirection === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                      ) : null}
                    </span>
                  </th>
                  <th scope="col" className="text-right py-3 px-4 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 px-4">
                      <div className="text-center">
                        <Car className="h-7 w-7 mx-auto text-[var(--agl-text-muted)] mb-2" />
                        <p className="text-sm text-[var(--agl-text-muted)]">No customers found yet.</p>
                        <button
                          type="button"
                          onClick={() => setCreateModalOpen(true)}
                          className="mt-3 bg-[var(--agl-primary)] hover:bg-[var(--agl-primary-hover)] text-white px-4 py-2 rounded-lg font-medium transition text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
                        >
                          Get started
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedCustomers.map((customer, index) => {
                    const isExpanded = expandedCustomerIds.has(customer.id);
                    const stripeClass = index % 2 === 0 ? "bg-transparent" : "bg-[var(--agl-bg-elevated)]/20";
                    return (
                      <React.Fragment key={customer.id}>
                        <tr className={`${stripeClass} border-b border-[var(--agl-border)] hover:bg-[var(--agl-bg-elevated)]/40`}>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => onToggleExpanded(customer.id)}
                              className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)] rounded"
                            >
                              <p className="text-sm font-medium">{customer.name}</p>
                              <p className="text-xs text-[var(--agl-text-muted)]">{customer.phone}</p>
                            </button>
                          </td>
                          <td className="py-3 px-4 text-[var(--agl-text-muted)]">{customer.vehicles.length}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planBadgeClass(customer.planLabel)}`}>
                              {customer.planLabel}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <a
                                href={`https://wa.me/${customer.phone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-[var(--agl-bg-elevated)] hover:bg-[var(--agl-border)] text-[var(--agl-text)] px-3 py-1.5 rounded-lg transition text-xs inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                                WhatsApp
                              </a>
                              <a
                                href={`tel:${customer.phone}`}
                                className="bg-[var(--agl-bg-elevated)] hover:bg-[var(--agl-border)] text-[var(--agl-text)] px-3 py-1.5 rounded-lg transition text-xs inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
                              >
                                <Phone className="h-3.5 w-3.5" />
                                Call
                              </a>
                            </div>
                          </td>
                        </tr>
                        {isExpanded ? (
                          <tr className="border-b border-[var(--agl-border)] bg-[var(--agl-bg-elevated)]/25">
                            <td colSpan={4} className="py-3 px-4">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 shadow-lg">
                                  <p className="text-xs text-[var(--agl-text-muted)] uppercase mb-2">Vehicles</p>
                                  {customer.vehicles.length === 0 ? (
                                    <p className="text-xs text-[var(--agl-text-muted)]">No vehicles on record.</p>
                                  ) : (
                                    <div className="space-y-2">
                                      {customer.vehicles.map((vehicle) => (
                                        <div key={vehicle.id} className="border border-[var(--agl-border)] rounded-lg p-2">
                                          <p className="text-sm">
                                            {vehicle.registration ?? "No Reg"} - {vehicle.make ?? "Make"} {vehicle.model ?? "Model"}
                                          </p>
                                          <p className="text-xs text-[var(--agl-text-muted)]">
                                            Year: {vehicle.year ?? "Unknown"}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 shadow-lg">
                                  <p className="text-xs text-[var(--agl-text-muted)] uppercase mb-2">Account Health</p>
                                  <div className="space-y-2">
                                    <div className="inline-flex items-center gap-2 text-xs text-[var(--agl-text-muted)]">
                                      <CheckCircle2 className="h-4 w-4 text-[var(--agl-success)]" />
                                      Contact channel active
                                    </div>
                                    <div className="inline-flex items-center gap-2 text-xs text-[var(--agl-text-muted)]">
                                      <CheckCircle2 className="h-4 w-4 text-[var(--agl-success)]" />
                                      CRM profile complete
                                    </div>
                                    <div className="inline-flex items-center gap-2 text-xs text-[var(--agl-text-muted)]">
                                      <CheckCircle2 className="h-4 w-4 text-[var(--agl-success)]" />
                                      Subscription: {customer.planLabel}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <Dialog.Root open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <Dialog.Title className="text-base font-semibold">Create Customer</Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="p-1 rounded-md hover:bg-[var(--agl-bg-elevated)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
                  aria-label="Close new customer dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[var(--agl-text-muted)] mb-1">Name</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full bg-[var(--agl-bg-elevated)] border border-[var(--agl-border)] rounded-lg px-3 py-2 text-[var(--agl-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--agl-text-muted)] mb-1">Phone</label>
                <input
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                  className="w-full bg-[var(--agl-bg-elevated)] border border-[var(--agl-border)] rounded-lg px-3 py-2 text-[var(--agl-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--agl-text-muted)] mb-1">Email</label>
                <input
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full bg-[var(--agl-bg-elevated)] border border-[var(--agl-border)] rounded-lg px-3 py-2 text-[var(--agl-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="bg-[var(--agl-bg-elevated)] hover:bg-[var(--agl-border)] text-[var(--agl-text)] px-4 py-2 rounded-lg transition text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSubmitNewCustomer}
                disabled={createCustomer.isPending}
                className="bg-[var(--agl-primary)] hover:bg-[var(--agl-primary-hover)] text-white px-4 py-2 rounded-lg font-medium transition text-sm inline-flex items-center gap-2 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
              >
                {createCustomer.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save Customer
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </main>
  );
};

export default CustomersCRM;