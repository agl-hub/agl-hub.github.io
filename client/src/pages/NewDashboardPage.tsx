<<<<<<< Updated upstream
// import NewAppLayout from "@/components/NewAppLayout";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";
import FilterBar from "@/components/FilterBar";
import LiveInsightsBanner from "@/components/LiveInsightsBanner";
=======
import { useEffect, useRef, useMemo, useCallback } from 'react';
import { getData, fmtGHS } from '../lib/dataStore';
import { useLayout } from '../components/MainLayout';
>>>>>>> Stashed changes

declare const Chart: any;

export default function NewDashboardPage() {
  const { openModal, openSlidePanel, filterState } = useLayout();
  const chartWeeklyRef = useRef<HTMLCanvasElement>(null);
  const chartPaymentRef = useRef<HTMLCanvasElement>(null);
  const chartChannelsRef = useRef<HTMLCanvasElement>(null);
  const chartMTDRef = useRef<HTMLCanvasElement>(null);
  const chartCatRef = useRef<HTMLCanvasElement>(null);
  const chartsRef = useRef<any[]>([]);

  const data = getData();

<<<<<<< Updated upstream
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#0f172a" }}>
        <FilterBar showDateRange showStatus showChannel showPaymentMethod />
        <div style={{ padding: "0 2rem" }}>
          <LiveInsightsBanner maxAlerts={3} />
        </div>
        <div style={{ display: "flex", gap: "2rem", padding: "2rem", height: "100%", overflow: "auto", flex: 1 }}>
          {/* Main Panel */}
          <div style={{ flex: 1 }}>
            {/* KPI Section */}
            <div style={{ marginBottom: "2rem" }}>
              <div style={{ fontSize: "0.875rem", color: "#7a8294", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "1rem", fontWeight: "600" }}>
                Today
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                {kpiData.map((kpi, idx) => (
                  <div key={idx} style={{
                    background: "linear-gradient(135deg, rgba(227, 6, 19, 0.05) 0%, rgba(20, 184, 166, 0.05) 100%)",
                    border: "1px solid #2a3447",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#e30613";
                      e.currentTarget.style.background = "linear-gradient(135deg, rgba(227, 6, 19, 0.1) 0%, rgba(20, 184, 166, 0.08) 100%)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#2a3447";
                      e.currentTarget.style.background = "linear-gradient(135deg, rgba(227, 6, 19, 0.05) 0%, rgba(20, 184, 166, 0.05) 100%)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{ fontSize: "0.875rem", color: "#b0b8c8", marginBottom: "0.5rem", fontWeight: "500" }}>
                      {kpi.title}
                    </div>
                    <div style={{ fontSize: "2rem", fontWeight: "700", color: "#ffffff", marginBottom: "0.5rem" }}>
                      {kpi.value}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: kpi.positive ? "#14b8a6" : "#e30613" }}>
                      {kpi.positive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      {kpi.change}
                    </div>
                  </div>
                ))}
              </div>
            </div>
=======
  // Filter sales
  const filteredSales = useMemo(() => {
    let sales = [...data.sales];
    if (filterState.staff) sales = sales.filter(s => s.rep === filterState.staff);
    if (filterState.channel) sales = sales.filter(s => s.channel === filterState.channel);
    if (filterState.payment) sales = sales.filter(s => s.payment === filterState.payment);
    return sales.sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
  }, [data.sales, filterState]);
>>>>>>> Stashed changes

  // KPI calculations
  const totalRevenue = filteredSales.reduce((s, x) => s + x.total, 0);
  const totalExpenses = data.expenses.reduce((s, x) => s + x.amount, 0);
  const totalPOs = data.purchaseOrders.reduce((s, x) => s + x.amount, 0);
  const totalOutflow = totalExpenses + totalPOs;
  const netPosition = totalRevenue - totalOutflow;
  const avgTxn = filteredSales.length ? totalRevenue / filteredSales.length : 0;

  // Payment breakdown
  const cashTotal = filteredSales.filter(s => s.payment === 'Cash').reduce((a, b) => a + b.total, 0);
  const momoTotal = filteredSales.filter(s => s.payment === 'MoMo').reduce((a, b) => a + b.total, 0);
  const bankTotal = filteredSales.filter(s => s.payment === 'Bank Transfer').reduce((a, b) => a + b.total, 0);
  const creditTotal = filteredSales.filter(s => s.payment === 'Credit').reduce((a, b) => a + b.total, 0);
  const workshopJobs = data.workshop.filter(w => w.status !== 'Completed').length;
  const conversion = filteredSales.length ? Math.round((filteredSales.filter(s => s.status === 'Completed').length / filteredSales.length) * 100) : 0;

  // Top products
  const productMap: Record<string, number> = {};
  filteredSales.forEach(s => { productMap[s.item] = (productMap[s.item] || 0) + s.total; });
  const topProducts = Object.entries(productMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxProd = topProducts.length ? topProducts[0][1] : 1;

  // Revenue by day
  const dailyRevenue: Record<string, number> = {};
  filteredSales.forEach(s => { dailyRevenue[s.date] = (dailyRevenue[s.date] || 0) + s.total; });
  const sortedDays = Object.keys(dailyRevenue).sort();

  // Sales rep leaderboard
  const repMap: Record<string, number> = {};
  filteredSales.forEach(s => { repMap[s.rep] = (repMap[s.rep] || 0) + s.total; });
  const repLeaderboard = Object.entries(repMap).sort((a, b) => b[1] - a[1]);

  // Revenue velocity
  const todaySales = filteredSales.filter(s => s.date === new Date().toISOString().slice(0, 10));
  const todayRevenue = todaySales.reduce((a, b) => a + b.total, 0);
  const hoursElapsed = Math.max(1, new Date().getHours() - 8);
  const revPerHour = todayRevenue / hoursElapsed;
  const projectedToday = revPerHour * 10;

  // Margins
  const profitMargin = totalRevenue > 0 ? ((netPosition / totalRevenue) * 100) : 0;
  const expenseRatio = totalRevenue > 0 ? ((totalOutflow / totalRevenue) * 100) : 0;

  // Insights
  const insights = useMemo(() => {
    const ins: { type: string; icon: string; title: string; text: string }[] = [];
    if (totalRevenue > 30000) ins.push({ type: 'positive', icon: '\u{1F4C8}', title: 'Strong Revenue', text: `Total revenue of ${fmtGHS(totalRevenue)} exceeds GHS 30,000 target` });
    if (profitMargin > 40) ins.push({ type: 'positive', icon: '\u{1F4B0}', title: 'Healthy Margins', text: `Profit margin at ${profitMargin.toFixed(1)}% — well above 30% threshold` });
    if (expenseRatio > 50) ins.push({ type: 'negative', icon: '\u26A0\uFE0F', title: 'High Expense Ratio', text: `Expenses consuming ${expenseRatio.toFixed(1)}% of revenue — review spending` });
    if (workshopJobs > 5) ins.push({ type: 'warning', icon: '\u{1F527}', title: 'Workshop Backlog', text: `${workshopJobs} active workshop jobs — consider capacity planning` });
    const creditSales = filteredSales.filter(s => s.payment === 'Credit');
    if (creditSales.length > 5) ins.push({ type: 'warning', icon: '\u{1F4B3}', title: 'Credit Sales Rising', text: `${creditSales.length} credit transactions — monitor collection` });
    if (topProducts.length > 0) ins.push({ type: 'info', icon: '\u{1F3C6}', title: 'Best Seller', text: `${topProducts[0][0]} leading with ${fmtGHS(topProducts[0][1])} in sales` });
    return ins;
  }, [totalRevenue, profitMargin, expenseRatio, workshopJobs, filteredSales, topProducts]);

  // Charts
  useEffect(() => {
    if (typeof Chart === 'undefined') return;
    chartsRef.current.forEach(c => c?.destroy());
    chartsRef.current = [];

    const baseOpts = {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#718096', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.03)' } },
        y: { ticks: { color: '#718096', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.03)' } },
      },
    };

    if (chartWeeklyRef.current) {
      chartsRef.current.push(new Chart(chartWeeklyRef.current, {
        type: 'bar',
        data: { labels: sortedDays.map(d => d.slice(5)), datasets: [{ data: sortedDays.map(d => dailyRevenue[d]), backgroundColor: 'rgba(22,160,133,0.6)', borderRadius: 4 }] },
        options: baseOpts,
      }));
    }

    if (chartPaymentRef.current) {
      chartsRef.current.push(new Chart(chartPaymentRef.current, {
        type: 'doughnut',
        data: { labels: ['Cash','MoMo','Bank','Credit'], datasets: [{ data: [cashTotal, momoTotal, bankTotal, creditTotal], backgroundColor: ['#16A085','#F39C12','#3B82F6','#E30613'] }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#A0AEC0', font: { size: 9 } } } } },
      }));
    }

    if (chartChannelsRef.current) {
      const channelMap: Record<string, number> = {};
      filteredSales.forEach(s => { channelMap[s.channel] = (channelMap[s.channel] || 0) + s.total; });
      const chLabels = Object.keys(channelMap);
      chartsRef.current.push(new Chart(chartChannelsRef.current, {
        type: 'bar',
        data: { labels: chLabels, datasets: [{ data: chLabels.map(c => channelMap[c]), backgroundColor: '#E30613', borderRadius: 4 }] },
        options: { ...baseOpts, indexAxis: 'y' as const },
      }));
    }

    if (chartMTDRef.current) {
      let cumulative = 0;
      const cumData = sortedDays.map(d => { cumulative += dailyRevenue[d]; return cumulative; });
      const targetLine = sortedDays.map((_, i) => (50000 / 30) * (i + 1));
      chartsRef.current.push(new Chart(chartMTDRef.current, {
        type: 'line',
        data: { labels: sortedDays.map(d => d.slice(5)), datasets: [
          { label: 'Actual', data: cumData, borderColor: '#16A085', backgroundColor: 'rgba(22,160,133,0.1)', fill: true, tension: 0.3 },
          { label: 'Target', data: targetLine, borderColor: '#E30613', borderDash: [5, 5], pointRadius: 0 },
        ] },
        options: { ...baseOpts, plugins: { legend: { display: true, labels: { color: '#A0AEC0', font: { size: 9 } } } } },
      }));
    }

    if (chartCatRef.current) {
      const catMap: Record<string, number> = {};
      filteredSales.forEach(s => { catMap[s.item] = (catMap[s.item] || 0) + s.total; });
      const catLabels = Object.keys(catMap).slice(0, 6);
      const colors = ['#E30613','#16A085','#F39C12','#3B82F6','#E67E22','#8B5CF6'];
      chartsRef.current.push(new Chart(chartCatRef.current, {
        type: 'pie',
        data: { labels: catLabels, datasets: [{ data: catLabels.map(c => catMap[c]), backgroundColor: colors }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#A0AEC0', font: { size: 8 } } } } },
      }));
    }

    return () => { chartsRef.current.forEach(c => c?.destroy()); };
  }, [filteredSales, sortedDays]);

  const openKPIDrilldown = useCallback((type: string) => {
    openModal(
      <div>
        <h3 style={{ fontFamily: 'Rajdhani', marginBottom: '18px', color: '#fff' }}>
          {type === 'revenue' ? 'Revenue Breakdown' : type === 'outflow' ? 'Outflow Breakdown' : type === 'net' ? 'Net Position Details' : 'Conversion Details'}
        </h3>
        <div className="finance-metric"><span className="fm-label">Total Revenue</span><span className="fm-value" style={{ color: '#1ABC9C' }}>{fmtGHS(totalRevenue)}</span></div>
        <div className="finance-metric"><span className="fm-label">Total Expenses</span><span className="fm-value" style={{ color: '#FF2D3A' }}>{fmtGHS(totalExpenses)}</span></div>
        <div className="finance-metric"><span className="fm-label">Purchase Orders</span><span className="fm-value" style={{ color: '#F39C12' }}>{fmtGHS(totalPOs)}</span></div>
        <div className="finance-metric"><span className="fm-label">Net Position</span><span className="fm-value" style={{ color: netPosition >= 0 ? '#1ABC9C' : '#FF2D3A' }}>{fmtGHS(netPosition)}</span></div>
        <div className="finance-metric"><span className="fm-label">Transactions</span><span className="fm-value">{filteredSales.length}</span></div>
      </div>
    );
  }, [totalRevenue, totalExpenses, totalPOs, netPosition, filteredSales, openModal]);

  const last7Days = sortedDays.slice(-7);
  const maxDayRev = Math.max(...last7Days.map(d => dailyRevenue[d] || 0), 1);

  return (
    <div>
      {/* ROW 1: Core Financial KPIs */}
      <div className="grid grid-4" style={{ marginBottom: '8px' }}>
        <div className="card kpi-card green clickable" onClick={() => openKPIDrilldown('revenue')}>
          <div className="kpi-label">Gross Revenue</div>
          <div className="kpi-value">{fmtGHS(totalRevenue)}</div>
          <div className="kpi-sub">{filteredSales.length} transactions</div>
        </div>
        <div className="card kpi-card red clickable" onClick={() => openKPIDrilldown('outflow')}>
          <div className="kpi-label">Total Outflow</div>
          <div className="kpi-value">{fmtGHS(totalOutflow)}</div>
          <div className="kpi-sub">Expenses + POs</div>
        </div>
        <div className="card kpi-card clickable" onClick={() => openKPIDrilldown('net')} style={{ borderTopColor: netPosition >= 0 ? '#16A085' : '#E30613' }}>
          <div className="kpi-label">Net Position</div>
          <div className="kpi-value" style={{ color: netPosition >= 0 ? '#1ABC9C' : '#FF2D3A' }}>{fmtGHS(netPosition)}</div>
          <div className="kpi-sub">{netPosition >= 0 ? 'Positive' : 'Negative'}</div>
        </div>
        <div className="card kpi-card gold clickable" onClick={() => openKPIDrilldown('conversion')}>
          <div className="kpi-label">Avg Transaction</div>
          <div className="kpi-value">{fmtGHS(avgTxn)}</div>
          <div className="kpi-sub">Per sale</div>
        </div>
      </div>

      {/* ROW 2: Payment Breakdown */}
      <div className="grid grid-5" style={{ marginBottom: '8px' }}>
        <div className="card kpi-card"><div className="kpi-label">Cash</div><div className="kpi-value" style={{ color: '#1ABC9C' }}>{fmtGHS(cashTotal)}</div></div>
        <div className="card kpi-card"><div className="kpi-label">MoMo</div><div className="kpi-value" style={{ color: '#F39C12' }}>{fmtGHS(momoTotal)}</div></div>
        <div className="card kpi-card"><div className="kpi-label">Bank</div><div className="kpi-value" style={{ color: '#3B82F6' }}>{fmtGHS(bankTotal)}</div></div>
        <div className="card kpi-card navy"><div className="kpi-label">Workshop Jobs</div><div className="kpi-value">{workshopJobs}</div></div>
        <div className="card kpi-card amber"><div className="kpi-label">Conversion</div><div className="kpi-value">{conversion}%</div></div>
      </div>

      {/* ROW 3: Revenue Trend + Top Products + Insights */}
      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr 1fr', marginBottom: '8px' }}>
        <div className="card chart-card">
          <h4>Revenue Trend</h4>
          <div className="chart-container"><canvas ref={chartWeeklyRef} /></div>
        </div>
        <div className="card" style={{ padding: '10px' }}>
          <h4 style={{ color: 'var(--text-dim)', marginBottom: '6px', fontSize: '9pt', fontFamily: 'Rajdhani', fontWeight: 600, letterSpacing: '0.5px' }}>Top Products / Services</h4>
          <div style={{ overflowY: 'auto', maxHeight: '190px' }}>
            {topProducts.map(([name, val]) => (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '11px' }}>
                <span style={{ color: 'var(--text)' }}>{name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                    <div style={{ width: `${(val / maxProd) * 100}%`, height: '100%', background: 'var(--green)', borderRadius: '2px' }} />
                  </div>
                  <span style={{ color: 'var(--text-dim)', fontFamily: 'Rajdhani', fontWeight: 600, fontSize: '10px' }}>{fmtGHS(val)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: '10px' }}>
          <h4 style={{ color: 'var(--text-dim)', marginBottom: '6px', fontSize: '9pt', fontFamily: 'Rajdhani', fontWeight: 600, letterSpacing: '0.5px' }}>{'\u26A1'} Insights</h4>
          <div style={{ overflowY: 'auto', maxHeight: '150px' }}>
            {insights.map((ins, i) => (
              <div key={i} className="insight-card">
                <div className={`insight-icon ${ins.type}`}>{ins.icon}</div>
                <div className="insight-text"><h5>{ins.title}</h5><p>{ins.text}</p></div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button className="btn btn-primary btn-sm" onClick={() => openSlidePanel('New Sale', <div style={{ color: 'var(--text-dim)' }}>Quick sale form coming soon</div>)} style={{ width: '100%', justifyContent: 'center' }}>+ New Sale</button>
            <button className="btn btn-success btn-sm" onClick={() => openSlidePanel('New Expense', <div style={{ color: 'var(--text-dim)' }}>Expense form coming soon</div>)} style={{ width: '100%', justifyContent: 'center' }}>+ Expense</button>
          </div>
        </div>
      </div>

      {/* ROW 4: Payment Mix + Channels + MTD */}
      <div className="grid grid-3" style={{ marginBottom: '8px' }}>
        <div className="card chart-card"><h4>Payment Mix</h4><div className="chart-container"><canvas ref={chartPaymentRef} /></div></div>
        <div className="card chart-card"><h4>Revenue by Channel</h4><div className="chart-container"><canvas ref={chartChannelsRef} /></div></div>
        <div className="card chart-card"><h4>MTD Cumulative vs Target</h4><div className="chart-container"><canvas ref={chartMTDRef} /></div></div>
      </div>

      {/* ROW 5: Transaction Log */}
      <div className="card" style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <h4 style={{ color: 'var(--text-dim)', fontFamily: 'Rajdhani', fontWeight: 600, letterSpacing: '0.5px' }}>Transaction Log</h4>
          <span style={{ fontSize: '8pt', color: 'var(--text-muted)' }}>{filteredSales.length} records</span>
        </div>
        <div style={{ overflowX: 'auto', maxHeight: '200px', overflowY: 'auto' }}>
          <table>
            <thead style={{ position: 'sticky', top: 0, background: 'rgba(16,20,30,0.95)', zIndex: 1 }}>
              <tr><th>Time</th><th>Customer</th><th>Item</th><th>Channel</th><th>Qty</th><th>Amount</th><th>Payment</th><th>Receipt</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filteredSales.slice(0, 50).map(s => (
                <tr key={s.id}>
                  <td>{s.time}</td><td>{s.customer}</td><td>{s.item}</td><td>{s.channel}</td>
                  <td>{s.qty}</td><td style={{ color: '#1ABC9C', fontWeight: 600 }}>{fmtGHS(s.total)}</td>
                  <td>{s.payment}</td><td style={{ fontFamily: 'monospace', fontSize: '8pt' }}>{s.receipt}</td>
                  <td><span className={`status-badge status-${s.status.toLowerCase().replace(/\s+/g, '')}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ROW 6: Revenue Velocity + Profit Margin + Expense Gauge */}
      <div className="grid grid-3" style={{ marginBottom: '8px' }}>
        <div className="card" style={{ padding: '10px' }}>
          <div className="kpi-label">Revenue Velocity</div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
            <div><div style={{ fontSize: '8pt', color: 'var(--text-dim)' }}>Per Hour</div><div style={{ fontFamily: 'Rajdhani', fontSize: '16px', fontWeight: 700, color: 'var(--green)' }}>{fmtGHS(revPerHour)}</div></div>
            <div><div style={{ fontSize: '8pt', color: 'var(--text-dim)' }}>Projected Today</div><div style={{ fontFamily: 'Rajdhani', fontSize: '16px', fontWeight: 700, color: 'var(--primary-light)' }}>{fmtGHS(projectedToday)}</div></div>
          </div>
        </div>
        <div className="card kpi-card" style={{ padding: '10px' }}>
          <div className="kpi-label">Gross Profit Margin</div>
          <div className="kpi-value" style={{ fontSize: '22px', marginTop: '6px' }}>{profitMargin.toFixed(1)}%</div>
          <div className="progress-bar" style={{ marginTop: '6px' }}>
            <div className="fill" style={{ width: `${Math.min(100, Math.max(0, profitMargin))}%`, background: profitMargin > 30 ? 'var(--green)' : 'var(--red)' }} />
          </div>
          <div className="kpi-sub">Revenue - Expenses - POs</div>
        </div>
        <div className="card kpi-card" style={{ padding: '10px' }}>
          <div className="kpi-label">Expense-to-Revenue Ratio</div>
          <div style={{ position: 'relative', width: '90px', height: '50px', margin: '8px auto 0', overflow: 'hidden' }}>
            <svg viewBox="0 0 100 50" style={{ width: '100%', height: '100%' }}>
              <path d="M5,50 A45,45 0 0,1 95,50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" strokeLinecap="round" />
              <path d="M5,50 A45,45 0 0,1 95,50" fill="none" stroke={expenseRatio < 30 ? 'var(--green)' : expenseRatio < 60 ? 'var(--amber)' : 'var(--red)'} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(expenseRatio / 100) * 142} 142`} />
            </svg>
            <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', fontFamily: 'Rajdhani', fontSize: '14px', fontWeight: 700, color: '#fff' }}>{expenseRatio.toFixed(0)}%</div>
          </div>
          <div className="kpi-sub">Healthy: &lt;30%</div>
        </div>
      </div>

      {/* ROW 7: Top Reps + Daily Comparison + Category Mix */}
      <div className="grid grid-3" style={{ marginBottom: '8px' }}>
        <div className="card" style={{ padding: '10px' }}>
          <h4 style={{ color: 'var(--text-dim)', marginBottom: '6px', fontSize: '9pt', fontFamily: 'Rajdhani', fontWeight: 600 }}>Top Sales Reps</h4>
          {repLeaderboard.map(([name, val]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="staff-avatar">{name.charAt(0)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{name}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{filteredSales.filter(s => s.rep === name).length} sales</div>
              </div>
              <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, color: 'var(--green)' }}>{fmtGHS(val)}</div>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: '10px' }}>
          <h4 style={{ color: 'var(--text-dim)', marginBottom: '6px', fontSize: '9pt', fontFamily: 'Rajdhani', fontWeight: 600 }}>Daily Comparison</h4>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '100px' }}>
            {last7Days.map(d => (
              <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', background: 'rgba(22,160,133,0.6)', borderRadius: '3px 3px 0 0', height: `${((dailyRevenue[d] || 0) / maxDayRev) * 80}px`, transition: 'height .3s' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            {last7Days.map(d => (
              <div key={d} style={{ flex: 1, textAlign: 'center', fontSize: '8px', color: 'var(--text-muted)' }}>{d.slice(8)}</div>
            ))}
          </div>
        </div>
        <div className="card chart-card" style={{ padding: '10px' }}>
          <h4 style={{ fontSize: '9pt' }}>Product Category Mix</h4>
          <div className="chart-container" style={{ height: '160px' }}><canvas ref={chartCatRef} /></div>
        </div>
      </div>
    </div>
  );
}
