import { useState, useMemo, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, AreaChart, Area,
} from 'recharts';
import { getData, fmtGHS, updateData } from '../lib/dataStore';
import { useLayout } from '../components/MainLayout';
import { usePeriodData } from '../lib/usePeriodData';

const COLORS = ['#D97706','#4F46E5','#BE123C','#7F1D1D','#92400E','#1D4ED8','#059669','#6B21A8'];
const fmt = (n: number) => fmtGHS(n);

interface DrillRow { date: string; customer: string; item: string; channel: string; qty: number; total: number; payment: string; receipt: string; status: string; }

export default function NewDashboardPage() {
  const { filterState, showToast, openModal } = useLayout();
  const [refresh, setRefresh] = useState(0);
  const [drill, setDrill] = useState<{ title: string; rows: DrillRow[] } | null>(null);

  const { data, sales, expenses, purchaseOrders, revenue, expenseTotal, poTotal, netProfit, margin, byPayment, byChannel, byDate, byRep, byProduct, bounds } = usePeriodData(filterState);
  void refresh; void purchaseOrders;

  const avgTxn = sales.length ? revenue / sales.length : 0;
  const workshopActive = data.workshop.filter(w => w.status !== 'Completed').length;
  const creditOutstanding = sales.filter(s => s.payment === 'Credit').reduce((a, b) => a + b.total, 0);

  const dailyData = useMemo(() => Object.keys(byDate).sort().map(d => ({ date: d.slice(5), full: d, rev: byDate[d] })), [byDate]);
  const paymentData = useMemo(() => Object.entries(byPayment).map(([name, value]) => ({ name, value })), [byPayment]);
  const channelData = useMemo(() => Object.entries(byChannel).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value })), [byChannel]);
  const topProducts = useMemo(() => Object.entries(byProduct).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value })), [byProduct]);
  const mtdData = useMemo(() => { const s = Object.keys(byDate).sort(); let c = 0; return s.map((d, i) => { c += byDate[d]; return { date: d.slice(5), cum: c, target: 4000 * (i + 1) }; }); }, [byDate]);

  const insights = useMemo(() => {
    const ins: { type: string; icon: string; title: string; text: string }[] = [];
    if (revenue > 30000) ins.push({ type: 'positive', icon: '📈', title: 'Strong Revenue', text: `${fmt(revenue)} in ${bounds.label} — above GHS 30,000 threshold` });
    if (margin > 35) ins.push({ type: 'positive', icon: '💰', title: 'Healthy Margins', text: `Profit margin at ${margin.toFixed(1)}% — above 30% target` });
    if (margin < 20 && revenue > 0) ins.push({ type: 'negative', icon: '⚠️', title: 'Margin Pressure', text: `Margin at ${margin.toFixed(1)}% — below 20% warning level` });
    const expRatio = revenue > 0 ? (expenseTotal / revenue) * 100 : 0;
    if (expRatio > 40) ins.push({ type: 'negative', icon: '⚠️', title: 'High Expense Ratio', text: `Expenses at ${expRatio.toFixed(1)}% of revenue` });
    if (workshopActive > 5) ins.push({ type: 'warning', icon: '🔧', title: 'Workshop Backlog', text: `${workshopActive} active jobs — review capacity` });
    if (creditOutstanding > 5000) ins.push({ type: 'warning', icon: '💳', title: 'Credit Exposure', text: `GHS ${creditOutstanding.toLocaleString()} in credit sales` });
    if (topProducts.length > 0) ins.push({ type: 'info', icon: '🏆', title: 'Best Seller', text: `${topProducts[0].name} — ${fmt(topProducts[0].value)}` });
    if (channelData.length > 0) ins.push({ type: 'info', icon: '📡', title: 'Top Channel', text: `${channelData[0].name}: ${fmt(channelData[0].value)} (${revenue > 0 ? ((channelData[0].value / revenue) * 100).toFixed(0) : 0}%)` });
    return ins;
  }, [revenue, margin, expenseTotal, workshopActive, creditOutstanding, topProducts, channelData, bounds]);

  const drillByDate = useCallback((d: string) => setDrill({ title: `Sales on ${d}`, rows: sales.filter(s => s.date === d) }), [sales]);
  const drillByChannel = useCallback((ch: string) => setDrill({ title: `${ch} Sales`, rows: sales.filter(s => s.channel === ch) }), [sales]);
  const drillByPayment = useCallback((pm: string) => setDrill({ title: `${pm} Transactions`, rows: sales.filter(s => s.payment === pm) }), [sales]);
  const openNewSale = () => openModal(<NewSaleForm onDone={() => { setRefresh(r => r + 1); showToast('Sale recorded', 'success'); }} />);
  const openNewExpense = () => openModal(<NewExpenseForm onDone={() => { setRefresh(r => r + 1); showToast('Expense recorded', 'success'); }} />);

  const ibg = (t: string) => t === 'positive' ? '#064E3B' : t === 'negative' ? '#7F1D1D' : t === 'warning' ? '#78350F' : '#1E1B4B';
  const ibd = (t: string) => t === 'positive' ? '#D97706' : t === 'negative' ? '#BE123C' : t === 'warning' ? '#D97706' : '#4F46E5';

  return (
    <div>
      {/* KPI Row — compact */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px', marginBottom: '8px' }}>
        <KpiCard label="Gross Revenue" value={fmt(revenue)} sub={`${sales.length} transactions · ${bounds.label}`} color="#D97706" onClick={() => setDrill({ title: 'All Sales', rows: sales })} />
        <KpiCard label="Total Outflow" value={fmt(expenseTotal + poTotal)} sub="Expenses + POs" color="#BE123C" />
        <KpiCard label="Net Position" value={fmt(netProfit)} sub={`${margin.toFixed(1)}% margin`} color={netProfit >= 0 ? '#059669' : '#BE123C'} />
        <KpiCard label="Avg Transaction" value={fmt(avgTxn)} sub="Per sale" color="#4F46E5" />
      </div>

      {/* Row 2: Revenue Trend + Top Products + Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 300px', gap: '8px', marginBottom: '8px' }}>
        <div className="card chart-card" style={{ padding: '12px' }}>
          <div className="chart-title">Revenue Trend</div>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={165}>
              <AreaChart data={dailyData} onClick={e => e?.activePayload && drillByDate(e.activePayload[0].payload.full)} style={{ cursor: 'pointer' }}>
                <defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#D97706" stopOpacity={0.3}/><stop offset="95%" stopColor="#D97706" stopOpacity={0}/></linearGradient></defs>
                <XAxis dataKey="date" tick={{ fill: '#718096', fontSize: 8 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#718096', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [fmt(v), 'Revenue']} contentStyle={{ background: '#1a1f2e', border: '1px solid #2d3748', fontSize: '10px' }} />
                <Area type="monotone" dataKey="rev" stroke="#D97706" fill="url(#rg)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <Empty label="No data for selected period" />}
        </div>

        <div className="card chart-card" style={{ padding: '12px' }}>
          <div className="chart-title">Top Products / Services</div>
          {topProducts.length > 0 ? (
            <div style={{ overflowY: 'auto', maxHeight: '175px' }}>
              {topProducts.map((p, i) => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px', cursor: 'pointer' }}
                  onClick={() => setDrill({ title: `${p.name} Sales`, rows: sales.filter(s => s.item === p.name) })}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7px', color: '#fff', fontWeight: 700, flexShrink: 0 }}>{i+1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '10px', color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginTop: '2px' }}>
                      <div style={{ width: `${topProducts[0].value > 0 ? (p.value / topProducts[0].value) * 100 : 0}%`, height: '100%', background: COLORS[i % COLORS.length], borderRadius: '2px' }} />
                    </div>
                  </div>
                  <div style={{ fontSize: '10px', color: COLORS[i % COLORS.length], fontWeight: 700, flexShrink: 0 }}>{fmt(p.value)}</div>
                </div>
              ))}
            </div>
          ) : <Empty label="No sales data" />}
        </div>

        <div className="card" style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div className="chart-title">⚡ Insights</div>
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '140px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {insights.map((ins, i) => (
              <div key={i} style={{ padding: '5px 7px', background: ibg(ins.type), border: `1px solid ${ibd(ins.type)}`, borderRadius: '5px' }}>
                <div style={{ fontSize: '9px', fontWeight: 700, color: '#fff' }}>{ins.icon} {ins.title}</div>
                <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.65)', marginTop: '1px', lineHeight: 1.3 }}>{ins.text}</div>
              </div>
            ))}
            {insights.length === 0 && <div style={{ fontSize: '9px', color: 'var(--text-dim)', textAlign: 'center', padding: '10px' }}>No insights for selected period</div>}
          </div>
          <button className="btn btn-primary" style={{ fontSize: '10px', padding: '5px 8px' }} onClick={openNewSale}>+ New Sale</button>
          <button className="btn btn-success" style={{ fontSize: '10px', padding: '5px 8px' }} onClick={openNewExpense}>+ Expense</button>
        </div>
      </div>

      {/* Row 3: Payment Mix + Channel + MTD */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
        <div className="card chart-card" style={{ padding: '12px' }}>
          <div className="chart-title">Payment Mix</div>
          {paymentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={165}>
              <PieChart>
                <Pie data={paymentData} cx="50%" cy="50%" innerRadius={38} outerRadius={62} dataKey="value" onClick={e => drillByPayment(e.name)}>
                  {paymentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} cursor="pointer" />)}
                </Pie>
                <Tooltip formatter={(v: number) => [fmt(v), '']} contentStyle={{ background: '#1a1f2e', border: '1px solid #2d3748', fontSize: '10px' }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '9px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <Empty label="No payment data" />}
        </div>

        <div className="card chart-card" style={{ padding: '12px' }}>
          <div className="chart-title">Revenue by Channel</div>
          {channelData.length > 0 ? (
            <ResponsiveContainer width="100%" height={165}>
              <BarChart data={channelData} layout="vertical" onClick={e => e?.activePayload && drillByChannel(e.activePayload[0].payload.name)} style={{ cursor: 'pointer' }}>
                <XAxis type="number" tick={{ fill: '#718096', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#718096', fontSize: 8 }} axisLine={false} tickLine={false} width={65} />
                <Tooltip formatter={(v: number) => [fmt(v), 'Revenue']} contentStyle={{ background: '#1a1f2e', border: '1px solid #2d3748', fontSize: '10px' }} />
                <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                  {channelData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty label="No channel data" />}
        </div>

        <div className="card chart-card" style={{ padding: '12px' }}>
          <div className="chart-title">MTD Cumulative vs Target</div>
          {mtdData.length > 0 ? (
            <ResponsiveContainer width="100%" height={165}>
              <LineChart data={mtdData}>
                <XAxis dataKey="date" tick={{ fill: '#718096', fontSize: 8 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#718096', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [fmt(v), '']} contentStyle={{ background: '#1a1f2e', border: '1px solid #2d3748', fontSize: '10px' }} />
                <Line type="monotone" dataKey="cum" stroke="#D97706" strokeWidth={2} dot={false} name="Actual" />
                <Line type="monotone" dataKey="target" stroke="#4F46E5" strokeWidth={1} strokeDasharray="4 2" dot={false} name="Target" />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '9px' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <Empty label="No data for period" />}
        </div>
      </div>

      {/* Row 4: Transaction Log + Rep Leaderboard */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginBottom: '8px' }}>
        <div className="card" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div className="chart-title" style={{ marginBottom: 0 }}>Transaction Log</div>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{sales.length} records · {bounds.label}</span>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: '260px' }}>
            <table>
              <thead><tr><th>Date</th><th>Time</th><th>Customer</th><th>Item</th><th>Ch.</th><th>Qty</th><th>Amount</th><th>Payment</th><th>Status</th></tr></thead>
              <tbody>
                {sales.slice(0, 150).map(s => (
                  <tr key={s.id}>
                    <td style={{ fontSize: '8px' }}>{s.date}</td>
                    <td style={{ fontSize: '8px' }}>{s.time || '-'}</td>
                    <td>{s.customer}</td>
                    <td style={{ fontWeight: 600 }}>{s.item}</td>
                    <td><span style={{ fontSize: '7px', padding: '1px 4px', background: 'rgba(79,70,229,0.15)', borderRadius: '3px', color: '#818CF8' }}>{s.channel}</span></td>
                    <td style={{ textAlign: 'center' }}>{s.qty}</td>
                    <td style={{ color: '#D97706', fontWeight: 700 }}>{fmt(s.total)}</td>
                    <td style={{ fontSize: '8px' }}>{s.payment}</td>
                    <td><span className={`status-badge ${s.status === 'Completed' ? 'status-completed' : 'status-progress'}`} style={{ fontSize: '7px' }}>{s.status}</span></td>
                  </tr>
                ))}
                {sales.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px' }}>No transactions for {bounds.label}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ padding: '12px' }}>
          <div className="chart-title">Sales Rep Leaderboard</div>
          {Object.entries(byRep).sort((a, b) => b[1] - a[1]).map(([name, rev], i) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}
              onClick={() => setDrill({ title: `${name}'s Sales`, rows: sales.filter(s => s.rep === name) })}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7px', color: '#fff', fontWeight: 700, flexShrink: 0 }}>{i+1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '10px', color: '#fff', fontWeight: 600 }}>{name}</span>
                  <span style={{ fontSize: '9px', color: COLORS[i % COLORS.length], fontWeight: 700 }}>{fmt(rev)}</span>
                </div>
                <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                  <div style={{ width: `${revenue > 0 ? (rev / revenue) * 100 : 0}%`, height: '100%', background: COLORS[i % COLORS.length], borderRadius: '2px' }} />
                </div>
                <div style={{ fontSize: '8px', color: 'var(--text-dim)', marginTop: '1px' }}>{sales.filter(s => s.rep === name).length} sales</div>
              </div>
            </div>
          ))}
          {Object.keys(byRep).length === 0 && <div style={{ fontSize: '9px', color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>No data</div>}
        </div>
      </div>

      {/* Drill-through Modal */}
      {drill && (
        <div className="drillthrough-overlay" onClick={() => setDrill(null)}>
          <div className="drillthrough-panel" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>{drill.title}</h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{drill.rows.length} records · Total: {fmt(drill.rows.reduce((a, b) => a + b.total, 0))}</span>
                <button className="btn btn-secondary" style={{ fontSize: '9px', padding: '3px 8px' }} onClick={() => setDrill(null)}>✕ Close</button>
              </div>
            </div>
            <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
              <table>
                <thead><tr><th>Date</th><th>Customer</th><th>Item</th><th>Channel</th><th>Qty</th><th>Amount</th><th>Payment</th><th>Status</th></tr></thead>
                <tbody>
                  {drill.rows.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontSize: '8px' }}>{r.date}</td><td>{r.customer}</td><td style={{ fontWeight: 600 }}>{r.item}</td>
                      <td style={{ fontSize: '8px' }}>{r.channel}</td><td style={{ textAlign: 'center' }}>{r.qty}</td>
                      <td style={{ color: '#D97706', fontWeight: 700 }}>{fmt(r.total)}</td><td style={{ fontSize: '8px' }}>{r.payment}</td>
                      <td><span className={`status-badge ${r.status === 'Completed' ? 'status-completed' : 'status-progress'}`} style={{ fontSize: '7px' }}>{r.status}</span></td>
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

function KpiCard({ label, value, sub, color, onClick }: { label: string; value: string; sub: string; color: string; onClick?: () => void }) {
  return (
    <div className="card" style={{ padding: '7px 11px', borderLeft: `3px solid ${color}`, cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <div style={{ fontSize: '8px', color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: '17px', fontWeight: 700, color, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: '8px', color: 'var(--text-muted)', marginTop: '1px' }}>{sub}</div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div style={{ height: '165px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '10px' }}>{label}</div>;
}

function NewSaleForm({ onDone }: { onDone: () => void }) {
  const data = getData();
  const items = useMemo(() => {
    const fromInv = data.inventory.map(i => i.name);
    const fromSales = Array.from(new Set(data.sales.map(s => s.item)));
    return Array.from(new Set([...fromInv, ...fromSales])).sort();
  }, [data]);
  const [form, setForm] = useState({ customer: '', contact: '', channel: 'Walk-In', rep: 'Yvonne', item: '', partNo: '', qty: '1', price: '', payment: 'Cash', vehicle: '', notes: '' });
  const total = (parseInt(form.qty) || 0) * (parseFloat(form.price) || 0);
  const submit = () => {
    if (!form.customer || !form.item || !form.price) return;
    const receipt = `AGL-RCT-${String(data.settings.receiptCounter).padStart(3, '0')}`;
    updateData(d => {
      d.sales.push({ id: `s_${Date.now()}`, date: new Date().toISOString().slice(0,10), time: new Date().toTimeString().slice(0,5), customer: form.customer, contact: form.contact, channel: form.channel, rep: form.rep, item: form.partNo ? `${form.item} (${form.partNo})` : form.item, qty: parseInt(form.qty)||1, price: parseFloat(form.price)||0, total, payment: form.payment, receipt, status: 'Completed', vehicle: form.vehicle, notes: form.notes });
      d.settings.receiptCounter++;
    });
    onDone();
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div className="form-group"><label className="form-label">Customer *</label><input className="form-control" value={form.customer} onChange={e => setForm(f=>({...f,customer:e.target.value}))} /></div>
        <div className="form-group"><label className="form-label">Contact</label><input className="form-control" value={form.contact} onChange={e => setForm(f=>({...f,contact:e.target.value}))} /></div>
        <div className="form-group"><label className="form-label">Item / Service *</label>
          <select className="form-control" value={form.item} onChange={e => { const sel=data.inventory.find(i=>i.name===e.target.value); setForm(f=>({...f,item:e.target.value,partNo:sel?.sku||'',price:sel?String(sel.sell):f.price})); }}>
            <option value="">Select item...</option>{items.map(i=><option key={i}>{i}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Part No / SKU</label><input className="form-control" value={form.partNo} onChange={e => setForm(f=>({...f,partNo:e.target.value}))} placeholder="e.g. NGK-93175" /></div>
        <div className="form-group"><label className="form-label">Qty</label><input type="number" className="form-control" value={form.qty} onChange={e => setForm(f=>({...f,qty:e.target.value}))} min="1" /></div>
        <div className="form-group"><label className="form-label">Unit Price (GHS) *</label><input type="number" className="form-control" value={form.price} onChange={e => setForm(f=>({...f,price:e.target.value}))} /></div>
        <div className="form-group"><label className="form-label">Channel</label>
          <select className="form-control" value={form.channel} onChange={e => setForm(f=>({...f,channel:e.target.value}))}>
            {['Walk-In','WhatsApp','Phone','Facebook','Instagram','Wholesale','Workshop'].map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Payment</label>
          <select className="form-control" value={form.payment} onChange={e => setForm(f=>({...f,payment:e.target.value}))}>
            {['Cash','MoMo','Bank Transfer','Credit'].map(p=><option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Sales Rep</label>
          <select className="form-control" value={form.rep} onChange={e => setForm(f=>({...f,rep:e.target.value}))}>
            {['Yvonne','Abigail','Ben','Appiah','Kojo','Fatawu','Chris'].map(r=><option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Vehicle Reg</label><input className="form-control" value={form.vehicle} onChange={e => setForm(f=>({...f,vehicle:e.target.value}))} placeholder="GR-1234-24" /></div>
      </div>
      {total > 0 && <div style={{ padding: '8px 12px', background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.3)', borderRadius: '6px', fontFamily: 'Georgia,serif', fontSize: '15px', fontWeight: 700, color: '#D97706' }}>Total: {fmtGHS(total)}</div>}
      <div className="form-group"><label className="form-label">Notes</label><input className="form-control" value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} /></div>
      <button className="btn btn-primary" onClick={submit}>Record Sale</button>
    </div>
  );
}

function NewExpenseForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({ item: '', supplier: '', amount: '', purpose: '' });
  const submit = () => {
    if (!form.item || !form.amount) return;
    updateData(d => { d.expenses.push({ id: `e_${Date.now()}`, date: new Date().toISOString().slice(0,10), item: form.item, supplier: form.supplier, amount: parseFloat(form.amount)||0, purpose: form.purpose }); });
    onDone();
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div className="form-group"><label className="form-label">Description *</label><input className="form-control" value={form.item} onChange={e => setForm(f=>({...f,item:e.target.value}))} /></div>
      <div className="form-group"><label className="form-label">Supplier</label><input className="form-control" value={form.supplier} onChange={e => setForm(f=>({...f,supplier:e.target.value}))} /></div>
      <div className="form-group"><label className="form-label">Amount (GHS) *</label><input type="number" className="form-control" value={form.amount} onChange={e => setForm(f=>({...f,amount:e.target.value}))} /></div>
      <div className="form-group"><label className="form-label">Purpose</label><input className="form-control" value={form.purpose} onChange={e => setForm(f=>({...f,purpose:e.target.value}))} /></div>
      <button className="btn btn-primary" onClick={submit}>Record Expense</button>
    </div>
  );
}
