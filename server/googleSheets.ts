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

/**
 * Fetch data from a specific sheet
 */
export async function getSheetData(sheetName: string, range?: string): Promise<SheetData | null> {
  try {
    const fullRange = range ? `${sheetName}!${range}` : `${sheetName}`;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: fullRange,
    });

    return {
      range: response.data.range || fullRange,
      values: response.data.values || [],
    };
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

/**
 * Sync all data from Google Sheets
 */
export async function syncAllSheetData() {
  try {
    const [monthlySummary, sales, workshop, staff, expenses, purchaseOrders] = await Promise.all([
      parseMonthlySummary(),
      parseSalesLog(),
      parseWorkshopLog(),
      parseStaffClockIn(),
      parseExpenseLog(),
      parsePurchaseOrders(),
    ]);

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
    console.error("Error syncing sheet data:", error);
    throw error;
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
