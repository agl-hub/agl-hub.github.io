import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function GoogleSheets() {
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncMessage, setSyncMessage] = useState("");

  const sheetsSync = trpc.sheets.syncAll.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setSyncStatus("success");
        setSyncMessage("Data synchronized successfully!");
        setLastSyncTime(new Date());
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

      {/* Sync History */}
      <div className="card">
        <h3 className="text-lg font-bold mb-lg">Sync History</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Action</th>
              <th>Records Synced</th>
              <th>Status</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2026-04-06 14:30:45</td>
              <td>Full Sync</td>
              <td>554</td>
              <td><span className="badge badge-success">Success</span></td>
              <td>2.3s</td>
            </tr>
            <tr>
              <td>2026-04-06 12:15:20</td>
              <td>Full Sync</td>
              <td>554</td>
              <td><span className="badge badge-success">Success</span></td>
              <td>2.1s</td>
            </tr>
            <tr>
              <td>2026-04-06 10:00:00</td>
              <td>Full Sync</td>
              <td>554</td>
              <td><span className="badge badge-success">Success</span></td>
              <td>2.4s</td>
            </tr>
            <tr>
              <td>2026-04-05 16:45:30</td>
              <td>Full Sync</td>
              <td>548</td>
              <td><span className="badge badge-success">Success</span></td>
              <td>2.2s</td>
            </tr>
          </tbody>
        </table>
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
