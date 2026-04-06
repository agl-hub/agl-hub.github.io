import { getDb } from "./db";
import {
  salesTransactions,
  workshopJobs,
  expenses,
  purchaseOrders,
  inventory,
  creditSales,
  notifications,
} from "../drizzle/schema";

export async function insertSalesTransaction(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(salesTransactions).values(data);
  return { success: true, id: result[0] };
}

export async function insertWorkshopJob(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(workshopJobs).values(data);
  return { success: true, id: result[0] };
}

export async function insertExpense(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(expenses).values(data);
  return { success: true, id: result[0] };
}

export async function insertPurchaseOrder(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(purchaseOrders).values(data);
  return { success: true, id: result[0] };
}

export async function insertInventory(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(inventory).values(data);
  return { success: true, id: result[0] };
}

export async function insertCreditSale(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(creditSales).values(data);
  return { success: true, id: result[0] };
}

export async function insertNotification(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(notifications).values(data);
  return { success: true, id: result[0] };
}
