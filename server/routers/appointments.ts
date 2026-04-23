import { z } from "zod";
import { eq, and, gte, lte, desc, asc, like } from "drizzle-orm";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { serviceAppointments, customers, vehicles } from "../../drizzle/schema";
import type { ServiceAppointment } from "../../drizzle/schema";

const STATUS_ENUM = ["Scheduled", "Checked In", "In Progress", "Ready", "Completed", "Cancelled"] as const;

const appointmentInputSchema = z.object({
  customerId: z.number().int(),
  vehicleId: z.number().int(),
  scheduledDate: z.string().min(1),
  scheduledTime: z.string().optional(),
  serviceType: z.string().min(1),
  assignedMechanic: z.string().optional(),
  estimatedCost: z.number().optional(),
  notes: z.string().optional(),
  status: z.enum(STATUS_ENUM).default("Scheduled"),
});

const updateStatusSchema = z.object({
  id: z.number().int(),
  status: z.enum(STATUS_ENUM),
});

const cancelSchema = z.object({
  id: z.number().int(),
  reason: z.string().min(1),
});

export const appointmentsRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          status: z.enum(STATUS_ENUM).optional(),
          dateRange: z
            .object({ start: z.string().optional(), end: z.string().optional() })
            .optional(),
          assignedMechanic: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      try {
        const conditions = [];

        if (input?.status) {
          conditions.push(eq(serviceAppointments.status, input.status));
        }
        if (input?.dateRange?.start) {
          conditions.push(gte(serviceAppointments.scheduledDate, input.dateRange.start));
        }
        if (input?.dateRange?.end) {
          conditions.push(lte(serviceAppointments.scheduledDate, input.dateRange.end));
        }
        if (input?.assignedMechanic) {
          conditions.push(like(serviceAppointments.assignedMechanic, `%${input.assignedMechanic}%`));
        }

        const results = await db
          .select({ appointment: serviceAppointments, customer: customers, vehicle: vehicles })
          .from(serviceAppointments)
          .innerJoin(customers, eq(serviceAppointments.customerId, customers.id))
          .innerJoin(vehicles, eq(serviceAppointments.vehicleId, vehicles.id))
          .where(conditions.length ? and(...conditions) : undefined)
          .orderBy(asc(serviceAppointments.scheduledDate));

        return { success: true, appointments: results };
      } catch (error) {
        console.error("Error listing appointments:", error);
        return { success: false, error: (error as Error).message };
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input }) => {
      try {
        const result = await db
          .select({ appointment: serviceAppointments, customer: customers, vehicle: vehicles })
          .from(serviceAppointments)
          .innerJoin(customers, eq(serviceAppointments.customerId, customers.id))
          .innerJoin(vehicles, eq(serviceAppointments.vehicleId, vehicles.id))
          .where(eq(serviceAppointments.id, input.id))
          .limit(1);

        if (!result.length) {
          return { success: false, error: "Appointment not found" };
        }

        return { success: true, appointment: result[0] };
      } catch (error) {
        console.error("Error fetching appointment:", error);
        return { success: false, error: (error as Error).message };
      }
    }),

  create: protectedProcedure
    .input(appointmentInputSchema)
    .mutation(async ({ input }) => {
      try {
        const customerExists = await db
          .select()
          .from(customers)
          .where(eq(customers.id, input.customerId))
          .limit(1);

        if (!customerExists.length) {
          return { success: false, error: "Customer not found" };
        }

        const vehicleExists = await db
          .select()
          .from(vehicles)
          .where(and(eq(vehicles.id, input.vehicleId), eq(vehicles.customerId, input.customerId)))
          .limit(1);

        if (!vehicleExists.length) {
          return { success: false, error: "Vehicle not found or does not belong to customer" };
        }

        const [{ id }] = await db.insert(serviceAppointments).values(input).$returningId();
        const [newAppointment] = await db
          .select()
          .from(serviceAppointments)
          .where(eq(serviceAppointments.id, id))
          .limit(1);

        return { success: true, appointment: newAppointment };
      } catch (error) {
        console.error("Error creating appointment:", error);
        return { success: false, error: (error as Error).message };
      }
    }),

  updateStatus: protectedProcedure
    .input(updateStatusSchema)
    .mutation(async ({ input }) => {
      try {
        const updateData: Partial<ServiceAppointment> = {
          status: input.status,
          updatedAt: new Date(),
        };

        if (input.status === "Ready" || input.status === "Completed") {
          updateData.notifiedAt = new Date().toISOString();
        }

        await db
          .update(serviceAppointments)
          .set(updateData)
          .where(eq(serviceAppointments.id, input.id));

        const [updatedAppointment] = await db
          .select()
          .from(serviceAppointments)
          .where(eq(serviceAppointments.id, input.id))
          .limit(1);

        if (!updatedAppointment) {
          return { success: false, error: "Appointment not found" };
        }

        return { success: true, appointment: updatedAppointment };
      } catch (error) {
        console.error("Error updating appointment status:", error);
        return { success: false, error: (error as Error).message };
      }
    }),

  cancel: protectedProcedure
    .input(cancelSchema)
    .mutation(async ({ input }) => {
      try {
        await db
          .update(serviceAppointments)
          .set({ status: "Cancelled", notes: input.reason, updatedAt: new Date() })
          .where(eq(serviceAppointments.id, input.id));

        const [cancelledAppointment] = await db
          .select()
          .from(serviceAppointments)
          .where(eq(serviceAppointments.id, input.id))
          .limit(1);

        if (!cancelledAppointment) {
          return { success: false, error: "Appointment not found" };
        }

        return { success: true, appointment: cancelledAppointment };
      } catch (error) {
        console.error("Error cancelling appointment:", error);
        return { success: false, error: (error as Error).message };
      }
    }),
});
