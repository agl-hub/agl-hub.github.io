/**
 * sheetsSync.ts
 * Two-way sync between AGL Command Center localStorage and Google Sheets.
 *
 * Architecture:
 * - PULL: Reads data from Google Sheets via a Google Apps Script Web App
 *   (deployed as a public JSON API endpoint). The script reads the sheets
 *   and returns structured JSON that we merge into localStorage.
 * - PUSH: Appends new rows to Google Sheets via the same Apps Script endpoint
 *   using POST requests.
 *
 * The Apps Script URL is stored in localStorage settings so users can
 * configure it once. We also support a direct import of the pre-fetched
 * snapshot JSON (embedded at build time for initial population).
 */

import { updateData, getData, saveData } from './dataStore';
import type { Sale, Expense, WorkshopJob, PurchaseOrder, ClockInRecord, StockItem } from './dataStore';

export const SHEET1_ID = '1pFBk2xCbILKxVSgwACQIrIscEimonnnyJNBKoiAVZ7U';
export const SHEET2_ID = '1r8cZtmyjqLmUJSUZPOZopOk8PEGCJyhKnaS0NvqUniw';
export const SHEET1_URL = `https://docs.google.com/spreadsheets/d/${SHEET1_ID}/edit`;
export const SHEET2_URL = `https://docs.google.com/spreadsheets/d/${SHEET2_ID}/edit`;

const SYNC_KEY = 'agl_sheets_sync';

export interface SyncState {
  lastPull: string | null;
  lastPush: string | null;
  gasUrl: string;
  autoSync: boolean;
  pullCount: number;
  pushCount: number;
  errors: string[];
}

