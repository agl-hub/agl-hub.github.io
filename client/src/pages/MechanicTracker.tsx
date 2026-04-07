<<<<<<< Updated upstream
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import LiveInsightsBanner from "@/components/LiveInsightsBanner";
import { trpc } from "@/lib/trpc";
=======
import { useMemo, useEffect, useRef } from 'react';
import { getData, fmtGHS } from '../lib/dataStore';
>>>>>>> Stashed changes

declare const Chart: any;

export default function MechanicTracker() {
<<<<<<< Updated upstream
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null);
  const insights = trpc.sheets.insights.useQuery(undefined, { refetchInterval: 60_000 });
  const liveMechanics =
    insights.data?.success && insights.data.metrics ? insights.data.metrics.mechanicEfficiency : [];

  return (
    <div className="flex flex-col gap-lg">
      <h2 className="text-2xl font-bold">Mechanic Tracker</h2>
      <LiveInsightsBanner categories={["workshop", "staff"]} />

      {/* Live mechanic ratings */}
      {liveMechanics.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold mb-md">Live Mechanic Ratings (5-star)</h3>
          <div className="grid grid-3 gap-md">
            {liveMechanics.map((m) => (
              <div key={m.mechanicName} className="p-md bg-bg-tertiary rounded-md">
                <div className="font-bold">{m.mechanicName}</div>
                <div className="text-sm" style={{ opacity: 0.8 }}>
                  {m.jobsCompleted} jobs · {m.efficiency}% efficiency
                </div>
                <div style={{ marginTop: 4, fontSize: 16, color: "#fbbf24" }}>
                  {"★".repeat(Math.round(m.score5Star))}
                  <span style={{ color: "#4b5563" }}>{"★".repeat(5 - Math.round(m.score5Star))}</span>
                  <span style={{ marginLeft: 6, fontSize: 11, color: "#9ca3af" }}>
                    {m.score5Star.toFixed(1)}/5
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-4 gap-md">
        <div className="card">
          <div className="kpi-label">Total Mechanics</div>
          <div className="kpi-value">{mechanics.length}</div>
          <div className="kpi-sub">Active staff</div>
        </div>
        <div className="card">
          <div className="kpi-label">Jobs Completed</div>
          <div className="kpi-value">{mechanics.reduce((sum, m) => sum + m.jobsCompleted, 0)}</div>
          <div className="kpi-sub">This month</div>
        </div>
        <div className="card">
          <div className="kpi-label">Avg Efficiency</div>
          <div className="kpi-value">{(mechanics.reduce((sum, m) => sum + m.efficiency, 0) / mechanics.length).toFixed(0)}%</div>
          <div className="kpi-sub">Team average</div>
        </div>
        <div className="card">
          <div className="kpi-label">Avg Rating</div>
          <div className="kpi-value">{(mechanics.reduce((sum, m) => sum + m.rating, 0) / mechanics.length).toFixed(1)}</div>
          <div className="kpi-sub">Customer satisfaction</div>
        </div>
      </div>

      {/* Performance Trend */}
      <div className="card">
        <h3 className="text-lg font-bold mb-lg">Weekly Performance Trend</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="week" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip contentStyle={{ background: "rgba(20,25,35,0.95)", border: "1px solid rgba(255,255,255,0.1)" }} />
            <Legend />
            <Line type="monotone" dataKey="John" stroke="#E30613" strokeWidth={2} />
            <Line type="monotone" dataKey="Peter" stroke="#16A085" strokeWidth={2} />
            <Line type="monotone" dataKey="Samuel" stroke="#F39C12" strokeWidth={2} />
            <Line type="monotone" dataKey="Ama" stroke="#3498DB" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
=======
  const data = getData();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInst = useRef<any>(null);

  const mechanics = useMemo(() => {
    const names = Array.from(new Set(data.workshop.map(j => j.mechanic)));
    return names.map(name => {
      const jobs = data.workshop.filter(j => j.mechanic === name);
      const completed = jobs.filter(j => j.status === 'Completed');
      const inProgress = jobs.filter(j => j.status === 'In Progress');
      const totalRev = completed.reduce((s, j) => s + j.estCost, 0);
      const efficiency = jobs.length > 0 ? Math.round((completed.length / jobs.length) * 100) : 0;
      const rating = Math.min(5, Math.max(1, Math.round(efficiency / 20)));
      return { name, total: jobs.length, completed: completed.length, inProgress: inProgress.length, totalRev, efficiency, rating };
    }).sort((a, b) => b.totalRev - a.totalRev);
  }, [data.workshop]);

  const totalJobs = data.workshop.length;
  const totalCompleted = data.workshop.filter(j => j.status === 'Completed').length;
  const avgEfficiency = mechanics.length > 0 ? Math.round(mechanics.reduce((s, m) => s + m.efficiency, 0) / mechanics.length) : 0;
  const topMechanic = mechanics[0]?.name || 'N/A';

  useEffect(() => {
    if (typeof Chart === 'undefined' || !chartRef.current) return;
    chartInst.current?.destroy();
    chartInst.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: mechanics.map(m => m.name),
        datasets: [
          { label: 'Completed', data: mechanics.map(m => m.completed), backgroundColor: '#16A085', borderRadius: 4 },
          { label: 'In Progress', data: mechanics.map(m => m.inProgress), backgroundColor: '#F39C12', borderRadius: 4 },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#A0AEC0', font: { size: 9 } } } }, scales: { x: { ticks: { color: '#718096', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.03)' } }, y: { ticks: { color: '#718096', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.03)' } } } },
    });
    return () => { chartInst.current?.destroy(); };
  }, [mechanics]);

  return (
    <div>
      <div className="grid grid-4" style={{ marginBottom: '8px' }}>
        <div className="card kpi-card navy"><div className="kpi-label">Total Jobs</div><div className="kpi-value">{totalJobs}</div></div>
        <div className="card kpi-card green"><div className="kpi-label">Completed</div><div className="kpi-value">{totalCompleted}</div></div>
        <div className="card kpi-card gold"><div className="kpi-label">Avg Efficiency</div><div className="kpi-value">{avgEfficiency}%</div></div>
        <div className="card kpi-card red"><div className="kpi-label">Top Mechanic</div><div className="kpi-value" style={{ fontSize: '16px' }}>{topMechanic}</div></div>
>>>>>>> Stashed changes
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '8px' }}>
        <div>
          <h3 style={{ color: '#fff', marginBottom: '8px' }}>Mechanic Performance</h3>
          <div className="grid grid-2">
            {mechanics.map(m => (
              <div key={m.name} className="card" style={{ padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #E30613, #16A085)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', color: '#fff' }}>
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '12px' }}>{m.name}</div>
                      <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>{m.total} jobs assigned</div>
                    </div>
                  </div>
                  <div style={{ color: '#F39C12', fontSize: '12px' }}>
                    {'★'.repeat(m.rating)}{'☆'.repeat(5 - m.rating)}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Efficiency</span>
                  <span style={{ color: m.efficiency >= 70 ? '#1ABC9C' : m.efficiency >= 40 ? '#F39C12' : '#FF2D3A', fontWeight: 600 }}>{m.efficiency}%</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${m.efficiency}%`, height: '100%', background: m.efficiency >= 70 ? '#16A085' : m.efficiency >= 40 ? '#F39C12' : '#E30613', borderRadius: '2px', transition: 'width 0.5s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '9px' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Completed: </span><span style={{ color: '#1ABC9C', fontWeight: 600 }}>{m.completed}</span></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>In Progress: </span><span style={{ color: '#F39C12', fontWeight: 600 }}>{m.inProgress}</span></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Revenue: </span><span style={{ color: '#1ABC9C', fontWeight: 600 }}>{fmtGHS(m.totalRev)}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card chart-card"><h4>Jobs by Mechanic</h4><div className="chart-container"><canvas ref={chartRef} /></div></div>
      </div>

      <div className="card" style={{ padding: '10px' }}>
        <h3 style={{ color: '#fff', marginBottom: '8px' }}>All Workshop Jobs</h3>
        <div style={{ overflowX: 'auto', maxHeight: '300px', overflowY: 'auto' }}>
          <table>
            <thead><tr><th>Date</th><th>Reg</th><th>Car</th><th>Job</th><th>Mechanic</th><th>Status</th><th>Est. Cost</th></tr></thead>
            <tbody>
              {[...data.workshop].sort((a, b) => b.date.localeCompare(a.date)).map(j => (
                <tr key={j.id}>
                  <td>{j.date}</td><td style={{ fontWeight: 600 }}>{j.reg}</td><td>{j.car}</td><td>{j.job}</td>
                  <td style={{ color: '#F39C12' }}>{j.mechanic}</td>
                  <td><span className={`status-badge ${j.status === 'Completed' ? 'status-completed' : j.status === 'In Progress' ? 'status-progress' : j.status === 'Awaiting Parts' ? 'status-awaiting' : 'status-queued'}`}>{j.status}</span></td>
                  <td style={{ color: '#1ABC9C', fontWeight: 600 }}>{fmtGHS(j.estCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
