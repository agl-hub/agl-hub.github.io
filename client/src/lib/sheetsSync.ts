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

export const SHEET1_ID = '1WVSb5klz93ZyQFCKAnZ4hd3S8ay5qEIbdIhozSoZ1uw';
export const SHEET2_ID = '1WVSb5klz93ZyQFCKAnZ4hd3S8ay5qEIbdIhozSoZ1uw'; // Same sheet — Inventory tab
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

    // Expenses — map SnapshotExpense fields to Expense interface
    const existingExpIds = new Set(data.expenses.map(e => e.id));
    for (const raw of (snapshot.expenses as any[])) {
      if (existingExpIds.has(raw.id)) { skipped.expenses++; continue; }
      const exp: Expense = {
        id:       raw.id,
        date:     raw.date || '',
        item:     raw.item || raw.description || raw.category || 'Expense',
        supplier: raw.supplier || raw.requestedBy || raw.vendor || '',
        amount:   Number(raw.amount) || 0,
        purpose:  raw.purpose || raw.notes || raw.budgetCode || '',
      };
      data.expenses.push(exp);
      stats.expenses++;
    }

    // Workshop — map SnapshotWorkshop fields to WorkshopJob interface
    const existingWIds = new Set(data.workshop.map(w => w.id));
    for (const raw of (snapshot.workshop as any[])) {
      if (existingWIds.has(raw.id)) { skipped.workshop++; continue; }
      const job: WorkshopJob = {
        id:       raw.id,
        date:     raw.date || '',
        reg:      raw.reg || raw.regNo || raw.vehicleReg || '',
        car:      raw.car || raw.vehicle || raw.make || '',
        owner:    raw.owner || raw.customer || '',
        job:      raw.job || raw.jobDescription || raw.description || '',
        mechanic: raw.mechanic || '',
        status:   raw.status || 'Queued',
        estCost:  Number(raw.estCost) || 0,
        notes:    raw.notes || '',
      };
      data.workshop.push(job);
      stats.workshop++;
    }

    // Purchase Orders — map SnapshotPurchaseOrder fields to PurchaseOrder interface
    const existingPOIds = new Set(data.purchaseOrders.map(p => p.id));
    for (const raw of (snapshot.purchaseOrders as any[])) {
      if (existingPOIds.has(raw.id)) { skipped.purchaseOrders++; continue; }
      const po: PurchaseOrder = {
        id:       raw.id,
        date:     raw.date || '',
        poNumber: raw.poNumber || raw.poNo || raw.id,
        supplier: raw.supplier || '',
        amount:   Number(raw.amount) || Number(raw.total) || (Number(raw.qty) * Number(raw.unitCost)) || 0,
        items:    raw.items || raw.item || '',
        notes:    raw.notes || raw.status || '',
      };
      data.purchaseOrders.push(po);
      stats.purchaseOrders++;
    }

    // Clock-In — map SnapshotClockIn fields to ClockInRecord interface
    const existingCIds = new Set(data.clockin.map(c => c.id));
    for (const raw of (snapshot.clockin as any[])) {
      if (existingCIds.has(raw.id)) { skipped.clockin++; continue; }
      const ci: ClockInRecord = {
        id:      raw.id,
        date:    raw.date || '',
        staff:   raw.staff || raw.name || '',
        timeIn:  raw.timeIn || raw.clockIn || '',
        timeOut: raw.timeOut || raw.clockOut || '',
        late:    raw.late === true || raw.late === 'true' || false,
        hours:   Number(raw.hours) || 0,
      };
      data.clockin.push(ci);
      stats.clockin++;
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
export const GAS_TEMPLATE = `// ============================================================
// AGL COMMAND CENTER — Google Apps Script
// Sheet ID: 1WVSb5klz93ZyQFCKAnZ4hd3S8ay5qEIbdIhozSoZ1uw
// Deploy as: Web App → Execute as Me → Anyone can access
// ============================================================
// INSTRUCTIONS:
//   1. Go to https://script.google.com
//   2. Create a new project named "AGL Command Center Sync"
//   3. Paste this entire file into Code.gs
//   4. Click Deploy → New Deployment → Web App
//      - Execute as: Me
//      - Who has access: Anyone
//   5. Copy the Web App URL
//   6. On the AGL website → Google Sheets → Import tab → paste URL → Save
// ============================================================

const SHEET_ID = '1WVSb5klz93ZyQFCKAnZ4hd3S8ay5qEIbdIhozSoZ1uw';

// ── Sales reps and mechanics (update here if staff changes) ──
const SALES_REPS  = ['Yvonne', 'Abigail', 'Bright'];
const MECHANICS   = ['Appiah', 'Kojo', 'Fatawu', 'Chris'];
const ALL_STAFF   = ['Yvonne', 'Abigail', 'Bright', 'Ben', 'Appiah', 'Kojo', 'Fatawu', 'Chris'];
const CHANNELS    = ['Walk-In', 'WhatsApp', 'Phone', 'Facebook', 'Instagram', 'Wholesale', 'Workshop'];
const PAYMENTS    = ['Cash', 'MoMo', 'Bank Transfer', 'Credit', 'Cheque'];
const WS_STATUSES = ['Queued', 'In Progress', 'Awaiting Parts', 'Completed'];
const WORK_START  = '08:00';

// ── SIMPLE onOpen: builds menu + auto-installs installable trigger ──
// The simple onOpen() CANNOT show modal dialogs (Google security restriction).
// Instead it: (1) builds the menu, (2) shows the sidebar, and
// (3) auto-installs an installable onOpen trigger the FIRST TIME the script runs.
// The installable trigger CAN show modal dialogs — so from the SECOND open
// onwards (and every open after that), the Record Sale form pops up automatically.
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📋 AGL Data Entry')
    .addItem('➕ Record Sale', 'showSaleForm')
    .addItem('💸 Record Expense', 'showExpenseForm')
    .addItem('🔧 Log Workshop Job', 'showWorkshopForm')
    .addItem('⏱ Clock In / Out', 'showClockInForm')
    .addItem('📦 Add Purchase Order', 'showPOForm')
    .addSeparator()
    .addItem('📊 View Summary', 'showSummary')
    .addItem('🔄 Refresh Formulas', 'refreshFormulas')
    .addToUi();

  // Auto-install the installable trigger on first run (silently)
  autoInstallOpenTrigger();

  // Show sidebar as immediate fallback (works even on first open)
  showDataEntrySidebar();
}

// ── Auto-install installable trigger (runs silently from onOpen) ──
// Checks if the trigger already exists; only creates it once.
// After this runs, every subsequent sheet open will show the sale form modal.
function autoInstallOpenTrigger() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    const alreadyInstalled = triggers.some(t =>
      t.getHandlerFunction() === 'showSaleFormOnOpen' &&
      t.getEventType() === ScriptApp.EventType.ON_OPEN
    );
    if (!alreadyInstalled) {
      ScriptApp.newTrigger('showSaleFormOnOpen')
        .forSpreadsheet(SpreadsheetApp.openById(SHEET_ID))
        .onOpen()
        .create();
    }
  } catch(e) {
    // Silently ignore — trigger may already exist or permissions not yet granted
  }
}

// ── Called by the installable trigger on every open ──
// Installable triggers CAN show modal dialogs — this fires the sale form popup.
function showSaleFormOnOpen() {
  showSaleForm();
}

// ── Manual trigger install (run once from Apps Script editor if needed) ──
function installOpenTrigger() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'showSaleFormOnOpen') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('showSaleFormOnOpen')
    .forSpreadsheet(SpreadsheetApp.openById(SHEET_ID))
    .onOpen()
    .create();
  SpreadsheetApp.getUi().alert('✓ Done! The Record Sale form will now pop up automatically every time the sheet is opened.');
}

// ── Sidebar: quick-access panel shown on every open ───────────
function showDataEntrySidebar() {
  const html = HtmlService.createHtmlOutput(\`
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; padding: 10px; background: #1a0a0a; color: #f0e6d3; margin: 0; }
  h2 { color: #D97706; font-size: 13px; margin: 0 0 4px; }
  p { font-size: 10px; color: #c8b89a; margin: 0 0 10px; }
  .btn { display: block; width: 100%; padding: 9px 10px; margin: 5px 0;
    background: #7F1D1D; color: white; border: none; border-radius: 5px;
    cursor: pointer; font-size: 12px; text-align: left; font-weight: bold; }
  .btn:hover { background: #991B1B; }
  .btn.green { background: #14532d; }
  .btn.green:hover { background: #166534; }
  .btn.blue { background: #1e3a5f; }
  .btn.blue:hover { background: #1e40af; }
  .divider { border-top: 1px solid #3a2a1a; margin: 8px 0; }
  .tip { background: #2a1a0a; border-left: 3px solid #D97706; padding: 6px 8px; font-size: 10px; color: #c8b89a; border-radius: 0 4px 4px 0; margin-top: 10px; }
</style>
</head>
<body>
<h2>📋 AGL Data Entry</h2>
<p>Click a button to open the entry form</p>
<button class="btn" onclick="google.script.run.showSaleForm()">➕ Record Sale</button>
<button class="btn green" onclick="google.script.run.showExpenseForm()">💸 Record Expense</button>
<button class="btn" onclick="google.script.run.showWorkshopForm()">🔧 Log Workshop Job</button>
<button class="btn blue" onclick="google.script.run.showClockInForm()">⏱ Clock In / Out</button>
<button class="btn green" onclick="google.script.run.showPOForm()">📦 Purchase Order</button>
<div class="divider"></div>
<button class="btn blue" onclick="google.script.run.showSummary()">📊 View Summary</button>
<div class="tip">⚠ Do NOT type directly into the sheet cells. Use these buttons to ensure data validation.</div>
</body>
</html>
\`).setTitle('AGL Data Entry').setWidth(200);
  SpreadsheetApp.getUi().showSidebar(html);
}

// ─────────────────────────────────────────────────────────────
// WEB APP ENDPOINTS (for website two-way sync)
// ─────────────────────────────────────────────────────────────
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'pull';
    if (action === 'pull') {
      return jsonResponse(pullAll());
    }
    if (action === 'summary') {
      return jsonResponse(getSummary());
    }
    return jsonResponse({ ok: false, error: 'Unknown action: ' + action });
  } catch(err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const { type, row } = payload;
    if (!type || !row) return jsonResponse({ ok: false, error: 'Missing type or row' });
    const result = appendRow(type, row);
    return jsonResponse(result);
  } catch(err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─────────────────────────────────────────────────────────────
// PULL — read all data for website sync
// ─────────────────────────────────────────────────────────────
function pullAll() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  return {
    ok: true,
    timestamp: new Date().toISOString(),
    sales:     readSheet(ss, 'Sales & Customer Log',  mapSaleRow),
    expenses:  readSheet(ss, 'Expense Log',            mapExpenseRow),
    workshop:  readSheet(ss, 'Workshop Daily Log',     mapWorkshopRow),
    clockin:   readSheet(ss, 'Staff Clock-In',         mapClockInRow),
    purchaseOrders: readSheet(ss, 'Purchase Orders',   mapPORow),
    inventory: readSheet(ss, 'Inventory',              mapInventoryRow),
  };
}

function readSheet(ss, name, mapper) {
  try {
    const sheet = ss.getSheetByName(name);
    if (!sheet) return [];
    const rows = sheet.getDataRange().getValues();
    if (rows.length < 2) return [];
    const result = [];
    for (let i = 1; i < rows.length; i++) {
      const mapped = mapper(rows[i], i);
      if (mapped) result.push(mapped);
    }
    return result;
  } catch(e) { return []; }
}

// Row mappers — column indices match the headers written by populate_sheet.py
function mapSaleRow(r, i) {
  const date = fmtDate(r[1]);
  if (!date) return null;
  return {
    id: r[0] || ('sh_s_' + i), date,
    customer: clean(r[2]), contact: clean(r[3]), channel: clean(r[4]),
    vehicle: clean(r[5]), item: clean(r[6]),
    qty: num(r[7]), unitPrice: num(r[8]), total: num(r[9]),
    payment: clean(r[10]), receipt: clean(r[11]),
    rep: clean(r[12]), mechanic: clean(r[13]),
    status: clean(r[14]) || 'Completed',
    workmanshipFee: num(r[15]), notes: clean(r[16])
  };
}

function mapExpenseRow(r, i) {
  const date = fmtDate(r[1]);
  if (!date) return null;
  return {
    id: r[0] || ('sh_e_' + i), date,
    description: clean(r[2]), category: clean(r[3]),
    requestedBy: clean(r[4]), approvedBy: clean(r[5]),
    receipt: clean(r[6]), amount: num(r[7]),
    paymentMethod: clean(r[8]), budgetCode: clean(r[9]),
    status: clean(r[10]), notes: clean(r[11])
  };
}

function mapWorkshopRow(r, i) {
  const date = fmtDate(r[1]);
  if (!date) return null;
  return {
    id: r[0] || ('sh_w_' + i), date,
    car: clean(r[2]), regNo: clean(r[3]), mechanic: clean(r[4]),
    jobDescription: clean(r[5]), status: clean(r[6]) || 'In Progress',
    estCost: num(r[7]), actualCost: num(r[8]),
    owner: clean(r[9]), recall: clean(r[10]) === 'Yes',
    recallNotes: clean(r[11]), notes: clean(r[12])
  };
}

function mapClockInRow(r, i) {
  const date = fmtDate(r[1]);
  if (!date) return null;
  return {
    id: r[0] || ('sh_c_' + i), date,
    staff: clean(r[2]), timeIn: clean(r[3]), timeOut: clean(r[4]),
    late: clean(r[5]) === 'Y',
    hours: num(r[6]),
    latePenalty: num(r[7]), noOutPenalty: num(r[8]),
    notes: clean(r[9])
  };
}

function mapPORow(r, i) {
  const date = fmtDate(r[2]);
  if (!date) return null;
  return {
    id: r[0] || ('sh_po_' + i), poNo: clean(r[1]), date,
    supplier: clean(r[3]), item: clean(r[4]),
    qty: num(r[5]), unitCost: num(r[6]), total: num(r[7]),
    requestedBy: clean(r[8]), approvedBy: clean(r[9]),
    dateApproved: clean(r[10]), expectedDelivery: clean(r[11]),
    dateReceived: clean(r[12]), status: clean(r[13]), notes: clean(r[14])
  };
}

function mapInventoryRow(r, i) {
  const name = clean(r[2]);
  if (!name) return null;
  return {
    id: r[0] || ('sh_inv_' + i), sku: clean(r[1]), name,
    category: clean(r[3]), brand: clean(r[4]),
    qty: num(r[5]), reorderLevel: num(r[6]),
    costPrice: num(r[7]), sellPrice: num(r[8]),
    supplier: clean(r[9]), vehicleModels: clean(r[10]),
    yearRange: clean(r[11]), status: clean(r[12]), notes: clean(r[13])
  };
}

// ─────────────────────────────────────────────────────────────
// PUSH — append a new row from website
// ─────────────────────────────────────────────────────────────
function appendRow(type, row) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheetMap = {
    sale:          'Sales & Customer Log',
    expense:       'Expense Log',
    workshop:      'Workshop Daily Log',
    clockin:       'Staff Clock-In',
    purchaseOrder: 'Purchase Orders',
  };
  const sheetName = sheetMap[type];
  if (!sheetName) return { ok: false, error: 'Unknown type: ' + type };

  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { ok: false, error: 'Sheet not found: ' + sheetName };

  // Validate before appending
  const validation = validateRow(type, row);
  if (!validation.ok) return validation;

  const rowData = buildRowArray(type, row);
  sheet.appendRow(rowData);
  return { ok: true, message: type + ' recorded successfully', rowData };
}

function validateRow(type, row) {
  const errors = [];
  if (type === 'sale') {
    if (!row.date) errors.push('Date is required');
    if (!row.item) errors.push('Item is required');
    if (!row.rep || !SALES_REPS.includes(row.rep)) errors.push('Valid sales rep required: ' + SALES_REPS.join(', '));
    if (isNaN(row.total) || row.total <= 0) errors.push('Total must be > 0');
    if (!row.payment || !PAYMENTS.includes(row.payment)) errors.push('Valid payment method required');
  }
  if (type === 'expense') {
    if (!row.date) errors.push('Date is required');
    if (!row.description) errors.push('Description is required');
    if (isNaN(row.amount) || row.amount <= 0) errors.push('Amount must be > 0');
  }
  if (type === 'workshop') {
    if (!row.date) errors.push('Date is required');
    if (!row.regNo) errors.push('Registration number is required');
    if (!row.jobDescription) errors.push('Job description is required');
    if (!row.mechanic) errors.push('Mechanic is required');
  }
  if (type === 'clockin') {
    if (!row.date) errors.push('Date is required');
    if (!row.staff || !ALL_STAFF.includes(row.staff)) errors.push('Valid staff name required');
    if (!row.timeIn) errors.push('Clock-in time is required');
  }
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true };
}

function buildRowArray(type, row) {
  const id = type.charAt(0) + '_' + Date.now();
  const today = new Date().toISOString().slice(0, 10);
  if (type === 'sale') {
    return [id, row.date || today, row.customer || '', row.contact || '',
      row.channel || 'Walk-In', row.vehicle || '', row.item,
      row.qty || 1, row.unitPrice || row.total, row.total,
      row.payment, row.receipt || 'RCP-' + Date.now(),
      row.rep, row.mechanic || '', row.status || 'Completed',
      row.workmanshipFee || 0, row.notes || ''];
  }
  if (type === 'expense') {
    return [id, row.date || today, row.description, row.category || 'General',
      row.requestedBy || '', row.approvedBy || '', row.receipt || '',
      row.amount, row.paymentMethod || 'Cash', row.budgetCode || '',
      row.status || 'Approved', row.notes || ''];
  }
  if (type === 'workshop') {
    return [id, row.date || today, row.car || '', row.regNo,
      row.mechanic, row.jobDescription, row.status || 'Queued',
      row.estCost || '', '', row.owner || '', 'No', '', row.notes || ''];
  }
  if (type === 'clockin') {
    const isLate = row.timeIn > WORK_START;
    const noOut = !row.timeOut;
    return [id, row.date || today, row.staff, row.timeIn, row.timeOut || '',
      isLate ? 'Y' : 'N', row.hours || '', isLate ? 20 : 0, noOut ? 5 : 0, row.notes || ''];
  }
  if (type === 'purchaseOrder') {
    const poNo = 'AGL-PO-' + String(Date.now()).slice(-5);
    return [id, poNo, row.date || today, row.supplier, row.item,
      row.qty || 1, row.unitCost || 0, row.total || 0,
      row.requestedBy || '', row.approvedBy || '', '', row.expectedDelivery || '',
      '', row.status || 'Pending', row.notes || ''];
  }
  return [];
}

// ─────────────────────────────────────────────────────────────
// GOOGLE FORM POPUPS — triggered from menu
// ─────────────────────────────────────────────────────────────
function showSaleForm() {
  const today = new Date().toISOString().slice(0, 10);
  const html = HtmlService.createHtmlOutput(\`
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; padding: 12px; background: #f8f8f8; }
  h2 { color: #7F1D1D; margin: 0 0 12px; font-size: 14px; }
  label { display: block; font-weight: bold; margin: 8px 0 2px; color: #333; font-size: 11px; }
  input, select, textarea { width: 100%; padding: 5px 7px; border: 1px solid #ccc; border-radius: 4px; font-size: 11px; box-sizing: border-box; }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .total-display { background: #D97706; color: white; padding: 6px 10px; border-radius: 4px; font-weight: bold; font-size: 13px; margin: 8px 0; }
  button { background: #7F1D1D; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 12px; width: 100%; margin-top: 8px; }
  button:hover { background: #991B1B; }
  .error { color: red; font-size: 10px; margin-top: 4px; }
  .required { color: red; }
</style>
</head>
<body>
<h2>➕ Record Sale</h2>
<div class="row">
  <div>
    <label>Date <span class="required">*</span></label>
    <input type="date" id="date" value="\${today}" />
  </div>
  <div>
    <label>Sales Rep <span class="required">*</span></label>
    <select id="rep">
      <option value="">Select rep...</option>
      <option>Yvonne</option><option>Abigail</option><option>Bright</option>
    </select>
  </div>
</div>
<label>Item / Service <span class="required">*</span></label>
<input type="text" id="item" placeholder="e.g. NGK Spark Plug 93175" />
<div class="row">
  <div>
    <label>Qty <span class="required">*</span></label>
    <input type="number" id="qty" value="1" min="1" onchange="calcTotal()" />
  </div>
  <div>
    <label>Unit Price (GHS) <span class="required">*</span></label>
    <input type="number" id="price" placeholder="0.00" step="0.01" onchange="calcTotal()" />
  </div>
</div>
<div class="total-display" id="totalDisplay">Total: GHS 0.00</div>
<div class="row">
  <div>
    <label>Payment Method <span class="required">*</span></label>
    <select id="payment">
      <option value="">Select...</option>
      <option>Cash</option><option>MoMo</option><option>Bank Transfer</option><option>Credit</option><option>Cheque</option>
    </select>
  </div>
  <div>
    <label>Channel</label>
    <select id="channel">
      <option>Walk-In</option><option>WhatsApp</option><option>Phone</option>
      <option>Facebook</option><option>Instagram</option><option>Wholesale</option><option>Workshop</option>
    </select>
  </div>
</div>
<div class="row">
  <div>
    <label>Customer Name</label>
    <input type="text" id="customer" placeholder="Walk-in customer" />
  </div>
  <div>
    <label>Contact / Phone</label>
    <input type="text" id="contact" placeholder="0244..." />
  </div>
</div>
<div class="row">
  <div>
    <label>Vehicle Reg</label>
    <input type="text" id="vehicle" placeholder="GR-1234-23" />
  </div>
  <div>
    <label>Mechanic (if workshop)</label>
    <select id="mechanic">
      <option value="">None</option>
      <option>Appiah</option><option>Kojo</option><option>Fatawu</option><option>Chris</option>
    </select>
  </div>
</div>
<label>Notes</label>
<input type="text" id="notes" placeholder="Optional notes" />
<div id="errMsg" class="error"></div>
<button onclick="submitSale()">✓ Record Sale</button>
<script>
function calcTotal() {
  const qty = parseFloat(document.getElementById('qty').value) || 0;
  const price = parseFloat(document.getElementById('price').value) || 0;
  const total = qty * price;
  document.getElementById('totalDisplay').textContent = 'Total: GHS ' + total.toFixed(2);
}
function submitSale() {
  const date = document.getElementById('date').value;
  const rep = document.getElementById('rep').value;
  const item = document.getElementById('item').value.trim();
  const qty = parseInt(document.getElementById('qty').value) || 1;
  const price = parseFloat(document.getElementById('price').value) || 0;
  const payment = document.getElementById('payment').value;
  const total = qty * price;
  const errors = [];
  if (!date) errors.push('Date required');
  if (!rep) errors.push('Sales rep required');
  if (!item) errors.push('Item required');
  if (price <= 0) errors.push('Unit price must be > 0');
  if (!payment) errors.push('Payment method required');
  if (errors.length) { document.getElementById('errMsg').textContent = errors.join(' | '); return; }
  document.getElementById('errMsg').textContent = '';
  const row = {
    date, rep, item, qty, unitPrice: price, total, payment,
    channel: document.getElementById('channel').value,
    customer: document.getElementById('customer').value,
    contact: document.getElementById('contact').value,
    vehicle: document.getElementById('vehicle').value,
    mechanic: document.getElementById('mechanic').value,
    notes: document.getElementById('notes').value,
    status: 'Completed'
  };
  google.script.run.withSuccessHandler(function(result) {
    if (result && result.ok) {
      alert('✓ Sale recorded: ' + item + ' — GHS ' + total.toFixed(2));
      google.script.host.close();
    } else {
      document.getElementById('errMsg').textContent = 'Error: ' + (result ? result.errors : 'Unknown');
    }
  }).submitSaleFromForm(row);
}
</script>
</body>
</html>
\`).setWidth(480).setHeight(560).setTitle('Record Sale');
  SpreadsheetApp.getUi().showModalDialog(html, 'Record Sale');
}

function showExpenseForm() {
  const today = new Date().toISOString().slice(0, 10);
  const html = HtmlService.createHtmlOutput(\`
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; padding: 12px; }
  h2 { color: #7F1D1D; margin: 0 0 12px; font-size: 14px; }
  label { display: block; font-weight: bold; margin: 8px 0 2px; font-size: 11px; }
  input, select { width: 100%; padding: 5px 7px; border: 1px solid #ccc; border-radius: 4px; font-size: 11px; box-sizing: border-box; }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  button { background: #7F1D1D; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 12px; width: 100%; margin-top: 8px; }
  .error { color: red; font-size: 10px; margin-top: 4px; }
  .required { color: red; }
</style>
</head>
<body>
<h2>💸 Record Expense</h2>
<div class="row">
  <div>
    <label>Date <span class="required">*</span></label>
    <input type="date" id="date" value="\${today}" />
  </div>
  <div>
    <label>Amount (GHS) <span class="required">*</span></label>
    <input type="number" id="amount" placeholder="0.00" step="0.01" />
  </div>
</div>
<label>Description / Item <span class="required">*</span></label>
<input type="text" id="description" placeholder="e.g. Workshop supplies" />
<div class="row">
  <div>
    <label>Category</label>
    <select id="category">
      <option>Workshop Supplies</option><option>Office Stationery</option>
      <option>Fuel</option><option>Staff Welfare</option><option>Utilities</option>
      <option>Repairs & Maintenance</option><option>Marketing</option><option>Other</option>
    </select>
  </div>
  <div>
    <label>Payment Method</label>
    <select id="payment">
      <option>Cash</option><option>MoMo</option><option>Bank Transfer</option>
    </select>
  </div>
</div>
<div class="row">
  <div>
    <label>Requested By</label>
    <select id="requestedBy">
      <option value="">Select...</option>
      <option>Yvonne</option><option>Abigail</option><option>Bright</option>
      <option>Ben</option><option>Appiah</option><option>Kojo</option><option>Fatawu</option><option>Chris</option>
    </select>
  </div>
  <div>
    <label>Receipt Ref</label>
    <input type="text" id="receipt" placeholder="Optional receipt #" />
  </div>
</div>
<label>Notes</label>
<input type="text" id="notes" placeholder="Optional" />
<div id="errMsg" class="error"></div>
<button onclick="submitExpense()">✓ Record Expense</button>
<script>
function submitExpense() {
  const date = document.getElementById('date').value;
  const amount = parseFloat(document.getElementById('amount').value) || 0;
  const description = document.getElementById('description').value.trim();
  const errors = [];
  if (!date) errors.push('Date required');
  if (!description) errors.push('Description required');
  if (amount <= 0) errors.push('Amount must be > 0');
  if (errors.length) { document.getElementById('errMsg').textContent = errors.join(' | '); return; }
  const row = {
    date, amount, description,
    category: document.getElementById('category').value,
    paymentMethod: document.getElementById('payment').value,
    requestedBy: document.getElementById('requestedBy').value,
    receipt: document.getElementById('receipt').value,
    notes: document.getElementById('notes').value
  };
  google.script.run.withSuccessHandler(function(result) {
    if (result && result.ok) {
      alert('✓ Expense recorded: ' + description + ' — GHS ' + amount.toFixed(2));
      google.script.host.close();
    } else {
      document.getElementById('errMsg').textContent = 'Error: ' + (result ? JSON.stringify(result.errors) : 'Unknown');
    }
  }).submitExpenseFromForm(row);
}
</script>
</body>
</html>
\`).setWidth(440).setHeight(460).setTitle('Record Expense');
  SpreadsheetApp.getUi().showModalDialog(html, 'Record Expense');
}

function showWorkshopForm() {
  const today = new Date().toISOString().slice(0, 10);
  const html = HtmlService.createHtmlOutput(\`
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; padding: 12px; }
  h2 { color: #7F1D1D; margin: 0 0 12px; font-size: 14px; }
  label { display: block; font-weight: bold; margin: 8px 0 2px; font-size: 11px; }
  input, select, textarea { width: 100%; padding: 5px 7px; border: 1px solid #ccc; border-radius: 4px; font-size: 11px; box-sizing: border-box; }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  button { background: #7F1D1D; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 12px; width: 100%; margin-top: 8px; }
  .error { color: red; font-size: 10px; margin-top: 4px; }
  .required { color: red; }
</style>
</head>
<body>
<h2>🔧 Log Workshop Job</h2>
<div class="row">
  <div>
    <label>Date <span class="required">*</span></label>
    <input type="date" id="date" value="\${today}" />
  </div>
  <div>
    <label>Mechanic <span class="required">*</span></label>
    <select id="mechanic">
      <option value="">Select...</option>
      <option>Appiah</option><option>Kojo</option><option>Fatawu</option><option>Chris</option>
    </select>
  </div>
</div>
<div class="row">
  <div>
    <label>Vehicle Make/Model <span class="required">*</span></label>
    <input type="text" id="car" placeholder="e.g. Toyota Corolla" />
  </div>
  <div>
    <label>Registration No. <span class="required">*</span></label>
    <input type="text" id="regNo" placeholder="GR-1234-23" />
  </div>
</div>
<label>Job Description <span class="required">*</span></label>
<textarea id="jobDesc" rows="2" placeholder="Full service, brake pad replacement..."></textarea>
<div class="row">
  <div>
    <label>Owner / Customer</label>
    <input type="text" id="owner" placeholder="Customer name" />
  </div>
  <div>
    <label>Status</label>
    <select id="status">
      <option>Queued</option><option>In Progress</option>
      <option>Awaiting Parts</option><option>Completed</option>
    </select>
  </div>
</div>
<div class="row">
  <div>
    <label>Est. Cost (GHS)</label>
    <input type="number" id="estCost" placeholder="0" />
  </div>
  <div>
    <label>Notes</label>
    <input type="text" id="notes" placeholder="Optional" />
  </div>
</div>
<div id="errMsg" class="error"></div>
<button onclick="submitWorkshop()">✓ Log Job</button>
<script>
function submitWorkshop() {
  const date = document.getElementById('date').value;
  const mechanic = document.getElementById('mechanic').value;
  const car = document.getElementById('car').value.trim();
  const regNo = document.getElementById('regNo').value.trim().toUpperCase();
  const jobDescription = document.getElementById('jobDesc').value.trim();
  const errors = [];
  if (!date) errors.push('Date required');
  if (!mechanic) errors.push('Mechanic required');
  if (!car) errors.push('Vehicle required');
  if (!regNo) errors.push('Registration required');
  if (!jobDescription) errors.push('Job description required');
  if (errors.length) { document.getElementById('errMsg').textContent = errors.join(' | '); return; }
  const row = {
    date, mechanic, car, regNo, jobDescription,
    owner: document.getElementById('owner').value,
    status: document.getElementById('status').value,
    estCost: parseFloat(document.getElementById('estCost').value) || 0,
    notes: document.getElementById('notes').value
  };
  google.script.run.withSuccessHandler(function(result) {
    if (result && result.ok) {
      alert('✓ Workshop job logged: ' + regNo + ' — ' + jobDescription);
      google.script.host.close();
    } else {
      document.getElementById('errMsg').textContent = 'Error: ' + (result ? JSON.stringify(result.errors) : 'Unknown');
    }
  }).submitWorkshopFromForm(row);
}
</script>
</body>
</html>
\`).setWidth(440).setHeight(500).setTitle('Log Workshop Job');
  SpreadsheetApp.getUi().showModalDialog(html, 'Log Workshop Job');
}

function showClockInForm() {
  const today = new Date().toISOString().slice(0, 10);
  const nowTime = Utilities.formatDate(new Date(), 'Africa/Accra', 'HH:mm');
  const html = HtmlService.createHtmlOutput(\`
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; padding: 12px; }
  h2 { color: #7F1D1D; margin: 0 0 12px; font-size: 14px; }
  label { display: block; font-weight: bold; margin: 8px 0 2px; font-size: 11px; }
  input, select { width: 100%; padding: 5px 7px; border: 1px solid #ccc; border-radius: 4px; font-size: 11px; box-sizing: border-box; }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  button { background: #7F1D1D; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 12px; width: 100%; margin-top: 8px; }
  .warning { background: #FEF3C7; border: 1px solid #D97706; padding: 6px 10px; border-radius: 4px; font-size: 10px; color: #92400E; margin: 6px 0; display: none; }
  .error { color: red; font-size: 10px; margin-top: 4px; }
  .required { color: red; }
</style>
</head>
<body>
<h2>⏱ Staff Clock-In / Out</h2>
<div class="row">
  <div>
    <label>Date <span class="required">*</span></label>
    <input type="date" id="date" value="\${today}" />
  </div>
  <div>
    <label>Staff Name <span class="required">*</span></label>
    <select id="staff">
      <option value="">Select staff...</option>
      <option>Yvonne</option><option>Abigail</option><option>Bright</option><option>Ben</option>
      <option>Appiah</option><option>Kojo</option><option>Fatawu</option><option>Chris</option>
    </select>
  </div>
</div>
<div class="row">
  <div>
    <label>Clock-In Time <span class="required">*</span></label>
    <input type="time" id="timeIn" value="\${nowTime}" onchange="checkLate()" />
  </div>
  <div>
    <label>Clock-Out Time</label>
    <input type="time" id="timeOut" />
  </div>
</div>
<div class="warning" id="lateWarning">⚠ Late arrival — GHS 20 penalty will be applied (work starts at 08:00)</div>
<label>Notes</label>
<input type="text" id="notes" placeholder="Optional" />
<div id="errMsg" class="error"></div>
<button onclick="submitClockIn()">✓ Record Clock-In</button>
<script>
function checkLate() {
  const timeIn = document.getElementById('timeIn').value;
  const warn = document.getElementById('lateWarning');
  warn.style.display = timeIn > '08:00' ? 'block' : 'none';
}
function submitClockIn() {
  const date = document.getElementById('date').value;
  const staff = document.getElementById('staff').value;
  const timeIn = document.getElementById('timeIn').value;
  const errors = [];
  if (!date) errors.push('Date required');
  if (!staff) errors.push('Staff required');
  if (!timeIn) errors.push('Clock-in time required');
  if (errors.length) { document.getElementById('errMsg').textContent = errors.join(' | '); return; }
  const timeOut = document.getElementById('timeOut').value;
  let hours = 0;
  if (timeOut) {
    const [ih, im] = timeIn.split(':').map(Number);
    const [oh, om] = timeOut.split(':').map(Number);
    hours = Math.round(((oh * 60 + om) - (ih * 60 + im)) / 60 * 100) / 100;
  }
  const row = { date, staff, timeIn, timeOut, hours, notes: document.getElementById('notes').value };
  google.script.run.withSuccessHandler(function(result) {
    if (result && result.ok) {
      alert('✓ Clock-in recorded for ' + staff + ' at ' + timeIn + (timeIn > '08:00' ? ' (LATE — GHS 20 penalty)' : ''));
      google.script.host.close();
    } else {
      document.getElementById('errMsg').textContent = 'Error: ' + (result ? JSON.stringify(result.errors) : 'Unknown');
    }
  }).submitClockInFromForm(row);
}
</script>
</body>
</html>
\`).setWidth(400).setHeight(400).setTitle('Staff Clock-In');
  SpreadsheetApp.getUi().showModalDialog(html, 'Staff Clock-In');
}

function showPOForm() {
  const today = new Date().toISOString().slice(0, 10);
  const html = HtmlService.createHtmlOutput(\`
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; padding: 12px; }
  h2 { color: #7F1D1D; margin: 0 0 12px; font-size: 14px; }
  label { display: block; font-weight: bold; margin: 8px 0 2px; font-size: 11px; }
  input, select { width: 100%; padding: 5px 7px; border: 1px solid #ccc; border-radius: 4px; font-size: 11px; box-sizing: border-box; }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  button { background: #7F1D1D; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 12px; width: 100%; margin-top: 8px; }
  .error { color: red; font-size: 10px; margin-top: 4px; }
  .required { color: red; }
</style>
</head>
<body>
<h2>📦 Add Purchase Order</h2>
<div class="row">
  <div>
    <label>Date <span class="required">*</span></label>
    <input type="date" id="date" value="\${today}" />
  </div>
  <div>
    <label>Supplier <span class="required">*</span></label>
    <input type="text" id="supplier" placeholder="AutoParts Ghana" />
  </div>
</div>
<label>Items Description <span class="required">*</span></label>
<input type="text" id="item" placeholder="Brake pads x10, Oil filters x5" />
<div class="row">
  <div>
    <label>Qty</label>
    <input type="number" id="qty" value="1" min="1" />
  </div>
  <div>
    <label>Total Amount (GHS) <span class="required">*</span></label>
    <input type="number" id="total" placeholder="0.00" step="0.01" />
  </div>
</div>
<div class="row">
  <div>
    <label>Requested By</label>
    <select id="requestedBy">
      <option value="">Select...</option>
      <option>Ben</option><option>Yvonne</option><option>Appiah</option>
    </select>
  </div>
  <div>
    <label>Expected Delivery</label>
    <input type="date" id="delivery" />
  </div>
</div>
<label>Notes</label>
<input type="text" id="notes" placeholder="Optional" />
<div id="errMsg" class="error"></div>
<button onclick="submitPO()">✓ Create PO</button>
<script>
function submitPO() {
  const date = document.getElementById('date').value;
  const supplier = document.getElementById('supplier').value.trim();
  const item = document.getElementById('item').value.trim();
  const total = parseFloat(document.getElementById('total').value) || 0;
  const errors = [];
  if (!date) errors.push('Date required');
  if (!supplier) errors.push('Supplier required');
  if (!item) errors.push('Items description required');
  if (total <= 0) errors.push('Total must be > 0');
  if (errors.length) { document.getElementById('errMsg').textContent = errors.join(' | '); return; }
  const row = {
    date, supplier, item, total,
    qty: parseInt(document.getElementById('qty').value) || 1,
    requestedBy: document.getElementById('requestedBy').value,
    expectedDelivery: document.getElementById('delivery').value,
    notes: document.getElementById('notes').value,
    status: 'Pending'
  };
  google.script.run.withSuccessHandler(function(result) {
    if (result && result.ok) {
      alert('✓ Purchase Order created: ' + supplier + ' — GHS ' + total.toFixed(2));
      google.script.host.close();
    } else {
      document.getElementById('errMsg').textContent = 'Error: ' + (result ? JSON.stringify(result.errors) : 'Unknown');
    }
  }).submitPOFromForm(row);
}
</script>
</body>
</html>
\`).setWidth(440).setHeight(460).setTitle('Add Purchase Order');
  SpreadsheetApp.getUi().showModalDialog(html, 'Add Purchase Order');
}

// ─────────────────────────────────────────────────────────────
// FORM SUBMIT HANDLERS (called from HTML via google.script.run)
// ─────────────────────────────────────────────────────────────
function submitSaleFromForm(row) {
  return appendRow('sale', row);
}
function submitExpenseFromForm(row) {
  return appendRow('expense', row);
}
function submitWorkshopFromForm(row) {
  return appendRow('workshop', row);
}
function submitClockInFromForm(row) {
  return appendRow('clockin', row);
}
function submitPOFromForm(row) {
  return appendRow('purchaseOrder', row);
}

// ─────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────
function getSummary() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sales = readSheet(ss, 'Sales & Customer Log', mapSaleRow);
  const expenses = readSheet(ss, 'Expense Log', mapExpenseRow);
  const workshop = readSheet(ss, 'Workshop Daily Log', mapWorkshopRow);
  const totalRevenue = sales.reduce((s, r) => s + (r.total || 0), 0);
  const totalExpenses = expenses.reduce((s, r) => s + (r.amount || 0), 0);
  return {
    ok: true,
    totalSales: sales.length,
    totalRevenue,
    totalExpenses,
    netPosition: totalRevenue - totalExpenses,
    workshopJobs: workshop.length,
    completedJobs: workshop.filter(w => w.status === 'Completed').length,
  };
}

function showSummary() {
  const summary = getSummary();
  const ui = SpreadsheetApp.getUi();
  ui.alert('AGL Summary',
    'Total Sales: ' + summary.totalSales + '\n' +
    'Total Revenue: GHS ' + summary.totalRevenue.toFixed(2) + '\n' +
    'Total Expenses: GHS ' + summary.totalExpenses.toFixed(2) + '\n' +
    'Net Position: GHS ' + summary.netPosition.toFixed(2) + '\n' +
    'Workshop Jobs: ' + summary.workshopJobs + ' (' + summary.completedJobs + ' completed)',
    ui.ButtonSet.OK);
}

function refreshFormulas() {
  SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange('A1').setValue(
    SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange('A1').getValue()
  );
  SpreadsheetApp.getUi().alert('Formulas refreshed.');
}

// ─────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d || d === '-') return '';
  if (d instanceof Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }
  const s = String(d).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const parts = s.split('/');
  if (parts.length === 3) {
    // DD/MM/YYYY
    return parts[2] + '-' + parts[1].padStart(2, '0') + '-' + parts[0].padStart(2, '0');
  }
  return s;
}

function clean(v) {
  if (v === null || v === undefined || v === '-') return '';
  return String(v).trim();
}

function num(v) {
  if (v === null || v === undefined || v === '') return 0;
  return parseFloat(String(v).replace(/[^0-9.\-]/g, '')) || 0;
}

`;
