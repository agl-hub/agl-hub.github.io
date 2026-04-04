import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  date,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "manager", "staff"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Sales & Customer Log
 */
export const salesTransactions = mysqlTable("sales_transactions", {
  id: int("id").autoincrement().primaryKey(),
  transactionDate: date("transaction_date").notNull(),
  customerName: varchar("customer_name", { length: 255 }),
  customerContact: varchar("customer_contact", { length: 20 }),
  channel: mysqlEnum("channel", ["Walk-In", "WhatsApp", "Phone", "Instagram", "TikTok", "Boss"]).notNull(),
  vehicle: varchar("vehicle", { length: 255 }),
  partService: text("part_service").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("payment_method", ["Cash", "MoMo", "Bank Transfer", "Credit", "POS"]).notNull(),
  receiptNo: varchar("receipt_no", { length: 50 }),
  salesRep: varchar("sales_rep", { length: 100 }),
  mechanic: varchar("mechanic", { length: 100 }),
  status: mysqlEnum("status", ["Completed", "Pending Payment", "Pending", "Cancelled", "Queued", "Awaiting", "Delivered"]).notNull(),
  workmanshipFee: decimal("workmanship_fee", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SalesTransaction = typeof salesTransactions.$inferSelect;
export type InsertSalesTransaction = typeof salesTransactions.$inferInsert;

/**
 * Workshop Daily Log
 */
export const workshopJobs = mysqlTable("workshop_jobs", {
  id: int("id").autoincrement().primaryKey(),
  jobDate: date("job_date").notNull(),
  vehicle: varchar("vehicle", { length: 255 }).notNull(),
  registrationNo: varchar("registration_no", { length: 50 }),
  mechanics: text("mechanics").notNull(), // JSON array of mechanic names
  jobDescription: text("job_description").notNull(),
  status: mysqlEnum("status", ["Completed", "In Progress", "Pending", "On Hold"]).notNull(),
  notes: text("notes"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WorkshopJob = typeof workshopJobs.$inferSelect;
export type InsertWorkshopJob = typeof workshopJobs.$inferInsert;

/**
 * Staff Clock-In & Attendance
 */
export const staffAttendance = mysqlTable("staff_attendance", {
  id: int("id").autoincrement().primaryKey(),
  staffName: varchar("staff_name", { length: 100 }).notNull(),
  role: varchar("role", { length: 100 }).notNull(),
  clockInDate: date("clock_in_date").notNull(),
  clockInTime: varchar("clock_in_time", { length: 10 }),
  clockOutTime: varchar("clock_out_time", { length: 10 }),
  hoursWorked: decimal("hours_worked", { precision: 5, scale: 2 }),
  isLate: boolean("is_late").default(false),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StaffAttendance = typeof staffAttendance.$inferSelect;
export type InsertStaffAttendance = typeof staffAttendance.$inferInsert;

/**
 * Expense Log
 */
export const expenses = mysqlTable("expenses", {
  id: int("id").autoincrement().primaryKey(),
  expenseDate: date("expense_date").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  vendor: varchar("vendor", { length: 255 }),
  approvedBy: varchar("approved_by", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;

/**
 * Purchase Orders
 */
export const purchaseOrders = mysqlTable("purchase_orders", {
  id: int("id").autoincrement().primaryKey(),
  poNumber: varchar("po_number", { length: 50 }).unique().notNull(),
  poDate: date("po_date").notNull(),
  vendor: varchar("vendor", { length: 255 }).notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["Pending", "Approved", "Received", "Cancelled"]).notNull(),
  deliveryDate: date("delivery_date"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = typeof purchaseOrders.$inferInsert;

/**
 * Inventory & Stock Management
 */
export const inventory = mysqlTable("inventory", {
  id: int("id").autoincrement().primaryKey(),
  itemName: varchar("item_name", { length: 255 }).notNull(),
  itemCode: varchar("item_code", { length: 50 }).unique().notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  quantity: int("quantity").notNull(),
  minStockLevel: int("min_stock_level").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  supplier: varchar("supplier", { length: 255 }),
  lastRestockDate: date("last_restock_date"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = typeof inventory.$inferInsert;

/**
 * Creditors & Credit Sales
 */
export const creditSales = mysqlTable("credit_sales", {
  id: int("id").autoincrement().primaryKey(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerContact: varchar("customer_contact", { length: 20 }),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }).default("0"),
  amountDue: decimal("amount_due", { precision: 10, scale: 2 }).notNull(),
  saleDate: date("sale_date").notNull(),
  dueDate: date("due_date"),
  status: mysqlEnum("status", ["Pending", "Partially Paid", "Fully Paid", "Overdue"]).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CreditSale = typeof creditSales.$inferSelect;
export type InsertCreditSale = typeof creditSales.$inferInsert;

/**
 * Notifications
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  type: mysqlEnum("type", ["revenue_alert", "attendance_alert", "vehicle_alert", "payment_alert", "inventory_alert", "general"]).notNull(),
  recipientRole: varchar("recipient_role", { length: 50 }).notNull(),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Monthly Summary (cached data)
 */
export const monthlySummary = mysqlTable("monthly_summary", {
  id: int("id").autoincrement().primaryKey(),
  month: date("month").notNull().unique(),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }),
  totalTransactions: int("total_transactions"),
  avgTransactionValue: decimal("avg_transaction_value", { precision: 10, scale: 2 }),
  totalVehiclesServiced: int("total_vehicles_serviced"),
  workingDays: int("working_days"),
  avgVehiclesPerDay: decimal("avg_vehicles_per_day", { precision: 5, scale: 2 }),
  totalExpenses: decimal("total_expenses", { precision: 12, scale: 2 }),
  totalPOSpend: decimal("total_po_spend", { precision: 12, scale: 2 }),
  netPosition: decimal("net_position", { precision: 12, scale: 2 }),
  summaryData: json("summary_data"), // Store detailed breakdown as JSON
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MonthlySummary = typeof monthlySummary.$inferSelect;
export type InsertMonthlySummary = typeof monthlySummary.$inferInsert;
