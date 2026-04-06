import { useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { trpc } from "@/lib/trpc";

const kpiData = [
  { date: "Apr 1", revenue: 4200, target: 5000, transactions: 12 },
  { date: "Apr 2", revenue: 4800, target: 5000, transactions: 15 },
  { date: "Apr 3", revenue: 3900, target: 5000, transactions: 10 },
  { date: "Apr 4", revenue: 5200, target: 5000, transactions: 18 },
  { date: "Apr 5", revenue: 4600, target: 5000, transactions: 14 },
  { date: "Apr 6", revenue: 5800, target: 5000, transactions: 20 },
];

export default function KPITracker() {
  const [selectedKPI, setSelectedKPI] = useState("revenue");
  const insightsQuery = trpc.sheets.insights.useQuery(undefined, { refetchInterval: 60_000 });
  const m = insightsQuery.data?.success ? insightsQuery.data.metrics : null;

  const kpis = [
    {
      id: "revenue",
      label: "Daily Revenue",
      value: "GHS 5,800",
      target: "GHS 5,000",
      progress: 116,
      trend: "↑ +15.2%",
      status: "exceeded",
    },
    {
      id: "transactions",
      label: "Transactions",
      value: "20",
      target: "15",
      progress: 133,
      trend: "↑ +33%",
      status: "exceeded",
    },
    {
      id: "efficiency",
      label: "Workshop Efficiency",
      value: "87%",
      target: "85%",
      progress: 102,
      trend: "↑ +2%",
      status: "on-track",
    },
    {
      id: "turnaround",
      label: "Avg Turnaround Time",
      value: "4.2h",
      target: "5h",
      progress: 84,
      trend: "↓ -15.8%",
      status: "on-track",
    },
  ];

  return (
    <div className="flex flex-col gap-lg">
      <h2 className="text-2xl font-bold">KPI Tracker</h2>

      {/* Monthly target progress (live) */}
      {m && (
        <div className="card">
          <div className="flex justify-between items-center mb-md">
            <div>
              <h3 className="text-lg font-bold">Monthly Revenue Target</h3>
              <div className="text-sm text-text-tertiary">
                GHS {m.monthlyRevenueActual.toLocaleString()} / GHS {m.monthlyRevenueTarget.toLocaleString()}
              </div>
            </div>
            <div className="text-2xl font-bold">{m.monthlyProgressPct}%</div>
          </div>
          <div style={{ height: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(100, m.monthlyProgressPct)}%`,
                height: '100%',
                background: m.monthlyProgressPct >= 100 ? '#10b981' : m.monthlyProgressPct >= 70 ? '#f59e0b' : '#ef4444',
                transition: 'width 0.4s',
              }}
            />
          </div>
          {m.alerts && m.alerts.length > 0 && (
            <div className="mt-md">
              <div className="text-sm font-bold mb-sm">Active Alerts ({m.alerts.length})</div>
              <div className="flex flex-col gap-sm">
                {m.alerts.slice(0, 5).map((a) => (
                  <div
                    key={a.id}
                    className={`p-sm rounded-md text-sm ${
                      a.severity === 'critical'
                        ? 'bg-danger/10 border border-danger/20'
                        : 'bg-warning/10 border border-warning/20'
                    }`}
                  >
                    <span className="font-bold">{a.title}</span> — {a.detail}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-4 gap-md">
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            onClick={() => setSelectedKPI(kpi.id)}
            className={`card cursor-pointer transition-all ${
              selectedKPI === kpi.id
                ? "border-primary shadow-glow"
                : "hover:border-primary/50"
            }`}
          >
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value">{kpi.value}</div>
            <div className="text-sm text-text-tertiary mb-md">Target: {kpi.target}</div>

            <div className="w-full bg-bg-tertiary rounded-full h-2 overflow-hidden mb-md">
              <div
                className={`h-full transition-all ${
                  kpi.status === "exceeded"
                    ? "bg-success-light"
                    : kpi.status === "on-track"
                    ? "bg-primary-light"
                    : "bg-warning"
                }`}
                style={{ width: `${Math.min(kpi.progress, 100)}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-text-tertiary">{kpi.progress}%</span>
              <span className={kpi.trend.startsWith("↑") ? "text-success-light" : "text-warning"}>
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Chart */}
      <div className="card">
        <h3 className="text-lg font-bold mb-lg">
          {kpis.find((k) => k.id === selectedKPI)?.label} - Trend Analysis
        </h3>

        {selectedKPI === "revenue" && (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={kpiData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ background: "rgba(20,25,35,0.95)", border: "1px solid rgba(255,255,255,0.1)" }} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#E30613" strokeWidth={2} dot={{ fill: "#E30613" }} />
              <Line type="monotone" dataKey="target" stroke="rgba(255,255,255,0.3)" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        )}

        {selectedKPI === "transactions" && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={kpiData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ background: "rgba(20,25,35,0.95)", border: "1px solid rgba(255,255,255,0.1)" }} />
              <Bar dataKey="transactions" fill="#16A085" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* KPI Details Table */}
      <div className="card">
        <h3 className="text-lg font-bold mb-lg">Historical Data</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Revenue</th>
              <th>Target</th>
              <th>Variance</th>
              <th>Transactions</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {kpiData.map((row, idx) => (
              <tr key={idx}>
                <td>{row.date}</td>
                <td className="font-mono font-bold">GHS {row.revenue.toLocaleString()}</td>
                <td className="font-mono">GHS {row.target.toLocaleString()}</td>
                <td className={row.revenue >= row.target ? "text-success-light font-bold" : "text-warning font-bold"}>
                  {row.revenue >= row.target ? "+" : ""}{row.revenue - row.target}
                </td>
                <td>{row.transactions}</td>
                <td>
                  <span className={`badge ${row.revenue >= row.target ? "badge-success" : "badge-warning"}`}>
                    {row.revenue >= row.target ? "Exceeded" : "Below Target"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
