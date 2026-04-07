import { router, protectedProcedure } from "../_core/trpc";
import { syncAllSheetData, getSheetMetadata } from "../googleSheets";
import { generateBusinessMetrics } from "../insights";

export const sheetsRouter = router({
  /**
   * Sync all data from Google Sheets
   */
  syncAll: protectedProcedure.mutation(async () => {
    try {
      const data = await syncAllSheetData();
      return {
        success: true,
        data,
        syncedAt: new Date(),
      };
    } catch (error) {
      console.error("Error syncing sheets:", error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }),

  /**
   * Get sheet metadata
   */
  getMetadata: protectedProcedure.query(async () => {
    try {
      const metadata = await getSheetMetadata();
      return {
        success: true,
        sheets: metadata,
      };
    } catch (error) {
      console.error("Error fetching metadata:", error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }),

  /**
   * Get business metrics and insights
   */
  getInsights: protectedProcedure.mutation(async () => {
    try {
      const data = await syncAllSheetData();
      const metrics = generateBusinessMetrics(data);
      return {
        success: true,
        metrics,
      };
    } catch (error) {
      console.error("Error generating insights:", error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }),
});
