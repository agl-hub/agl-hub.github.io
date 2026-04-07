import { useState, useMemo, useRef, useEffect } from 'react';
import { getData, fmtGHS } from '../lib/dataStore';

declare const Chart: any;

export default function MonthlyReport() {
  const data = getData();
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(2); // 0-indexed, 2 = March
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const chartTrendRef = useRef<HTMLCanvasElement>(null);
  const chartPayRef = useRef<HTMLCanvasElement>(null);
  const chartItemsRef = useRef<HTMLCanvasElement>(null);
  const chartChannelsRef = useRef<HTMLCanvasElement>(null);
  const chartsRef = useRef<any[]>([]);

  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthLabel = new Date(year, month).toLocaleString('en', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const monthlySales = useMemo(() => data.sales.filter(s => s.date.startsWith(monthStr)), [data.sales, monthStr]);
  const monthlyExpenses = useMemo(() => data.expenses.filter(e => e.date.startsWith(monthStr)), [data.expenses, monthStr]);

  const totalRev = monthlySales.reduce((s, x) => s + x.total, 0);
  const totalExp = monthlyExpenses.reduce((s, x) => s + x.amount, 0);
  const totalTxn = monthlySales.length;
  const avgTicket = totalTxn > 0 ? totalRev / totalTxn : 0;

  // Daily revenue map
  const dailyRev = useMemo(() => {
    const map: Record<number, number> = {};
    monthlySales.forEach(s => { const d = parseInt(s.date.slice(8)); map[d] = (map[d] || 0) + s.total; });
    return map;
  }, [monthlySales]);

  const maxDayRev = Math.max(...Object.values(dailyRev), 1);

  // Day detail
  const dayDetail = useMemo(() => {
    if (!selectedDay) return null;
    const dateStr = `${monthStr}-${String(selectedDay).padStart(2, '0')}`;
    const sales = data.sales.filter(s => s.date === dateStr);
    const expenses = data.expenses.filter(e => e.date === dateStr);
    return { sales, expenses, rev: sales.reduce((s, x) => s + x.total, 0), exp: expenses.reduce((s, x) => s + x.amount, 0) };
  }, [selectedDay, monthStr, data.sales, data.expenses]);

  // Charts
  useEffect(() => {
    if (typeof Chart === 'undefined') return;
    chartsRef.current.forEach(c => c?.destroy());
    chartsRef.current = [];

    const labels = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
    const revData = labels.map((_, i) => dailyRev[i + 1] || 0);

    if (chartTrendRef.current) {
      chartsRef.current.push(new Chart(chartTrendRef.current, {
        type: 'line', data: { labels, datasets: [{ label: 'Revenue', data: revData, borderColor: '#1ABC9C', backgroundColor: 'rgba(26,188,156,0.1)', fill: true, tension: 0.3, pointRadius: 2 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 8 } }, grid: { display: false } }, y: { ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 8 } }, grid: { color: 'rgba(255,255,255,0.04)' } } } }
      }));
    }

    // Payment methods
    const payMap: Record<string, number> = {};
    monthlySales.forEach(s => { payMap[s.payment] = (payMap[s.payment] || 0) + s.total; });
    if (chartPayRef.current) {
      const colors = ['#1ABC9C', '#3B82F6', '#F39C12', '#E30613', '#8B5CF6'];
      chartsRef.current.push(new Chart(chartPayRef.current, {
        type: 'doughnut', data: { labels: Object.keys(payMap), datasets: [{ data: Object.values(payMap), backgroundColor: colors.slice(0, Object.keys(payMap).length), borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.6)', font: { size: 9 }, padding: 8 } } } }
      }));
    }

    // Top items
    const itemMap: Record<string, number> = {};
    monthlySales.forEach(s => { itemMap[s.item] = (itemMap[s.item] || 0) + s.total; });
    const topItems = Object.entries(itemMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
    if (chartItemsRef.current) {
      chartsRef.current.push(new Chart(chartItemsRef.current, {
        type: 'bar', data: { labels: topItems.map(i => i[0]), datasets: [{ data: topItems.map(i => i[1]), backgroundColor: 'rgba(26,188,156,0.6)', borderRadius: 3 }] },
        options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 8 } }, grid: { color: 'rgba(255,255,255,0.04)' } }, y: { ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 8 } }, grid: { display: false } } } }
      }));
    }

    // Channels
    const chanMap: Record<string, number> = {};
    monthlySales.forEach(s => { chanMap[s.channel] = (chanMap[s.channel] || 0) + s.total; });
    if (chartChannelsRef.current) {
      const colors = ['#1ABC9C', '#3B82F6', '#F39C12', '#E30613', '#8B5CF6', '#EC4899', '#10B981'];
      chartsRef.current.push(new Chart(chartChannelsRef.current, {
        type: 'pie', data: { labels: Object.keys(chanMap), datasets: [{ data: Object.values(chanMap), backgroundColor: colors.slice(0, Object.keys(chanMap).length), borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.6)', font: { size: 9 }, padding: 8 } } } }
      }));
    }

    return () => { chartsRef.current.forEach(c => c?.destroy()); };
  }, [monthStr, monthlySales, monthlyExpenses, daysInMonth, dailyRev]);

  const changeMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setMonth(m);
    setYear(y);
    setSelectedDay(null);
  };

  return (
    <div>
      <div className="grid grid-2" style={{ marginBottom: '20px', alignItems: 'start', gap: '16px' }}>
        {/* Calendar */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <button className="btn btn-secondary" style={{ fontSize: '10px', padding: '4px 10px' }} onClick={() => changeMonth(-1)}>{'\u2190'} Prev</button>
            <h3 style={{ fontSize: '18px', fontFamily: 'Rajdhani', fontWeight: 700, color: '#fff' }}>{monthLabel}</h3>
            <button className="btn btn-secondary" style={{ fontSize: '10px', padding: '4px 10px' }} onClick={() => changeMonth(1)}>Next {'\u2192'}</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '8px', color: 'var(--text-muted)', padding: '4px', fontWeight: 600 }}>{d}</div>
            ))}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e_${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const rev = dailyRev[day] || 0;
              const intensity = rev > 0 ? Math.min(1, rev / maxDayRev) : 0;
              const isSelected = selectedDay === day;
              return (
                <div key={day} onClick={() => setSelectedDay(day)}
                  style={{
                    textAlign: 'center', padding: '6px 2px', borderRadius: '4px', cursor: 'pointer',
                    background: isSelected ? 'rgba(26,188,156,0.3)' : intensity > 0 ? `rgba(26,188,156,${intensity * 0.2})` : 'rgba(255,255,255,0.02)',
                    border: isSelected ? '1px solid #1ABC9C' : '1px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#fff' }}>{day}</div>
                  {rev > 0 && <div style={{ fontSize: '7px', color: '#1ABC9C', marginTop: '2px' }}>{fmtGHS(rev)}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* KPIs + Day Detail */}
        <div>
          <div className="grid grid-2" style={{ marginBottom: '16px' }}>
            <div className="card kpi-card green"><div className="kpi-label">Revenue</div><div className="kpi-value" style={{ fontSize: '16px' }}>{fmtGHS(totalRev)}</div></div>
            <div className="card kpi-card red"><div className="kpi-label">Expenses</div><div className="kpi-value" style={{ fontSize: '16px' }}>{fmtGHS(totalExp)}</div></div>
            <div className="card kpi-card navy"><div className="kpi-label">Transactions</div><div className="kpi-value">{totalTxn}</div></div>
            <div className="card kpi-card gold"><div className="kpi-label">Avg Ticket</div><div className="kpi-value" style={{ fontSize: '16px' }}>{fmtGHS(avgTicket)}</div></div>
          </div>

          {dayDetail && selectedDay && (
            <div className="card fade-in" style={{ padding: '12px' }}>
              <h4 style={{ fontFamily: 'Rajdhani', fontSize: '14px', marginBottom: '12px', color: 'var(--text-dim)' }}>
                Day {selectedDay} Details
              </h4>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '10px' }}>
                <div><span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Revenue</span><div style={{ fontFamily: 'Rajdhani', fontWeight: 700, color: '#1ABC9C' }}>{fmtGHS(dayDetail.rev)}</div></div>
                <div><span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Expenses</span><div style={{ fontFamily: 'Rajdhani', fontWeight: 700, color: '#E30613' }}>{fmtGHS(dayDetail.exp)}</div></div>
                <div><span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Transactions</span><div style={{ fontFamily: 'Rajdhani', fontWeight: 700, color: '#fff' }}>{dayDetail.sales.length}</div></div>
              </div>
              {dayDetail.sales.length > 0 && (
                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  <table>
                    <thead><tr><th>Time</th><th>Customer</th><th>Item</th><th>Amount</th></tr></thead>
                    <tbody>
                      {dayDetail.sales.map(s => (
                        <tr key={s.id}><td>{s.time}</td><td>{s.customer}</td><td>{s.item}</td><td style={{ color: '#1ABC9C', fontWeight: 600 }}>{fmtGHS(s.total)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-2" style={{ marginBottom: '16px' }}>
        <div className="card chart-card"><h4>Daily Revenue Trend</h4><div className="chart-container"><canvas ref={chartTrendRef} /></div></div>
        <div className="card chart-card"><h4>Monthly Payment Methods</h4><div className="chart-container"><canvas ref={chartPayRef} /></div></div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-2">
        <div className="card chart-card"><h4>Top Selling Items</h4><div className="chart-container"><canvas ref={chartItemsRef} /></div></div>
        <div className="card chart-card"><h4>Sales by Channel</h4><div className="chart-container"><canvas ref={chartChannelsRef} /></div></div>
      </div>
    </div>
  );
}
