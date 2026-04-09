import { useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, ComposedChart,
} from 'recharts';
import { getData, fmtGHS } from '../lib/dataStore';
import { getPeriodBounds, filterByPeriod } from '../lib/usePeriodData';

const COLORS = ['#D97706','#4F46E5','#BE123C','#7F1D1D','#92400E','#1D4ED8','#059669','#6B21A8'];
const fmt = (n: number) => fmtGHS(n);
const pct = (a: number, b: number) => b > 0 ? ((a / b) * 100).toFixed(1) + '%' : '0%';

type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'full';
const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Reports() {
  const data = getData();
  const [period, setPeriod] = useState<ReportPeriod>('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [drillData, setDrillData] = useState<{ title: string; rows: any[] } | null>(null);

  // Period bounds
  const bounds = useMemo(() => {
    if (period === 'daily') return getPeriodBounds('custom', selectedDate, selectedDate);
    if (period === 'weekly') return getPeriodBounds('week', selectedDate, selectedDate);
    if (period === 'monthly') {
      const [y, m] = selectedMonth.split('-').map(Number);
      const last = new Date(y, m, 0).getDate();
      return getPeriodBounds('custom', `${selectedMonth}-01`, `${selectedMonth}-${String(last).padStart(2,'0')}`);
    }
    return getPeriodBounds('custom', '2000-01-01', '2099-12-31');
  }, [period, selectedDate, selectedMonth]);

  const sales = useMemo(() => filterByPeriod(data.sales, bounds), [data.sales, bounds]);
  const expenses = useMemo(() => filterByPeriod(data.expenses, bounds), [data.expenses, bounds]);
  const pos = useMemo(() => filterByPeriod(data.purchaseOrders, bounds), [data.purchaseOrders, bounds]);
  const workshop = useMemo(() => filterByPeriod(data.workshop.map(w => ({ ...w, date: w.date || '2000-01-01' })), bounds), [data.workshop, bounds]);

  // Core metrics
  const revenue = useMemo(() => sales.reduce((s, x) => s + x.total, 0), [sales]);
  const expTotal = useMemo(() => expenses.reduce((s, x) => s + x.amount, 0), [expenses]);
  const poTotal = useMemo(() => pos.reduce((s, x) => s + x.amount, 0), [pos]);
  const netProfit = revenue - expTotal - poTotal;
  const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  const avgTxn = sales.length ? revenue / sales.length : 0;
  const uniqueCustomers = new Set(sales.map(s => s.customer)).size;

  // Daily breakdown
  const byDate = useMemo(() => {
    const m: Record<string, number> = {};
    sales.forEach(s => { m[s.date] = (m[s.date] || 0) + s.total; });
    return m;
  }, [sales]);

  const dailyChartData = useMemo(() => {
    const sorted = Object.keys(byDate).sort();
    return sorted.map(d => ({ date: d.slice(5), full: d, rev: byDate[d] }));
  }, [byDate]);

  // Day-of-week breakdown
  const byDow = useMemo(() => {
    const m: Record<number, { rev: number; count: number }> = {};
    sales.forEach(s => {
      const dow = new Date(s.date + 'T00:00:00').getDay();
      if (!m[dow]) m[dow] = { rev: 0, count: 0 };
      m[dow].rev += s.total; m[dow].count++;
    });
    return DOW.map((name, i) => ({ name, rev: m[i]?.rev || 0, count: m[i]?.count || 0 }));
  }, [sales]);

  // Payment breakdown
  const byPayment = useMemo(() => {
    const m: Record<string, number> = {};
    sales.forEach(s => { m[s.payment] = (m[s.payment] || 0) + s.total; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [sales]);

  // Channel breakdown
  const byChannel = useMemo(() => {
    const m: Record<string, number> = {};
    sales.forEach(s => { m[s.channel] = (m[s.channel] || 0) + s.total; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  }, [sales]);

  // Top products
  const topProducts = useMemo(() => {
    const m: Record<string, { rev: number; qty: number; count: number }> = {};
    sales.forEach(s => {
      if (!m[s.item]) m[s.item] = { rev: 0, qty: 0, count: 0 };
      m[s.item].rev += s.total; m[s.item].qty += s.qty; m[s.item].count++;
    });
    return Object.entries(m).sort((a, b) => b[1].rev - a[1].rev).slice(0, 15).map(([name, v]) => ({ name, ...v }));
  }, [sales]);

  // Rep performance
  const byRep = useMemo(() => {
    const m: Record<string, { rev: number; count: number }> = {};
    sales.forEach(s => {
      if (!m[s.rep]) m[s.rep] = { rev: 0, count: 0 };
      m[s.rep].rev += s.total; m[s.rep].count++;
    });
    return Object.entries(m).sort((a, b) => b[1].rev - a[1].rev).map(([name, v]) => ({ name, ...v, avg: v.count ? v.rev / v.count : 0 }));
  }, [sales]);

  // Workshop metrics
  const wCompleted = workshop.filter(w => w.status === 'Completed').length;
  const wActive = workshop.filter(w => w.status !== 'Completed').length;
  const wCompRate = workshop.length ? (wCompleted / workshop.length) * 100 : 0;
  const byMechanic = useMemo(() => {
    const m: Record<string, { jobs: number; completed: number; recalls: number }> = {};
    data.workshop.forEach(w => {
      const mech = w.mechanic || 'Unassigned';
      if (!m[mech]) m[mech] = { jobs: 0, completed: 0, recalls: 0 };
      m[mech].jobs++;
      if (w.status === 'Completed') m[mech].completed++;
      if ((w as any).recall) m[mech].recalls++;
    });
    return Object.entries(m).sort((a, b) => b[1].jobs - a[1].jobs).map(([name, v]) => ({ name, ...v, rate: v.jobs ? Math.round((v.completed / v.jobs) * 100) : 0 }));
  }, [data.workshop]);

  // Expense breakdown
  const byExpCategory = useMemo(() => {
    const m: Record<string, number> = {};
    expenses.forEach(e => { const cat = e.purpose || 'General'; m[cat] = (m[cat] || 0) + e.amount; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  // Inventory alerts
  const lowStock = data.inventory.filter(i => i.qty <= (i.reorder || 5));

  // Monthly comparison (last 6 months)
  const monthlyComparison = useMemo(() => {
    const months: { month: string; rev: number; exp: number; net: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const mSales = data.sales.filter(s => s.date.startsWith(ym));
      const mExp = data.expenses.filter(e => e.date.startsWith(ym));
      const rev = mSales.reduce((a, b) => a + b.total, 0);
      const exp = mExp.reduce((a, b) => a + b.amount, 0);
      months.push({ month: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`, rev, exp, net: rev - exp });
    }
    return months;
  }, [data]);

  // Creditor exposure
  const creditors = data.creditors || [];
  const totalOwed = creditors.filter((c: any) => !c.paid).reduce((a: number, b: any) => a + (b.amount || 0), 0);
  const overdueCreditors = creditors.filter((c: any) => !c.paid && c.dueDate && c.dueDate < new Date().toISOString().slice(0, 10));

  // DAX-style insights
  const insights = useMemo(() => {
    const ins: { icon: string; title: string; text: string; color: string }[] = [];
    if (revenue > 0) {
      const bestDay = Object.entries(byDate).sort((a, b) => b[1] - a[1])[0];
      if (bestDay) ins.push({ icon: '🏆', title: 'Best Day', text: `${bestDay[0]} — ${fmt(bestDay[1])} (${pct(bestDay[1], revenue)} of period revenue)`, color: '#D97706' });
      const bestDow = byDow.sort((a, b) => b.rev - a.rev)[0];
      if (bestDow?.rev > 0) ins.push({ icon: '📅', title: 'Best Day of Week', text: `${bestDow.name} averages ${fmt(bestDow.rev / Math.max(1, byDow.filter(d => d.name === bestDow.name).length))} per occurrence`, color: '#4F46E5' });
      const topProd = topProducts[0];
      if (topProd) ins.push({ icon: '📦', title: 'Product Concentration', text: `${topProd.name} = ${pct(topProd.rev, revenue)} of revenue — ${topProd.count} transactions`, color: '#BE123C' });
      const topCh = byChannel[0];
      if (topCh) ins.push({ icon: '📡', title: 'Channel Dominance', text: `${topCh.name} = ${pct(topCh.value, revenue)} of revenue`, color: '#059669' });
      if (margin < 20) ins.push({ icon: '⚠️', title: 'Margin Alert', text: `Profit margin at ${margin.toFixed(1)}% — below 20% threshold. Review pricing.`, color: '#BE123C' });
      if (wCompRate < 85) ins.push({ icon: '🔧', title: 'Workshop Efficiency', text: `Job completion rate at ${wCompRate.toFixed(0)}% — target is 85%`, color: '#D97706' });
      if (overdueCreditors.length > 0) ins.push({ icon: '💸', title: 'Overdue Creditors', text: `${overdueCreditors.length} overdue creditor(s) — total exposure GHS ${totalOwed.toLocaleString()}`, color: '#BE123C' });
      if (lowStock.length > 0) ins.push({ icon: '📉', title: 'Inventory Alert', text: `${lowStock.length} items at or below reorder level`, color: '#D97706' });
    }
    return ins;
  }, [revenue, byDate, byDow, topProducts, byChannel, margin, wCompRate, overdueCreditors, totalOwed, lowStock]);

  const periodLabel = bounds.label;

  return (
    <div>
      {/* Period Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['daily','weekly','monthly','full'] as ReportPeriod[]).map(p => (
            <button key={p} className={`tab-btn ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)} style={{ fontSize: '10px', padding: '4px 10px', textTransform: 'capitalize' }}>{p === 'full' ? 'Full Ops' : p}</button>
          ))}
        </div>
        {(period === 'daily' || period === 'weekly') && (
          <input type="date" className="form-control" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ width: '140px', fontSize: '10px', padding: '3px 8px' }} />
        )}
        {period === 'monthly' && (
          <input type="month" className="form-control" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{ width: '140px', fontSize: '10px', padding: '3px 8px' }} />
        )}
        <span style={{ fontSize: '10px', color: 'var(--text-dim)', marginLeft: 'auto' }}>Period: <strong style={{ color: '#D97706' }}>{periodLabel}</strong> · {sales.length} transactions</span>
      </div>

      {/* Executive KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '6px', marginBottom: '10px' }}>
        {[
          { label: 'Gross Revenue', value: fmt(revenue), color: '#D97706' },
          { label: 'Total Expenses', value: fmt(expTotal + poTotal), color: '#BE123C' },
          { label: 'Net Profit', value: fmt(netProfit), color: netProfit >= 0 ? '#059669' : '#BE123C' },
          { label: 'Profit Margin', value: `${margin.toFixed(1)}%`, color: margin >= 30 ? '#059669' : margin >= 20 ? '#D97706' : '#BE123C' },
          { label: 'Avg Transaction', value: fmt(avgTxn), color: '#4F46E5' },
          { label: 'Unique Customers', value: String(uniqueCustomers), color: '#92400E' },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '7px 10px', borderLeft: `3px solid ${k.color}` }}>
            <div style={{ fontSize: '8px', color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '2px' }}>{k.label}</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '15px', fontWeight: 700, color: k.color, lineHeight: 1.1 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Section 1: Revenue Analysis */}
      <div className="report-section-header">01 · Revenue Analysis</div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginBottom: '10px' }}>
        <div className="card chart-card" style={{ padding: '12px' }}>
          <div className="chart-title">Daily Revenue Trend — {periodLabel}</div>
          {dailyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <ComposedChart data={dailyChartData} onClick={e => e?.activePayload && setDrillData({ title: `Sales on ${e.activePayload[0].payload.full}`, rows: sales.filter(s => s.date === e.activePayload![0].payload.full) })}>
                <defs><linearGradient id="rg2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#D97706" stopOpacity={0.25}/><stop offset="95%" stopColor="#D97706" stopOpacity={0}/></linearGradient></defs>
                <XAxis dataKey="date" tick={{ fill: '#718096', fontSize: 8 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#718096', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [fmt(v), 'Revenue']} contentStyle={{ background: '#1a1f2e', border: '1px solid #2d3748', fontSize: '10px' }} />
                <Area type="monotone" dataKey="rev" fill="url(#rg2)" stroke="none" />
                <Line type="monotone" dataKey="rev" stroke="#D97706" strokeWidth={2} dot={{ r: 2, fill: '#D97706' }} activeDot={{ r: 5, cursor: 'pointer' }} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </div>
        <div className="card chart-card" style={{ padding: '12px' }}>
          <div className="chart-title">Revenue by Day of Week</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byDow}>
              <XAxis dataKey="name" tick={{ fill: '#718096', fontSize: 8 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#718096', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [fmt(v), 'Revenue']} contentStyle={{ background: '#1a1f2e', border: '1px solid #2d3748', fontSize: '10px' }} />
              <Bar dataKey="rev" radius={[3, 3, 0, 0]}>
                {byDow.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section 2: Payment & Channel Mix */}
      <div className="report-section-header">02 · Payment & Channel Mix</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
        <div className="card chart-card" style={{ padding: '12px' }}>
          <div className="chart-title">Payment Method Breakdown</div>
          {byPayment.length > 0 ? (
            <ResponsiveContainer width="100%" height={165}>
              <PieChart>
                <Pie data={byPayment} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" onClick={e => setDrillData({ title: `${e.name} Transactions`, rows: sales.filter(s => s.payment === e.name) })}>
                  {byPayment.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} cursor="pointer" />)}
                </Pie>
                <Tooltip formatter={(v: number) => [fmt(v), '']} contentStyle={{ background: '#1a1f2e', border: '1px solid #2d3748', fontSize: '10px' }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '9px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </div>
        <div className="card chart-card" style={{ padding: '12px' }}>
          <div className="chart-title">Revenue by Channel</div>
          {byChannel.length > 0 ? (
            <ResponsiveContainer width="100%" height={165}>
              <BarChart data={byChannel} layout="vertical" onClick={e => e?.activePayload && setDrillData({ title: `${e.activePayload[0].payload.name} Sales`, rows: sales.filter(s => s.channel === e.activePayload![0].payload.name) })} style={{ cursor: 'pointer' }}>
                <XAxis type="number" tick={{ fill: '#718096', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#718096', fontSize: 8 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip formatter={(v: number) => [fmt(v), 'Revenue']} contentStyle={{ background: '#1a1f2e', border: '1px solid #2d3748', fontSize: '10px' }} />
                <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                  {byChannel.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </div>
        <div className="card" style={{ padding: '12px' }}>
          <div className="chart-title">Channel Summary</div>
          <table>
            <thead><tr><th>Channel</th><th>Revenue</th><th>Share</th></tr></thead>
            <tbody>
              {byChannel.map(c => (
                <tr key={c.name} style={{ cursor: 'pointer' }} onClick={() => setDrillData({ title: `${c.name} Sales`, rows: sales.filter(s => s.channel === c.name) })}>
                  <td>{c.name}</td>
                  <td style={{ color: '#D97706', fontWeight: 700 }}>{fmt(c.value)}</td>
                  <td style={{ color: 'var(--text-dim)' }}>{pct(c.value, revenue)}</td>
                </tr>
              ))}
              {byChannel.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-dim)' }}>No data</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Product Analysis */}
      <div className="report-section-header">03 · Product & Service Analysis</div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginBottom: '10px' }}>
        <div className="card" style={{ padding: '12px' }}>
          <div className="chart-title">Top Products / Services by Revenue</div>
          <div style={{ overflowY: 'auto', maxHeight: '220px' }}>
            <table>
              <thead><tr><th>#</th><th>Item</th><th>Revenue</th><th>Qty</th><th>Txns</th><th>Avg Price</th><th>Share</th></tr></thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={p.name} style={{ cursor: 'pointer' }} onClick={() => setDrillData({ title: `${p.name} Transactions`, rows: sales.filter(s => s.item === p.name) })}>
                    <td style={{ color: COLORS[i % COLORS.length], fontWeight: 700 }}>{i+1}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td style={{ color: '#D97706', fontWeight: 700 }}>{fmt(p.rev)}</td>
                    <td>{p.qty}</td>
                    <td>{p.count}</td>
                    <td>{fmt(p.count ? p.rev / p.count : 0)}</td>
                    <td style={{ color: 'var(--text-dim)' }}>{pct(p.rev, revenue)}</td>
                  </tr>
                ))}
                {topProducts.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-dim)' }}>No data</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card chart-card" style={{ padding: '12px' }}>
          <div className="chart-title">Product Revenue Distribution</div>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProducts.slice(0, 8)} layout="vertical">
                <XAxis type="number" tick={{ fill: '#718096', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#718096', fontSize: 7 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip formatter={(v: number) => [fmt(v), 'Revenue']} contentStyle={{ background: '#1a1f2e', border: '1px solid #2d3748', fontSize: '10px' }} />
                <Bar dataKey="rev" radius={[0, 3, 3, 0]}>
                  {topProducts.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </div>
      </div>

      {/* Section 4: Sales Rep Performance */}
      <div className="report-section-header">04 · Sales Rep Performance</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
        <div className="card" style={{ padding: '12px' }}>
          <div className="chart-title">Rep Leaderboard</div>
          <table>
            <thead><tr><th>Rep</th><th>Revenue</th><th>Txns</th><th>Avg Ticket</th><th>Share</th></tr></thead>
            <tbody>
              {byRep.map((r, i) => (
                <tr key={r.name} style={{ cursor: 'pointer' }} onClick={() => setDrillData({ title: `${r.name}'s Transactions`, rows: sales.filter(s => s.rep === r.name) })}>
                  <td><span style={{ color: COLORS[i % COLORS.length], fontWeight: 700, marginRight: '6px' }}>{i+1}</span>{r.name}</td>
                  <td style={{ color: '#D97706', fontWeight: 700 }}>{fmt(r.rev)}</td>
                  <td>{r.count}</td>
                  <td>{fmt(r.avg)}</td>
                  <td style={{ color: 'var(--text-dim)' }}>{pct(r.rev, revenue)}</td>
                </tr>
              ))}
              {byRep.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-dim)' }}>No data</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="card chart-card" style={{ padding: '12px' }}>
          <div className="chart-title">Revenue by Rep</div>
          {byRep.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byRep}>
                <XAxis dataKey="name" tick={{ fill: '#718096', fontSize: 8 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#718096', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [fmt(v), 'Revenue']} contentStyle={{ background: '#1a1f2e', border: '1px solid #2d3748', fontSize: '10px' }} />
                <Bar dataKey="rev" radius={[3, 3, 0, 0]}>
                  {byRep.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </div>
      </div>

      {/* Section 5: Financial Summary */}
      <div className="report-section-header">05 · Financial Summary</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
        <div className="card" style={{ padding: '12px' }}>
          <div className="chart-title">P&amp;L Statement — {periodLabel}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { label: 'Gross Revenue', value: revenue, color: '#059669', bold: true },
              { label: 'Operating Expenses', value: -expTotal, color: '#BE123C', bold: false },
              { label: 'Purchase Orders', value: -poTotal, color: '#BE123C', bold: false },
              { label: 'Total Outflow', value: -(expTotal + poTotal), color: '#BE123C', bold: true },
              { label: 'Net Profit', value: netProfit, color: netProfit >= 0 ? '#059669' : '#BE123C', bold: true },
              { label: 'Profit Margin', value: null, display: `${margin.toFixed(1)}%`, color: margin >= 30 ? '#059669' : margin >= 20 ? '#D97706' : '#BE123C', bold: true },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', borderLeft: row.bold ? `2px solid ${row.color}` : 'none' }}>
                <span style={{ fontSize: '10px', color: row.bold ? '#fff' : 'var(--text-dim)', fontWeight: row.bold ? 600 : 400 }}>{row.label}</span>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: row.bold ? '13px' : '11px', fontWeight: 700, color: row.color }}>{row.display || fmt(Math.abs(row.value!))}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card chart-card" style={{ padding: '12px' }}>
          <div className="chart-title">Expense Categories</div>
          {byExpCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={byExpCategory} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value">
                  {byExpCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [fmt(v), '']} contentStyle={{ background: '#1a1f2e', border: '1px solid #2d3748', fontSize: '10px' }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '9px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '10px' }}>No expense data for period</div>}
        </div>
        <div className="card chart-card" style={{ padding: '12px' }}>
          <div className="chart-title">6-Month Revenue vs Expenses</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyComparison}>
              <XAxis dataKey="month" tick={{ fill: '#718096', fontSize: 7 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#718096', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [fmt(v), '']} contentStyle={{ background: '#1a1f2e', border: '1px solid #2d3748', fontSize: '10px' }} />
              <Bar dataKey="rev" fill="#D97706" radius={[2, 2, 0, 0]} name="Revenue" />
              <Bar dataKey="exp" fill="#BE123C" radius={[2, 2, 0, 0]} name="Expenses" />
              <Legend iconSize={8} wrapperStyle={{ fontSize: '9px' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section 6: Workshop */}
      <div className="report-section-header">06 · Workshop Operations</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
        <div className="card" style={{ padding: '12px' }}>
          <div className="chart-title">Workshop KPIs</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
            {[
              { label: 'Total Jobs', value: String(workshop.length), color: '#4F46E5' },
              { label: 'Completed', value: String(wCompleted), color: '#059669' },
              { label: 'Active', value: String(wActive), color: '#D97706' },
              { label: 'Completion Rate', value: `${wCompRate.toFixed(0)}%`, color: wCompRate >= 85 ? '#059669' : '#BE123C' },
            ].map(k => (
              <div key={k.label} className="card" style={{ padding: '6px 10px', borderLeft: `2px solid ${k.color}` }}>
                <div style={{ fontSize: '8px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{k.label}</div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 700, color: k.color }}>{k.value}</div>
              </div>
            ))}
          </div>
          <div className="chart-title" style={{ marginTop: '8px' }}>Jobs by Mechanic</div>
          <table>
            <thead><tr><th>Mechanic</th><th>Jobs</th><th>Done</th><th>Rate</th><th>Recalls</th></tr></thead>
            <tbody>
              {byMechanic.map(m => (
                <tr key={m.name}>
                  <td style={{ fontWeight: 600 }}>{m.name}</td>
                  <td>{m.jobs}</td>
                  <td style={{ color: '#059669' }}>{m.completed}</td>
                  <td><span style={{ color: m.rate >= 85 ? '#059669' : m.rate >= 70 ? '#D97706' : '#BE123C', fontWeight: 700 }}>{m.rate}%</span></td>
                  <td style={{ color: m.recalls > 0 ? '#BE123C' : 'var(--text-dim)' }}>{m.recalls}</td>
                </tr>
              ))}
              {byMechanic.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-dim)' }}>No data</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="card" style={{ padding: '12px' }}>
          <div className="chart-title">Recent Workshop Jobs</div>
          <div style={{ overflowY: 'auto', maxHeight: '260px' }}>
            <table>
              <thead><tr><th>Date</th><th>Vehicle</th><th>Job</th><th>Mechanic</th><th>Status</th></tr></thead>
              <tbody>
                {data.workshop.slice(-30).reverse().map((w, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: '8px' }}>{w.date}</td>
                    <td style={{ fontWeight: 600 }}>{w.car}</td>
                    <td>{w.job}</td>
                    <td style={{ fontSize: '9px' }}>{w.mechanic}</td>
                    <td><span className={`status-badge ${w.status === 'Completed' ? 'status-completed' : w.status === 'In Progress' ? 'status-progress' : 'status-queued'}`} style={{ fontSize: '7px' }}>{w.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section 7: Inventory Alerts */}
      <div className="report-section-header">07 · Inventory Alerts</div>
      <div className="card" style={{ padding: '12px', marginBottom: '10px' }}>
        {lowStock.length > 0 ? (
          <div style={{ overflowY: 'auto', maxHeight: '200px' }}>
            <table>
              <thead><tr><th>SKU</th><th>Item</th><th>Category</th><th>Current Qty</th><th>Reorder Level</th><th>Status</th></tr></thead>
              <tbody>
                {lowStock.map(i => (
                  <tr key={i.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '8px' }}>{i.sku}</td>
                    <td style={{ fontWeight: 600 }}>{i.name}</td>
                    <td style={{ fontSize: '9px' }}>{i.category}</td>
                    <td style={{ color: i.qty === 0 ? '#BE123C' : '#D97706', fontWeight: 700 }}>{i.qty}</td>
                    <td>{i.reorder || 5}</td>
                    <td><span className={`status-badge ${i.qty === 0 ? 'status-awaiting' : 'status-progress'}`} style={{ fontSize: '7px' }}>{i.qty === 0 ? 'OUT OF STOCK' : 'LOW STOCK'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div style={{ padding: '20px', textAlign: 'center', color: '#059669', fontSize: '11px' }}>✓ All inventory levels are above reorder thresholds</div>}
      </div>

      {/* Section 8: Business Insights */}
      <div className="report-section-header">08 · Business Insights &amp; Analytics</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px', marginBottom: '10px' }}>
        {insights.map((ins, i) => (
          <div key={i} className="card" style={{ padding: '10px 14px', borderLeft: `3px solid ${ins.color}` }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', marginBottom: '3px' }}>{ins.icon} {ins.title}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', lineHeight: 1.5 }}>{ins.text}</div>
          </div>
        ))}
        {insights.length === 0 && <div className="card" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', gridColumn: 'span 2' }}>No insights available — select a period with data</div>}
      </div>

      {/* Section 9: Transaction Log (Daily only) */}
      {period === 'daily' && (
        <>
          <div className="report-section-header">09 · Daily Transaction Log — {selectedDate}</div>
          <div className="card" style={{ padding: '12px', marginBottom: '10px' }}>
            <table>
              <thead><tr><th>Time</th><th>Customer</th><th>Item</th><th>Qty</th><th>Price</th><th>Total</th><th>Payment</th><th>Channel</th><th>Rep</th><th>Receipt</th></tr></thead>
              <tbody>
                {sales.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontSize: '8px' }}>{s.time || '-'}</td>
                    <td>{s.customer}</td>
                    <td style={{ fontWeight: 600 }}>{s.item}</td>
                    <td style={{ textAlign: 'center' }}>{s.qty}</td>
                    <td>{fmt(s.price)}</td>
                    <td style={{ color: '#D97706', fontWeight: 700 }}>{fmt(s.total)}</td>
                    <td style={{ fontSize: '8px' }}>{s.payment}</td>
                    <td style={{ fontSize: '8px' }}>{s.channel}</td>
                    <td style={{ fontSize: '9px' }}>{s.rep}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '7px', color: 'var(--text-muted)' }}>{s.receipt}</td>
                  </tr>
                ))}
                {sales.length === 0 && <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px' }}>No sales on {selectedDate}</td></tr>}
              </tbody>
            </table>
            {sales.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginTop: '10px', padding: '8px 12px', background: 'rgba(217,119,6,0.08)', borderRadius: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Transactions: <strong style={{ color: '#fff' }}>{sales.length}</strong></span>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Expenses: <strong style={{ color: '#BE123C' }}>{fmt(expTotal)}</strong></span>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Net for Day: <strong style={{ color: netProfit >= 0 ? '#059669' : '#BE123C', fontFamily: 'Georgia,serif', fontSize: '13px' }}>{fmt(netProfit)}</strong></span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Drill-through Modal */}
      {drillData && (
        <div className="drillthrough-overlay" onClick={() => setDrillData(null)}>
          <div className="drillthrough-panel" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>{drillData.title}</h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{drillData.rows.length} records · Total: {fmt(drillData.rows.reduce((a: number, b: any) => a + (b.total || 0), 0))}</span>
                <button className="btn btn-secondary" style={{ fontSize: '9px', padding: '3px 8px' }} onClick={() => setDrillData(null)}>✕ Close</button>
              </div>
            </div>
            <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
              <table>
                <thead><tr><th>Date</th><th>Customer</th><th>Item</th><th>Channel</th><th>Qty</th><th>Amount</th><th>Payment</th><th>Rep</th></tr></thead>
                <tbody>
                  {drillData.rows.map((r: any, i: number) => (
                    <tr key={i}>
                      <td style={{ fontSize: '8px' }}>{r.date}</td><td>{r.customer}</td><td style={{ fontWeight: 600 }}>{r.item}</td>
                      <td style={{ fontSize: '8px' }}>{r.channel}</td><td style={{ textAlign: 'center' }}>{r.qty}</td>
                      <td style={{ color: '#D97706', fontWeight: 700 }}>{fmt(r.total)}</td>
                      <td style={{ fontSize: '8px' }}>{r.payment}</td><td style={{ fontSize: '9px' }}>{r.rep}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyChart() {
  return <div style={{ height: '165px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '10px' }}>No data for selected period</div>;
}
