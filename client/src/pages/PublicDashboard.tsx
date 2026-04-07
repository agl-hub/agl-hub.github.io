import { useEffect, useState } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

export default function PublicDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching public data
    setTimeout(() => {
      setMetrics({
        dailyRevenue: 5800,
        dailyRevenueTarget: 5000,
        revenueProgress: 116,
        mechanicEfficiency: [
          { mechanicName: "John", efficiency: 92, jobsCompleted: 8 },
          { mechanicName: "Peter", efficiency: 88, jobsCompleted: 7 },
          { mechanicName: "Samuel", efficiency: 85, jobsCompleted: 6 },
        ],
        bestSellers: {
          "Oil Change": 15,
          "Brake Service": 12,
          "Engine Diagnostics": 8,
          "Tire Rotation": 10,
        },
        actionItems: [
          {
            type: "positive",
            title: "Revenue Target Exceeded",
            description: "Daily revenue is 16% above target",
          },
          {
            type: "warning",
            title: "Pending Vehicles",
            description: "3 vehicles pending completion",
          },
        ],
      });
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="text-center">
          <div className="text-4xl font-bold mb-lg">AGL Command Center</div>
          <div className="text-text-tertiary">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const mechanicData = metrics?.mechanicEfficiency || [];
  const paymentData = Object.entries(metrics?.bestSellers || {}).map(([name, value]: any) => ({
    name,
    value,
  }));
  const colors = ["#E30613", "#16A085", "#F39C12", "#3498DB"];

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="bg-bg-secondary border-b border-border-color p-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-md">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center font-bold text-white">
              AGL
            </div>
            <div>
              <h1 className="text-2xl font-bold">AGL Command Center</h1>
              <p className="text-text-tertiary text-sm">Automotive Operations Dashboard</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-text-tertiary text-sm">Last updated</div>
            <div className="font-mono text-lg">{new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-lg">
        <div className="flex flex-col gap-lg">
          {/* KPI Cards */}
          <div className="grid grid-4 gap-md">
            <div className="card kpi-card primary">
              <div className="kpi-label">Gross Revenue</div>
              <div className="kpi-value">GHS {(metrics.dailyRevenue || 0).toLocaleString()}</div>
              <div className="kpi-sub">↑ On track</div>
            </div>

            <div className="card kpi-card success">
              <div className="kpi-label">Total Transactions</div>
              <div className="kpi-value">21</div>
              <div className="kpi-sub">Today</div>
            </div>

            <div className="card kpi-card info">
              <div className="kpi-label">Vehicles Serviced</div>
              <div className="kpi-value">15</div>
              <div className="kpi-sub">This week</div>
            </div>

            <div className="card kpi-card warning">
              <div className="kpi-label">Pending Jobs</div>
              <div className="kpi-value">3</div>
              <div className="kpi-sub">In progress</div>
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

          {/* Charts */}
          <div className="grid grid-2 gap-md">
            <div className="card">
              <h3 className="text-lg font-bold mb-lg">Mechanic Efficiency</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mechanicData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="mechanicName" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip contentStyle={{ background: "rgba(20,25,35,0.95)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <Bar dataKey="efficiency" fill="#E30613" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="text-lg font-bold mb-lg">Top Services</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={{ fill: "rgba(255,255,255,0.7)" }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
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
              <h3 className="text-lg font-bold mb-lg">Key Updates</h3>
              <div className="flex flex-col gap-md">
                {metrics.actionItems.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-md p-md bg-bg-tertiary rounded-md">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.type === "positive"
                          ? "bg-success/20 text-success-light"
                          : item.type === "warning"
                          ? "bg-warning/20 text-warning"
                          : "bg-info/20 text-info"
                      }`}
                    >
                      {item.type === "positive" ? "✓" : item.type === "warning" ? "!" : "ℹ"}
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
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-bg-secondary border-t border-border-color p-lg mt-2xl">
        <div className="max-w-7xl mx-auto text-center text-text-tertiary text-sm">
          <p>AGL Command Center © 2026 | Automobiles Ghana Ltd</p>
          <p className="mt-sm">This is a public dashboard. For full access, please log in.</p>
        </div>
      </footer>
    </div>
  );
}
