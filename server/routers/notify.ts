import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { communicationLog, customers, serviceAppointments } from "../../drizzle/schema";

const sendNotificationSchema = z.object({
  customerId: z.number().int(),
  appointmentId: z.number().int().optional(),
  channel: z.enum(["sms", "whatsapp", "email"]),
  message: z.string().min(1),
});

export const notifyRouter = router({
  sendNotification: protectedProcedure
    .input(sendNotificationSchema)
    .mutation(async ({ input }) => {
      try {
        const customer = await db
          .select()
          .from(customers)
          .where(eq(customers.id, input.customerId))
          .limit(1);

        if (!customer.length) {
          return { success: false, error: "Customer not found" };
        }

        if (input.appointmentId) {
          const appointment = await db
            .select()
            .from(serviceAppointments)
            .where(
              and(
                eq(serviceAppointments.id, input.appointmentId),
                eq(serviceAppointments.customerId, input.customerId)
              )
            )
            .limit(1);

          if (!appointment.length) {
            return {
              success: false,
              error: "Appointment not found or does not belong to customer",
            };
          }
        }

        console.log(
          `[NOTIFICATION] To: ${customer[0].name} (${customer[0].phone}) | Channel: ${input.channel} | Message: ${input.message}`
        );

        const [{ id }] = await db
          .insert(communicationLog)
          .values({
            customerId: input.customerId,
            appointmentId: input.appointmentId ?? null,
            channel: input.channel,
            message: input.message,
            status: "sent",
          })
          .$returningId();

        const [logEntry] = await db
          .select()
          .from(communicationLog)
          .where(eq(communicationLog.id, id))
          .limit(1);

        return { success: true, log: logEntry, message: "Notification sent successfully" };
      } catch (error) {
        console.error("Error sending notification:", error);
        return { success: false, error: (error as Error).message };
      }
    }),

  getHistory: protectedProcedure
    .input(z.object({ customerId: z.number().int() }))
    .query(async ({ input }) => {
      try {
        const history = await db
          .select()
          .from(communicationLog)
          .where(eq(communicationLog.customerId, input.customerId))
          .orderBy(desc(communicationLog.createdAt));

        return { success: true, history };
      } catch (error) {
        console.error("Error fetching notification history:", error);
        return { success: false, error: (error as Error).message };
      }
    }),

  getTemplates: protectedProcedure.query(() => {
    return {
      success: true,
      templates: {
        ready: "Hi {name}, your {vehicle} is ready for pickup at AGL Auto.",
        inprogress: "Hi {name}, work has started on your {vehicle}.",
        reminder: "Hi {name}, reminder: your {vehicle} appointment is tomorrow.",
      },
    };
  }),
});
