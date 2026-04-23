import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { router, protectedProcedure } from "../_core/trpc";
import { tenantProcedure } from "../_core/procedures";
import { db } from "../db";
import { tenants } from "../../drizzle/schema";

const createTenantSchema = z.object({
  businessName: z.string().min(1),
  ownerEmail: z.string().email(),
  subscriptionTier: z.enum(["free", "starter", "pro", "enterprise"]).default("free"),
  brandingJSON: z.string().optional(),
});

const updateTenantSchema = createTenantSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const tenantsRouter = router({
  list: protectedProcedure.query(async () => {
    try {
      const list = await db.select().from(tenants).orderBy(desc(tenants.createdAt));
      return { success: true, tenants: list };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }),

  getById: tenantProcedure.query(async ({ ctx }) => {
    try {
      const [tenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, ctx.tenantId))
        .limit(1);
      if (!tenant) return { success: false, error: "Tenant not found" };
      return { success: true, tenant };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }),

  create: protectedProcedure.input(createTenantSchema).mutation(async ({ input }) => {
    try {
      const [{ id }] = await db.insert(tenants).values(input).$returningId();
      const [created] = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
      return { success: true, tenant: created };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }),

  update: tenantProcedure.input(updateTenantSchema).mutation(async ({ ctx, input }) => {
    try {
      await db
        .update(tenants)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(tenants.id, ctx.tenantId));
      const [updated] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, ctx.tenantId))
        .limit(1);
      if (!updated) return { success: false, error: "Tenant not found" };
      return { success: true, tenant: updated };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }),
});
