import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

export default function Dashboard() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch insights from Google Sheets
  const sheetsSync = trpc.sheets.getInsights.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setInsights(data.metrics);
      }
      setLoading(false);
    },
    onError: () => {
      setLoading(false);
    },
  });

  useEffect(() => {
    sheetsSync.mutate();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-lg">
        <div className="animate-pulse">
          <div className="h-32 bg-bg-tertiary rounded-md mb-lg"></div>
          <div className="grid grid-4 gap-md">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-bg-tertiary rounded-md"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const metrics = insights || {};

  // Prepare chart data
  const mechanicData = (metrics.mechanicEfficiency || []).map((m: any) => ({
    name: m.mechanicName,
    efficiency: m.efficiency,
    jobs: m.jobsCompleted,
  }));

  const paymentData = Object.entries(metrics.bestSellers || {}).map(([name, value]: any) => ({
    name,
    value,
  }));

  const colors = ["#E30613", "#16A085", "#F39C12", "#3498DB", "#E74C3C"];

  return (
    <div className="flex flex-col gap-lg">
      {/* Header */}
      <div className="flex flex-between">
        <div>
          <h1 className="text-3xl font-bold">Live Dashboard</h1>
          <p className="text-text-tertiary mt-sm">Welcome back, {user?.name || "User"}</p>
        </div>
        <div className="text-right">
          <div className="text-text-tertiary text-sm">Last updated</div>
          <div className="font-mono text-lg">{new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      {/* KPI Cards - Row 1 */}
      <div className="grid grid-4 gap-md">
        <div className="card kpi-card primary">
          <div className="kpi-label">Gross Revenue</div>
          <div className="kpi-value">GHS {(metrics.dailyRevenue || 0).toLocaleString()}</div>
          <div className="kpi-sub">{(metrics.dailyRevenue || 0) > 0 ? "↑ On track" : "↓ Below target"}</div>
        </div>

        <div className="card kpi-card success">
          <div className="kpi-label">Total Outflow</div>
          <div className="kpi-value">GHS 0</div>
          <div className="kpi-sub">Expenses + POs</div>
        </div>

        <div className="card kpi-card info">
          <div className="kpi-label">Net Position</div>
          <div className="kpi-value">GHS {(metrics.dailyRevenue || 0).toLocaleString()}</div>
          <div className="kpi-sub">Positive</div>
        </div>

        <div className="card kpi-card warning">
          <div className="kpi-label">Avg Transaction</div>
          <div className="kpi-value">GHS 0</div>
          <div className="kpi-sub">Per sale</div>
        </div>
      </div>

      {/* KPI Cards - Row 2: Payment Methods */}
      <div className="grid grid-5 gap-md">
        <div className="card kpi-card">
          <div className="kpi-label">Cash</div>
          <div className="kpi-value">GHS 0</div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-label">MoMo</div>
          <div className="kpi-value">GHS 0</div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-label">Bank</div>
          <div className="kpi-value">GHS 0</div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-label">Credit</div>
          <div className="kpi-value">GHS 0</div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-label">POS</div>
          <div className="kpi-value">GHS 0</div>
        </div>
      </div>

      {/* Revenue Progress */}
      <div className="card">
        <div className="flex flex-between mb-lg">
          <h3 className="text-lg font-bold">Daily Revenue Target</h3>
          <span className="badge badge-primary">{metrics.revenueProgress || 0}%</span>
        </div>
        <div className="w-full bg-bg-tertiary rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-primary h-full transition-all duration-500"
            style={{ width: `${Math.min(metrics.revenueProgress || 0, 100)}%` }}
          ></div>
        </div>
        <div className="flex flex-between mt-md text-sm">
          <span className="text-text-tertiary">GHS {(metrics.dailyRevenue || 0).toLocaleString()}</span>
          <span className="text-text-tertiary">Target: GHS {(metrics.dailyRevenueTarget || 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-2 gap-md">
        {/* Mechanic Efficiency Chart */}
        <div className="card">
          <h3 className="text-lg font-bold mb-lg">Mechanic Efficiency</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mechanicData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ background: "rgba(20,25,35,0.95)", border: "1px solid rgba(255,255,255,0.1)" }} />
              <Bar dataKey="efficiency" fill="#E30613" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Best Sellers Chart */}
        <div className="card">
          <h3 className="text-lg font-bold mb-lg">Top Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={paymentData} cx="50%" cy="50%" labelLine={false} label={{ fill: "rgba(255,255,255,0.7)" }} outerRadius={80} fill="#8884d8" dataKey="value">
                {paymentData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "rgba(20,25,35,0.95)", border: "1px solid rgba(255,255,255,0.1)" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Action Items */}
      {metrics.actionItems && metrics.actionItems.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold mb-lg">Action Items & Alerts</h3>
          <div className="flex flex-col gap-md">
            {metrics.actionItems.slice(0, 5).map((item: any, idx: number) => (
              <div key={idx} className="flex gap-md p-md bg-bg-tertiary rounded-md">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.type === "positive" ? "bg-success/20 text-success-light" :
                  item.type === "negative" ? "bg-danger/20 text-danger" :
                  item.type === "warning" ? "bg-warning/20 text-warning" :
                  "bg-info/20 text-info"
                }`}>
                  {item.type === "positive" ? "✓" : item.type === "negative" ? "✕" : item.type === "warning" ? "!" : "ℹ"}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm">{item.title}</div>
                  <div className="text-text-tertiary text-sm">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vehicle Turnaround Time */}
      <div className="card">
        <h3 className="text-lg font-bold mb-lg">Vehicle Turnaround Time</h3>
        <div className="flex gap-2xl">
          <div>
            <div className="text-text-tertiary text-sm">Average Time</div>
            <div className="text-3xl font-bold font-mono">{metrics.vehicleTurnaroundTime?.average || 0}h</div>
          </div>
          <div>
            <div className="text-text-tertiary text-sm">Trend</div>
            <div className={`text-lg font-bold ${metrics.vehicleTurnaroundTime?.trend === "improving" ? "text-success-light" : "text-warning"}`}>
              {metrics.vehicleTurnaroundTime?.trend === "improving" ? "↓ Improving" : "↑ Declining"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
