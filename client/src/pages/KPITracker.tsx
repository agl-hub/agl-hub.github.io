<<<<<<< Updated upstream
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
=======
import { useMemo } from 'react';
import { getData, fmtGHS } from '../lib/dataStore';

export default function KPITracker() {
  const data = getData();
>>>>>>> Stashed changes

  const kpis = useMemo(() => {
    const totalRev = data.sales.reduce((s, x) => s + x.total, 0);
    const totalExp = data.expenses.reduce((s, x) => s + x.amount, 0);
    const totalPO = data.purchaseOrders.reduce((s, x) => s + x.amount, 0);
    const netProfit = totalRev - totalExp - totalPO;
    const txns = data.sales.length;
    const avgTicket = txns > 0 ? totalRev / txns : 0;
    const wsJobs = data.workshop.length;
    const wsCompleted = data.workshop.filter(j => j.status === 'Completed').length;
    const wsEfficiency = wsJobs > 0 ? Math.round((wsCompleted / wsJobs) * 100) : 0;
    const uniqueCustomers = new Set(data.sales.map(s => s.customer)).size;
    const cashSales = data.sales.filter(s => s.payment === 'Cash').reduce((a, b) => a + b.total, 0);
    const momoSales = data.sales.filter(s => s.payment === 'MoMo').reduce((a, b) => a + b.total, 0);
    const creditSales = data.sales.filter(s => s.payment === 'Credit').reduce((a, b) => a + b.total, 0);
    const profitMargin = totalRev > 0 ? ((netProfit / totalRev) * 100) : 0;
    const kanbanDone = data.kanban.filter(t => t.column === 'Done').length;
    const kanbanTotal = data.kanban.length;

    return [
      { label: 'Total Revenue', value: fmtGHS(totalRev), target: 'GHS 120,000', pct: Math.min(100, Math.round((totalRev / 120000) * 100)), color: '#16A085' },
      { label: 'Net Profit', value: fmtGHS(netProfit), target: 'GHS 50,000', pct: Math.min(100, Math.round((netProfit / 50000) * 100)), color: netProfit >= 0 ? '#16A085' : '#E30613' },
      { label: 'Profit Margin', value: `${profitMargin.toFixed(1)}%`, target: '40%', pct: Math.min(100, Math.round(profitMargin / 40 * 100)), color: profitMargin >= 30 ? '#16A085' : '#F39C12' },
      { label: 'Total Transactions', value: String(txns), target: '200', pct: Math.min(100, Math.round((txns / 200) * 100)), color: '#3B82F6' },
      { label: 'Avg Ticket Size', value: fmtGHS(avgTicket), target: 'GHS 500', pct: Math.min(100, Math.round((avgTicket / 500) * 100)), color: '#F39C12' },
      { label: 'Unique Customers', value: String(uniqueCustomers), target: '100', pct: Math.min(100, Math.round((uniqueCustomers / 100) * 100)), color: '#8B5CF6' },
      { label: 'Workshop Efficiency', value: `${wsEfficiency}%`, target: '85%', pct: Math.min(100, Math.round(wsEfficiency / 85 * 100)), color: wsEfficiency >= 70 ? '#16A085' : '#E30613' },
      { label: 'Workshop Jobs', value: `${wsCompleted}/${wsJobs}`, target: 'All completed', pct: wsJobs > 0 ? Math.round((wsCompleted / wsJobs) * 100) : 0, color: '#E67E22' },
      { label: 'Cash Collection', value: fmtGHS(cashSales), target: 'GHS 60,000', pct: Math.min(100, Math.round((cashSales / 60000) * 100)), color: '#16A085' },
      { label: 'MoMo Collection', value: fmtGHS(momoSales), target: 'GHS 30,000', pct: Math.min(100, Math.round((momoSales / 30000) * 100)), color: '#F39C12' },
      { label: 'Credit Outstanding', value: fmtGHS(creditSales), target: '< GHS 5,000', pct: Math.min(100, Math.round((creditSales / 5000) * 100)), color: creditSales > 5000 ? '#E30613' : '#16A085' },
      { label: 'Task Completion', value: `${kanbanDone}/${kanbanTotal}`, target: 'All done', pct: kanbanTotal > 0 ? Math.round((kanbanDone / kanbanTotal) * 100) : 0, color: '#3B82F6' },
    ];
  }, [data]);

  return (
    <div>
      <div className="grid grid-4" style={{ marginBottom: '8px' }}>
        <div className="card kpi-card green"><div className="kpi-label">Revenue vs Target</div><div className="kpi-value">{kpis[0]?.pct}%</div></div>
        <div className="card kpi-card navy"><div className="kpi-label">Profit Margin</div><div className="kpi-value">{kpis[2]?.value}</div></div>
        <div className="card kpi-card gold"><div className="kpi-label">Workshop Efficiency</div><div className="kpi-value">{kpis[6]?.value}</div></div>
        <div className="card kpi-card red"><div className="kpi-label">Task Completion</div><div className="kpi-value">{kpis[11]?.pct}%</div></div>
      </div>

      <div className="card" style={{ padding: '14px' }}>
        <h3 style={{ color: '#fff', marginBottom: '12px' }}>KPI Dashboard — Target Tracking</h3>
        <div className="grid grid-3" style={{ gap: '10px' }}>
          {kpis.map((k, i) => (
            <div key={i} style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600 }}>{k.label}</span>
                <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Target: {k.target}</span>
              </div>
              <div style={{ fontFamily: 'Rajdhani', fontSize: '20px', fontWeight: 700, color: k.color, marginBottom: '6px' }}>{k.value}</div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${k.pct}%`, height: '100%', background: k.color, borderRadius: '3px', transition: 'width 0.8s ease' }} />
              </div>
              <div style={{ textAlign: 'right', fontSize: '8px', color: 'var(--text-muted)', marginTop: '3px' }}>{k.pct}% of target</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
