import { useState, useMemo } from 'react';
import { getData, fmtGHS } from '../lib/dataStore';

type ReportType = 'daily' | 'weekly' | 'monthly' | 'full';

export default function Reports() {
  const data = getData();
  const [reportType, setReportType] = useState<ReportType>('daily');

  const report = useMemo(() => {
    const totalRev = data.sales.reduce((s, x) => s + x.total, 0);
    const totalExp = data.expenses.reduce((s, x) => s + x.amount, 0);
    const totalPO = data.purchaseOrders.reduce((s, x) => s + x.amount, 0);
    const netProfit = totalRev - totalExp - totalPO;
    const txns = data.sales.length;
    const avgTicket = txns > 0 ? totalRev / txns : 0;
    const wsJobs = data.workshop.length;
    const wsCompleted = data.workshop.filter(j => j.status === 'Completed').length;
    const wsEfficiency = wsJobs > 0 ? Math.round((wsCompleted / wsJobs) * 100) : 0;
    const channels: Record<string, number> = {};
    data.sales.forEach(s => { channels[s.channel] = (channels[s.channel] || 0) + s.total; });
    const payments: Record<string, number> = {};
    data.sales.forEach(s => { payments[s.payment] = (payments[s.payment] || 0) + s.total; });
    const itemTotals: Record<string, number> = {};
    data.sales.forEach(s => { itemTotals[s.item] = (itemTotals[s.item] || 0) + s.total; });
    const topItems = Object.entries(itemTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const repTotals: Record<string, number> = {};
    data.sales.forEach(s => { repTotals[s.rep] = (repTotals[s.rep] || 0) + s.total; });
    return { totalRev, totalExp, totalPO, netProfit, txns, avgTicket, wsJobs, wsCompleted, wsEfficiency, channels, payments, topItems, repTotals };
  }, [data]);

  return (
    <div>
      <div className="grid grid-4" style={{ marginBottom: '8px' }}>
        <div className="card kpi-card green"><div className="kpi-label">Revenue</div><div className="kpi-value" style={{ fontSize: '16px' }}>{fmtGHS(report.totalRev)}</div></div>
        <div className="card kpi-card red"><div className="kpi-label">Expenses</div><div className="kpi-value" style={{ fontSize: '16px' }}>{fmtGHS(report.totalExp + report.totalPO)}</div></div>
        <div className="card kpi-card navy"><div className="kpi-label">Net Profit</div><div className="kpi-value" style={{ fontSize: '16px', color: report.netProfit >= 0 ? '#1ABC9C' : '#FF2D3A' }}>{fmtGHS(report.netProfit)}</div></div>
        <div className="card kpi-card gold"><div className="kpi-label">Transactions</div><div className="kpi-value">{report.txns}</div></div>
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
        <div className="tab-bar" style={{ flex: 1 }}>
          {(['daily', 'weekly', 'monthly', 'full'] as ReportType[]).map(t => (
            <button key={t} className={`tab-btn ${reportType === t ? 'active' : ''}`} onClick={() => setReportType(t)}>
              {t === 'full' ? 'Full Operations' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => window.print()}>Print / PDF</button>
      </div>

      <div className="card" style={{ padding: '16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
          <h2 style={{ color: '#E30613', fontFamily: 'Rajdhani', fontSize: '20px', fontWeight: 700, margin: 0 }}>AGL AUTO PARTS &amp; WORKSHOP</h2>
          <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px' }}>
            {reportType === 'daily' ? 'Daily CEO Report' : reportType === 'weekly' ? 'Weekly Management Report' : reportType === 'monthly' ? 'Monthly Financial Report' : 'Full Operations Report'}
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>Generated: {new Date().toLocaleString()}</div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ color: '#E30613', fontSize: '13px', fontFamily: 'Rajdhani', fontWeight: 700, marginBottom: '8px', borderBottom: '1px solid rgba(227,6,19,0.3)', paddingBottom: '4px' }}>FINANCIAL SUMMARY</h3>
          <table><tbody>
            <tr><td style={{ fontWeight: 600 }}>Total Revenue</td><td style={{ color: '#1ABC9C', fontWeight: 700 }}>{fmtGHS(report.totalRev)}</td></tr>
            <tr><td style={{ fontWeight: 600 }}>Total Expenses</td><td style={{ color: '#FF2D3A' }}>{fmtGHS(report.totalExp)}</td></tr>
            <tr><td style={{ fontWeight: 600 }}>Purchase Orders</td><td style={{ color: '#F39C12' }}>{fmtGHS(report.totalPO)}</td></tr>
            <tr style={{ borderTop: '2px solid rgba(255,255,255,0.1)' }}><td style={{ fontWeight: 700, fontSize: '12px' }}>NET PROFIT</td><td style={{ fontWeight: 700, fontSize: '14px', color: report.netProfit >= 0 ? '#1ABC9C' : '#FF2D3A' }}>{fmtGHS(report.netProfit)}</td></tr>
          </tbody></table>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ color: '#E30613', fontSize: '13px', fontFamily: 'Rajdhani', fontWeight: 700, marginBottom: '8px', borderBottom: '1px solid rgba(227,6,19,0.3)', paddingBottom: '4px' }}>SALES BREAKDOWN</h3>
          <div className="grid grid-2" style={{ gap: '12px' }}>
            <div>
              <h4 style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '6px', fontWeight: 600 }}>By Channel</h4>
              <table><thead><tr><th>Channel</th><th>Revenue</th><th>%</th></tr></thead><tbody>
                {Object.entries(report.channels).sort((a, b) => b[1] - a[1]).map(([ch, amt]) => (
                  <tr key={ch}><td>{ch}</td><td style={{ color: '#1ABC9C', fontWeight: 600 }}>{fmtGHS(amt)}</td><td>{report.totalRev > 0 ? Math.round((amt / report.totalRev) * 100) : 0}%</td></tr>
                ))}
              </tbody></table>
            </div>
            <div>
              <h4 style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '6px', fontWeight: 600 }}>By Payment Method</h4>
              <table><thead><tr><th>Method</th><th>Amount</th><th>%</th></tr></thead><tbody>
                {Object.entries(report.payments).sort((a, b) => b[1] - a[1]).map(([pm, amt]) => (
                  <tr key={pm}><td>{pm}</td><td style={{ color: '#1ABC9C', fontWeight: 600 }}>{fmtGHS(amt)}</td><td>{report.totalRev > 0 ? Math.round((amt / report.totalRev) * 100) : 0}%</td></tr>
                ))}
              </tbody></table>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ color: '#E30613', fontSize: '13px', fontFamily: 'Rajdhani', fontWeight: 700, marginBottom: '8px', borderBottom: '1px solid rgba(227,6,19,0.3)', paddingBottom: '4px' }}>TOP SELLING ITEMS</h3>
          <table><thead><tr><th>#</th><th>Item</th><th>Revenue</th></tr></thead><tbody>
            {report.topItems.map(([item, amt], i) => (
              <tr key={item}><td>{i + 1}</td><td style={{ fontWeight: 600 }}>{item}</td><td style={{ color: '#1ABC9C', fontWeight: 600 }}>{fmtGHS(amt)}</td></tr>
            ))}
          </tbody></table>
        </div>

        {(reportType === 'weekly' || reportType === 'monthly' || reportType === 'full') && (
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ color: '#E30613', fontSize: '13px', fontFamily: 'Rajdhani', fontWeight: 700, marginBottom: '8px', borderBottom: '1px solid rgba(227,6,19,0.3)', paddingBottom: '4px' }}>WORKSHOP SUMMARY</h3>
            <table><tbody>
              <tr><td>Total Jobs</td><td style={{ fontWeight: 600 }}>{report.wsJobs}</td></tr>
              <tr><td>Completed</td><td style={{ color: '#1ABC9C', fontWeight: 600 }}>{report.wsCompleted}</td></tr>
              <tr><td>Efficiency</td><td style={{ color: report.wsEfficiency >= 70 ? '#1ABC9C' : '#F39C12', fontWeight: 600 }}>{report.wsEfficiency}%</td></tr>
            </tbody></table>
          </div>
        )}

        {(reportType === 'monthly' || reportType === 'full') && (
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ color: '#E30613', fontSize: '13px', fontFamily: 'Rajdhani', fontWeight: 700, marginBottom: '8px', borderBottom: '1px solid rgba(227,6,19,0.3)', paddingBottom: '4px' }}>SALES REP PERFORMANCE</h3>
            <table><thead><tr><th>Rep</th><th>Revenue</th></tr></thead><tbody>
              {Object.entries(report.repTotals).sort((a, b) => b[1] - a[1]).map(([rep, amt]) => (
                <tr key={rep}><td style={{ fontWeight: 600 }}>{rep}</td><td style={{ color: '#1ABC9C', fontWeight: 600 }}>{fmtGHS(amt)}</td></tr>
              ))}
            </tbody></table>
          </div>
        )}

        <div className="grid grid-3" style={{ gap: '8px' }}>
          <div style={{ padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>Avg Ticket</div>
            <div style={{ fontFamily: 'Rajdhani', fontSize: '16px', fontWeight: 700, color: '#F39C12' }}>{fmtGHS(report.avgTicket)}</div>
          </div>
          <div style={{ padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>Profit Margin</div>
            <div style={{ fontFamily: 'Rajdhani', fontSize: '16px', fontWeight: 700, color: report.netProfit >= 0 ? '#1ABC9C' : '#FF2D3A' }}>{report.totalRev > 0 ? ((report.netProfit / report.totalRev) * 100).toFixed(1) : 0}%</div>
          </div>
          <div style={{ padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>Inquiries</div>
            <div style={{ fontFamily: 'Rajdhani', fontSize: '16px', fontWeight: 700, color: '#3B82F6' }}>{data.inquiries}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
