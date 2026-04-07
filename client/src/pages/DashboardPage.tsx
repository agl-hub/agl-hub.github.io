import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const { data: kpis, isLoading: kpisLoading } = trpc.dashboard.getKPIs.useQuery({});
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const KPICard = ({ label, value, subtext, trend, icon: Icon, status }: any) => (
    <div className="card kpi-card" style={{ borderLeftColor: `var(--${status || "primary"})` }}>
      <div>
        <div className="kpi-label">{label}</div>
        <div className="kpi-value" style={{ color: `var(--${status || "primary"})` }}>
          {value}
        </div>
        {subtext && <div className="kpi-sub">{subtext}</div>}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "var(--spacing-md)" }}>
        {Icon && <Icon size={20} style={{ color: `var(--${status || "primary"})` }} />}
        {trend && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px", color: trend > 0 ? "var(--success)" : "var(--danger)" }}>
            {trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span style={{ fontSize: "var(--text-sm)" }}>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  );

  const chartData = [
    { name: "Mon", revenue: 2400, expenses: 1200 },
    { name: "Tue", revenue: 2210, expenses: 1390 },
    { name: "Wed", revenue: 2290, expenses: 1000 },
    { name: "Thu", revenue: 2000, expenses: 1200 },
    { name: "Fri", revenue: 2181, expenses: 1500 },
    { name: "Sat", revenue: 2500, expenses: 1200 },
    { name: "Sun", revenue: 2100, expenses: 800 },
  ];

  const channelData = [
    { name: "Walk-In", value: 35 },
    { name: "WhatsApp", value: 25 },
    { name: "Phone", value: 20 },
    { name: "Instagram", value: 12 },
    { name: "TikTok", value: 8 },
  ];

  const COLORS = ["var(--primary)", "var(--accent-teal)", "var(--accent-blue)", "var(--accent-amber)", "var(--accent-green)"];

  return (
    <div>
      {/* Header Section */}
      <div style={{ marginBottom: "var(--spacing-2xl)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-lg)" }}>
          <div>
            <h1 style={{ margin: 0, marginBottom: "var(--spacing-sm)" }}>Live Dashboard</h1>
            <p style={{ color: "var(--text-tertiary)", margin: 0 }}>
              Welcome back! Here's your operational overview for today.
            </p>
          </div>
          <div style={{ textAlign: "right", color: "var(--text-tertiary)" }}>
            <div style={{ fontSize: "var(--text-sm)" }}>Last updated</div>
            <div style={{ fontSize: "var(--text-xl)", fontWeight: "var(--font-bold)", color: "var(--text-primary)" }}>
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-4" style={{ marginBottom: "var(--spacing-2xl)" }}>
        <KPICard
          label="Gross Revenue"
          value={`GHS ${kpis?.totalRevenue?.toLocaleString() || "0"}`}
          subtext="↑ 12% from last week"
          trend={12}
          icon={DollarSign}
          status="primary"
        />
        <KPICard
          label="Total Transactions"
          value={kpis?.totalTransactions || "0"}
          subtext="Sales & Services"
          trend={8}
          icon={CheckCircle}
          status="accent-teal"
        />
        <KPICard
          label="Vehicles Serviced"
          value={kpis?.totalVehiclesServiced || "0"}
          subtext="This week"
          trend={5}
          icon={TrendingUp}
          status="accent-blue"
        />
        <KPICard
          label="Net Position"
          value={`GHS ${(kpis?.totalRevenue || 0) - (kpis?.totalExpenses || 0)}`}
          subtext="Revenue - Expenses"
          trend={-3}
          icon={AlertCircle}
          status="accent-amber"
        />
      </div>

      {/* Action Items & Alerts */}
      <div className="card" style={{ marginBottom: "var(--spacing-2xl)", borderLeft: "4px solid var(--warning)" }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)", margin: 0, marginBottom: "var(--spacing-md)" }}>
          <AlertCircle size={20} style={{ color: "var(--warning)" }} />
          Action Items
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          {[
            { title: "Revenue Below Target", description: "Daily revenue is 10% below target. Current: GHS 4,500 / Target: GHS 5,000" },
            { title: "Pending Payments", description: "3 invoices pending payment for over 7 days" },
            { title: "Mechanic Attendance", description: "John Mensah marked late today - 3rd time this week" },
          ].map((item: any, idx: number) => (
            <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "var(--spacing-md)", paddingBottom: "var(--spacing-md)", borderBottom: idx < 2 ? "1px solid var(--border-color)" : "none" }}>
              <div style={{ width: "8px", height: "8px", backgroundColor: "var(--warning)", borderRadius: "50%", marginTop: "6px", flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: "var(--font-semibold)", color: "var(--text-primary)" }}>
                  {item.title}
                </div>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>
                  {item.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-2" style={{ marginBottom: "var(--spacing-2xl)" }}>
        {/* Revenue vs Expenses */}
        <div className="card">
          <h3 style={{ marginBottom: "var(--spacing-lg)" }}>Weekly Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="name" stroke="var(--text-tertiary)" />
              <YAxis stroke="var(--text-tertiary)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                }}
              />
              <Legend />
              <Bar dataKey="revenue" fill="var(--primary)" />
              <Bar dataKey="expenses" fill="var(--accent-teal)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sales by Channel */}
        <div className="card">
          <h3 style={{ marginBottom: "var(--spacing-lg)" }}>Sales by Channel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={channelData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {channelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-2">
        {/* Mechanic Performance */}
        <div className="card">
          <h3 style={{ marginBottom: "var(--spacing-lg)" }}>Top Mechanics</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
            {[
              { name: "John Mensah", jobs: 24, efficiency: 95 },
              { name: "Kwesi Boateng", jobs: 21, efficiency: 92 },
              { name: "Ama Adjei", jobs: 19, efficiency: 88 },
            ].map((mechanic, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "var(--spacing-md)", borderBottom: idx < 2 ? "1px solid var(--border-color)" : "none" }}>
                <div>
                  <div style={{ fontWeight: "var(--font-semibold)", color: "var(--text-primary)" }}>
                    {mechanic.name}
                  </div>
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>
                    {mechanic.jobs} jobs completed
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "var(--text-lg)", fontWeight: "var(--font-bold)", color: "var(--success)" }}>
                      {mechanic.efficiency}%
                    </div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                      Efficiency
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Targets */}
        <div className="card">
          <h3 style={{ marginBottom: "var(--spacing-lg)" }}>Daily Targets</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
            {[
              { label: "Revenue Target", current: 4500, target: 5000, unit: "GHS" },
              { label: "Transactions", current: 18, target: 25, unit: "" },
              { label: "Vehicles", current: 12, target: 15, unit: "" },
            ].map((target, idx) => (
              <div key={idx} style={{ paddingBottom: "var(--spacing-md)", borderBottom: idx < 2 ? "1px solid var(--border-color)" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--spacing-sm)" }}>
                  <div style={{ fontWeight: "var(--font-semibold)", color: "var(--text-primary)" }}>
                    {target.label}
                  </div>
                  <div style={{ color: "var(--text-tertiary)" }}>
                    {target.current} / {target.target} {target.unit}
                  </div>
                </div>
                <div style={{ width: "100%", height: "8px", backgroundColor: "var(--bg-tertiary)", borderRadius: "4px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      backgroundColor: target.current >= target.target ? "var(--success)" : "var(--primary)",
                      width: `${(target.current / target.target) * 100}%`,
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
