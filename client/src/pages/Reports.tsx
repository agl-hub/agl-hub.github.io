import { useState, useMemo, useRef, useEffect } from 'react';
import { getData, fmtGHS } from '../lib/dataStore';
import type { Sale, Expense, WorkshopJob } from '../lib/dataStore';

// ── Palette ─────────────────────────────────────────────────────────────────
const C = {
  amber:   '#D97706', amberL: '#F59E0B',
  indigo:  '#4F46E5', indigoL: '#6366F1',
  ruby:    '#BE123C', rubyL:  '#E11D48',
  emerald: '#059669', emeraldL:'#10B981',
  maroon:  '#7F1D1D',
  violet:  '#7C3AED',
  cyan:    '#0891B2',
  beige:   '#F5F0E8',
  muted:   '#8A7F72',
  dim:     '#C4B9A8',
};
const CHART_COLORS = [C.amber, C.indigo, C.ruby, C.emerald, C.maroon, C.violet, C.cyan, C.amberL];

type ReportType = 'daily' | 'weekly' | 'monthly' | 'full';

// ── DAX-style measure helpers ────────────────────────────────────────────────
function sumBy<T>(arr: T[], fn: (x: T) => number) { return arr.reduce((s, x) => s + fn(x), 0); }
function groupBy<T>(arr: T[], key: (x: T) => string): Record<string, T[]> {
  return arr.reduce((m, x) => { const k = key(x); (m[k] = m[k] || []).push(x); return m; }, {} as Record<string, T[]>);
}
function pct(n: number, d: number) { return d > 0 ? Math.round((n / d) * 100) : 0; }
function growthRate(curr: number, prev: number) {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
}
function weekOfMonth(dateStr: string) {
  const d = new Date(dateStr);
  return Math.ceil(d.getDate() / 7);
}
function dayOfWeek(dateStr: string) {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  return days[new Date(dateStr).getDay()];
}

// ── Sparkline component ──────────────────────────────────────────────────────
function Sparkline({ data, color = C.amber, height = 32 }: { data: number[]; color?: string; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;
    const min = Math.min(...data), max = Math.max(...data);
    const range = max - min || 1;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    ctx.fillStyle = color + '22';
    ctx.fill();
  }, [data, color, height]);
  return <canvas ref={canvasRef} width={120} height={height} style={{ display: 'block', width: '100%' }} />;
}

// ── Mini bar chart ───────────────────────────────────────────────────────────
function MiniBar({ value, max, color = C.amber }: { value: number; max: number; color?: string }) {
  const w = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ height: 6, background: 'rgba(245,240,232,0.08)', borderRadius: 3, overflow: 'hidden', width: '100%' }}>
      <div style={{ height: '100%', width: `${w}%`, background: color, borderRadius: 3, transition: 'width 0.4s' }} />
    </div>
  );
}

// ── Drill-through panel ──────────────────────────────────────────────────────
function DrillPanel({ title, rows, onClose }: { title: string; rows: Sale[]; onClose: () => void }) {
  return (
    <div className="drillthrough-overlay" onClick={onClose}>
      <div className="drillthrough-panel" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ margin: 0, color: C.amberL, fontSize: 14 }}>{title}</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕ Close</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr><th>Date</th><th>Customer</th><th>Item</th><th>Channel</th><th>Payment</th><th>Rep</th><th style={{ textAlign: 'right' }}>Amount</th></tr>
            </thead>
            <tbody>
              {rows.map(s => (
                <tr key={s.id}>
                  <td style={{ color: C.dim, whiteSpace: 'nowrap' }}>{s.date}</td>
                  <td>{s.customer}</td>
                  <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.item}</td>
                  <td><span style={{ background: C.indigo + '22', color: C.indigoL, padding: '1px 7px', borderRadius: 20, fontSize: 8, fontWeight: 700 }}>{s.channel}</span></td>
                  <td><span style={{ background: C.amber + '22', color: C.amberL, padding: '1px 7px', borderRadius: 20, fontSize: 8, fontWeight: 700 }}>{s.payment}</span></td>
                  <td style={{ color: C.dim }}>{s.rep}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: C.emeraldL }}>{fmtGHS(s.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: `2px solid ${C.amber}44` }}>
                <td colSpan={6} style={{ fontWeight: 700, paddingTop: 8 }}>TOTAL ({rows.length} transactions)</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: C.amberL, paddingTop: 8 }}>{fmtGHS(sumBy(rows, s => s.total))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ num, title, subtitle }: { num: string; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 14, borderBottom: `2px solid ${C.ruby}44`, paddingBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontSize: 9, color: C.ruby, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>{num}</span>
        <h3 style={{ color: C.beige, fontSize: 13, margin: 0, letterSpacing: 0.5 }}>{title}</h3>
      </div>
      {subtitle && <p style={{ fontSize: 9, color: C.muted, margin: '3px 0 0', fontStyle: 'italic' }}>{subtitle}</p>}
    </div>
  );
}

