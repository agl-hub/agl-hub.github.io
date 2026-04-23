import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  Car,
  Loader2,
  UserCog,
  Wrench,
  X,
} from "lucide-react";
import { trpc } from "../lib/trpc";
import { toast } from "sonner";

type AppointmentStatus = "Scheduled" | "In Progress" | "Ready" | "Completed" | "Cancelled";

interface MechanicOption {
  id: number;
  name: string;
}

interface KanbanCard {
  id: number;
  customerName: string;
  vehicleLabel: string;
  serviceType: string;
  status: AppointmentStatus;
  assignedMechanic: string | null;
  scheduleLabel: string;
}

interface StatusColumn {
  id: AppointmentStatus;
  title: string;
  badgeClass: string;
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

const statusColumns: StatusColumn[] = [
  { id: "Scheduled", title: "Scheduled", badgeClass: "bg-blue-500/20 text-blue-400" },
  { id: "In Progress", title: "In Progress", badgeClass: "bg-orange-500/20 text-orange-400" },
  { id: "Ready", title: "Ready", badgeClass: "bg-[color:var(--agl-success)]/20 text-[color:var(--agl-success)] animate-pulse" },
  { id: "Completed", title: "Completed", badgeClass: "bg-slate-500/20 text-slate-400" },
  { id: "Cancelled", title: "Cancelled", badgeClass: "bg-[color:var(--agl-danger)]/20 text-[color:var(--agl-danger)]" },
];

function mapIncomingStatus(raw: string): AppointmentStatus {
  if (raw === "Scheduled") return "Scheduled";
  if (raw === "In Progress" || raw === "Checked In") return "In Progress";
  if (raw === "Ready") return "Ready";
  if (raw === "Cancelled") return "Cancelled";
  return "Completed";
}

function statusBadgeClass(status: AppointmentStatus): string {
  const found = statusColumns.find((col) => col.id === status);
  return found ? found.badgeClass : "bg-slate-500/20 text-slate-400";
}

function KanbanSkeleton() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div
          key={`kanban-skeleton-${idx}`}
          className="bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 shadow-lg animate-pulse"
        >
          <div className="h-4 w-1/2 bg-[var(--agl-bg-elevated)] rounded mb-4" />
          <div className="space-y-3">
            <div className="h-24 bg-[var(--agl-bg-elevated)] rounded-lg" />
            <div className="h-24 bg-[var(--agl-bg-elevated)] rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export const WorkshopKanban: React.FC = () => {
  const utils = trpc.useUtils();

  const [localAssignments, setLocalAssignments] = React.useState<Record<number, string>>({});
  const [assignmentCard, setAssignmentCard] = React.useState<KanbanCard | null>(null);
  const [selectedMechanicId, setSelectedMechanicId] = React.useState<number | null>(null);
  const [activeDropColumn, setActiveDropColumn] = React.useState<AppointmentStatus | null>(null);

  const { data: appointmentsData, isLoading: appointmentsLoading, error: appointmentsError } =
    trpc.appointments.list.useQuery();
  const { data: mechanicsData, isLoading: mechanicsLoading } = trpc.staff.list.useQuery({ role: "mechanic" });

  const updateStatus = trpc.appointments.updateStatus.useMutation({
    onSuccess: () => {
      void utils.appointments.list.invalidate();
      toast.success("Job status updated");
    },
    onError: (error) => {
      toast.error(`Unable to update status: ${error.message}`);
    },
  });

  const mechanics: MechanicOption[] = React.useMemo(() => {
    if (!mechanicsData?.staff) return [];
    return mechanicsData.staff.map((staffMember) => ({ id: staffMember.id, name: staffMember.name }));
  }, [mechanicsData]);

  const cards: KanbanCard[] = React.useMemo(() => {
    if (!appointmentsData?.appointments) return [];
    return appointmentsData.appointments.map((row) => {
      const fallbackVehicle = [row.vehicle?.make, row.vehicle?.model].filter(Boolean).join(" ");
      const vehicleLabel = row.vehicle?.registration || fallbackVehicle || "Vehicle";
      const mechanicName = localAssignments[row.appointment.id] ?? row.appointment.assignedMechanic ?? null;
      return {
        id: row.appointment.id,
        customerName: row.customer?.name ?? "Unknown Customer",
        vehicleLabel,
        serviceType: row.appointment.serviceType ?? "General Service",
        status: mapIncomingStatus(row.appointment.status),
        assignedMechanic: mechanicName,
        scheduleLabel: `${row.appointment.scheduledDate}${row.appointment.scheduledTime ? ` • ${row.appointment.scheduledTime}` : ""}`,
      };
    });
  }, [appointmentsData, localAssignments]);

