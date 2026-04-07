/**
 * Lightweight in-memory audit log.
 * Stores recent mutations + access events for the running process.
 * Replace with a persistent store when scale demands it.
 */

export interface AuditEntry {
  id: string;
  at: Date;
  userId: string | null;
  userName: string | null;
  action: string; // e.g. "sales.create"
  category: "mutation" | "auth" | "access";
  meta?: Record<string, any>;
  ip?: string | null;
}

const MAX_ENTRIES = 500;
const log: AuditEntry[] = [];

export function recordAudit(entry: Omit<AuditEntry, "id" | "at">): AuditEntry {
  const full: AuditEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date(),
    ...entry,
  };
  log.unshift(full);
  if (log.length > MAX_ENTRIES) log.length = MAX_ENTRIES;
  return full;
}

export function getAudit(limit = 100): AuditEntry[] {
  return log.slice(0, limit);
}

export function clearAudit() {
  log.length = 0;
}
