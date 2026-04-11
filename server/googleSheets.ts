import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";
import { ENV } from "./_core/env";

// Path to the Excel file (.xlsx or .xlsm with VBA macros)
const EXCEL_FILE_PATH = process.env.EXCEL_FILE_PATH || path.join(process.cwd(), "data.xlsm");

export interface SheetData {
  range: string;
  values: any[][];
}

// In-memory cache: key -> { data, expiresAt }
const CACHE_TTL_MS = 60_000; // 1 minute
const sheetCache = new Map<string, { data: SheetData; expiresAt: number }>();

// Cached workbook
let cachedWorkbook: XLSX.WorkBook | null = null;
let workbookCacheTime: number = 0;
const WORKBOOK_CACHE_TTL_MS = 30_000; // 30 seconds

export function clearSheetCache(key?: string) {
  if (key) sheetCache.delete(key);
  else {
    sheetCache.clear();
    cachedWorkbook = null;
    workbookCacheTime = 0;
  }
}

/**
 * Load workbook from Excel file with caching
 */
function loadWorkbook(): XLSX.WorkBook | null {
  const now = Date.now();
  
  // Return cached workbook if still valid
  if (cachedWorkbook && now - workbookCacheTime < WORKBOOK_CACHE_TTL_MS) {
    return cachedWorkbook;
  }

  try {
    if (!fs.existsSync(EXCEL_FILE_PATH)) {
      console.error(`Excel file not found: ${EXCEL_FILE_PATH}`);
      return null;
    }

    const buffer = fs.readFileSync(EXCEL_FILE_PATH);
    const workbook = XLSX.read(buffer, { type: "buffer", cellStyles: true, cellDates: true });
    cachedWorkbook = workbook;
    workbookCacheTime = now;
    return workbook;
  } catch (error) {
    console.error("Error loading Excel file:", error);
    return null;
  }
}

/**
 * Fetch data from a specific sheet
 */
export async function getSheetData(
  sheetName: string,
  range?: string,
  opts: { force?: boolean } = {},
): Promise<SheetData | null> {
  const cacheKey = `${sheetName}${range ? "!" + range : ""}`;

  if (!opts.force) {
    const cached = sheetCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }
  }

  try {
    const workbook = loadWorkbook();
    if (!workbook) {
      return null;
    }

    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      console.error(`Sheet "${sheetName}" not found in Excel file`);
      return null;
    }

    // Convert sheet to JSON array
    const values = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
    
    const data: SheetData = {
      range: range || sheetName,
      values: values as any[][],
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
  const data = await g