import { eq, and, gte, lte, like, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  salesTransactions,
  workshopJobs,
  staffAttendance,
  expenses,
  purchaseOrders,
  inventory,
  creditSales,
  notifications,
  monthlySummary,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Sales Transactions
export async function getSalesTransactions(filters?: {
  startDate?: Date;
  endDate?: Date;
  channel?: string;
  paymentMethod?: string;
  status?: string;
  searchTerm?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (filters?.startDate) {
    conditions.push(gte(salesTransactions.transactionDate, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(salesTransactions.transactionDate, filters.endDate));
  }
  if (filters?.channel) {
    conditions.push(eq(salesTransactions.channel, filters.channel as any));
  }
  if (filters?.paymentMethod) {
    conditions.push(eq(salesTransactions.paymentMethod, filters.paymentMethod as any));
  }
  if (filters?.status) {
    conditions.push(eq(salesTransactions.status, filters.status as any));
  }
  if (filters?.searchTerm) {
    conditions.push(
      like(salesTransactions.customerName, `%${filters.searchTerm}%`)
    );
  }

  return await db
    .select()
    .from(salesTransactions)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(salesTransactions.transactionDate));
}

// Workshop Jobs
export async function getWorkshopJobs(filters?: {
  startDate?: Date;
  endDate?: Date;
  status?: string;
  searchTerm?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (filters?.startDate) {
    conditions.push(gte(workshopJobs.jobDate, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(workshopJobs.jobDate, filters.endDate));
  }
  if (filters?.status) {
    conditions.push(eq(workshopJobs.status, filters.status as any));
  }
  if (filters?.searchTerm) {
    conditions.push(
      like(workshopJobs.vehicle, `%${filters.searchTerm}%`)
    );
  }

  return await db
    .select()
    .from(workshopJobs)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(workshopJobs.jobDate));
}

// Staff Attendance
export async function getStaffAttendance(filters?: {
  startDate?: Date;
  endDate?: Date;
  staffName?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (filters?.startDate) {
    conditions.push(gte(staffAttendance.clockInDate, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(staffAttendance.clockInDate, filters.endDate));
  }
  if (filters?.staffName) {
    conditions.push(eq(staffAttendance.staffName, filters.staffName));
  }

  return await db
    .select()
    .from(staffAttendance)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(staffAttendance.clockInDate));
}

// Expenses
export async function getExpenses(filters?: {
  startDate?: Date;
  endDate?: Date;
  category?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (filters?.startDate) {
    conditions.push(gte(expenses.expenseDate, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(expenses.expenseDate, filters.endDate));
  }
  if (filters?.category) {
    conditions.push(eq(expenses.category, filters.category));
  }

  return await db
    .select()
    .from(expenses)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(expenses.expenseDate));
}

// Purchase Orders
export async function getPurchaseOrders(filters?: { status?: string }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (filters?.status) {
    conditions.push(eq(purchaseOrders.status, filters.status as any));
  }

  return await db
    .select()
    .from(purchaseOrders)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(purchaseOrders.poDate));
}

// Inventory
export async function getInventory(filters?: {
  category?: string;
  lowStockOnly?: boolean;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (filters?.category) {
    conditions.push(eq(inventory.category, filters.category));
  }
  if (filters?.lowStockOnly) {
    conditions.push(lte(inventory.quantity, inventory.minStockLevel));
  }

  return await db
    .select()
    .from(inventory)
    .where(conditions.length > 0 ? and(...conditions) : undefined);
}

// Credit Sales
export async function getCreditSales(filters?: { status?: string }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (filters?.status) {
    conditions.push(eq(creditSales.status, filters.status as any));
  }

  return await db
    .select()
    .from(creditSales)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(creditSales.saleDate));
}

// Notifications
export async function getNotifications(filters?: {
  recipientRole?: string;
  unreadOnly?: boolean;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (filters?.recipientRole) {
    conditions.push(eq(notifications.recipientRole, filters.recipientRole));
  }
  if (filters?.unreadOnly) {
    conditions.push(eq(notifications.isRead, false));
  }

  return await db
    .select()
    .from(notifications)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(notifications.createdAt));
}

// Monthly Summary
export async function getMonthlySummary(month?: Date) {
  const db = await getDb();
  if (!db) return null;

  if (!month) {
    // Get the most recent month
    const result = await db
      .select()
      .from(monthlySummary)
      .orderBy(desc(monthlySummary.month))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  }

  const result = await db
    .select()
    .from(monthlySummary)
    .where(eq(monthlySummary.month, month))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// KPI Calculations
export async function calculateKPIs(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) {
    return {
      totalRevenue: 0,
      totalTransactions: 0,
      avgTransactionValue: 0,
      totalVehiclesServiced: 0,
      totalExpenses: 0,
      netPosition: 0,
    };
  }

  const transactions = await db
    .select()
    .from(salesTransactions)
    .where(
      and(
        gte(salesTransactions.transactionDate, startDate),
        lte(salesTransactions.transactionDate, endDate)
      )
    );

  const jobs = await db
    .select()
    .from(workshopJobs)
    .where(
      and(
        gte(workshopJobs.jobDate, startDate),
        lte(workshopJobs.jobDate, endDate)
      )
    );

  const expenseRecords = await db
    .select()
    .from(expenses)
    .where(
      and(
        gte(expenses.expenseDate, startDate),
        lte(expenses.expenseDate, endDate)
      )
    );

  const totalRevenue = transactions.reduce(
    (sum, t) => sum + (parseFloat(t.totalAmount?.toString() || "0")),
    0
  );

  const totalExpenses = expenseRecords.reduce(
    (sum, e) => sum + (parseFloat(e.amount?.toString() || "0")),
    0
  );

  return {
    totalRevenue,
    totalTransactions: transactions.length,
    avgTransactionValue: transactions.length > 0 ? totalRevenue / transactions.length : 0,
    totalVehiclesServiced: jobs.length,
    totalExpenses,
    netPosition: totalRevenue - totalExpenses,
  };
}
