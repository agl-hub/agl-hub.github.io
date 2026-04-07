import { google } from "googleapis";
import { ENV } from "./_core/env";

const SPREADSHEET_ID = "1pFBk2xCbILKxVSgwACQIrIscEimonnnyJNBKoiAVZ7U";

// Initialize Google Sheets API with API key
const sheets = google.sheets({
  version: "v4",
  auth: ENV.forgeApiKey, // Using Manus built-in API key
});

export interface SheetData {
  range: string;
  values: any[][];
}

// In-memory cache: key -> { data, expiresAt }
const CACHE_TTL_MS = 60_000; // 1 minute
const sheetCache = new Map<string, { data: SheetData; expiresAt: number }>();

export function clearSheetCache(key?: string) {
  if (key) sheetCache.delete(key);
  else sheetCache.clear();
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3, baseDelayMs = 300): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      const status = err?.code || err?.response?.status;
      // Don't retry on auth/permission/not-found
      if ([400, 401, 403, 404].includes(Number(status))) break;
      if (i < attempts - 1) {
        const delay = baseDelayMs * Math.pow(2, i);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastErr;
}

/**
 * Fetch data from a specific sheet (with cache + retry)
 */
export async function getSheetData(
  sheetName: string,
  range?: string,
  opts: { force?: boolean } = {},
): Promise<SheetData | null> {
  const fullRange = range ? `${sheetName}!${range}` : `${sheetName}`;
  const cacheKey = fullRange;

  if (!opts.force) {
    const cached = sheetCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }
  }

  try {
    const response = await withRetry(() =>
      sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: fullRange,
      }),
    );

    const data: SheetData = {
      range: response.data.range || fullRange,
      values: response.data.values || [],
    };
    sheetCache.set(cacheKey, { data, expiresAt: Date.now() + CACHE_TTL_MS });
    return data;
  } catch (error) {
    console.error(`Error fetching sheet data from ${sheetName}:`, error);
    return null;
  }
}

/**
 * Parse Monthly Summary sheet
 */
export async function parseMonthlySummary() {
  const data = await getSheetData("Monthly Summary");
  if (!data || !data.values || data.values.length === 0) return null;

  const headers = data.values[0];
  const rows = data.values.slice(1);

  return rows.map((row) => {
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

/**
 * Parse Sales & Customer Log sheet
 */
export async function parseSalesLog() {
  const data = await getSheetData("Sales & Customer Log");
  if (!data || !data.values || data.values.length === 0) return null;

  const headers = data.values[0];
  const rows = data.values.slice(1);

  return rows.map((row) => {
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

/**
 * Parse Workshop Daily Log sheet
 */
export async function parseWorkshopLog() {
  const data = await getSheetData("Workshop Daily Log");
  if (!data || !data.values || data.values.length === 0) return null;

  const headers = data.values[0];
  const rows = data.values.slice(1);

  return rows.map((row) => {
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

/**
 * Parse Staff Clock-In sheet
 */
export async function parseStaffClockIn() {
  const data = await getSheetData("Staff Clock-In");
  if (!data || !data.values || data.values.length === 0) return null;

  const headers = data.values[0];
  const rows = data.values.slice(1);

  return rows.map((row) => {
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

/**
 * Parse Expense Log sheet
 */
export async function parseExpenseLog() {
  const data = await getSheetData("Expense Log");
  if (!data || !data.values || data.values.length === 0) return null;

  const headers = data.values[0];
  const rows = data.values.slice(1);

  return rows.map((row) => {
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

/**
 * Parse Purchase Orders sheet
 */
export async function parsePurchaseOrders() {
  const data = await getSheetData("Purchase Orders");
  if (!data || !data.values || data.values.length === 0) return null;

  const headers = data.values[0];
  const rows = data.values.slice(1);

  return rows.map((row) => {
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

// Sync status (in-memory)
export interface SyncStatus {
  lastSyncedAt: Date | null;
  lastSuccessAt: Date | null;
  lastError: string | null;
  inProgress: boolean;
  totalSyncs: number;
  totalFailures: number;
}

const syncStatus: SyncStatus = {
  lastSyncedAt: null,
  lastSuccessAt: null,
  lastError: null,
  inProgress: false,
  totalSyncs: 0,
  totalFailures: 0,
};

export function getSyncStatus(): SyncStatus {
  return { ...syncStatus };
}

/**
 * Sync all data from Google Sheets
 */
export async function syncAllSheetData(opts: { force?: boolean } = {}) {
  if (opts.force) clearSheetCache();
  syncStatus.inProgress = true;
  syncStatus.lastSyncedAt = new Date();
  syncStatus.totalSyncs += 1;
  try {
    const [monthlySummary, sales, workshop, staff, expenses, purchaseOrders] = await Promise.all([
      parseMonthlySummary(),
      parseSalesLog(),
      parseWorkshopLog(),
      parseStaffClockIn(),
      parseExpenseLog(),
      parsePurchaseOrders(),
    ]);

    syncStatus.lastSuccessAt = new Date();
    syncStatus.lastError = null;
    syncStatus.inProgress = false;
    return {
      monthlySummary,
      sales,
      workshop,
      staff,
      expenses,
      purchaseOrders,
      syncedAt: new Date(),
    };
  } catch (error) {
    syncStatus.lastError = (error as Error).message;
    syncStatus.totalFailures += 1;
    syncStatus.inProgress = false;
    console.error("Error syncing sheet data:", error);
    throw error;
  }
}

// Auto-refresh: pre-warm cache every 5 minutes
const AUTO_REFRESH_MS = 5 * 60_000;
let autoRefreshTimer: NodeJS.Timeout | null = null;

export function startAutoRefresh() {
  if (autoRefreshTimer) return;
  autoRefreshTimer = setInterval(() => {
    syncAllSheetData({ force: true }).catch((e) =>
      console.error("Auto-refresh failed:", e),
    );
  }, AUTO_REFRESH_MS);
}

export function stopAutoRefresh() {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer);
    autoRefreshTimer = null;
  }
}

/**
 * Get sheet metadata (list of all sheets)
 */
export async function getSheetMetadata() {
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    return response.data.sheets?.map((sheet) => ({
      title: sheet.properties?.title,
      sheetId: sheet.properties?.sheetId,
      index: sheet.properties?.index,
      gridProperties: sheet.properties?.gridProperties,
    }));
  } catch (error) {
    console.error("Error fetching sheet metadata:", error);
    return null;
  }
}