  const groupedCards = React.useMemo(() => {
    const grouped: Record<AppointmentStatus, KanbanCard[]> = {
      Scheduled: [],
      "In Progress": [],
      Ready: [],
      Completed: [],
      Cancelled: [],
    };
    cards.forEach((card) => {
      grouped[card.status].push(card);
    });
    return grouped;
  }, [cards]);

  const moveCard = React.useCallback(
    (cardId: number, nextStatus: AppointmentStatus) => {
      updateStatus.mutate({ id: cardId, status: nextStatus });
    },
    [updateStatus]
  );

  const onDropCard = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>, targetColumn: AppointmentStatus) => {
      event.preventDefault();
      setActiveDropColumn(null);
      const payload = event.dataTransfer.getData("application/json");
      if (!payload) return;
      try {
        const parsed = JSON.parse(payload) as { id: number; status: AppointmentStatus };
        if (parsed.status !== targetColumn) {
          moveCard(parsed.id, targetColumn);
        }
      } catch {
        toast.error("Could not process dropped job card");
      }
    },
    [moveCard]
  );

  const confirmAssignment = React.useCallback(() => {
    if (!assignmentCard || !selectedMechanicId) {
      toast.error("Select a mechanic before saving");
      return;
    }
    const selectedMechanic = mechanics.find((item) => item.id === selectedMechanicId);
    if (!selectedMechanic) {
      toast.error("Selected mechanic not found");
      return;
    }

    // TODO: Wire to tRPC in Phase 4
    setLocalAssignments((previous) => ({
      ...previous,
      [assignmentCard.id]: selectedMechanic.name,
    }));
    toast.success(`${selectedMechanic.name} assigned to ${assignmentCard.vehicleLabel}`);
    setAssignmentCard(null);
    setSelectedMechanicId(null);
  }, [assignmentCard, mechanics, selectedMechanicId]);

  if (appointmentsLoading || mechanicsLoading) {
    return (
      <main className="min-h-full bg-[var(--agl-bg-dark)] text-[var(--agl-text)] p-6" style={aglThemeVars}>
        <KanbanSkeleton />
      </main>
    );
  }

  if (appointmentsError) {
    return (
      <main className="min-h-full bg-[var(--agl-bg-dark)] text-[var(--agl-text)] p-6" style={aglThemeVars}>
        <section className="bg-[var(--agl-bg-card)] border border-[var(--agl-danger)]/50 rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-[var(--agl-danger)]" />
            <div>
              <p className="text-sm font-medium">Unable to load workshop board</p>
              <p className="text-xs text-[var(--agl-text-muted)]">{appointmentsError.message}</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-full bg-[var(--agl-bg-dark)] text-[var(--agl-text)] p-6 space-y-4" style={aglThemeVars}>
      <header className="bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 shadow-lg">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-base md:text-xl font-semibold">Workshop Kanban</h1>
            <p className="text-sm text-[var(--agl-text-muted)]">
              Live service flow with status movement, assignment, and completion tracking.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-xs text-[var(--agl-text-muted)]">
            <CalendarClock className="h-4 w-4" />
            Drag cards across columns to update job status
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {statusColumns.map((column) => {
          const columnCards = groupedCards[column.id];
          const isActiveDrop = activeDropColumn === column.id;
          return (
            <article
              key={column.id}
              className={`bg-[var(--agl-bg-card)] border rounded-xl p-3 shadow-lg min-h-[520px] transition ${
                isActiveDrop ? "border-[var(--agl-primary)]" : "border-[var(--agl-border)]"
              }`}
              onDragOver={(event) => {
                event.preventDefault();
                setActiveDropColumn(column.id);
              }}
              onDragLeave={() => setActiveDropColumn(null)}
              onDrop={(event) => onDropCard(event, column.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold">{column.title}</h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${column.badgeClass}`}>
                  {columnCards.length}
                </span>
              </div>

              <div className="space-y-3">
                {columnCards.length === 0 ? (
                  <div className="border border-dashed border-[var(--agl-border)] rounded-lg p-6 text-center">
                    <Car className="h-5 w-5 mx-auto text-[var(--agl-text-muted)] mb-2" />
                    <p className="text-xs text-[var(--agl-text-muted)]">No jobs in this stage</p>
                  </div>
                ) : (
                  columnCards.map((card) => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData(
                          "application/json",
                          JSON.stringify({ id: card.id, status: card.status })
                        );
                      }}
                      className="bg-[var(--agl-bg-elevated)]/50 border border-[var(--agl-border)] rounded-xl p-3 cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="text-sm font-medium">{card.vehicleLabel}</p>
                          <p className="text-xs text-[var(--agl-text-muted)]">{card.customerName}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(card.status)}`}>
                          {card.status}
                        </span>
                      </div>

                      <p className="text-xs text-[var(--agl-text)] mb-2">{card.serviceType}</p>
                      <p className="text-xs text-[var(--agl-text-muted)] mb-2">{card.scheduleLabel}</p>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-[var(--agl-text-muted)] inline-flex items-center gap-1">
                          <Wrench className="h-3.5 w-3.5" />
                          {card.assignedMechanic ?? "Unassigned"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setAssignmentCard(card);
                            setSelectedMechanicId(null);
                          }}
                          className="bg-[var(--agl-bg-elevated)] hover:bg-[var(--agl-border)] text-[var(--agl-text)] px-2 py-1 rounded-lg transition text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
                        >
                          Assign
                        </button>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        {column.id !== "Cancelled" && column.id !== "Completed" ? (
                          <>
                            {column.id !== "In Progress" ? (
                              <button
                                type="button"
                                onClick={() => moveCard(card.id, "In Progress")}
                                disabled={updateStatus.isPending}
                                className="bg-[var(--agl-primary)] hover:bg-[var(--agl-primary-hover)] text-white px-2 py-1 rounded-lg font-medium transition text-xs disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
                              >
                                Start
                              </button>
                            ) : null}
                            {column.id !== "Ready" ? (
                              <button
                                type="button"
                                onClick={() => moveCard(card.id, "Ready")}
                                disabled={updateStatus.isPending}
                                className="bg-[var(--agl-bg-elevated)] hover:bg-[var(--agl-border)] text-[var(--agl-text)] px-2 py-1 rounded-lg transition text-xs disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
                              >
                                Mark Ready
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => moveCard(card.id, "Completed")}
                                disabled={updateStatus.isPending}
                                className="bg-[var(--agl-primary)] hover:bg-[var(--agl-primary-hover)] text-white px-2 py-1 rounded-lg font-medium transition text-xs disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)] inline-flex items-center gap-1"
                              >
                                Complete
                                <ArrowRight className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>
          );
        })}
      </section>

      <Dialog.Root open={Boolean(assignmentCard)} onOpenChange={(open) => !open && setAssignmentCard(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <Dialog.Title className="text-base font-semibold">Assign Mechanic</Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="p-1 rounded-md hover:bg-[var(--agl-bg-elevated)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
                  aria-label="Close assignment dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            <p className="text-xs text-[var(--agl-text-muted)] mb-3">
              {assignmentCard ? `Select mechanic for ${assignmentCard.vehicleLabel}` : "Select mechanic"}
            </p>

            <label className="text-xs text-[var(--agl-text-muted)] mb-1 block">Mechanic</label>
            <div className="relative">
              <UserCog className="h-4 w-4 text-[var(--agl-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={selectedMechanicId ?? ""}
                onChange={(event) => setSelectedMechanicId(Number(event.target.value))}
                className="w-full bg-[var(--agl-bg-elevated)] border border-[var(--agl-border)] rounded-lg pl-9 pr-3 py-2 text-[var(--agl-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
              >
                <option value="">Select mechanic</option>
                {mechanics.map((mechanic) => (
                  <option key={mechanic.id} value={mechanic.id}>
                    {mechanic.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAssignmentCard(null)}
                className="bg-[var(--agl-bg-elevated)] hover:bg-[var(--agl-border)] text-[var(--agl-text)] px-4 py-2 rounded-lg transition text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAssignment}
                className="bg-[var(--agl-primary)] hover:bg-[var(--agl-primary-hover)] text-white px-4 py-2 rounded-lg font-medium transition text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
              >
                Save Assignment
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </main>
  );
};

export default WorkshopKanban;