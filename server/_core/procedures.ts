import { protectedProcedure } from "./trpc";
import { tenantMiddleware } from "../middleware/tenant";
import { requireTier } from "../middleware/feature-gate";

export const tenantProcedure = protectedProcedure.use(tenantMiddleware);

export const starterProcedure = tenantProcedure.use(requireTier("starter"));
export const proProcedure = tenantProcedure.use(requireTier("pro"));
export const enterpriseProcedure = tenantProcedure.use(requireTier("enterprise"));
