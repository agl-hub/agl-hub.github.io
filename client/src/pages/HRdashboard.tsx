import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  AlertTriangle,
  Clock,
  Loader2,
  ShieldAlert,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { trpc } from "../lib/trpc";
import { toast } from "sonner";

interface StaffMember {
  id: number;
  name: string;
  role: string;
  status: string;
  hourlyRate: number;
}

interface AttendanceRow {
  id: number;
  staffName: string;
  clockInTime: string;
  clockOutTime: string | null;
  overtimeHours: string | null;
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

function formatGhs(value: number): string {
  return `GHS ${value.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function AiWidget({ alertCount }: { alertCount: number }) {
  return (
    <div className="bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[var(--agl-accent)] mt-0.5" />
        <div>
          <p className="text-sm font-medium text-[var(--agl-text)]">
            Medium: {alertCount} staff anomaly flag{alertCount === 1 ? "" : "s"} detected this week.
          </p>
          <p className="text-xs text-[var(--agl-text-muted)] mt-1">
            Suggested action: Review late arrivals and rebalance shifts for better on-time coverage.
          </p>
          <button className="mt-2 text-xs bg-[var(--agl-primary)] hover:bg-[var(--agl-primary-hover)] text-white px-3 py-1 rounded transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]">
            Open AI Review
          </button>
        </div>
      </div>
    </div>
  );
}

export const HRDashboard: React.FC = () => {
  const utils = trpc.useUtils();
  const [clockInStaffId, setClockInStaffId] = React.useState<number | null>(null);
  const [recordModalOpen, setRecordModalOpen] = React.useState(false);
  const [selectedStaffId, setSelectedStaffId] = React.useState<number | null>(null);
  const [jobsCompleted, setJobsCompleted] = React.useState<number>(0);

  const staffQuery = trpc.staffManagement.list.useQuery();
  const attendanceQuery = trpc.staffManagement.listAttendance.useQuery();
  const alertsQuery = trpc.monitoring.getAlerts.useQuery();

  const clockInMutation = trpc.staffManagement.clockIn.useMutation({
    onSuccess: () => {
      void utils.staffManagement.listAttendance.invalidate();
      toast.success("Clock-in recorded");
    },
    onError: (error) => toast.error(`Clock-in failed: ${error.message}`),
  });

  const recordPerformanceMutation = trpc.staffManagement.recordPerformance.useMutation({
    onSuccess: () => {
      toast.success("Performance saved");
      setRecordModalOpen(false);
    },
    onError: (error) => toast.error(`Performance save failed: ${error.message}`),
  });

  const staffMembers: StaffMember[] = React.useMemo(() => {
    if (!staffQuery.data?.staff) return [];
    return staffQuery.data.staff.map((staff) => ({
      id: staff.id,
      name: staff.name,
      role: staff.role,
      status: staff.status,
      hourlyRate: Number(staff.hourlyRate ?? 0),
    }));
  }, [staffQuery.data]);

  const attendanceRows: AttendanceRow[] = React.useMemo(() => {
    if (!attendanceQuery.data?.attendanceLogs) return [];
    return attendanceQuery.data.attendanceLogs.map((row) => ({
      id: row.log.id,
      staffName: row.staffName,
      clockInTime: row.log.clockInTime ?? "",
      clockOutTime: row.log.clockOutTime ?? null,
      overtimeHours: row.log.overtimeHours ?? null,
    }));
  }, [attendanceQuery.data]);

  const payrollSummary = React.useMemo(() => {
    const openByStaff = new Map<string, AttendanceRow>();
    attendanceRows.forEach((row) => {
      if (!row.clockOutTime) openByStaff.set(row.staffName, row);
    });
    const gross = staffMembers.reduce((sum, member) => {
      const hasOpenShift = openByStaff.has(member.name);
      return sum + (hasOpenShift ? member.hourlyRate * 8 : 0);
    }, 0);
    const deductions = gross * 0.06;
    return {
      gross,
      deductions,
      net: gross - deductions,
    };
  }, [attendanceRows, staffMembers]);

  const isLoading = staffQuery.isLoading || attendanceQuery.isLoading;
  const hasError = staffQuery.error || attendanceQuery.error;
  const alertCount = alertsQuery.data?.alerts?.length ?? 0;

  const openRecordModal = React.useCallback((staffId: number) => {
    setSelectedStaffId(staffId);
    setJobsCompleted(0);
    setRecordModalOpen(true);
  }, []);

  const submitPerformance = React.useCallback(() => {
    if (!selectedStaffId) return;
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);

    recordPerformanceMutation.mutate({
      staffId: selectedStaffId,
      monthStart,
      monthEnd,
      jobsCompleted,
      avgJobTime: 2.4,
      customerRating: 4.5,
      revenueGenerated: 0,
      deductionsApplied: 0,
    });
  }, [jobsCompleted, recordPerformanceMutation, selectedStaffId]);

  return (
    <main className="min-h-full bg-[var(--agl-bg-dark)] text-[var(--agl-text)] p-6 space-y-6" style={aglThemeVars}>
      <header className="bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 shadow-lg">
        <h1 className="text-base md:text-xl font-semibold">HR Dashboard</h1>
        <p className="text-sm text-[var(--agl-text-muted)] mt-1">
          Staff attendance, payroll preview, and AI-driven workforce risk monitoring.
        </p>
      </header>

      <AiWidget alertCount={alertCount} />

      {hasError ? (
        <section className="bg-[var(--agl-bg-card)] border border-[var(--agl-danger)]/50 rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-[var(--agl-danger)]" />
            <div>
              <p className="text-sm font-medium">Unable to load HR data</p>
              <p className="text-xs text-[var(--agl-text-muted)]">
                {hasError.message}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <article className="lg:col-span-2 bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 shadow-lg">
          <h2 className="text-base font-semibold mb-3">Clock In / Out</h2>
          {isLoading ? (
            <div className="py-10 text-center text-[var(--agl-text-muted)]">
              <Loader2 className="h-5 w-5 mx-auto animate-spin mb-2" />
              Loading attendance...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {staffMembers.slice(0, 8).map((member) => (
                <div key={member.id} className="border border-[var(--agl-border)] rounded-lg p-3 bg-[var(--agl-bg-elevated)]/30">
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-[var(--agl-text-muted)]">{member.role} • {member.status}</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setClockInStaffId(member.id);
                        clockInMutation.mutate({ staffId: member.id });
                      }}
                      className="bg-[var(--agl-primary)] hover:bg-[var(--agl-primary-hover)] text-white px-3 py-1 rounded-lg font-medium transition text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
                    >
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Clock In
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openRecordModal(member.id)}
                      className="bg-[var(--agl-bg-elevated)] hover:bg-[var(--agl-border)] text-[var(--agl-text)] px-3 py-1 rounded-lg transition text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
                    >
                      Performance
                    </button>
                  </div>
                  {clockInMutation.isPending && clockInStaffId === member.id ? (
                    <p className="text-xs text-[var(--agl-text-muted)] mt-2">Submitting...</p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 shadow-lg">
          <h2 className="text-base font-semibold mb-3">Payroll Preview</h2>
          <div className="space-y-2">
            <p className="text-sm text-[var(--agl-text-muted)]">Gross</p>
            <p className="text-xl font-semibold">{formatGhs(payrollSummary.gross)}</p>
            <p className="text-sm text-[var(--agl-text-muted)]">Deductions</p>
            <p className="text-lg text-[var(--agl-danger)]">-{formatGhs(payrollSummary.deductions)}</p>
            <p className="text-sm text-[var(--agl-text-muted)]">Net Payroll</p>
            <p className="text-xl text-[var(--agl-success)] font-semibold">{formatGhs(payrollSummary.net)}</p>
          </div>
        </article>
      </section>

      <section className="bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 shadow-lg">
        <h2 className="text-base font-semibold mb-3">Attendance Log</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--agl-border)] text-[var(--agl-text-muted)]">
                <th scope="col" className="text-left py-2 px-3 font-medium">Staff</th>
                <th scope="col" className="text-left py-2 px-3 font-medium">Clock In</th>
                <th scope="col" className="text-left py-2 px-3 font-medium">Clock Out</th>
                <th scope="col" className="text-left py-2 px-3 font-medium">Overtime</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-[var(--agl-text-muted)]">
                    <Users className="h-5 w-5 mx-auto mb-2" />
                    No attendance records yet.
                  </td>
                </tr>
              ) : (
                attendanceRows.slice(0, 20).map((row, idx) => (
                  <tr key={row.id} className={`${idx % 2 === 0 ? "bg-transparent" : "bg-[var(--agl-bg-elevated)]/20"} border-b border-[var(--agl-border)] hover:bg-[var(--agl-bg-elevated)]/40`}>
                    <td className="py-2 px-3">{row.staffName}</td>
                    <td className="py-2 px-3">{new Date(row.clockInTime).toLocaleString()}</td>
                    <td className="py-2 px-3">{row.clockOutTime ? new Date(row.clockOutTime).toLocaleString() : "Active Shift"}</td>
                    <td className="py-2 px-3">{row.overtimeHours ?? "0.00"}h</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog.Root open={recordModalOpen} onOpenChange={setRecordModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <Dialog.Title className="text-base font-semibold">Record Performance</Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close performance modal"
                  className="p-1 rounded-md hover:bg-[var(--agl-bg-elevated)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            <label className="block text-xs text-[var(--agl-text-muted)] mb-1">Jobs Completed</label>
            <input
              type="number"
              min={0}
              value={jobsCompleted}
              onChange={(event) => setJobsCompleted(Number(event.target.value))}
              className="w-full bg-[var(--agl-bg-elevated)] border border-[var(--agl-border)] rounded-lg px-3 py-2 text-[var(--agl-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRecordModalOpen(false)}
                className="bg-[var(--agl-bg-elevated)] hover:bg-[var(--agl-border)] text-[var(--agl-text)] px-4 py-2 rounded-lg transition text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitPerformance}
                disabled={recordPerformanceMutation.isPending}
                className="bg-[var(--agl-primary)] hover:bg-[var(--agl-primary-hover)] text-white px-4 py-2 rounded-lg font-medium transition text-sm inline-flex items-center gap-2 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
              >
                {recordPerformanceMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                Save
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </main>
  );
};

export default HRDashboard;