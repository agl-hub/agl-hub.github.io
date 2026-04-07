import { router, protectedProcedure } from "../_core/trpc";
import { getAudit } from "../audit";
import { z } from "zod";

export const auditRouter = router({
  list: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(500).optional() }).optional())
    .query(({ input }) => {
      return getAudit(input?.limit ?? 100);
    }),
});
