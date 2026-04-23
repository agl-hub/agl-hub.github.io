import * as React from "react";
import { Link } from "wouter";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeAlert,
  CalendarClock,
  Car,
  CircleDollarSign,
  ClipboardList,
  Loader2,
  Sparkles,
  UserPlus,
  Users,
  Wrench,
} from "lucide-react";
import { trpc } from "../lib/trpc";

type AppointmentStatus = "Scheduled" | "Checked In" | "In Progress" | "Ready" | "Completed" | "Cancelled";

interface DashboardKPI {
  id: string;
  label: string;
  value: string;
  helper: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface ActivityItem {
  id: string;
  title: string;
  helper: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface InsightWidgetProps {
  message?: string;
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

const statusClassMap: Record<AppointmentStatus, string> = {
  Scheduled: "bg-blue-500/20 text-blue-400",
  "Checked In": "bg-blue-500/20 text-blue-400",
  "In Progress": "bg-orange-500/20 text-orange-400",
  Ready: "bg-[color:var(--agl-success)]/20 text-[color:var(--agl-success)] animate-pulse",
  Completed: "bg-slate-500/20 text-slate-400",
  Cancelled: "bg-[color:var(--agl-danger)]/20 text-[color:var(--agl-danger)]",
};

function formatGhs(amount: number): string {
  return `GHS ${amount.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function InsightWidget({ message }: InsightWidgetProps) {
  return (
    <div className="bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[var(--agl-accent)] mt-0.5" />
        <div>
          <p className="text-sm font-medium text-[var(--agl-text)]">
            {message ?? "Medium: Facebook ads spent GHS 500.00, 0 conversions this week."}
          </p>
          <p className="text-xs text-[var(--agl-text-muted)] mt-1">
            Suggested action: Pause campaign and reallocate budget to WhatsApp.
          </p>
          <button
            type="button"
            className="mt-2 text-xs bg-[var(--agl-primary)] hover:bg-[var(--agl-primary-hover)] text-white px-3 py-1 rounded transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
          >
            Pause Campaign
          </button>
        </div>
      </div>
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 shadow-lg animate-pulse">
      <div className="h-3 w-1/2 bg-[var(--agl-bg-elevated)] rounded mb-3" />
      <div className="h-7 w-2/3 bg-[var(--agl-bg-elevated)] rounded mb-2" />
      <div className="h-3 w-1/3 bg-[var(--agl-bg-elevated)] rounded" />
    </div>
  );
}

export const EnterpriseDashboard: React.FC = () => {
  const { data: salesData, isLoading: salesLoading, error: salesError } = trpc.finance.dailySales.useQuery();
  const { data: appointmentsData, isLoading: appointmentsLoading, error: appointmentsError } =
    trpc.appointments.list.useQuery({ status: "Scheduled" });
  const { data: customersData, isLoading: customersLoading, error: customersError } = trpc.customers.list.useQuery();
  const { data: subscribersData, isLoading: subscribersLoading } = trpc.subscriptions.listSubscribers.useQuery();
  const { data: alertsData, isLoading: alertsLoading, error: alertsError } = trpc.monitoring.getAlerts.useQuery();

  const appointments = appointmentsData?.appointments ?? [];
  const customers = customersData?.customers ?? [];
  const salesTotal = salesData?.data?.grandTotal ?? 0;
  const activeSubscribers = subscribersData?.subscribers?.length ?? 0;
  // TODO: Wire to tRPC in Phase 4 if monitoring router shape changes.
  const activeAlerts = alertsData?.alerts?.length ?? 0;

  const kpis: DashboardKPI[] = [
    {
      id: "gross-revenue",
      label: "Gross Revenue",
      value: formatGhs(salesTotal),
      helper: `${salesData?.data?.breakdown?.length ?? 0} payment channels`,
      icon: CircleDollarSign,
    },
    {
      id: "open-jobs",
      label: "Open Jobs",
      value: String(appointments.length),
      helper: "Scheduled for action",
      icon: Wrench,
    },
    {
      id: "customers",
      label: "Total Customers",
      value: String(customers.length),
      helper: "Active records",
      icon: Users,
    },
    {
      id: "mrr",
      label: "Subscription MRR",
      value: formatGhs(activeSubscribers * 120),
      helper: `${activeSubscribers} active subscribers`,
      icon: Activity,
    },
  ];

  const recentActivities: ActivityItem[] = [
    {
      id: "a1",
      title: `${appointments.length} jobs scheduled in the board`,
      helper: "Workshop queue updated",
      icon: ClipboardList,
    },
    {
      id: "a2",
      title: `${customers.length} customer profiles available`,
      helper: "CRM ready for follow-up",
      icon: UserPlus,
    },
    {
      id: "a3",
      title: `${activeAlerts} active monitoring alert${activeAlerts === 1 ? "" : "s"}`,
      helper: "Needs manager review",
      icon: BadgeAlert,
    },
  ];

  const hasError = salesError || appointmentsError || customersError || alertsError;
  const isLoading = salesLoading || appointmentsLoading || customersLoading || subscribersLoading;

  return (
    <main
      className="min-h-full bg-[var(--agl-bg-dark)] text-[var(--agl-text)] p-6 space-y-6"
      style={aglThemeVars}
    >
      <header className="bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--agl-text-muted)]">AGL Ops Enterprise</p>
            <h1 className="text-base md:text-xl font-semibold">Live Command Center</h1>
            <p className="text-sm text-[var(--agl-text-muted)] mt-1">
              Unified visibility across workshop, finance, team, and customer operations.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/workshop"
              className="bg-[var(--agl-primary)] hover:bg-[var(--agl-primary-hover)] text-white px-4 py-2 rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
            >
              Open Job Board
            </Link>
            <Link
              href="/customers"
              className="bg-[var(--agl-bg-elevated)] hover:bg-[var(--agl-border)] text-[var(--agl-text)] px-4 py-2 rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
            >
              Customer CRM
            </Link>
          </div>
        </div>
      </header>

      <InsightWidget
        message={
          alertsLoading
            ? "Monitoring engine is reviewing campaign performance."
            : activeAlerts > 0
              ? `Medium: ${activeAlerts} monitoring alert${activeAlerts === 1 ? "" : "s"} detected in operations.`
              : "Medium: Facebook ads spent GHS 500.00, 0 conversions this week."
        }
      />

      {hasError ? (
        <section className="bg-[var(--agl-bg-card)] border border-[var(--agl-danger)]/50 rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-[var(--agl-danger)]" />
            <div>
              <p className="text-sm font-medium text-[var(--agl-text)]">Dashboard data failed to load</p>
              <p className="text-xs text-[var(--agl-text-muted)]">
                Check API connectivity and tenant permissions, then refresh.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, idx) => <KpiSkeleton key={`kpi-skeleton-${idx}`} />)
          : kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <article
                  key={kpi.id}
                  className="bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[var(--agl-text-muted)] uppercase tracking-wide">{kpi.label}</p>
                    <Icon className="h-4 w-4 text-[var(--agl-accent)]" />
                  </div>
                  <p className="mt-2 text-xl font-semibold">{kpi.value}</p>
                  <p className="mt-1 text-xs text-[var(--agl-text-muted)]">{kpi.helper}</p>
                </article>
              );
            })}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <article className="xl:col-span-2 bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Recent Activity</h2>
            <Link
              href="/workshop"
              className="text-xs text-[var(--agl-text-muted)] hover:text-[var(--agl-text)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)] rounded"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-[var(--agl-text-muted)]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading activity feed...
              </div>
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 rounded-lg border border-[var(--agl-border)] bg-[var(--agl-bg-elevated)]/40 p-3"
                  >
                    <Icon className="h-4 w-4 mt-0.5 text-[var(--agl-accent)]" />
                    <div>
                      <p className="text-sm">{activity.title}</p>
                      <p className="text-xs text-[var(--agl-text-muted)]">{activity.helper}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--agl-border)] p-8 text-center">
                <Sparkles className="mx-auto h-6 w-6 text-[var(--agl-text-muted)] mb-2" />
                <p className="text-sm text-[var(--agl-text-muted)]">No activity yet for this tenant.</p>
                <Link
                  href="/workshop"
                  className="mt-3 inline-flex items-center gap-2 bg-[var(--agl-primary)] hover:bg-[var(--agl-primary-hover)] text-white px-4 py-2 rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
                >
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </article>

        <article className="bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 shadow-lg">
          <h2 className="text-base font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-2">
            <Link
              href="/workshop"
              className="bg-[var(--agl-primary)] hover:bg-[var(--agl-primary-hover)] text-white px-4 py-2 rounded-lg font-medium transition flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
            >
              <span className="inline-flex items-center gap-2">
                <CalendarClock className="h-4 w-4" />
                New Appointment
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/customers"
              className="bg-[var(--agl-bg-elevated)] hover:bg-[var(--agl-border)] text-[var(--agl-text)] px-4 py-2 rounded-lg transition flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
            >
              <span className="inline-flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Add Customer
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/finance"
              className="bg-[var(--agl-bg-elevated)] hover:bg-[var(--agl-border)] text-[var(--agl-text)] px-4 py-2 rounded-lg transition flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
            >
              <span className="inline-flex items-center gap-2">
                <CircleDollarSign className="h-4 w-4" />
                Record Finance
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/hr"
              className="bg-[var(--agl-bg-elevated)] hover:bg-[var(--agl-border)] text-[var(--agl-text)] px-4 py-2 rounded-lg transition flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
            >
              <span className="inline-flex items-center gap-2">
                <Users className="h-4 w-4" />
                Manage Staff
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </article>
      </section>

      <section className="bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Upcoming Jobs</h2>
          <Link
            href="/workshop"
            className="text-xs text-[var(--agl-text-muted)] hover:text-[var(--agl-text)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)] rounded"
          >
            Open Kanban
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--agl-border)] text-[var(--agl-text-muted)]">
                <th scope="col" className="text-left py-2 px-3 font-medium">
                  Vehicle
                </th>
                <th scope="col" className="text-left py-2 px-3 font-medium">
                  Customer
                </th>
                <th scope="col" className="text-left py-2 px-3 font-medium">
                  Service
                </th>
                <th scope="col" className="text-left py-2 px-3 font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {appointmentsLoading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-[var(--agl-text-muted)]">
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading appointments...
                    </div>
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10">
                    <div className="text-center">
                      <Car className="mx-auto h-6 w-6 text-[var(--agl-text-muted)] mb-2" />
                      <p className="text-sm text-[var(--agl-text-muted)] mb-3">No scheduled jobs for now.</p>
                      <Link
                        href="/workshop"
                        className="inline-flex items-center gap-2 bg-[var(--agl-primary)] hover:bg-[var(--agl-primary-hover)] text-white px-4 py-2 rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
                      >
                        Get started
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                appointments.slice(0, 6).map((row, index) => {
                  const status = row.appointment.status as AppointmentStatus;
                  return (
                    <tr
                      key={row.appointment.id}
                      className={`border-b border-[var(--agl-border)] hover:bg-[var(--agl-bg-elevated)]/40 ${
                        index % 2 === 0 ? "bg-transparent" : "bg-[var(--agl-bg-elevated)]/20"
                      }`}
                    >
                      <td className="py-2 px-3">{row.vehicle.makeModel ?? "Vehicle"}</td>
                      <td className="py-2 px-3">{row.customer.name}</td>
                      <td className="py-2 px-3">{row.appointment.serviceType}</td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClassMap[status]}`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default EnterpriseDashboard;