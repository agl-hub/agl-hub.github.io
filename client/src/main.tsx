import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/professional-theme.css";
import "./styles/global.css";
import "./index.css";
import { importSnapshot } from "./lib/sheetsSync";
import {
  snapshotSales, snapshotExpenses, snapshotWorkshop,
  snapshotPurchaseOrders, snapshotClockIn, snapshotInventory,
} from "./lib/sheetsSnapshot";

// Auto-import snapshot on first load (only once per version)
const SNAPSHOT_KEY = "agl_snapshot_loaded_v6";
if (!localStorage.getItem(SNAPSHOT_KEY)) {
  try {
    importSnapshot(
      {
        sales: snapshotSales as any,
        expenses: snapshotExpenses as any,
        workshop: snapshotWorkshop as any,
        purchaseOrders: snapshotPurchaseOrders as any,
        clockin: snapshotClockIn as any,
        inventory: snapshotInventory as any,
      },
      "replace"
    );
    localStorage.setItem(SNAPSHOT_KEY, "1");
  } catch (e) {
    console.warn("Snapshot import failed:", e);
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