export function getSyncState(): SyncState {
  try {
    const raw = localStorage.getItem(SYNC_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    lastPull: null,
    lastPush: null,
    gasUrl: '',
    autoSync: false,
    pullCount: 0,
    pushCount: 0,
    errors: [],
  };
}

export function saveSyncState(state: SyncState) {
  localStorage.setItem(SYNC_KEY, JSON.stringify(state));
}

// ============================================================
// SNAPSHOT IMPORT — loads the pre-fetched Google Sheets data
// into localStorage without needing an API call.
// ============================================================
export interface SheetsSnapshot {
  sales: Sale[];
  expenses: Expense[];
  workshop: WorkshopJob[];
  purchaseOrders: PurchaseOrder[];
  clockin: ClockInRecord[];
  inventory: StockItem[];
}

export function importSnapshot(snapshot: SheetsSnapshot, mode: 'merge' | 'replace' = 'merge'): { added: Record<string, number>; skipped: Record<string, number> } {
  const stats: Record<string, number> = { sales: 0, expenses: 0, workshop: 0, purchaseOrders: 0, clockin: 0, inventory: 0 };
  const skipped: Record<string, number> = { sales: 0, expenses: 0, workshop: 0, purchaseOrders: 0, clockin: 0, inventory: 0 };

  updateData(data => {
    if (mode === 'replace') {
      // Replace all sheet-sourced data
      data.sales = data.sales.filter(s => !s.id.startsWith('sh1_'));
      data.expenses = data.expenses.filter(e => !e.id.startsWith('sh1_'));
      data.workshop = data.workshop.filter(w => !w.id.startsWith('sh1_'));
      data.purchaseOrders = data.purchaseOrders.filter(p => !p.id.startsWith('sh1_'));
      data.clockin = data.clockin.filter(c => !c.id.startsWith('sh1_'));
      data.inventory = data.inventory.filter(i => !i.id.startsWith('sh2_'));
    }

    // Sales
    const existingSaleIds = new Set(data.sales.map(s => s.id));
    for (const sale of snapshot.sales) {
      if (!existingSaleIds.has(sale.id)) {
        data.sales.push(sale);
        stats.sales++;
      } else {
        skipped.sales++;
      }
    }

    // Expenses
    const existingExpIds = new Set(data.expenses.map(e => e.id));
    for (const exp of snapshot.expenses) {
      if (!existingExpIds.has(exp.id)) {
        data.expenses.push(exp);
        stats.expenses++;
      } else {
        skipped.expenses++;
      }
    }

    // Workshop
    const existingWIds = new Set(data.workshop.map(w => w.id));
    for (const job of snapshot.workshop) {
      if (!existingWIds.has(job.id)) {
        data.workshop.push(job);
        stats.workshop++;
      } else {
        skipped.workshop++;
      }
    }

    // Purchase Orders
    const existingPOIds = new Set(data.purchaseOrders.map(p => p.id));
    for (const po of snapshot.purchaseOrders) {
      if (!existingPOIds.has(po.id)) {
        data.purchaseOrders.push(po);
        stats.purchaseOrders++;
      } else {
        skipped.purchaseOrders++;
      }
    }

    // Clock-In
    const existingCIds = new Set(data.clockin.map(c => c.id));
    for (const ci of snapshot.clockin) {
      if (!existingCIds.has(ci.id)) {
        data.clockin.push(ci);
        stats.clockin++;
      } else {
        skipped.clockin++;
      }
    }

    // Inventory — map sheet inventory to StockItem format
    const existingInvIds = new Set(data.inventory.map(i => i.id));
    for (const item of snapshot.inventory) {
      if (!existingInvIds.has(item.id)) {
        data.inventory.push(item);
        stats.inventory++;
      } else {
        skipped.inventory++;
      }
    }
  });

  const state = getSyncState();
  state.lastPull = new Date().toISOString();
  state.pullCount += Object.values(stats).reduce((a, b) => a + b, 0);
  saveSyncState(state);

  return { added: stats, skipped };
}

// ============================================================
// GAS (Google Apps Script) PULL — live fetch via deployed script
// ============================================================
export async function pullFromGAS(gasUrl: string): Promise<{ ok: boolean; message: string; stats?: Record<string, number> }> {
  try {
    const url = `${gasUrl}?action=pull`;
    const resp = await fetch(url, { mode: 'cors' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    if (!json.sales && !json.inventory) throw new Error('Invalid response format');
    const result = importSnapshot(json as SheetsSnapshot, 'merge');
    return { ok: true, message: `Pulled successfully`, stats: result.added };
  } catch (e: any) {
    const state = getSyncState();
    state.errors.push(`Pull error: ${e.message}`);
    if (state.errors.length > 10) state.errors = state.errors.slice(-10);
    saveSyncState(state);
    return { ok: false, message: e.message };
  }
}

// ============================================================
// GAS PUSH — send new local entries to Google Sheets
// ============================================================
export async function pushToGAS(gasUrl: string, payload: { type: string; row: Record<string, unknown> }): Promise<{ ok: boolean; message: string }> {
  try {
    const resp = await fetch(gasUrl, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    if (!json.ok) throw new Error(json.error || 'Push failed');
    const state = getSyncState();
    state.lastPush = new Date().toISOString();
    state.pushCount++;
    saveSyncState(state);
    return { ok: true, message: 'Row pushed to Google Sheets' };
  } catch (e: any) {
    return { ok: false, message: e.message };
  }
}

// ============================================================
// EXPORT — generate CSV from localStorage data for a given type
// ============================================================
export function exportToCSV(type: 'sales' | 'expenses' | 'workshop' | 'purchaseOrders' | 'clockin' | 'inventory'): string {
  const data = getData();
  const rows: string[][] = [];

  if (type === 'sales') {
    rows.push(['Date', 'Time', 'Customer', 'Contact', 'Channel', 'Vehicle', 'Item', 'Qty', 'Price', 'Total', 'Payment', 'Receipt', 'Rep', 'Status', 'Notes']);
    for (const s of data.sales) {
      rows.push([s.date, s.time, s.customer, s.contact || '', s.channel, s.vehicle || '', s.item, String(s.qty), String(s.price), String(s.total), s.payment, s.receipt, s.rep, s.status, s.notes || '']);
    }
  } else if (type === 'expenses') {
    rows.push(['Date', 'Item', 'Supplier', 'Amount', 'Purpose']);
    for (const e of data.expenses) {
      rows.push([e.date, e.item, e.supplier || '', String(e.amount), e.purpose || '']);
    }
  } else if (type === 'workshop') {
    rows.push(['Date', 'Car', 'Reg', 'Mechanic', 'Job', 'Status', 'Notes']);
    for (const w of data.workshop) {
      rows.push([w.date, w.car, w.reg || '', w.mechanic || '', w.job, w.status, w.notes || '']);
    }
  } else if (type === 'purchaseOrders') {
    rows.push(['PO Number', 'Date', 'Supplier', 'Items', 'Amount', 'Notes']);
    for (const p of data.purchaseOrders) {
      rows.push([p.poNumber, p.date, p.supplier, p.items || '', String(p.amount), p.notes || '']);
    }
  } else if (type === 'clockin') {
    rows.push(['Date', 'Staff', 'Time In', 'Time Out', 'Late', 'Hours']);
    for (const c of data.clockin) {
      rows.push([c.date, c.staff, c.timeIn, c.timeOut || '', c.late ? 'Yes' : 'No', String(c.hours || '')]);
    }
  } else if (type === 'inventory') {
    rows.push(['SKU', 'Name', 'Category', 'Qty', 'Reorder', 'Cost', 'Sell Price']);
    for (const i of data.inventory) {
      rows.push([i.sku, i.name, i.category, String(i.qty), String(i.reorder), String(i.cost), String(i.sell)]);
    }
  }

  return rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
}

// ============================================================
// APPS SCRIPT TEMPLATE — the GAS code users deploy
// ============================================================
export const GAS_TEMPLATE = `// AGL Command Center — Google Apps Script Bridge
// Deploy as: Web App → Execute as Me → Anyone can access
// Paste this in script.google.com and deploy

const SHEET1_ID = '${SHEET1_ID}';
const SHEET2_ID = '${SHEET2_ID}';

function doGet(e) {
  const action = e.parameter.action || 'pull';
  if (action === 'pull') {
    return ContentService.createTextOutput(JSON.stringify(pullAll()))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'Unknown action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const result = pushRow(payload.type, payload.row);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function pullAll() {
  // Returns all data as structured JSON
  const ss1 = SpreadsheetApp.openById(SHEET1_ID);
  const ss2 = SpreadsheetApp.openById(SHEET2_ID);
  return {
    sales: readSheet(ss1, 'Sales & Customer Log', mapSale),
    expenses: readSheet(ss1, 'Expense Log', mapExpense),
    workshop: readSheet(ss1, 'Workshop Daily Log', mapWorkshop),
    purchaseOrders: readSheet(ss1, 'Purchase Orders', mapPO),
    clockin: readClockIn(ss1),
    inventory: [
      ...readSheet(ss2, '_FilterData', mapFilter),
      ...readSheet(ss2, '_PlugData', mapPlug),
      ...readSheet(ss2, '_ServiceData', mapService),
    ]
  };
}

function readSheet(ss, name, mapper) {
  try {
    const sheet = ss.getSheetByName(name);
    if (!sheet) return [];
    const rows = sheet.getDataRange().getValues();
    const result = [];
    for (let i = 1; i < rows.length; i++) {
      const mapped = mapper(rows[i], i);
      if (mapped) result.push(mapped);
    }
    return result;
  } catch(e) { return []; }
}

function parseDate(d) {
  if (!d || d === '-') return '';
  if (d instanceof Date) {
    const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0');
    return y + '-' + m + '-' + day;
  }
  const s = String(d);
  const parts = s.split('/');
  if (parts.length === 3) return parts[2] + '-' + parts[1].padStart(2,'0') + '-' + parts[0].padStart(2,'0');
  return s;
}

function clean(v) { return v === '-' || v === undefined ? '' : String(v).trim(); }
function num(v) { return parseFloat(String(v).replace(/[^0-9.]/g,'')) || 0; }

function mapSale(r, i) {
  const date = parseDate(r[1]);
  if (!date) return null;
  return { id: 'sh1_s_' + (i), date, time: '09:00', channel: clean(r[4]) || 'Walk-In',
    item: clean(r[6]) || 'Unknown', customer: clean(r[2]) || 'Walk-in', contact: clean(r[3]),
    vehicle: clean(r[5]), rep: clean(r[12]) || 'Staff', qty: parseInt(r[7]) || 1,
    price: num(r[8]), total: num(r[9]), payment: clean(r[10]) || 'Cash',
    receipt: clean(r[11]) || 'RCP-SH-' + i, status: clean(r[14]) || 'Completed', notes: clean(r[16]) };
}

function mapExpense(r, i) {
  const date = parseDate(r[1]);
  if (!date) return null;
  return { id: 'sh1_e_' + i, date, item: clean(r[3]) || 'General',
    supplier: clean(r[2]) || 'Unknown', amount: num(r[7]), purpose: clean(r[2]) };
}

function mapWorkshop(r, i) {
  const date = parseDate(r[1]);
  if (!date) return null;
  return { id: 'sh1_w_' + i, date, car: clean(r[2]) || 'Unknown', reg: clean(r[3]),
    mechanic: clean(r[4]), job: clean(r[5]), status: clean(r[6]) || 'In Progress', notes: clean(r[7]) };
}

function mapPO(r, i) {
  const poNum = clean(r[0]) || 'PO-' + i;
  const date = parseDate(r[1]) || '2026-03-01';
  return { id: 'sh1_po_' + i, poNumber: poNum, date, supplier: clean(r[2]) || 'Unknown',
    items: clean(r[3]), amount: num(r[6]), notes: clean(r[14]) };
}

function readClockIn(ss) {
  try {
    const sheet = ss.getSheetByName('Staff Clock-In');
    if (!sheet) return [];
    const rows = sheet.getDataRange().getValues();
    if (rows.length < 2) return [];
    const headerRow = rows[0];
    const staffCols = [];
    for (let c = 2; c < headerRow.length; c += 4) {
      const name = String(headerRow[c] || '').split('(')[0].trim();
      if (name) staffCols.push([c, name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()]);
    }
    const result = [];
    for (let i = 2; i < rows.length; i++) {
      const date = parseDate(rows[i][1]);
      if (!date) continue;
      for (const [col, staff] of staffCols) {
        const timeIn = clean(rows[i][col]);
        if (!timeIn || timeIn === '-' || timeIn === 'N/A') continue;
        result.push({ id: 'sh1_c_' + result.length, date, staff,
          timeIn, timeOut: clean(rows[i][col+1]), late: clean(rows[i][col+2]) === 'LATE',
          hours: num(rows[i][col+3]) });
      }
    }
    return result;
  } catch(e) { return []; }
}

function mapFilter(r, i) {
  const partNum = clean(r[2]);
  const name = (clean(r[1]) + ' ' + partNum).trim();
  if (!name) return null;
  return { id: 'sh2_f_' + i, sku: partNum || 'FILTER-' + i, name, category: 'Filters & Oil',
    brand: clean(r[1]), partNumber: partNum, vehicleModels: clean(r[4]), yearRange: clean(r[6]),
    price: num(r[7]), qty: parseInt(r[8]) || 0, reorder: 5,
    status: String(r[9]).includes('IN STOCK') ? 'In Stock' : 'Out of Stock', notes: '' };
}

function mapPlug(r, i) {
  const partName = clean(r[3]) || clean(r[2]) || 'Spark Plug ' + i;
  if (!partName) return null;
  return { id: 'sh2_p_' + i, sku: clean(r[2]) || 'PLUG-' + i, name: partName, category: 'Spark Plugs',
    brand: clean(r[1]), partNumber: clean(r[2]), vehicleModels: clean(r[7]), yearRange: clean(r[9]),
    price: num(r[4]), qty: parseInt(r[12]) || 0, reorder: 3,
    status: String(r[13]).includes('IN STOCK') ? 'In Stock' : 'Out of Stock',
    notes: 'Material: ' + clean(r[10]) + ', Size: ' + clean(r[11]) };
}

function mapService(r, i) {
  const name = clean(r[1]);
  if (!name) return null;
  return { id: 'sh2_sv_' + i, sku: 'SVC-' + String(i).padStart(3,'0'), name,
    category: 'Services - ' + (clean(r[3]) || 'General'), brand: 'AGL',
    partNumber: '', vehicleModels: '', yearRange: '',
    price: num(r[2]), qty: 999, reorder: 0, status: 'In Stock', notes: '' };
}

function pushRow(type, row) {
  const ss1 = SpreadsheetApp.openById(SHEET1_ID);
  const sheetMap = {
    sale: 'Sales & Customer Log',
    expense: 'Expense Log',
    workshop: 'Workshop Daily Log',
    purchaseOrder: 'Purchase Orders',
  };
  const sheetName = sheetMap[type];
  if (!sheetName) return { ok: false, error: 'Unknown type: ' + type };
  const sheet = ss1.getSheetByName(sheetName);
  if (!sheet) return { ok: false, error: 'Sheet not found: ' + sheetName };
  const lastRow = sheet.getLastRow();
  const newNum = lastRow; // row number
  if (type === 'sale') {
    sheet.appendRow([newNum, row.date, row.customer, row.contact, row.channel, row.vehicle,
      row.item, row.qty, row.price, row.total, row.payment, row.receipt, row.rep, '', row.status, '', row.notes]);
  } else if (type === 'expense') {
    sheet.appendRow([newNum, row.date, row.supplier, row.item, '', '', '', row.amount, '', '', 'Paid', row.purpose]);
  } else if (type === 'workshop') {
    sheet.appendRow([newNum, row.date, row.car, row.reg, row.mechanic, row.job, row.status, row.notes]);
  } else if (type === 'purchaseOrder') {
    sheet.appendRow([row.poNumber, row.date, row.supplier, row.items, '', '', row.amount, '', '', '', '', '', 'Pending', '', row.notes]);
  }
  return { ok: true };
}`;
