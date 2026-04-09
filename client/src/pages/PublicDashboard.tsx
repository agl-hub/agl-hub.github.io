import { useMemo } from 'react';
import { getData, fmtGHS } from '../lib/dataStore';

export default function PublicDashboard() {
  const data = getData();

  const metrics = useMemo(() => {
    const totalRevenue = data.sales.reduce((s, x) => s + x.total, 0);
    const totalExpenses = data.expenses.reduce((s, x) => s + x.amount, 0);
    const totalPOs = data.purchaseOrders.reduce((s, x) => s + x.amount, 0);
    const netProfit = totalRevenue - totalExpenses - totalPOs;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0;
    const wsJobs = data.workshop.length;
    const wsCompleted = data.workshop.filter(j => j.status === 'Completed').length;
    const wsEfficiency = wsJobs > 0 ? Math.round((wsCompleted / wsJobs) * 100) : 0;
    const today = new Date().toISOString().slice(0, 10);
    const dailyRevenue = data.sales.filter(s => s.date === today).reduce((s, x) => s + x.total, 0);
    const dailyTarget = 5000;
    const revenueProgress = Math.min(100, Math.round((dailyRevenue / dailyTarget) * 100));

    // Payment breakdown
    const cashTotal = data.sales.filter(s => s.payment === 'Cash').reduce((a, b) => a + b.total, 0);
    const momoTotal = data.sales.filter(s => s.payment === 'MoMo').reduce((a, b) => a + b.total, 0);
    const bankTotal = data.sales.filter(s => s.payment === 'Bank Transfer').reduce((a, b) => a + b.total, 0);
    const creditTotal = data.sales.filter(s => s.payment === 'Credit').reduce((a, b) => a + b.total, 0);

    // Top products
    const productMap: Record<string, number> = {};
    data.sales.forEach(s => { productMap[s.item] = (productMap[s.item] || 0) + s.total; });
    const topProducts = Object.entries(productMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Mechanic efficiency
    const mechMap: Record<string, { total: number; completed: number }> = {};
    data.workshop.forEach(j => {
      if (!mechMap[j.mechanic]) mechMap[j.mechanic] = { total: 0, completed: 0 };
      mechMap[j.mechanic].total++;
      if (j.status === 'Completed') mechMap[j.mechanic].completed++;
    });
    const mechanicData = Object.entries(mechMap).map(([name, d]) => ({
      name,
      efficiency: d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0,
    }));

    return {
      totalRevenue, totalExpenses, totalPOs, netProfit, profitMargin,
      wsJobs, wsCompleted, wsEfficiency,
      dailyRevenue, dailyTarget, revenueProgress,
      cashTotal, momoTotal, bankTotal, creditTotal,
      topProducts, mechanicData,
      txnCount: data.sales.length,
    };
  }, [data]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A0C12 0%, #0E111A 100%)',
      color: '#fff',
      fontFamily: 'Montserrat, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(10,12,18,0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{ fontFamily: 'Rajdhani', fontSize: '22px', fontWeight: 700, color: '#fff', margin: 0 }}>
            AGL Command Center
          </h1>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
            Public Dashboard — Read Only
          </div>
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
          Automobiles Ghana Ltd
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 24px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* KPI Row */}
        <div className="grid grid-4" style={{ marginBottom: '12px' }}>
          <div className="card kpi-card green">
            <div className="kpi-label">Total Revenue</div>
            <div className="kpi-value">{fmtGHS(metrics.totalRevenue)}</div>
            <div className="kpi-sub">{metrics.txnCount} transactions</div>
          </div>
          <div className="card kpi-card navy">
            <div className="kpi-label">Net Profit</div>
            <div className="kpi-value" style={{ color: metrics.netProfit >= 0 ? '#1ABC9C' : '#FF2D3A' }}>
              {fmtGHS(metrics.netProfit)}
            </div>
            <div className="kpi-sub">{metrics.profitMargin.toFixed(1)}% margin</div>
          </div>
          <div className="card kpi-card gold">
            <div className="kpi-label">Workshop Efficiency</div>
            <div className="kpi-value">{metrics.wsEfficiency}%</div>
            <div className="kpi-sub">{metrics.wsCompleted}/{metrics.wsJobs} jobs done</div>
          </div>
          <div className="card kpi-card red">
            <div className="kpi-label">Daily Revenue</div>
            <div className="kpi-value">{fmtGHS(metrics.dailyRevenue)}</div>
            <div className="kpi-sub">{metrics.revenueProgress}% of target</div>
          </div>
        </div>

        {/* Revenue Progress */}
        <div className="card" style={{ padding: '14px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontFamily: 'Rajdhani', fontSize: '13px', color: 'var(--text-dim)', fontWeight: 600 }}>Daily Revenue Progress</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
              {fmtGHS(metrics.dailyRevenue)} / {fmtGHS(metrics.dailyTarget)}
            </span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${metrics.revenueProgress}%`,
              background: 'var(--gradient-teal)',
              borderRadius: '4px',
              transition: 'width 0.5s',
            }} />
          </div>
        </div>

        {/* Payment Breakdown + Top Products */}
        <div className="grid grid-2" style={{ marginBottom: '12px' }}>
          <div className="card" style={{ padding: '14px' }}>
            <h3 style={{ fontFamily: 'Rajdhani', fontSize: '13px', color: 'var(--text-dim)', fontWeight: 600, marginBottom: '10px' }}>Payment Breakdown</h3>
            {[
              { label: 'Cash', value: metrics.cashTotal, color: '#16A085' },
              { label: 'MoMo', value: metrics.momoTotal, color: '#F39C12' },
              { label: 'Bank Transfer', value: metrics.bankTotal, color: '#3B82F6' },
              { label: 'Credit', value: metrics.creditTotal, color: '#E30613' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{label}</span>
                <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, color }}>{fmtGHS(value)}</span>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: '14px' }}>
            <h3 style={{ fontFamily: 'Rajdhani', fontSize: '13px', color: 'var(--text-dim)', fontWeight: 600, marginBottom: '10px' }}>Top Products</h3>
            {metrics.topProducts.length === 0 ? (
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>No sales data yet</div>
            ) : metrics.topProducts.map(([item, total]) => (
              <div key={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{item}</span>
                <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, color: '#1ABC9C' }}>{fmtGHS(total)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mechanic Efficiency */}
        {metrics.mechanicData.length > 0 && (
          <div className="card" style={{ padding: '14px', marginBottom: '12px' }}>
            <h3 style={{ fontFamily: 'Rajdhani', fontSize: '13px', color: 'var(--text-dim)', fontWeight: 600, marginBottom: '10px' }}>Mechanic Efficiency</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {metrics.mechanicData.map(m => (
                <div key={m.name} style={{ flex: '1', minWidth: '120px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>{m.name}</div>
                  <div style={{ fontFamily: 'Rajdhani', fontSize: '20px', fontWeight: 700, color: m.efficiency >= 70 ? '#1ABC9C' : '#F39C12' }}>
                    {m.efficiency}%
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '4px', height: '4px', marginTop: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${m.efficiency}%`, background: m.efficiency >= 70 ? '#16A085' : '#F39C12' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '16px', fontSize: '11px', color: 'rgba(255,255,255,0.3)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        AGL Command Center © 2026 | Automobiles Ghana Ltd | Public Dashboard — Read Only
      </div>
    </div>
  );
}
