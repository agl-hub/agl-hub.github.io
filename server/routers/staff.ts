import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { router } from "../_core/trpc";
import { tenantProcedure } from "../_core/procedures";
import { db } from "../db";
import { staff, staffAttendanceLogs, staffPerformance } from "../../drizzle/schema";

const createStaffSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(["owner", "manager", "mechanic", "receptionist", "accountant"]),
  hireDate: z.string().optional(),
  status: z.enum(["active", "suspended", "terminated"]).default("active"),
  hourlyRate: z.number().positive().optional(),
  salaryType: z.enum(["hourly", "salary", "commission"]),
});

const clockInSchema = z.object({
  staffId: z.number().int(),
  locationGPS: z.string().optional(),
  deviceFingerprint: z.string().optional(),
});

const clockOutSchema = z.object({
  attendanceLogId: z.number().int(),
  approvedBy: z.number().int().optional(),
});

const performanceSchema = z.object({
  staffId: z.number().int(),
  monthStart: z.string(),
  monthEnd: z.string(),
  jobsCompleted: z.number().int().min(0).optional(),
  avgJobTime: z.number().optional(),
  customerRating: z.number().min(0).max(5).optional(),
  revenueGenerated: z.number().optional(),
  deductionsApplied: z.number().optional(),
});

export const staffRouter = router({
  list: tenantProcedure
    .input(
      z.object({
        role: z.enum(["owner", "manager", "mechanic", "receptionist", "accountant"]).optional(),
        status: z.enum(["active", "suspended", "terminated"]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      try {
        const conditions = [eq(staff.tenantId, ctx.tenantId)];
        if (input?.role) conditions.push(eq(staff.role, input.role));
        if (input?.status) conditions.push(eq(staff.status, input.status));

        const list = await db
          .select()
          .from(staff)
          .where(and(...conditions))
          .orderBy(staff.name);

        return { success: true, staff: list };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    }),

  create: tenantProcedure.input(createStaffSchema).mutation(async ({ ctx, input }) => {
    try {
      const [{ id }] = await db
        .insert(staff)
        .values({ ...input, tenantId: ctx.tenantId })
        .$returningId();
      const [created] = await db.select().from(staff).where(eq(staff.id, id)).limit(1);
      return { success: true, staff: created };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }),

  clockIn: tenantProcedure.input(clockInSchema).mutation(async ({ ctx, input }) => {
    try {
      const [member] = await db
        .select()
        .from(staff)
        .where(and(eq(staff.id, input.staffId), eq(staff.tenantId, ctx.tenantId), eq(staff.status, "active")))
        .limit(1);

      if (!member) return { success: false, error: "Staff member not found or inactive" };

      const [open] = await db
        .select()
        .from(staffAttendanceLogs)
        .where(and(eq(staffAttendanceLogs.staffId, input.staffId), sql`${staffAttendanceLogs.clockOutTime} IS NULL`))
        .limit(1);

      if (open) return { success: false, error: "Staff member already clocked in" };

      const [{ id }] = await db
        .insert(staffAttendanceLogs)
        .values({
          staffId: input.staffId,
          clockInTime: new Date(),
          locationGPS: input.locationGPS ?? null,
          deviceFingerprint: input.deviceFingerprint ?? null,
        })
        .$returningId();

      await db.update(staff).set({ lastClockIn: new Date() }).where(eq(staff.id, input.staffId));

      const [log] = await db.select().from(staffAttendanceLogs).where(eq(staffAttendanceLogs.id, id)).limit(1);
      return { success: true, attendanceLog: log };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }),

  clockOut: tenantProcedure.input(clockOutSchema).mutation(async ({ ctx, input }) => {
    try {
      const [log] = await db
        .select({ log: staffAttendanceLogs, member: staff })
        .from(staffAttendanceLogs)
        .innerJoin(staff, eq(staffAttendanceLogs.staffId, staff.id))
        .where(
          and(
            eq(staffAttendanceLogs.id, input.attendanceLogId),
            eq(staff.tenantId, ctx.tenantId),
            sql`${staffAttendanceLogs.clockOutTime} IS NULL`
          )
        )
        .limit(1);

      if (!log) return { success: false, error: "Attendance record not found or already clocked out" };

      const clockOutTime = new Date();
      const clockInTime = new Date(log.log.clockInTime!);
      const hoursWorked = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
      const overtimeHours = Math.max(0, hoursWorked - 8).toString();

      await db
        .update(staffAttendanceLogs)
        .set({
          clockOutTime,
          overtimeHours,
          approvedBy: input.approvedBy ?? null,
          updatedAt: new Date(),
        })
        .where(eq(staffAttendanceLogs.id, input.attendanceLogId));

      await db.update(staff).set({ lastClockOut: clockOutTime }).where(eq(staff.id, log.log.staffId));

      const [updated] = await db
        .select()
        .from(staffAttendanceLogs)
        .where(eq(staffAttendanceLogs.id, input.attendanceLogId))
        .limit(1);

      return { success: true, attendanceLog: updated };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }),

  recordPerformance: tenantProcedure.input(performanceSchema).mutation(async ({ ctx, input }) => {
    try {
      const [member] = await db
        .select()
        .from(staff)
        .where(and(eq(staff.id, input.staffId), eq(staff.tenantId, ctx.tenantId)))
        .limit(1);

      if (!member) return { success: false, error: "Staff member not found" };

      const [{ id }] = await db
        .insert(staffPerformance)
        .values({
          staffId: input.staffId,
          monthStart: input.monthStart,
          monthEnd: input.monthEnd,
          jobsCompleted: input.jobsCompleted ?? 0,
          avgJobTime: input.avgJobTime?.toString() ?? null,
          customerRating: input.customerRating?.toString() ?? null,
          revenueGenerated: input.revenueGenerated?.toString() ?? null,
          deductionsApplied: input.deductionsApplied?.toString() ?? null,
        })
        .$returningId();

      const [created] = await db
        .select()
        .from(staffPerformance)
        .where(eq(staffPerformance.id, id))
        .limit(1);

      return { success: true, performance: created };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }),

  listAttendance: tenantProcedure
    .input(z.object({ staffId: z.number().int().optional() }).optional())
    .query(async ({ ctx, input }) => {
      try {
        const conditions = input?.staffId
          ? [eq(staffAttendanceLogs.staffId, input.staffId), eq(staff.tenantId, ctx.tenantId)]
          : [eq(staff.tenantId, ctx.tenantId)];

        const logs = await db
          .select({ log: staffAttendanceLogs, staffName: staff.name })
          .from(staffAttendanceLogs)
          .innerJoin(staff, eq(staffAttendanceLogs.staffId, staff.id))
          .where(and(...conditions))
          .orderBy(desc(staffAttendanceLogs.clockInTime));

        return { success: true, attendanceLogs: logs };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    }),
});
