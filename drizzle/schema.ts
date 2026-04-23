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
import { relations } from "drizzle-orm";

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
  mechanics: text("mechanics").notNull(),
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
  summaryData: json("summary_data"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MonthlySummary = typeof monthlySummary.$inferSelect;
export type InsertMonthlySummary = typeof monthlySummary.$inferInsert;

/**
 * Tenants (multi-tenant root)
 */
export const tenants = mysqlTable("tenants", {
  id: int("id").autoincrement().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  businessName: text("businessName").notNull(),
  ownerEmail: varchar("ownerEmail", { length: 320 }).notNull(),
  subscriptionTier: mysqlEnum("subscriptionTier", ["free", "starter", "pro", "enterprise"]).notNull().default("free"),
  isActive: boolean("isActive").default(true).notNull(),
  brandingJSON: text("brandingJSON"),
});

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;

/**
 * Customer Directory
 */
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  tenantId: text("tenantId"),
  name: text("name").notNull(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  email: varchar("email", { length: 320 }),
  preferredContact: mysqlEnum("preferredContact", ["sms", "whatsapp", "email"]),
  notificationsEnabled: boolean("notificationsEnabled").default(true).notNull(),
  notes: text("notes"),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/**
 * Customer Vehicles
 */
export const vehicles = mysqlTable("vehicles", {
  id: int("id").autoincrement().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  tenantId: text("tenantId"),
  customerId: int("customerId").notNull().references(() => customers.id),
  registrationNo: varchar("registrationNo", { length: 50 }).notNull().unique(),
  make: text("make").notNull(),
  model: text("model"),
  year: text("year"),
  color: text("color"),
  notes: text("notes"),
});

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;

/**
 * Service Appointments
 */
export const serviceAppointments = mysqlTable("service_appointments", {
  id: int("id").autoincrement().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  tenantId: text("tenantId"),
  customerId: int("customerId").notNull().references(() => customers.id),
  vehicleId: int("vehicleId").notNull().references(() => vehicles.id),
  scheduledDate: text("scheduledDate").notNull(),
  scheduledTime: text("scheduledTime"),
  serviceType: text("serviceType").notNull(),
  status: mysqlEnum("status", ["Scheduled", "Checked In", "In Progress", "Ready", "Completed", "Cancelled"]).notNull(),
  assignedMechanic: text("assignedMechanic"),
  estimatedCost: decimal("estimatedCost", { precision: 10, scale: 2 }),
  actualCost: decimal("actualCost", { precision: 10, scale: 2 }),
  notes: text("notes"),
  notifiedAt: text("notifiedAt"),
});

export type ServiceAppointment = typeof serviceAppointments.$inferSelect;
export type InsertServiceAppointment = typeof serviceAppointments.$inferInsert;

/**
 * Communication Log
 */
export const communicationLog = mysqlTable("communication_log", {
  id: int("id").autoincrement().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  tenantId: text("tenantId"),
  customerId: int("customerId").notNull().references(() => customers.id),
  appointmentId: int("appointmentId").references(() => serviceAppointments.id),
  channel: mysqlEnum("channel", ["sms", "whatsapp", "email"]).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["sent", "delivered", "failed", "pending"]).notNull(),
  provider: text("provider"),
  externalId: text("externalId"),
});

export type CommunicationLog = typeof communicationLog.$inferSelect;
export type InsertCommunicationLog = typeof communicationLog.$inferInsert;

/**
 * Staff Directory
 */
export const staff = mysqlTable("staff", {
  id: int("id").autoincrement().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  tenantId: int("tenantId").notNull().references(() => tenants.id),
  name: text("name").notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  role: mysqlEnum("role", ["owner", "manager", "mechanic", "receptionist", "accountant"]).notNull(),
  hireDate: date("hireDate"),
  status: mysqlEnum("status", ["active", "suspended", "terminated"]).notNull().default("active"),
  hourlyRate: decimal("hourlyRate", { precision: 10, scale: 2 }),
  salaryType: mysqlEnum("salaryType", ["hourly", "salary", "commission"]).notNull(),
  lastClockIn: timestamp("lastClockIn"),
  lastClockOut: timestamp("lastClockOut"),
});

export type Staff = typeof staff.$inferSelect;
export type InsertStaff = typeof staff.$inferInsert;

/**
 * Staff Attendance Logs (GPS & device-tracked clock-in/out)
 * Note: legacy simple attendance is in staff_attendance table
 */
export const staffAttendanceLogs = mysqlTable("staff_attendance_logs", {
  id: int("id").autoincrement().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  staffId: int("staffId").notNull().references(() => staff.id),
  clockInTime: timestamp("clockInTime"),
  clockOutTime: timestamp("clockOutTime"),
  locationGPS: text("locationGPS"),
  deviceFingerprint: text("deviceFingerprint"),
  overtimeHours: decimal("overtimeHours", { precision: 5, scale: 2 }),
  approvedBy: int("approvedBy").references(() => staff.id),
});

export type StaffAttendanceLog = typeof staffAttendanceLogs.$inferSelect;
export type InsertStaffAttendanceLog = typeof staffAttendanceLogs.$inferInsert;

/**
 * Staff Performance
 */
export const staffPerformance = mysqlTable("staff_performance", {
  id: int("id").autoincrement().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  staffId: int("staffId").notNull().references(() => staff.id),
  monthStart: date("monthStart").notNull(),
  monthEnd: date("monthEnd").notNull(),
  jobsCompleted: int("jobsCompleted").default(0),
  avgJobTime: decimal("avgJobTime", { precision: 10, scale: 2 }),
  customerRating: decimal("customerRating", { precision: 3, scale: 2 }),
  revenueGenerated: decimal("revenueGenerated", { precision: 12, scale: 2 }),
  deductionsApplied: decimal("deductionsApplied", { precision: 10, scale: 2 }),
});

export type StaffPerformance = typeof staffPerformance.$inferSelect;
export type InsertStaffPerformance = typeof staffPerformance.$inferInsert;

/**
 * Transactions
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  tenantId: int("tenantId").notNull().references(() => tenants.id),
  appointmentId: int("appointmentId").references(() => serviceAppointments.id),
  type: mysqlEnum("type", ["sale", "refund", "expense", "payroll", "subscription"]).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("GHS"),
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "mobile_money", "card"]).notNull(),
  processedBy: int("processedBy").references(() => staff.id),
  status: mysqlEnum("status", ["pending", "completed", "flagged"]).notNull().default("pending"),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Marketing Spend
 */
export const marketingSpend = mysqlTable("marketing_spend", {
  id: int("id").autoincrement().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  tenantId: int("tenantId").notNull().references(() => tenants.id),
  campaignName: varchar("campaignName", { length: 255 }).notNull(),
  channel: mysqlEnum("channel", ["facebook", "google", "whatsapp", "radio"]).notNull(),
  budget: decimal("budget", { precision: 12, scale: 2 }).notNull(),
  spent: decimal("spent", { precision: 12, scale: 2 }).notNull().default("0"),
  leads: int("leads").default(0),
  roi: decimal("roi", { precision: 10, scale: 4 }),
  flaggedForReview: boolean("flaggedForReview").default(false),
});

export type MarketingSpend = typeof marketingSpend.$inferSelect;
export type InsertMarketingSpend = typeof marketingSpend.$inferInsert;

/**
 * Subscription Plans
 */
export const subscriptionPlans = mysqlTable("subscription_plans", {
  id: int("id").autoincrement().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  tenantId: int("tenantId").notNull().references(() => tenants.id),
  name: varchar("name", { length: 255 }).notNull(),
  monthlyPrice: decimal("monthlyPrice", { precision: 10, scale: 2 }).notNull(),
  yearlyPrice: decimal("yearlyPrice", { precision: 10, scale: 2 }).notNull(),
  benefitsJSON: text("benefitsJSON"),
  isActive: boolean("isActive").default(true).notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

/**
 * Customer Subscriptions
 */
export const customerSubscriptions = mysqlTable("customer_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  tenantId: int("tenantId").notNull().references(() => tenants.id),
  customerId: int("customerId").notNull().references(() => customers.id),
  planId: int("planId").notNull().references(() => subscriptionPlans.id),
  status: mysqlEnum("status", ["active", "paused", "canceled"]).notNull().default("active"),
  startDate: date("startDate").notNull(),
  nextBillingDate: date("nextBillingDate"),
  paymentMethod: varchar("paymentMethod", { length: 100 }),
  autoRenew: boolean("autoRenew").default(true).notNull(),
});

export type CustomerSubscription = typeof customerSubscriptions.$inferSelect;
export type InsertCustomerSubscription = typeof customerSubscriptions.$inferInsert;

// ─── Relations ───────────────────────────────────────────────────────────────

export const tenantsRelations = relations(tenants, ({ many }) => ({
  staff: many(staff),
  transactions: many(transactions),
  marketingSpend: many(marketingSpend),
  subscriptionPlans: many(subscriptionPlans),
  customerSubscriptions: many(customerSubscriptions),
}));

export const staffRelations = relations(staff, ({ one, many }) => ({
  tenant: one(tenants, { fields: [staff.tenantId], references: [tenants.id] }),
  attendanceLogs: many(staffAttendanceLogs),
  performance: many(staffPerformance),
  processedTransactions: many(transactions),
}));

export const staffAttendanceLogsRelations = relations(staffAttendanceLogs, ({ one }) => ({
  staff: one(staff, { fields: [staffAttendanceLogs.staffId], references: [staff.id] }),
  approver: one(staff, { fields: [staffAttendanceLogs.approvedBy], references: [staff.id], relationName: "approvedAttendance" }),
}));

export const staffPerformanceRelations = relations(staffPerformance, ({ one }) => ({
  staff: one(staff, { fields: [staffPerformance.staffId], references: [staff.id] }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  vehicles: many(vehicles),
  serviceAppointments: many(serviceAppointments),
  communicationLog: many(communicationLog),
  subscriptions: many(customerSubscriptions),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  customer: one(customers, { fields: [vehicles.customerId], references: [customers.id] }),
  serviceAppointments: many(serviceAppointments),
}));

export const serviceAppointmentsRelations = relations(serviceAppointments, ({ one, many }) => ({
  customer: one(customers, { fields: [serviceAppointments.customerId], references: [customers.id] }),
  vehicle: one(vehicles, { fields: [serviceAppointments.vehicleId], references: [vehicles.id] }),
  communicationLog: many(communicationLog),
  transactions: many(transactions),
}));

export const communicationLogRelations = relations(communicationLog, ({ one }) => ({
  customer: one(customers, { fields: [communicationLog.customerId], references: [customers.id] }),
  appointment: one(serviceAppointments, { fields: [communicationLog.appointmentId], references: [serviceAppointments.id] }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  tenant: one(tenants, { fields: [transactions.tenantId], references: [tenants.id] }),
  appointment: one(serviceAppointments, { fields: [transactions.appointmentId], references: [serviceAppointments.id] }),
  processedByStaff: one(staff, { fields: [transactions.processedBy], references: [staff.id] }),
}));

export const marketingSpendRelations = relations(marketingSpend, ({ one }) => ({
  tenant: one(tenants, { fields: [marketingSpend.tenantId], references: [tenants.id] }),
}));

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ one, many }) => ({
  tenant: one(tenants, { fields: [subscriptionPlans.tenantId], references: [tenants.id] }),
  customerSubscriptions: many(customerSubscriptions),
}));

export const customerSubscriptionsRelations = relations(customerSubscriptions, ({ one }) => ({
  tenant: one(tenants, { fields: [customerSubscriptions.tenantId], references: [tenants.id] }),
  customer: one(customers, { fields: [customerSubscriptions.customerId], references: [customers.id] }),
  plan: one(subscriptionPlans, { fields: [customerSubscriptions.planId], references: [subscriptionPlans.id] }),
}));
