import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function GoogleSheets() {
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncMessage, setSyncMessage] = useState("");

  // Live status, refetched every 10s
  const statusQuery = trpc.sheets.getStatus.useQuery(undefined, {
    refetchInterval: 10_000,
  });
  const liveStatus = statusQuery.data?.status;

  const sheetsSync = trpc.sheets.forceSync.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setSyncStatus("success");
        setSyncMessage("Data synchronized successfully!");
        setLastSyncTime(new Date());
        statusQuery.refetch();
        setTimeout(() => setSyncStatus("idle"), 3000);
      } else {
        setSyncStatus("error");
        setSyncMessage(data.error || "Sync failed");
      }
    },
    onError: (error) => {
      setSyncStatus("error");
      setSyncMessage(error.message || "Sync failed");
    },
  });

  const handleSync = () => {
    setSyncStatus("syncing");
    setSyncMessage("Synchronizing data from Google Sheets...");
    sheetsSync.mutate();
  };

  const sheetInfo = [
    { name: "Monthly Summary", records: "12", lastSync: "2026-04-06 14:30" },
    { name: "Sales & Customer Log", records: "245", lastSync: "2026-04-06 14:30" },
    { name: "Workshop Daily Log", records: "89", lastSync: "2026-04-06 14:30" },
    { name: "Staff Clock-In", records: "156", lastSync: "2026-04-06 14:30" },
    { name: "Expense Log", records: "34", lastSync: "2026-04-06 14:30" },
    { name: "Purchase Orders", records: "18", lastSync: "2026-04-06 14:30" },
  ];

  return (
    <div className="flex flex-col gap-lg">
      <h2 className="text-2xl font-bold">Google Sheets Integration</h2>

      {/* Sync Status Card */}
      <div className="card">
        <div className="flex justify-between items-start mb-lg">
          <div>
            <h3 className="text-lg font-bold mb-md">Data Synchronization</h3>
            <p className="text-text-tertiary">
              Sync your operational data from Google Sheets to keep the dashboard updated in real-time.
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncStatus === "syncing"}
            className={`btn ${syncStatus === "syncing" ? "opacity-50 cursor-not-allowed" : ""} ${
              syncStatus === "success" ? "btn-success" : "btn-primary"
            }`}
          >
            {syncStatus === "syncing" ? "Syncing..." : syncStatus === "success" ? "✓ Synced" : "🔄 Sync Now"}
          </button>
        </div>

        {syncMessage && (
          <div
            className={`p-md rounded-md mb-lg ${
              syncStatus === "success"
                ? "bg-success/10 text-success-light border border-success/20"
                : syncStatus === "error"
                ? "bg-danger/10 text-danger border border-danger/20"
                : "bg-info/10 text-info border border-info/20"
            }`}
          >
            {syncMessage}
          </div>
        )}

        {lastSyncTime && (
          <div className="text-sm text-text-tertiary">
            Last synchronized: {lastSyncTime.toLocaleString()}
          </div>
        )}
      </div>

      {/* Connection Info */}
      <div className="card">
        <h3 className="text-lg font-bold mb-lg">Connection Details</h3>
        <div className="grid grid-2 gap-lg">
          <div>
            <div className="text-text-tertiary text-sm mb-sm">Spreadsheet ID</div>
            <div className="font-mono text-sm break-all">1pFBk2xCbILKxVSgwACQIrIscEimonnnyJNBKoiAVZ7U</div>
          </div>
          <div>
            <div className="text-text-tertiary text-sm mb-sm">Status</div>
            <div className="flex items-center gap-sm">
              <div className="w-2 h-2 bg-success-light rounded-full"></div>
              <span className="text-success-light font-bold">Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sheets Overview */}
      <div className="card">
        <h3 className="text-lg font-bold mb-lg">Synced Sheets</h3>
        <div className="grid grid-2 gap-md">
          {sheetInfo.map((sheet, idx) => (
            <div key={idx} className="p-md bg-bg-tertiary rounded-md">
              <div className="flex justify-between items-start mb-md">
                <h4 className="font-bold">{sheet.name}</h4>
                <span className="badge badge-success">✓ Synced</span>
              </div>
              <div className="text-sm text-text-tertiary">
                <div>Records: {sheet.records}</div>
                <div>Last sync: {sheet.lastSync}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Sync Status */}
      <div className="card">
        <h3 className="text-lg font-bold mb-lg">Live Sync Status</h3>
        {!liveStatus ? (
          <div className="text-text-tertiary">Loading status...</div>
        ) : (
          <div className="grid grid-2 gap-md">
            <div className="p-md bg-bg-tertiary rounded-md">
              <div className="text-text-tertiary text-sm">Last sync attempt</div>
              <div className="font-bold">
                {liveStatus.lastSyncedAt ? new Date(liveStatus.lastSyncedAt).toLocaleString() : "Never"}
              </div>
            </div>
            <div className="p-md bg-bg-tertiary rounded-md">
              <div className="text-text-tertiary text-sm">Last successful sync</div>
              <div className="font-bold">
                {liveStatus.lastSuccessAt ? new Date(liveStatus.lastSuccessAt).toLocaleString() : "Never"}
              </div>
            </div>
            <div className="p-md bg-bg-tertiary rounded-md">
              <div className="text-text-tertiary text-sm">Total syncs / failures</div>
              <div className="font-bold">
                {liveStatus.totalSyncs} / {liveStatus.totalFailures}
              </div>
            </div>
            <div className="p-md bg-bg-tertiary rounded-md">
              <div className="text-text-tertiary text-sm">In progress</div>
              <div className="font-bold">{liveStatus.inProgress ? "Yes" : "No"}</div>
            </div>
            {liveStatus.lastError && (
              <div className="p-md bg-danger/10 border border-danger/20 rounded-md col-span-2">
                <div className="text-danger font-bold text-sm">Last error</div>
                <div className="text-sm">{liveStatus.lastError}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="card">
        <h3 className="text-lg font-bold mb-lg">Sync Settings</h3>
        <div className="flex flex-col gap-md">
          <div className="flex items-center justify-between p-md bg-bg-tertiary rounded-md">
            <div>
              <div className="font-bold">Auto-Sync</div>
              <div className="text-sm text-text-tertiary">Automatically sync data every 30 minutes</div>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </div>

          <div className="flex items-center justify-between p-md bg-bg-tertiary rounded-md">
            <div>
              <div className="font-bold">Sync Notifications</div>
              <div className="text-sm text-text-tertiary">Notify when sync completes or fails</div>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </div>

          <div className="flex items-center justify-between p-md bg-bg-tertiary rounded-md">
            <div>
              <div className="font-bold">Sync on Startup</div>
              <div className="text-sm text-text-tertiary">Automatically sync when dashboard loads</div>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
