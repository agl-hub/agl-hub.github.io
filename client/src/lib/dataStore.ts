// ========== AGL DATA STORE — Excel-backed, no seed data ==========

const DB_KEY = 'agl_ops_v3'; // bumped to clear all cached seed data

export interface Sale {
  id: string; date: string; time: string; customer: string; contact: string;
  channel: string; rep: string; item: string; qty: number; price: number;
  total: number; payment: string; receipt: string; status: string;
  vehicle: string; notes: string;
}
export interface Expense { id: string; date: string; item: string; supplier: string; amount: number; purpose: string; }
export interface PurchaseOrder { id: string; date: string; poNumber: string; supplier: string; amount: number; items: string; notes: string; }
export interface WorkshopJob {
  id: string; date: string; reg: string; car: string; owner?: string;
  job: string; mechanic: string; status: string; estCost?: number; notes: string;
}
export interface ClockInRecord { id: string; staff: string; name?: string; date: string; timeIn: string; timeOut: string; clockIn?: string; clockOut?: string; late?: boolean; hours?: number; }
export interface Creditor {
  id: string; name: string; contact: string; amount: number; date: string;
  dueDate: string; category: string; priority: string; notes: string; paid: number;
}
export interface Payment {
  id: string; creditorId: string; amount: number; date: string;
  method: string; reference: string; notes: string;
}
export interface KanbanTask {
  id: string; title: string; desc: string; assignee: string;
  priority: string; column: string; created: string;
}
export interface StockItem {
  id: string; name: string; category: string; sku: string;
  qty: number; reorder: number; cost: number; sell: number;
}
export interface TrainingModule {
  name: string; assignees: string[]; deadline: string; status?: string; notes?: string;
  completion?: Record<string, number>;
}
export interface StaffMember {
  id: string; name: string; role: string; department: string; phone: string; email?: string; startDate?: string; status?: string; notes?: string;
  clockIn: string; clockOut: string; rating: number; salary: number;
}

export interface AGLData {
  sales: Sale[];
  expenses: Expense[];
  purchaseOrders: PurchaseOrder[];
  workshop: WorkshopJob[];
  clockin: ClockInRecord[];
  creditors: Creditor[];
  payments: Payment[];
  kanban: KanbanTask[];
  inventory: StockItem[];
  mechanics: Record<string, { jobs: number; recalls: number; deductions: number }>;
  training: {
    sales: { modules: TrainingModule[] };
    mechanics: { modules: TrainingModule[] };
    supervisors: { modules: TrainingModule[] };
    ceo: { modules: TrainingModule[] };
  };
  staff: StaffMember[];
  notifications: { id: string; title: string; body: string; time: string }[];
  settings: { receiptCounter: number; poCounter: number; autoSync: boolean; syncOnEntry: boolean; kpiTargets?: Record<string, number> };
  inquiries: number;
}

function defaultData(): AGLData {
  return {
    sales: [], expenses: [], purchaseOrders: [], workshop: [], clockin: [],
    creditors: [], payments: [], kanban: [], inventory: [],
    staff: [],
    mechanics: { Appiah: { jobs: 0, recalls: 0, deductions: 0 }, Kojo: { jobs: 0, recalls: 0, deductions: 0 }, Fatawu: { jobs: 0, recalls: 0, deductions: 0 }, Chris: { jobs: 0, recalls: 0, deductions: 0 } },
    training: { sales: { modules: [] }, mechanics: { modules: [] }, supervisors: { modules: [] }, ceo: { modules: [] } },
    notifications: [],
    settings: { receiptCounter: 1, poCounter: 1, autoSync: true, syncOnEntry: true },
    inquiries: 0,
  };
}

let DATA: AGLData;

export function loadData(): AGLData {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) {
    try { DATA = JSON.parse(raw); } catch { DATA = defaultData(); }
  } else {
    DATA = defaultData();
  }
  // Ensure all array fields exist
  if (!DATA.clockin) DATA.clockin = [];
  if (!DATA.creditors) DATA.creditors = [];
  if (!DATA.payments) DATA.payments = [];
  if (!DATA.inventory) DATA.inventory = [];
  if (!DATA.kanban) DATA.kanban = [];
  if (!DATA.staff) DATA.staff = [];
  if (!DATA.notifications) DATA.notifications = [];
  DATA.staff.forEach(s => { if (!s.status) s.status = 'Active'; });
  saveData();
  return DATA;
}

export function getData(): AGLData {
  if (!DATA) return loadData();
  return DATA;
}

export function saveData() {
  localStorage.setItem(DB_KEY, JSON.stringify(DATA));
}

export function updateData(updater: (data: AGLData) => void) {
  if (!DATA) loadData();
  updater(DATA);
  saveData();
}

export function fmtGHS(n: number): string {
  return 'GHS ' + Number(n || 0).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function today(): string { return new Date().toISOString().slice(0, 10); }
export function now(): string { return new Date().toTimeString().slice(0, 5); }