// ── Insight box ──────────────────────────────────────────────────────────────
function Insight({ icon, title, text, variant = 'indigo' }: { icon: string; title: string; text: string; variant?: 'indigo' | 'amber' | 'ruby' }) {
  const colors: Record<string, [string, string]> = { indigo: [C.indigo, C.indigoL], amber: [C.amber, C.amberL], ruby: [C.ruby, C.rubyL] };
  const [bg, fg] = colors[variant];
  return (
    <div style={{ background: bg + '18', border: `1px solid ${bg}33`, borderRadius: 8, padding: '10px 14px', marginBottom: 8 }}>
      <div style={{ fontWeight: 700, color: fg, fontSize: 10, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{icon} {title}</div>
      <div style={{ fontSize: 9.5, color: C.dim, lineHeight: 1.6 }}>{text}</div>
    </div>
  );
}

export default function Reports() {
  const data = getData();
  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [drill, setDrill] = useState<{ title: string; rows: Sale[] } | null>(null);

  const filteredSales = useMemo((): Sale[] => {
    if (reportType === 'daily') return data.sales.filter(s => s.date === selectedDate);
    if (reportType === 'weekly') {
      const d = new Date(selectedDate);
      const day = d.getDay();
      const mon = new Date(d); mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
      return data.sales.filter(s => s.date >= mon.toISOString().slice(0,10) && s.date <= sun.toISOString().slice(0,10));
    }
    if (reportType === 'monthly') return data.sales.filter(s => s.date.startsWith(selectedMonth));
    return data.sales;
  }, [data.sales, reportType, selectedDate, selectedMonth]);

  const filteredExpenses = useMemo((): Expense[] => {
    if (reportType === 'daily') return data.expenses.filter(e => e.date === selectedDate);
    if (reportType === 'weekly') {
      const d = new Date(selectedDate);
      const day = d.getDay();
      const mon = new Date(d); mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
      return data.expenses.filter(e => e.date >= mon.toISOString().slice(0,10) && e.date <= sun.toISOString().slice(0,10));
    }
    if (reportType === 'monthly') return data.expenses.filter(e => e.date.startsWith(selectedMonth));
    return data.expenses;
  }, [data.expenses, reportType, selectedDate, selectedMonth]);

  const filteredWorkshop = useMemo((): WorkshopJob[] => {
    if (reportType === 'daily') return data.workshop.filter(j => j.date === selectedDate);
    if (reportType === 'monthly') return data.workshop.filter(j => j.date.startsWith(selectedMonth));
    return data.workshop;
  }, [data.workshop, reportType, selectedDate, selectedMonth]);

  const measures = useMemo(() => {
    const totalRev = sumBy(filteredSales, s => s.total);
    const totalExp = sumBy(filteredExpenses, e => e.amount);
    const totalPO = sumBy(data.purchaseOrders.filter(p =>
      reportType === 'monthly' ? p.date.startsWith(selectedMonth) : true
    ), p => p.amount);
    const netProfit = totalRev - totalExp - totalPO;
    const txns = filteredSales.length;
    const avgTicket = txns > 0 ? totalRev / txns : 0;
    const uniqueCustomers = new Set(filteredSales.map(s => s.customer)).size;
    const repeatCustomers = Object.values(groupBy(filteredSales, s => s.customer)).filter(g => g.length > 1).length;

    const byChannel = groupBy(filteredSales, s => s.channel);
    const channelRevenue = Object.entries(byChannel).map(([ch, rows]) => ({
      ch, rev: sumBy(rows, s => s.total), txns: rows.length, rows,
    })).sort((a, b) => b.rev - a.rev);

    const byPayment = groupBy(filteredSales, s => s.payment);
    const paymentRevenue = Object.entries(byPayment).map(([pm, rows]) => ({
      pm, rev: sumBy(rows, s => s.total), txns: rows.length,
    })).sort((a, b) => b.rev - a.rev);

    const byItem = groupBy(filteredSales, s => s.item);
    const topItems = Object.entries(byItem).map(([item, rows]) => ({
      item, rev: sumBy(rows, s => s.total), qty: sumBy(rows, s => s.qty), txns: rows.length, rows,
    })).sort((a, b) => b.rev - a.rev).slice(0, 10);

    const byRep = groupBy(filteredSales, s => s.rep);
    const repPerf = Object.entries(byRep).map(([rep, rows]) => ({
      rep, rev: sumBy(rows, s => s.total), txns: rows.length, avg: sumBy(rows, s => s.total) / rows.length,
    })).sort((a, b) => b.rev - a.rev);

    const byDate = groupBy(filteredSales, s => s.date);
    const dailyTrend = Object.entries(byDate).sort((a, b) => a[0].localeCompare(b[0])).map(([date, rows]) => ({
      date, rev: sumBy(rows, s => s.total), txns: rows.length,
    }));

    const dowOrder = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const byDow = groupBy(filteredSales, s => dayOfWeek(s.date));
    const dowAnalysis = dowOrder.map(dow => {
      const rows = byDow[dow] || [];
      return { dow, rev: sumBy(rows, s => s.total), txns: rows.length, avg: rows.length > 0 ? sumBy(rows, s => s.total) / rows.length : 0 };
    }).filter(d => d.txns > 0).sort((a, b) => b.rev - a.rev);

    const byWeek = groupBy(filteredSales, s => `W${weekOfMonth(s.date)}`);
    const weeklyBreakdown = Object.entries(byWeek).sort((a, b) => a[0].localeCompare(b[0])).map(([wk, rows]) => ({
      wk, rev: sumBy(rows, s => s.total), txns: rows.length, days: new Set(rows.map(r => r.date)).size,
    }));

    const wsJobs = filteredWorkshop.length;
    const wsCompleted = filteredWorkshop.filter(j => j.status === 'Completed').length;
    const wsEfficiency = pct(wsCompleted, wsJobs);
    const byMechanic = groupBy(filteredWorkshop, j => j.mechanic);
    const mechanicPerf = Object.entries(byMechanic).map(([mech, jobs]) => ({
      mech, total: jobs.length, done: jobs.filter(j => j.status === 'Completed').length,
    })).sort((a, b) => b.total - a.total);

    const lowStock = data.inventory.filter(i => i.qty <= (i.reorder || 5));
    const totalOwed = sumBy(data.creditors, c => c.amount - c.paid);
    const overdueCreditors = data.creditors.filter(c => c.dueDate < new Date().toISOString().slice(0,10) && c.amount > c.paid);

    let prevRev = 0;
    if (reportType === 'monthly') {
      const [yr, mo] = selectedMonth.split('-').map(Number);
      const prevMo = mo === 1 ? `${yr-1}-12` : `${yr}-${String(mo-1).padStart(2,'0')}`;
      prevRev = sumBy(data.sales.filter(s => s.date.startsWith(prevMo)), s => s.total);
    }
    const growthVsPrev = growthRate(totalRev, prevRev);
    const bestDay = dailyTrend.reduce((b, d) => d.rev > (b?.rev || 0) ? d : b, dailyTrend[0]);
    const tradingDays = new Set(filteredSales.map(s => s.date)).size;

    return {
      totalRev, totalExp, totalPO, netProfit, txns, avgTicket,
      uniqueCustomers, repeatCustomers,
      channelRevenue, paymentRevenue, topItems, repPerf,
      dailyTrend, dowAnalysis, weeklyBreakdown,
      wsJobs, wsCompleted, wsEfficiency, mechanicPerf,
      lowStock, totalOwed, overdueCreditors,
      growthVsPrev, bestDay, tradingDays, prevRev,
    };
  }, [filteredSales, filteredExpenses, filteredWorkshop, data, reportType, selectedMonth]);

  const maxItemRev = measures.topItems[0]?.rev || 1;
  const maxRepRev  = measures.repPerf[0]?.rev || 1;
  const maxDowRev  = Math.max(...measures.dowAnalysis.map(d => d.rev), 1);
  const maxChRev   = measures.channelRevenue[0]?.rev || 1;

  const periodLabel = reportType === 'daily' ? selectedDate
    : reportType === 'weekly' ? `Week of ${selectedDate}`
    : reportType === 'monthly' ? selectedMonth
    : 'All Time';

  const insights = useMemo(() => {
    const out: { icon: string; title: string; text: string; variant: 'indigo' | 'amber' | 'ruby' }[] = [];
    const { totalRev, avgTicket, tradingDays, topItems, dowAnalysis, channelRevenue, growthVsPrev, wsEfficiency, lowStock, overdueCreditors } = measures;
    if (tradingDays > 0) {
      const dailyAvg = totalRev / tradingDays;
      out.push({ icon: '📊', title: 'Revenue Velocity', variant: 'indigo',
        text: `Daily average of ${fmtGHS(dailyAvg)} across ${tradingDays} trading days. Average ticket: ${fmtGHS(avgTicket)}.${growthVsPrev !== 0 ? ` ${growthVsPrev > 0 ? '▲' : '▼'} ${Math.abs(growthVsPrev)}% vs prior period.` : ''}` });
    }
    if (dowAnalysis.length > 0) {
      const best = dowAnalysis[0];
      const worst = dowAnalysis[dowAnalysis.length - 1];
      out.push({ icon: '📅', title: 'Day-of-Week Pattern', variant: 'amber',
        text: `${best.dow} is the strongest trading day (${fmtGHS(best.rev)}, avg ${fmtGHS(best.avg)} per txn). ${worst.dow} is the weakest. Consider targeted promotions on ${worst.dow}.` });
    }
    if (topItems.length > 0) {
      const top = topItems[0];
      const topShare = pct(top.rev, totalRev);
      out.push({ icon: '🏆', title: 'Top Product Concentration', variant: topShare > 40 ? 'ruby' : 'indigo',
        text: `"${top.item}" drives ${topShare}% of revenue (${fmtGHS(top.rev)}). ${topShare > 40 ? 'High concentration risk — diversify product mix.' : 'Healthy spread across product lines.'}` });
    }
    if (channelRevenue.length > 1) {
      const top = channelRevenue[0];
      out.push({ icon: '📡', title: 'Channel Mix', variant: 'amber',
        text: `${top.ch} leads with ${fmtGHS(top.rev)} (${pct(top.rev, measures.totalRev)}% of revenue). ${channelRevenue.length} active channels.` });
    }
    if (wsEfficiency < 80 && measures.wsJobs > 0) {
      out.push({ icon: '🔧', title: 'Workshop Efficiency Alert', variant: 'ruby',
        text: `Workshop completion rate is ${wsEfficiency}% (${measures.wsCompleted}/${measures.wsJobs} jobs). Target: ≥85%. Review pending jobs and assign mechanics to clear backlog.` });
    }
    if (lowStock.length > 0) {
      out.push({ icon: '📦', title: 'Inventory Reorder Alert', variant: 'ruby',
        text: `${lowStock.length} SKUs are at or below reorder level. Top items: ${lowStock.slice(0,3).map(i => i.name).join(', ')}. Place purchase orders to avoid stockouts.` });
    }
    if (overdueCreditors.length > 0) {
      out.push({ icon: '💳', title: 'Overdue Creditors', variant: 'ruby',
        text: `${overdueCreditors.length} creditor(s) are past due date. Total outstanding: ${fmtGHS(measures.totalOwed)}. Prioritise payment to maintain supplier relationships.` });
    }
    return out;
  }, [measures]);

  const S = {
    section: { background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 10, padding: '16px 18px', marginBottom: 12 } as React.CSSProperties,
    kpiCard: (color: string) => ({ background: color + '14', border: `1px solid ${color}30`, borderRadius: 8, padding: '10px 12px', borderTop: `2px solid ${color}` }) as React.CSSProperties,
    kpiLabel: { fontSize: 8, color: C.dim, textTransform: 'uppercase' as const, letterSpacing: 1, fontWeight: 700, marginBottom: 4 },
    kpiValue: (color: string) => ({ fontSize: 20, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' as const }),
    kpiSub: { fontSize: 8, color: C.muted, marginTop: 2 },
    twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 } as React.CSSProperties,
    tableWrap: { overflowX: 'auto' as const },
    badge: (color: string) => ({ background: color + '22', color, padding: '1px 7px', borderRadius: 20, fontSize: 8, fontWeight: 700 }),
  };

  return (
    <div className="fade-in">
      <div className="filter-bar" style={{ gap: 12 }}>
        <div className="tab-bar" style={{ marginBottom: 0, border: 'none', flex: 1 }}>
          {(['daily','weekly','monthly','full'] as ReportType[]).map(t => (
            <button key={t} className={`tab-btn ${reportType === t ? 'active' : ''}`} onClick={() => setReportType(t)}>
              {t === 'full' ? 'Full Ops' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        {(reportType === 'daily' || reportType === 'weekly') && (
          <input type="date" className="filter-pill" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ minWidth: 130 }} />
        )}
        {reportType === 'monthly' && (
          <input type="month" className="filter-pill" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{ minWidth: 130 }} />
        )}
        <button className="btn btn-primary btn-sm" onClick={() => window.print()}>⎙ Print / PDF</button>
      </div>

      <div style={{ ...S.section, textAlign: 'center', padding: '20px 24px' }}>
        <div style={{ fontSize: 9, color: C.ruby, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Automobiles Ghana Limited</div>
        <h1 style={{ fontSize: 22, color: C.beige, margin: '0 0 4px', letterSpacing: 1 }}>
          {reportType === 'daily' ? 'Daily CEO Report' : reportType === 'weekly' ? 'Weekly Management Report' : reportType === 'monthly' ? 'Monthly Operations Report' : 'Full Operations Report'}
        </h1>
        <div style={{ fontSize: 10, color: C.dim }}>Period: {periodLabel}</div>
        <div style={{ fontSize: 8.5, color: C.muted, marginTop: 2 }}>Generated: {new Date().toLocaleString()} · Confidential — Internal Management Use Only</div>
      </div>

      <div style={S.section}>
        <SectionHeader num="01" title="Executive KPI Dashboard" subtitle="Key performance indicators at a glance" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 8 }}>
          <div style={S.kpiCard(C.emerald)}>
            <div style={S.kpiLabel}>Total Revenue</div>
            <div style={S.kpiValue(C.emeraldL)}>{fmtGHS(measures.totalRev)}</div>
            <div style={S.kpiSub}>{measures.tradingDays} trading days</div>
          </div>
          <div style={S.kpiCard(C.ruby)}>
            <div style={S.kpiLabel}>Total Expenses</div>
            <div style={S.kpiValue(C.rubyL)}>{fmtGHS(measures.totalExp + measures.totalPO)}</div>
            <div style={S.kpiSub}>Opex + Purchase Orders</div>
          </div>
          <div style={S.kpiCard(measures.netProfit >= 0 ? C.emerald : C.ruby)}>
            <div style={S.kpiLabel}>Net Profit</div>
            <div style={S.kpiValue(measures.netProfit >= 0 ? C.emeraldL : C.rubyL)}>{fmtGHS(measures.netProfit)}</div>
            <div style={S.kpiSub}>{measures.netProfit >= 0 ? '▲ Profitable' : '▼ Loss'}{measures.growthVsPrev !== 0 ? ` · ${measures.growthVsPrev > 0 ? '+' : ''}${measures.growthVsPrev}% MoM` : ''}</div>
          </div>
          <div style={S.kpiCard(C.amber)}>
            <div style={S.kpiLabel}>Transactions</div>
            <div style={S.kpiValue(C.amberL)}>{measures.txns}</div>
            <div style={S.kpiSub}>Avg {fmtGHS(measures.avgTicket)} / txn</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          <div style={S.kpiCard(C.indigo)}>
            <div style={S.kpiLabel}>Daily Average</div>
            <div style={S.kpiValue(C.indigoL)}>{fmtGHS(measures.tradingDays > 0 ? measures.totalRev / measures.tradingDays : 0)}</div>
            <div style={S.kpiSub}>per trading day</div>
          </div>
          <div style={S.kpiCard(C.amber)}>
            <div style={S.kpiLabel}>Best Day</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.amberL }}>{measures.bestDay ? fmtGHS(measures.bestDay.rev) : '—'}</div>
            <div style={S.kpiSub}>{measures.bestDay?.date || '—'}</div>
          </div>
          <div style={S.kpiCard(C.maroon)}>
            <div style={S.kpiLabel}>Workshop Jobs</div>
            <div style={S.kpiValue('#F87171')}>{measures.wsJobs}</div>
            <div style={S.kpiSub}>{measures.wsEfficiency}% completion</div>
          </div>
          <div style={S.kpiCard(C.violet)}>
            <div style={S.kpiLabel}>Unique Customers</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#A78BFA' }}>{measures.uniqueCustomers}</div>
            <div style={S.kpiSub}>{measures.repeatCustomers} repeat buyers</div>
          </div>
        </div>
        {measures.dailyTrend.length > 1 && (
          <div style={{ marginTop: 14, padding: '10px 12px', background: 'rgba(245,240,232,0.04)', borderRadius: 8 }}>
            <div style={{ fontSize: 8.5, color: C.dim, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Revenue Trend</div>
            <Sparkline data={measures.dailyTrend.map(d => d.rev)} color={C.amber} height={40} />
          </div>
        )}
      </div>

      <div style={S.section}>
        <SectionHeader num="02" title="Sales Performance" subtitle="Revenue analysis and breakdown" />
        {reportType === 'monthly' && measures.weeklyBreakdown.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, color: C.dim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Weekly Breakdown</div>
            <div style={S.tableWrap}>
              <table>
                <thead><tr><th>Week</th><th>Revenue</th><th>Transactions</th><th>Trading Days</th><th>Day Average</th><th>% of Period</th></tr></thead>
                <tbody>
                  {measures.weeklyBreakdown.map(w => (
                    <tr key={w.wk}>
                      <td style={{ fontWeight: 700, color: C.amberL }}>{w.wk}</td>
                      <td style={{ color: C.emeraldL, fontWeight: 700 }}>{fmtGHS(w.rev)}</td>
                      <td>{w.txns}</td>
                      <td>{w.days}</td>
                      <td style={{ color: C.dim }}>{fmtGHS(w.days > 0 ? w.rev / w.days : 0)}</td>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MiniBar value={w.rev} max={measures.totalRev} color={C.amber} /><span style={{ fontSize: 8.5, color: C.dim, minWidth: 28 }}>{pct(w.rev, measures.totalRev)}%</span></div></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: `2px solid ${C.amber}44` }}>
                    <td style={{ fontWeight: 700 }}>TOTAL</td>
                    <td style={{ fontWeight: 700, color: C.emeraldL }}>{fmtGHS(measures.totalRev)}</td>
                    <td style={{ fontWeight: 700 }}>{measures.txns}</td>
                    <td style={{ fontWeight: 700 }}>{measures.tradingDays}</td>
                    <td style={{ color: C.dim }}>{fmtGHS(measures.tradingDays > 0 ? measures.totalRev / measures.tradingDays : 0)}</td>
                    <td style={{ fontWeight: 700 }}>100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
        <div style={S.twoCol}>
          <div>
            <div style={{ fontSize: 9, color: C.dim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>By Channel</div>
            {measures.channelRevenue.map((c, i) => (
              <div key={c.ch} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 9.5, cursor: 'pointer', color: CHART_COLORS[i % CHART_COLORS.length] }} onClick={() => setDrill({ title: `Channel: ${c.ch}`, rows: c.rows })}>{c.ch} ↗</span>
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: C.emeraldL }}>{fmtGHS(c.rev)}</span>
                </div>
                <MiniBar value={c.rev} max={maxChRev} color={CHART_COLORS[i % CHART_COLORS.length]} />
                <div style={{ fontSize: 8, color: C.muted, marginTop: 2 }}>{c.txns} txns · {pct(c.rev, measures.totalRev)}% of revenue</div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 9, color: C.dim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>By Payment Method</div>
            {measures.paymentRevenue.map((p, i) => (
              <div key={p.pm} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 9.5, color: CHART_COLORS[i % CHART_COLORS.length] }}>{p.pm}</span>
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: C.emeraldL }}>{fmtGHS(p.rev)}</span>
                </div>
                <MiniBar value={p.rev} max={measures.totalRev} color={CHART_COLORS[i % CHART_COLORS.length]} />
                <div style={{ fontSize: 8, color: C.muted, marginTop: 2 }}>{p.txns} txns · {pct(p.rev, measures.totalRev)}%</div>
              </div>
            ))}
          </div>
        </div>
        {measures.dowAnalysis.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 9, color: C.dim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Day-of-Week Performance</div>
            <div style={S.tableWrap}>
              <table>
                <thead><tr><th>Day</th><th>Revenue</th><th>Transactions</th><th>Avg / Txn</th><th>% of Period</th><th>Rank</th></tr></thead>
                <tbody>
                  {measures.dowAnalysis.map((d, i) => (
                    <tr key={d.dow}>
                      <td style={{ fontWeight: 700, color: CHART_COLORS[i % CHART_COLORS.length] }}>{d.dow}</td>
                      <td style={{ color: C.emeraldL, fontWeight: 700 }}>{fmtGHS(d.rev)}</td>
                      <td>{d.txns}</td>
                      <td style={{ color: C.dim }}>{fmtGHS(d.avg)}</td>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MiniBar value={d.rev} max={maxDowRev} color={CHART_COLORS[i % CHART_COLORS.length]} /><span style={{ fontSize: 8.5, color: C.dim, minWidth: 28 }}>{pct(d.rev, measures.totalRev)}%</span></div></td>
                      <td><span style={S.badge(CHART_COLORS[i % CHART_COLORS.length])}>#{i+1}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div style={S.section}>
        <SectionHeader num="03" title="Product & Service Analysis" subtitle="Top 10 revenue-generating items — click any row to drill through" />
        <div style={S.tableWrap}>
          <table>
            <thead><tr><th>#</th><th>Product / Service</th><th>Revenue</th><th>Qty Sold</th><th>Transactions</th><th>Avg Price</th><th>Revenue Share</th></tr></thead>
            <tbody>
              {measures.topItems.map((item, i) => (
                <tr key={item.item} style={{ cursor: 'pointer' }} onClick={() => setDrill({ title: `Product: ${item.item}`, rows: item.rows })}>
                  <td><span style={S.badge(CHART_COLORS[i % CHART_COLORS.length])}>{i+1}</span></td>
                  <td style={{ color: CHART_COLORS[i % CHART_COLORS.length], fontWeight: 600 }}>{item.item} ↗</td>
                  <td style={{ color: C.emeraldL, fontWeight: 700 }}>{fmtGHS(item.rev)}</td>
                  <td>{item.qty}</td>
                  <td>{item.txns}</td>
                  <td style={{ color: C.dim }}>{fmtGHS(item.qty > 0 ? item.rev / item.qty : 0)}</td>
                  <td style={{ minWidth: 120 }}><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MiniBar value={item.rev} max={maxItemRev} color={CHART_COLORS[i % CHART_COLORS.length]} /><span style={{ fontSize: 8.5, color: C.dim, minWidth: 28 }}>{pct(item.rev, measures.totalRev)}%</span></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {measures.repPerf.length > 0 && (
        <div style={S.section}>
          <SectionHeader num="04" title="Sales Rep Performance" subtitle="Individual contribution and efficiency metrics" />
          <div style={S.tableWrap}>
            <table>
              <thead><tr><th>Rep</th><th>Revenue</th><th>Transactions</th><th>Avg Ticket</th><th>Revenue Share</th></tr></thead>
              <tbody>
                {measures.repPerf.map((r, i) => (
                  <tr key={r.rep}>
                    <td style={{ fontWeight: 700, color: CHART_COLORS[i % CHART_COLORS.length] }}>{r.rep || '(Unassigned)'}</td>
                    <td style={{ color: C.emeraldL, fontWeight: 700 }}>{fmtGHS(r.rev)}</td>
                    <td>{r.txns}</td>
                    <td style={{ color: C.dim }}>{fmtGHS(r.avg)}</td>
                    <td style={{ minWidth: 120 }}><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MiniBar value={r.rev} max={maxRepRev} color={CHART_COLORS[i % CHART_COLORS.length]} /><span style={{ fontSize: 8.5, color: C.dim, minWidth: 28 }}>{pct(r.rev, measures.totalRev)}%</span></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={S.section}>
        <SectionHeader num="05" title="Workshop Operations" subtitle="Job completion, mechanic performance, and efficiency" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
          <div style={S.kpiCard(C.indigo)}><div style={S.kpiLabel}>Total Jobs</div><div style={S.kpiValue(C.indigoL)}>{measures.wsJobs}</div></div>
          <div style={S.kpiCard(C.emerald)}><div style={S.kpiLabel}>Completed</div><div style={S.kpiValue(C.emeraldL)}>{measures.wsCompleted}</div><div style={S.kpiSub}>{measures.wsEfficiency}% efficiency</div></div>
          <div style={S.kpiCard(measures.wsEfficiency >= 85 ? C.emerald : C.ruby)}><div style={S.kpiLabel}>Efficiency Rate</div><div style={S.kpiValue(measures.wsEfficiency >= 85 ? C.emeraldL : C.rubyL)}>{measures.wsEfficiency}%</div><div style={S.kpiSub}>Target: ≥85%</div></div>
        </div>
        {measures.mechanicPerf.length > 0 && (
          <div style={S.tableWrap}>
            <table>
              <thead><tr><th>Mechanic</th><th>Total Jobs</th><th>Completed</th><th>Completion Rate</th></tr></thead>
              <tbody>
                {measures.mechanicPerf.map((m, i) => (
                  <tr key={m.mech}>
                    <td style={{ fontWeight: 700, color: CHART_COLORS[i % CHART_COLORS.length] }}>{m.mech || '(Unassigned)'}</td>
                    <td>{m.total}</td>
                    <td style={{ color: C.emeraldL }}>{m.done}</td>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MiniBar value={m.done} max={m.total} color={pct(m.done, m.total) >= 85 ? C.emerald : C.amber} /><span style={{ fontSize: 8.5, color: C.dim, minWidth: 28 }}>{pct(m.done, m.total)}%</span></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={S.section}>
        <SectionHeader num="06" title="Financial Summary" subtitle="P&L overview and creditor exposure" />
        <div style={S.twoCol}>
          <div>
            <div style={{ fontSize: 9, color: C.dim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>P&L Statement</div>
            <table>
              <tbody>
                <tr><td style={{ fontWeight: 600, paddingBottom: 6 }}>Total Revenue</td><td style={{ textAlign: 'right', color: C.emeraldL, fontWeight: 700 }}>{fmtGHS(measures.totalRev)}</td></tr>
                <tr><td style={{ color: C.dim, paddingBottom: 4 }}>Operating Expenses</td><td style={{ textAlign: 'right', color: C.rubyL }}>{fmtGHS(measures.totalExp)}</td></tr>
                <tr><td style={{ color: C.dim, paddingBottom: 8 }}>Purchase Orders</td><td style={{ textAlign: 'right', color: C.rubyL }}>{fmtGHS(measures.totalPO)}</td></tr>
                <tr style={{ borderTop: `2px solid ${C.amber}44` }}>
                  <td style={{ fontWeight: 700, paddingTop: 8, fontSize: 12 }}>NET PROFIT</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, fontSize: 14, paddingTop: 8, color: measures.netProfit >= 0 ? C.emeraldL : C.rubyL }}>{fmtGHS(measures.netProfit)}</td>
                </tr>
                <tr><td style={{ color: C.muted, fontSize: 8.5 }}>Profit Margin</td><td style={{ textAlign: 'right', color: C.muted, fontSize: 8.5 }}>{measures.totalRev > 0 ? pct(measures.netProfit, measures.totalRev) : 0}%</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <div style={{ fontSize: 9, color: C.dim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Creditors Overview</div>
            <div style={S.kpiCard(C.ruby)}>
              <div style={S.kpiLabel}>Total Outstanding</div>
              <div style={S.kpiValue(C.rubyL)}>{fmtGHS(measures.totalOwed)}</div>
              <div style={S.kpiSub}>{measures.overdueCreditors.length} overdue accounts</div>
            </div>
            {measures.overdueCreditors.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 8.5, color: C.rubyL, fontWeight: 700, marginBottom: 6 }}>⚠ Overdue Accounts</div>
                {measures.overdueCreditors.slice(0, 5).map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, marginBottom: 4, color: C.dim }}>
                    <span>{c.name}</span>
                    <span style={{ color: C.rubyL, fontWeight: 700 }}>{fmtGHS(c.amount - c.paid)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {measures.lowStock.length > 0 && (
        <div style={S.section}>
          <SectionHeader num="07" title="Inventory Alerts" subtitle="Items at or below reorder level" />
          <div style={S.tableWrap}>
            <table>
              <thead><tr><th>SKU</th><th>Item</th><th>Category</th><th>In Stock</th><th>Reorder Level</th><th>Status</th></tr></thead>
              <tbody>
                {measures.lowStock.slice(0, 15).map(item => (
                  <tr key={item.id}>
                    <td style={{ color: C.muted, fontSize: 8.5 }}>{item.sku}</td>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td><span style={S.badge(C.indigo)}>{item.category}</span></td>
                    <td style={{ color: item.qty === 0 ? C.rubyL : C.amberL, fontWeight: 700 }}>{item.qty}</td>
                    <td style={{ color: C.dim }}>{item.reorder}</td>
                    <td><span style={S.badge(item.qty === 0 ? C.ruby : C.amber)}>{item.qty === 0 ? 'OUT OF STOCK' : 'LOW STOCK'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={S.section}>
        <SectionHeader num="08" title="Business Insights & Recommendations" subtitle="Data-driven observations for management action" />
        {insights.length > 0 ? insights.map((ins, i) => (
          <Insight key={i} icon={ins.icon} title={ins.title} text={ins.text} variant={ins.variant} />
        )) : (
          <p style={{ color: C.muted, fontSize: 9.5, fontStyle: 'italic' }}>No data available for the selected period.</p>
        )}
      </div>

      {reportType === 'daily' && filteredSales.length > 0 && (
        <div style={S.section}>
          <SectionHeader num="09" title="Daily Transaction Log" subtitle={`All transactions for ${selectedDate}`} />
          <div style={S.tableWrap}>
            <table>
              <thead><tr><th>#</th><th>Customer</th><th>Item</th><th>Channel</th><th>Payment</th><th>Rep</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
              <tbody>
                {filteredSales.map((s, i) => (
                  <tr key={s.id}>
                    <td style={{ color: C.muted }}>{i+1}</td>
                    <td style={{ fontWeight: 600 }}>{s.customer}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.item}</td>
                    <td><span style={S.badge(C.indigo)}>{s.channel}</span></td>
                    <td><span style={S.badge(C.amber)}>{s.payment}</span></td>
                    <td style={{ color: C.dim }}>{s.rep}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: C.emeraldL }}>{fmtGHS(s.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: `2px solid ${C.amber}44` }}>
                  <td colSpan={6} style={{ fontWeight: 700, paddingTop: 8 }}>TOTAL SALES</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: C.amberL, paddingTop: 8, fontSize: 14 }}>{fmtGHS(measures.totalRev)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          {filteredExpenses.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 9, color: C.rubyL, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Expenses (Petty Cash)</div>
              <table>
                <thead><tr><th>#</th><th>Description</th><th>Supplier</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
                <tbody>
                  {filteredExpenses.map((e, i) => (
                    <tr key={e.id}><td style={{ color: C.muted }}>{i+1}</td><td>{e.item}</td><td style={{ color: C.dim }}>{e.supplier}</td><td style={{ textAlign: 'right', color: C.rubyL, fontWeight: 700 }}>{fmtGHS(e.amount)}</td></tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: `2px solid ${C.ruby}44` }}>
                    <td colSpan={3} style={{ fontWeight: 700, paddingTop: 8 }}>TOTAL EXPENSES</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: C.rubyL, paddingTop: 8 }}>{fmtGHS(measures.totalExp)}</td>
                  </tr>
                </tfoot>
              </table>
              <div style={{ marginTop: 12, padding: '10px 14px', background: C.emerald + '14', border: `1px solid ${C.emerald}33`, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: C.emeraldL }}>NET FOR THE DAY</span>
                <span style={{ fontWeight: 700, fontSize: 18, color: C.emeraldL }}>{fmtGHS(measures.netProfit)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ textAlign: 'center', padding: '12px 0', fontSize: 8.5, color: C.muted }}>
        Generated: {new Date().toLocaleString()} · Automobiles Ghana Limited · Accra, Ghana · {data.sales.length} total records
      </div>

      {drill && <DrillPanel title={drill.title} rows={drill.rows} onClose={() => setDrill(null)} />}
    </div>
  );
}
