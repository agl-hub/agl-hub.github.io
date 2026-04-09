import { useMemo, useState } from 'react';
import { getData, fmtGHS, updateData } from '../lib/dataStore';
import { useDataRefresh } from '../lib/usePeriodData';
import { useLayout } from '../components/MainLayout';

export default function KPITracker() {
  const refresh = useDataRefresh();
  const data = useMemo(() => getData(), [refresh]);
  const { showToast, openModal } = useLayout();
  const [editTarget, setEditTarget] = useState<{ key: string; label: string; current: number } | null>(null);
  const [newTarget, setNewTarget] = useState('');

  const targets = useMemo(() => {
    const stored: Record<string, number> = (data.settings as any)?.kpiTargets || {};
    return {
      revenue: stored.revenue ?? 120000,
      netProfit: stored.netProfit ?? 50000,
      margin: stored.margin ?? 40,
      transactions: stored.transactions ?? 200,
      avgTicket: stored.avgTicket ?? 500,
      customers: stored.customers ?? 100,
      wsEfficiency: stored.wsEfficiency ?? 85,
      cashTarget: stored.cashTarget ?? 60000,
      momoTarget: stored.momoTarget ?? 30000,
      creditLimit: stored.creditLimit ?? 5000,
    };
  }, [data.settings, refresh]);

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
    const uniqueCustomers = new Set(data.sales.map(s => s.customer).filter(Boolean)).size;
    const cashSales = data.sales.filter(s => s.payment === 'Cash').reduce((a, b) => a + b.total, 0);
    const momoSales = data.sales.filter(s => ['MoMo', 'Mobile Money', 'MOMO'].includes(s.payment)).reduce((a, b) => a + b.total, 0);
    const creditSales = data.sales.filter(s => s.payment === 'Credit').reduce((a, b) => a + b.total, 0);
    const profitMargin = totalRev > 0 ? ((netProfit / totalRev) * 100) : 0;
    const kanbanDone = data.kanban.filter(t => t.column === 'Done').length;
    const kanbanTotal = data.kanban.length;
    const lowStock = data.inventory.filter(i => i.qty <= i.reorder).length;
    const overdueCreditors = data.creditors.filter(c => c.dueDate && c.dueDate < new Date().toISOString().slice(0, 10) && c.paid < c.amount).length;

    return [
      { key: 'revenue', label: 'Total Revenue', value: fmtGHS(totalRev), raw: totalRev, target: targets.revenue, unit: 'GHS', pct: Math.min(100, Math.round((totalRev / targets.revenue) * 100)), color: '#D97706', status: totalRev >= targets.revenue ? 'met' : 'behind' },
      { key: 'netProfit', label: 'Net Profit', value: fmtGHS(netProfit), raw: netProfit, target: targets.netProfit, unit: 'GHS', pct: Math.min(100, Math.round((netProfit / targets.netProfit) * 100)), color: netProfit >= 0 ? '#059669' : '#BE123C', status: netProfit >= targets.netProfit ? 'met' : 'behind' },
      { key: 'margin', label: 'Profit Margin', value: `${profitMargin.toFixed(1)}%`, raw: profitMargin, target: targets.margin, unit: '%', pct: Math.min(100, Math.round(profitMargin / targets.margin * 100)), color: profitMargin >= targets.margin ? '#059669' : '#D97706', status: profitMargin >= targets.margin ? 'met' : 'behind' },
      { key: 'transactions', label: 'Total Transactions', value: String(txns), raw: txns, target: targets.transactions, unit: '', pct: Math.min(100, Math.round((txns / targets.transactions) * 100)), color: '#4F46E5', status: txns >= targets.transactions ? 'met' : 'behind' },
      { key: 'avgTicket', label: 'Avg Ticket Size', value: fmtGHS(avgTicket), raw: avgTicket, target: targets.avgTicket, unit: 'GHS', pct: Math.min(100, Math.round((avgTicket / targets.avgTicket) * 100)), color: '#D97706', status: avgTicket >= targets.avgTicket ? 'met' : 'behind' },
      { key: 'customers', label: 'Unique Customers', value: String(uniqueCustomers), raw: uniqueCustomers, target: targets.customers, unit: '', pct: Math.min(100, Math.round((uniqueCustomers / targets.customers) * 100)), color: '#7C3AED', status: uniqueCustomers >= targets.customers ? 'met' : 'behind' },
      { key: 'wsEfficiency', label: 'Workshop Efficiency', value: `${wsEfficiency}%`, raw: wsEfficiency, target: targets.wsEfficiency, unit: '%', pct: Math.min(100, Math.round(wsEfficiency / targets.wsEfficiency * 100)), color: wsEfficiency >= targets.wsEfficiency ? '#059669' : '#BE123C', status: wsEfficiency >= targets.wsEfficiency ? 'met' : 'behind' },
      { key: 'wsJobs', label: 'Workshop Jobs', value: `${wsCompleted}/${wsJobs}`, raw: wsCompleted, target: wsJobs, unit: '', pct: wsJobs > 0 ? Math.round((wsCompleted / wsJobs) * 100) : 0, color: '#D97706', status: wsCompleted === wsJobs && wsJobs > 0 ? 'met' : 'behind' },
      { key: 'cashTarget', label: 'Cash Collection', value: fmtGHS(cashSales), raw: cashSales, target: targets.cashTarget, unit: 'GHS', pct: Math.min(100, Math.round((cashSales / targets.cashTarget) * 100)), color: '#059669', status: cashSales >= targets.cashTarget ? 'met' : 'behind' },
      { key: 'momoTarget', label: 'MoMo Collection', value: fmtGHS(momoSales), raw: momoSales, target: targets.momoTarget, unit: 'GHS', pct: Math.min(100, Math.round((momoSales / targets.momoTarget) * 100)), color: '#D97706', status: momoSales >= targets.momoTarget ? 'met' : 'behind' },
      { key: 'creditLimit', label: 'Credit Outstanding', value: fmtGHS(creditSales), raw: creditSales, target: targets.creditLimit, unit: 'GHS', pct: Math.min(100, Math.round((creditSales / targets.creditLimit) * 100)), color: creditSales > targets.creditLimit ? '#BE123C' : '#059669', status: creditSales <= targets.creditLimit ? 'met' : 'over' },
      { key: 'kanban', label: 'Task Completion', value: `${kanbanDone}/${kanbanTotal}`, raw: kanbanDone, target: kanbanTotal, unit: '', pct: kanbanTotal > 0 ? Math.round((kanbanDone / kanbanTotal) * 100) : 0, color: '#4F46E5', status: kanbanDone === kanbanTotal && kanbanTotal > 0 ? 'met' : 'behind' },
      { key: 'lowStock', label: 'Low Stock Items', value: String(lowStock), raw: lowStock, target: 0, unit: '', pct: lowStock === 0 ? 100 : 0, color: lowStock > 0 ? '#BE123C' : '#059669', status: lowStock === 0 ? 'met' : 'alert' },
      { key: 'overdueCreditors', label: 'Overdue Creditors', value: String(overdueCreditors), raw: overdueCreditors, target: 0, unit: '', pct: overdueCreditors === 0 ? 100 : 0, color: overdueCreditors > 0 ? '#BE123C' : '#059669', status: overdueCreditors === 0 ? 'met' : 'alert' },
    ];
  }, [data, targets, refresh]);

  const metCount = kpis.filter(k => k.status === 'met').length;
  const overallScore = Math.round((metCount / kpis.length) * 100);

  function openEditTarget(k: typeof kpis[0]) {
    setEditTarget({ key: k.key, label: k.label, current: k.target });
    setNewTarget(String(k.target));
    openModal(
      <div style={{ padding: '16px', minWidth: '280px' }}>
        <h3 style={{ color: 'var(--text-main)', marginBottom: '12px', fontSize: '14px' }}>Edit Target: {k.label}</h3>
        <div className="form-group">
          <label className="form-label">New Target {k.unit ? `(${k.unit})` : ''}</label>
          <input
            type="number"
            className="form-control"
            defaultValue={k.target}
            id="kpi-target-input"
            autoFocus
          />
        </div>
        <button className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} onClick={() => {
          const val = parseFloat((document.getElementById('kpi-target-input') as HTMLInputElement)?.value || '0');
          if (!isNaN(val) && val > 0) {
            updateData(d => {
              if (!d.settings) d.settings = { receiptCounter: 1, poCounter: 1, autoSync: true, syncOnEntry: true };
              if (!d.settings.kpiTargets) d.settings.kpiTargets = {};
              d.settings.kpiTargets[k.key] = val;
            });
            showToast(`Target for "${k.label}" updated to ${val}`, 'success');
          }
        }}>Save Target</button>
      </div>
    );
  }

  const statusColor = { met: '#059669', behind: '#D97706', over: '#BE123C', alert: '#BE123C' };
  const statusLabel = { met: '✓ On Target', behind: '↓ Behind', over: '↑ Over Limit', alert: '⚠ Alert' };

  return (
    <div>
      {/* Summary bar */}
      <div className="grid grid-4" style={{ marginBottom: '10px' }}>
        <div className="card kpi-card" style={{ borderColor: '#D97706' }}>
          <div className="kpi-label">Overall Score</div>
          <div className="kpi-value" style={{ color: '#D97706' }}>{overallScore}%</div>
          <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>{metCount}/{kpis.length} targets met</div>
        </div>
        <div className="card kpi-card" style={{ borderColor: '#059669' }}>
          <div className="kpi-label">Total Revenue</div>
          <div className="kpi-value" style={{ color: '#059669' }}>{kpis[0]?.value}</div>
          <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>Target: {fmtGHS(targets.revenue)}</div>
        </div>
        <div className="card kpi-card" style={{ borderColor: '#4F46E5' }}>
          <div className="kpi-label">Workshop Efficiency</div>
          <div className="kpi-value" style={{ color: '#4F46E5' }}>{kpis[6]?.value}</div>
          <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>Target: {targets.wsEfficiency}%</div>
        </div>
        <div className="card kpi-card" style={{ borderColor: kpis[1]?.raw >= 0 ? '#059669' : '#BE123C' }}>
          <div className="kpi-label">Net Profit</div>
          <div className="kpi-value" style={{ color: kpis[1]?.raw >= 0 ? '#059669' : '#BE123C' }}>{kpis[1]?.value}</div>
          <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>Target: {fmtGHS(targets.netProfit)}</div>
        </div>
      </div>

      <div className="card" style={{ padding: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ color: 'var(--text-main)', fontSize: '13px', fontWeight: 700 }}>KPI Dashboard — Target Tracking</h3>
          <span style={{ fontSize: '9px', color: 'var(--text-dim)' }}>Click any card to edit its target</span>
        </div>
        <div className="grid grid-3" style={{ gap: '8px' }}>
          {kpis.map((k, i) => (
            <div key={i}
              onClick={() => ['wsJobs', 'kanban', 'lowStock', 'overdueCreditors'].includes(k.key) ? null : openEditTarget(k)}
              style={{
                padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)',
                border: `1px solid ${k.color}22`, cursor: ['wsJobs', 'kanban', 'lowStock', 'overdueCreditors'].includes(k.key) ? 'default' : 'pointer',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => { if (!['wsJobs', 'kanban', 'lowStock', 'overdueCreditors'].includes(k.key)) (e.currentTarget as HTMLElement).style.borderColor = k.color; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${k.color}22`; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '9px', color: 'var(--text-dim)', fontWeight: 600 }}>{k.label}</span>
                <span style={{ fontSize: '8px', color: statusColor[k.status as keyof typeof statusColor], fontWeight: 700 }}>
                  {statusLabel[k.status as keyof typeof statusLabel]}
                </span>
              </div>
              <div style={{ fontFamily: 'Rajdhani, Georgia, serif', fontSize: '18px', fontWeight: 700, color: k.color, marginBottom: '5px' }}>{k.value}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>
                  Target: {k.unit === 'GHS' ? fmtGHS(k.target) : `${k.target}${k.unit}`}
                </span>
                <span style={{ fontSize: '8px', color: k.color, fontWeight: 700 }}>{k.pct}%</span>
              </div>
              <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${k.pct}%`, height: '100%', background: k.color, borderRadius: '3px', transition: 'width 0.8s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
