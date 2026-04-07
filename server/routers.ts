import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { sheetsRouter } from "./routers/sheets";
import { reportsRouter } from "./routers/reports";
import { auditRouter } from "./routers/audit";
import { configRouter } from "./routers/config";
import { shareRouter } from "./routers/share";
import { schedulesRouter } from "./routers/schedules";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { aiRouter } from "./routers/ai";
import {
  getSalesTransactions,
  getWorkshopJobs,
  getStaffAttendance,
  getExpenses,
  getPurchaseOrders,
  getInventory,
  getCreditSales,
  getNotifications,
  getMonthlySummary,
  calculateKPIs,
  getDb,
} from "./db";
import {
  insertSalesTransaction,
  insertWorkshopJob,
  insertExpense,
  insertPurchaseOrder,
  insertInventory,
  insertCreditSale,
  insertNotification,
} from "./db.insert";


export const appRouter = router({
  system: systemRouter,
  sheets: sheetsRouter,
  reports: reportsRouter,
  audit: auditRouter,
  config: configRouter,
  share: shareRouter,
  schedules: schedulesRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Dashboard KPIs
  dashboard: router({
    getKPIs: publicProcedure
      .input(
        z.object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
      )
      .query(async ({ input }) => {
        const startDate = input.startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endDate = input.endDate || new Date();
        return await calculateKPIs(startDate, endDate);
      }),

    getMonthlySummary: publicProcedure
      .input(z.object({ month: z.date().optional() }))
      .query(async ({ input }) => {
        return await getMonthlySummary(input.month);
      }),
  }),

  // Sales & Transactions
  sales: router({
    list: publicProcedure
      .input(
        z.object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          channel: z.string().optional(),
          paymentMethod: z.string().optional(),
          status: z.string().optional(),
          searchTerm: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return await getSalesTransactions(input);
      }),

    create: protectedProcedure
      .input(
        z.object({
          transactionDate: z.date(),
          customerName: z.string().optional(),
          customerContact: z.string().optional(),
          channel: z.string(),
          vehicle: z.string().optional(),
          partService: z.string(),
          quantity: z.number().optional(),
          unitPrice: z.number().optional(),
          totalAmount: z.number(),
          paymentMethod: z.string(),
          receiptNo: z.string().optional(),
          salesRep: z.string().optional(),
          mechanic: z.string().optional(),
          status: z.string(),
          workmanshipFee: z.number().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await insertSalesTransaction(input);
      }),
  }),

  // Workshop Jobs
  workshop: router({
    list: publicProcedure
      .input(
        z.object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          status: z.string().optional(),
          searchTerm: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return await getWorkshopJobs(input);
      }),

    create: protectedProcedure
      .input(
        z.object({
          jobDate: z.date(),
          vehicle: z.string(),
          registrationNo: z.string().optional(),
          mechanics: z.array(z.string()),
          jobDescription: z.string(),
          status: z.string(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await insertWorkshopJob(input);
      }),
  }),

  // Staff Attendance
  staff: router({
    listAttendance: publicProcedure
      .input(
        z.object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          staffName: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return await getStaffAttendance(input);
      }),
  }),

  // Expenses
  expenses: router({
    list: publicProcedure
      .input(
        z.object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          category: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return await getExpenses(input);
      }),

    create: protectedProcedure
      .input(
        z.object({
          expenseDate: z.date(),
          category: z.string(),
          description: z.string(),
          amount: z.number(),
          paymentMethod: z.string().optional(),
          vendor: z.string().optional(),
          approvedBy: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await insertExpense(input);
      }),
  }),

  // Purchase Orders
  purchaseOrders: router({
    list: publicProcedure
      .input(z.object({ status: z.string().optional() }))
      .query(async ({ input }) => {
        return await getPurchaseOrders(input);
      }),

    create: protectedProcedure
      .input(
        z.object({
          poNumber: z.string(),
          poDate: z.date(),
          vendor: z.string(),
          description: z.string(),
          amount: z.number(),
          status: z.string(),
          deliveryDate: z.date().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await insertPurchaseOrder(input);
      }),
  }),

  // Inventory
  inventory: router({
    list: publicProcedure
      .input(
        z.object({
          category: z.string().optional(),
          lowStockOnly: z.boolean().optional(),
        })
      )
      .query(async ({ input }) => {
        return await getInventory(input);
      }),

    create: protectedProcedure
      .input(
        z.object({
          itemName: z.string(),
          itemCode: z.string(),
          category: z.string(),
          quantity: z.number(),
          minStockLevel: z.number(),
          unitPrice: z.number(),
          supplier: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await insertInventory(input);
      }),
  }),

  // Credit Sales
  creditSales: router({
    list: publicProcedure
      .input(z.object({ status: z.string().optional() }))
      .query(async ({ input }) => {
        return await getCreditSales(input);
      }),

    create: protectedProcedure
      .input(
        z.object({
          customerName: z.string(),
          customerContact: z.string().optional(),
          totalAmount: z.number(),
          amountPaid: z.number().optional(),
          amountDue: z.number(),
          saleDate: z.date(),
          dueDate: z.date().optional(),
          status: z.string(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await insertCreditSale(input);
      }),
  }),

  // Notifications
  notifications: router({
    list: publicProcedure
      .input(
        z.object({
          recipientRole: z.string().optional(),
          unreadOnly: z.boolean().optional(),
        })
      )
      .query(async ({ input }) => {
        return await getNotifications(input);
      }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          content: z.string(),
          type: z.string(),
          recipientRole: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        return await insertNotification(input);
      }),
  }),

  // AI Chat
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
