// ========== AGL DATA STORE — Exact port from original HTML ==========

const DB_KEY = 'agl_ops_v2';

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

const pick = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const ri = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;

function seedDemoData(data: AGLData): AGLData {
  const items = ['Brake Pads','Oil Filter','Spark Plugs','Air Filter','Timing Belt','Battery','Alternator','Radiator Hose','Wiper Blades','Clutch Plate','CV Joint','Wheel Bearing','Shock Absorber','Fuel Pump','Headlight Bulb','Engine Oil 5L','Transmission Fluid','Power Steering Fluid','Brake Disc','Fan Belt'];
  const customers = ['Kwame Asante','Ama Serwaa','Kofi Mensah','Abena Osei','Yaw Boateng','Efua Darko','Nana Agyemang','Akua Manu','Kwesi Appiah','Adjoa Frimpong','Samuel Tetteh','Grace Owusu','Daniel Annan','Felicia Addo','Emmanuel Quaye','Richard Boadu','Patience Gyamfi','Isaac Nyarko','Mercy Adei','Frank Asare'];
  const channels = ['Walk-In','WhatsApp','Phone','Facebook','Instagram','Wholesale','Workshop'];
  const payments = ['Cash','MoMo','Bank Transfer','Credit'];
  const reps = ['Yvonne','Abigail','Bright'];
  const mechanics = ['Appiah','Kojo','Fatawu','Chris'];
  const statuses = ['Completed','Completed','Completed','Pending Payment','Completed'];

  // Sales for current month
  let receiptNum = 1;
  for (let d = 1; d <= 20; d++) {
    const date = `2026-03-${String(d).padStart(2, '0')}`;
    const txCount = ri(3, 8);
    for (let t = 0; t < txCount; t++) {
      const qty = ri(1, 4);
      const price = ri(15, 800);
      data.sales.push({
        id: `s_${Date.now()}_${d}_${t}`, date, time: `${String(ri(8, 17)).padStart(2, '0')}:${String(ri(0, 59)).padStart(2, '0')}`,
        customer: pick(customers), contact: `0${ri(20, 27)}${ri(1000000, 9999999)}`,
        channel: pick(channels), rep: pick(reps), item: pick(items),
        qty, price, total: qty * price, payment: pick(payments),
        receipt: `AGL-RCT-${String(receiptNum++).padStart(3, '0')}`,
        status: pick(statuses), vehicle: Math.random() > 0.6 ? `GR-${ri(1000, 9999)}-${ri(18, 24)}` : '', notes: '',
      });
    }
  }
  data.settings.receiptCounter = receiptNum;

  // Expenses
  const expItems = ['Workshop supplies','Cleaning materials','Office stationery','Fuel for delivery','Lunch for staff','Electrical repair','Signage','Internet bill','Water bill','Tool replacement'];
  for (let d = 1; d <= 20; d++) {
    if (Math.random() > 0.4) {
      data.expenses.push({ id: `e_${d}`, date: `2026-03-${String(d).padStart(2, '0')}`, item: pick(expItems), supplier: pick(['Local Market','Accra Parts Hub','KwameShop','Tema Industrial']), amount: ri(50, 600), purpose: 'Operational expense' });
    }
  }

  // Purchase Orders
  let poNum = 1;
  for (let i = 0; i < 6; i++) {
    data.purchaseOrders.push({ id: `po_${i}`, date: `2026-03-${String(ri(1, 18)).padStart(2, '0')}`, poNumber: `AGL-PO-${String(poNum++).padStart(3, '0')}`, supplier: pick(['AutoParts Ghana','Japan Motors Spares','SsangYong Parts','Kia Genuine Parts','Hyundai Parts Hub']), amount: ri(2000, 15000), items: `Assorted ${pick(items)}, ${pick(items)}`, notes: '' });
  }
  data.settings.poCounter = poNum;

  // Workshop
  const wsStatuses = ['Queued','In Progress','Awaiting Parts','Completed','In Progress','Queued'];
  const jobs = ['Full service','Brake repair','Engine diagnostics','AC repair','Suspension work','Clutch replacement','Electrical fault','Body work','Tire alignment','Oil change'];
  for (let i = 0; i < 8; i++) {
    data.workshop.push({
      id: `w_${i}`, date: `2026-03-${String(ri(10, 20)).padStart(2, '0')}`,
      reg: `G${pick(['R','T','N','E'])}-${ri(1000, 9999)}-${ri(20, 25)}`,
      car: `${pick(['Toyota','Honda','Hyundai','Kia','Nissan','Mercedes','BMW'])} ${pick(['Camry','Civic','Tucson','Sportage','Altima','C-Class','X3'])}`,
      owner: pick(customers), job: pick(jobs), mechanic: pick(mechanics),
      status: pick(wsStatuses), estCost: ri(200, 5000), notes: '',
    });
  }

  // Kanban
  const kanbanTasks = [
    { title: 'Restock brake pads inventory', desc: 'Running low on popular brake pad models', assignee: 'Ben (Supervisor)', priority: 'High', column: 'To Do' },
    { title: 'Update price list for Q2', desc: 'Review and adjust pricing for all items', assignee: 'Yvonne', priority: 'Medium', column: 'In Progress' },
    { title: 'Fix workshop drainage', desc: 'Water pooling near bay 3', assignee: 'Appiah', priority: 'High', column: 'In Progress' },
    { title: 'Train new sales staff', desc: 'Onboarding for Abigail on POS system', assignee: 'Ben (Supervisor)', priority: 'Medium', column: 'Review' },
    { title: 'Monthly inventory count', desc: 'Full physical stock count', assignee: 'Yvonne', priority: 'Low', column: 'Done' },
    { title: 'Install CCTV cameras', desc: 'Security upgrade for workshop area', assignee: 'CEO', priority: 'High', column: 'To Do' },
    { title: 'Service company vehicle', desc: 'Routine maintenance for delivery van', assignee: 'Appiah', priority: 'Low', column: 'Done' },
  ];
  data.kanban = kanbanTasks.map((t, i) => ({ ...t, id: `k_${i}`, created: `2026-03-${String(ri(1, 20)).padStart(2, '0')}` }));

  // Clock-in
  const staff = ['Yvonne','Abigail','Bright','Ben','Appiah','Kojo','Fatawu','Chris'];
  for (let d = 15; d <= 20; d++) {
    const date = `2026-03-${String(d).padStart(2, '0')}`;
    staff.forEach(s => {
      if (Math.random() > 0.1) {
        const lateMin = Math.random() > 0.6 ? ri(5, 45) : 0;
        const hr = 8 + (lateMin > 0 ? Math.floor(lateMin / 60) : 0);
        const mn = lateMin > 0 ? lateMin % 60 : ri(0, 10);
        data.clockin.push({
          id: `ci_${d}_${s}`, staff: s, date,
          timeIn: `${String(hr).padStart(2, '0')}:${String(mn).padStart(2, '0')}`,
          timeOut: `${String(ri(17, 19)).padStart(2, '0')}:${String(ri(0, 59)).padStart(2, '0')}`,
        });
      }
    });
  }

  // Mechanics
  data.mechanics = {
    Appiah: { jobs: ri(15, 30), recalls: ri(0, 3), deductions: ri(0, 200) },
    Kojo: { jobs: ri(12, 25), recalls: ri(0, 4), deductions: ri(0, 300) },
    Fatawu: { jobs: ri(10, 20), recalls: ri(1, 5), deductions: ri(50, 400) },
    Chris: { jobs: ri(8, 18), recalls: ri(0, 2), deductions: ri(0, 150) },
  };

  // Creditors
  const creditors = [
    { name: 'AutoParts Ghana', contact: '0244123456', amount: 12000, category: 'Parts Supplier', priority: 'High' },
    { name: 'Tema Industrial Supplies', contact: '0201234567', amount: 5000, category: 'Service Provider', priority: 'Normal' },
    { name: 'Staff Advance - Ben', contact: '0551234567', amount: 2000, category: 'Staff Advance', priority: 'Normal' },
    { name: 'Landlord - Workshop', contact: '0271234567', amount: 8000, category: 'Rent/Utilities', priority: 'Urgent' },
  ];
  data.creditors = creditors.map((c, i) => ({
    ...c, id: `cr_${i}`, date: `2026-03-${String(ri(1, 10)).padStart(2, '0')}`,
    dueDate: `2026-04-${String(ri(1, 30)).padStart(2, '0')}`, notes: '', paid: ri(0, Math.floor(c.amount * 0.5)),
  }));

  // Inventory
  const stockItems = [
    { name: 'NGK Spark Plug 93175', category: 'Spark Plugs', sku: 'NGK-93175', qty: 45, reorder: 10, cost: 25, sell: 45 },
    { name: 'Bosch Oil Filter', category: 'Filters', sku: 'BSH-OF-001', qty: 22, reorder: 8, cost: 35, sell: 60 },
    { name: 'Mobil 1 5W-30 5L', category: 'Oils & Fluids', sku: 'MOB-5W30-5L', qty: 15, reorder: 5, cost: 180, sell: 250 },
    { name: 'Brembo Brake Pads Front', category: 'Brake Parts', sku: 'BRM-BP-F01', qty: 8, reorder: 5, cost: 120, sell: 200 },
    { name: 'Gates Timing Belt Kit', category: 'Belts & Hoses', sku: 'GAT-TBK-01', qty: 3, reorder: 3, cost: 280, sell: 450 },
    { name: 'Denso Alternator', category: 'Electrical', sku: 'DNS-ALT-01', qty: 2, reorder: 2, cost: 450, sell: 700 },
    { name: 'KYB Shock Absorber', category: 'Suspension', sku: 'KYB-SA-01', qty: 6, reorder: 4, cost: 200, sell: 350 },
    { name: 'Air Filter Universal', category: 'Filters', sku: 'AF-UNI-01', qty: 30, reorder: 10, cost: 15, sell: 30 },
    { name: 'Brake Disc Rotor', category: 'Brake Parts', sku: 'BD-ROT-01', qty: 4, reorder: 3, cost: 150, sell: 280 },
    { name: 'Fan Belt V-Ribbed', category: 'Belts & Hoses', sku: 'FB-VR-01', qty: 12, reorder: 5, cost: 45, sell: 80 },
  ];
  data.inventory = stockItems.map((s, i) => ({ ...s, id: `inv_${i}` }));

  // Training
  data.training = {
    sales: { modules: [
      { name: 'Customer Greeting Protocol', assignees: ['Yvonne','Abigail','Bright'], deadline: '2026-03-25', completion: { Yvonne: 100, Abigail: 80, Bright: 60 } },
      { name: 'Sales Flow & Closing', assignees: ['Yvonne','Abigail','Bright'], deadline: '2026-03-28', completion: { Yvonne: 60, Abigail: 40, Bright: 30 } },
      { name: 'Phone Etiquette', assignees: ['Yvonne','Abigail','Bright'], deadline: '2026-04-01', completion: { Yvonne: 30, Abigail: 20, Bright: 10 } },
      { name: 'Complaint Handling', assignees: ['Yvonne','Abigail','Bright'], deadline: '2026-04-05', completion: { Yvonne: 0, Abigail: 0, Bright: 0 } },
      { name: 'MoMo Payment Process', assignees: ['Yvonne','Abigail','Bright'], deadline: '2026-03-22', completion: { Yvonne: 100, Abigail: 100, Bright: 100 } },
    ] },
    mechanics: { modules: [
      { name: 'PRF Process', assignees: ['Appiah','Kojo','Fatawu','Chris'], deadline: '2026-03-30', completion: { Appiah: 100, Kojo: 80, Fatawu: 60, Chris: 70 } },
      { name: 'Job Card Completion', assignees: ['Appiah','Kojo','Fatawu','Chris'], deadline: '2026-03-30', completion: { Appiah: 90, Kojo: 100, Fatawu: 50, Chris: 80 } },
      { name: 'Workshop Safety', assignees: ['Appiah','Kojo','Fatawu','Chris'], deadline: '2026-04-05', completion: { Appiah: 70, Kojo: 60, Fatawu: 40, Chris: 50 } },
      { name: 'No Customer Contact Rule', assignees: ['Appiah','Kojo','Fatawu','Chris'], deadline: '2026-03-25', completion: { Appiah: 100, Kojo: 100, Fatawu: 80, Chris: 100 } },
    ] },
    supervisors: { modules: [
      { name: 'Daily Reporting SOP', assignees: ['Ben'], deadline: '2026-03-28', completion: { Ben: 75 } },
      { name: 'Quality Control Checks', assignees: ['Ben'], deadline: '2026-04-01', completion: { Ben: 50 } },
      { name: 'Escalation Protocol', assignees: ['Ben'], deadline: '2026-04-05', completion: { Ben: 30 } },
    ] },
    ceo: { modules: [
      { name: 'Weekly Review Framework', assignees: ['CEO'], deadline: '2026-04-01', completion: { CEO: 60 } },
      { name: 'Financial Oversight', assignees: ['CEO'], deadline: '2026-04-05', completion: { CEO: 40 } },
      { name: 'Decision Framework', assignees: ['CEO'], deadline: '2026-04-10', completion: { CEO: 20 } },
    ] },
  };

  // Staff
  data.staff = [
    { id: 'st_1', name: 'Yvonne', role: 'Sales Rep', department: 'Sales', phone: '0244-111-222', clockIn: '08:02', clockOut: '', rating: 4, salary: 2500, status: 'Active' },
    { id: 'st_8', name: 'Bright', role: 'Sales Rep', department: 'Sales', phone: '0244-888-999', clockIn: '08:00', clockOut: '', rating: 4, salary: 2500, status: 'Active' },
    { id: 'st_2', name: 'Abigail', role: 'Sales Rep', department: 'Sales', phone: '0244-333-444', clockIn: '08:15', clockOut: '', rating: 3, salary: 2200, status: 'Active' },
    { id: 'st_3', name: 'Ben', role: 'Supervisor', department: 'Operations', phone: '0244-555-666', clockIn: '07:55', clockOut: '', rating: 5, salary: 3500, status: 'Active' },
    { id: 'st_4', name: 'Appiah', role: 'Mechanic', department: 'Workshop', phone: '0244-777-888', clockIn: '08:00', clockOut: '', rating: 5, salary: 3200, status: 'Active' },
    { id: 'st_5', name: 'Kojo', role: 'Mechanic', department: 'Workshop', phone: '0244-999-000', clockIn: '08:30', clockOut: '', rating: 4, salary: 2800, status: 'Active' },
    { id: 'st_6', name: 'Fatawu', role: 'Mechanic', department: 'Workshop', phone: '0244-111-333', clockIn: '', clockOut: '', rating: 3, salary: 2800, status: 'Active' },
    { id: 'st_7', name: 'Chris', role: 'Mechanic', department: 'Workshop', phone: '0244-444-555', clockIn: '08:10', clockOut: '', rating: 4, salary: 3500, status: 'Active' },
  ];

  return data;
}

let DATA: AGLData;

export function loadData(): AGLData {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) {
    try { DATA = JSON.parse(raw); } catch { DATA = defaultData(); DATA = seedDemoData(DATA); }
  } else {
    DATA = defaultData();
    DATA = seedDemoData(DATA);
  }
  // Ensure all fields exist
  if (!DATA.clockin) DATA.clockin = [];
  if (!DATA.creditors) DATA.creditors = [];
  if (!DATA.payments) DATA.payments = [];
  if (!DATA.inventory) DATA.inventory = [];
  if (!DATA.kanban) DATA.kanban = [];
  if (!DATA.staff) DATA.staff = [];
  // Ensure all staff have a status (fix for B-03 bug)
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
