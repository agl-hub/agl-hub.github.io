import { TRPCError } from "@trpc/server";
import { t } from "../_core/trpc";

export const tenantMiddleware = t.middleware(async ({ ctx, next }) => {
  const header = ctx.req.headers["x-tenant-id"];
  const raw = Array.isArray(header) ? header[0] : header;
  const tenantId = raw ? parseInt(raw, 10) : NaN;

  if (!raw || isNaN(tenantId) || tenantId <= 0) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Missing or invalid x-tenant-id header",
    });
  }

  return next({ ctx: { ...ctx, tenantId } });
});
