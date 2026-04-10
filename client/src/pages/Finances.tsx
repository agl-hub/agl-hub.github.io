import { useState, useMemo, useEffect, useRef } from 'react';
import { getData, updateData, fmtGHS, today } from '../lib/dataStore';
import { useDataRefresh } from '../lib/usePeriodData';
import { useLayout } from '../components/MainLayout';

declare const Chart: any;

export default function Finances() {
  const { showToast, openSlidePanel } = useLayout();
  const refresh = useDataRefresh();
  const [localRefresh, setLocalRefresh] = useState(0);
  const data = useMemo(() => getData(), [refresh, localRefresh]);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInst = useRef<any>(null);
  const [tab, setTab] = useState<'expenses' | 'po'>('expenses');

  const totalRevenue = data.sales.reduce((s, x) => s + (Number(x.total) || 0), 0);
  const totalExpenses = data.expenses.reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const totalPOs = data.purchaseOrders.reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const totalOutflow = totalExpenses + totalPOs;
  const netPosition = totalRevenue - totalOutflow;
  const profitMargin = totalRevenue > 0 ? ((netPosition / totalRevenue) * 100) : 0;

  const expByCat: Record<string, number> = {};
  data.expenses.forEach(e => { expByCat[e.item || 'Other'] = (expByCat[e.item || 'Other'] || 0) + (Number(e.amount) || 0); });

  useEffect(() => {
    if (typeof Chart === 'undefined' || !chartRef.current) return;
    chartInst.current?.destroy();
    const labels = Object.keys(expByCat).slice(0, 8);
    const colors = ['#BE123C','#D97706','#F59E0B','#4F46E5','#D97706','#8B5CF6','#EC4899','#14B8A6'];
    chartInst.current = new Chart(chartRef.current, {
      type: 'doughnut',
      data: { labels, datasets: [{ data: labels.map(l => expByCat[l]), backgroundColor: colors }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#A0AEC0', font: { size: 9 } } } } },
    });
    return () => { chartInst.current?.destroy(); };
  }, [data.expenses, refresh]);

  const addExpense = () => {
    openSlidePanel('Add Expense', (
      <div style={{ color: 'var(--text)' }}>
        <div className="form-group"><label className="form-label">Item / Description</label><input className="form-control" id="exp-item" placeholder="Workshop supplies" /></div>
        <div className="form-group"><label className="form-label">Supplier</label><input className="form-control" id="exp-sup" placeholder="Local Market" /></div>
        <div className="form-group"><label className="form-label">Amount (GHS)</label><input type="number" className="form-control" id="exp-amt" placeholder="0" /></div>
        <div className="form-group"><label className="form-label">Purpose</label><input className="form-control" id="exp-purp" placeholder="Operational expense" /></div>
        <button className="btn btn-primary" style={{ marginTop: '12px' }} onClick={() => {
          const item = (document.getElementById('exp-item') as HTMLInputElement)?.value;
          const supplier = (document.getElementById('exp-sup') as HTMLInputElement)?.value;
          const amount = parseFloat((document.getElementById('exp-amt') as HTMLInputElement)?.value) || 0;
          const purpose = (document.getElementById('exp-purp') as HTMLInputElement)?.value;
          if (!item || !amount) { showToast('Fill in Item and Amount', 'error'); return; }
          updateData(d => { d.expenses.push({ id: `e_${Date.now()}`, date: today(), item, supplier, amount, purpose }); });
          showToast(`Expense recorded: ${item} — ${fmtGHS(amount)}`, 'success');
          setLocalRefresh(r => r + 1);
        }}>Record Expense</button>
      </div>
    ));
  };

  const addPO = () => {
    openSlidePanel('Add Purchase Order', (
      <div style={{ color: 'var(--text)' }}>
        <div className="form-group"><label className="form-label">Supplier</label><input className="form-control" id="po-sup" placeholder="AutoParts Ghana" /></div>
        <div className="form-group"><label className="form-label">Items</label><input className="form-control" id="po-items" placeholder="Brake pads, oil filters" /></div>
        <div className="form-group"><label className="form-label">Amount (GHS)</label><input type="number" className="form-control" id="po-amt" placeholder="0" /></div>
        <div className="form-group"><label className="form-label">Notes</label><input className="form-control" id="po-notes" placeholder="Optional notes" /></div>
        <button className="btn btn-primary" style={{ marginTop: '12px' }} onClick={() => {
          const supplier = (document.getElementById('po-sup') as HTMLInputElement)?.value;
          const items = (document.getElementById('po-items') as HTMLInputElement)?.value;
          const amount = parseFloat((document.getElementById('po-amt') as HTMLInputElement)?.value) || 0;
          const notes = (document.getElementById('po-notes') as HTMLInputElement)?.value;
          if (!supplier || !amount) { showToast('Fill in Supplier and Amount', 'error'); return; }
          updateData(d => {
            const poNumber = `AGL-PO-${String(d.settings.poCounter++).padStart(3, '0')}`;
            d.purchaseOrders.push({ id: `po_${Date.now()}`, date: today(), poNumber, supplier, amount, items, notes });
          });
          showToast(`PO created: ${supplier}`, 'success');
          setLocalRefresh(r => r + 1);
        }}>Create PO</button>
      </div>
    ));
  };

  return (
    <div>
      <div className="grid grid-5" style={{ marginBottom: '8px' }}>
        <div className="card kpi-card green"><div className="kpi-label">Total Revenue</div><div className="kpi-value">{fmtGHS(totalRevenue)}</div></div>
        <div className="card kpi-card red"><div className="kpi-label">Expenses</div><div className="kpi-value">{fmtGHS(totalExpenses)}</div></div>
        <div className="card kpi-card gold"><div className="kpi-label">Purchase Orders</div><div className="kpi-value">{fmtGHS(totalPOs)}</div></div>
        <div className="card kpi-card" style={{ borderTopColor: netPosition >= 0 ? '#D97706' : '#BE123C' }}><div className="kpi-label">Net Position</div><div className="kpi-value" style={{ color: netPosition >= 0 ? '#10B981' : '#E11D48' }}>{fmtGHS(netPosition)}</div></div>
        <div className="card kpi-card navy"><div className="kpi-label">Profit Margin</div><div className="kpi-value">{profitMargin.toFixed(1)}%</div></div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <button className="btn btn-primary" onClick={addExpense}>+ Add Expense</button>
        <button className="btn btn-success" onClick={addPO}>+ Purchase Order</button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', marginBottom: '8px' }}>
        <div className="card" style={{ padding: '10px' }}>
          <div className="tab-bar">
            <button className={`tab-btn ${tab === 'expenses' ? 'active' : ''}`} onClick={() => setTab('expenses')}>Expenses ({data.expenses.length})</button>
            <button className={`tab-btn ${tab === 'po' ? 'active' : ''}`} onClick={() => setTab('po')}>Purchase Orders ({data.purchaseOrders.length})</button>
          </div>
          {tab === 'expenses' && (
            <div style={{ overflowX: 'auto', maxHeight: '300px', overflowY: 'auto' }}>
              <table>
                <thead><tr><th>Date</th><th>Item</th><th>Supplier</th><th>Amount</th><th>Purpose</th></tr></thead>
                <tbody>
                  {[...data.expenses].sort((a, b) => b.date.localeCompare(a.date)).map(e => (
                    <tr key={e.id}><td>{e.date}</td><td>{e.item}</td><td>{e.supplier}</td><td style={{ color: '#E11D48', fontWeight: 600 }}>{fmtGHS(e.amount)}</td><td style={{ color: 'var(--text-dim)' }}>{e.purpose}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tab === 'po' && (
            <div style={{ overflowX: 'auto', maxHeight: '300px', overflowY: 'auto' }}>
              <table>
                <thead><tr><th>Date</th><th>PO #</th><th>Supplier</th><th>Items</th><th>Amount</th></tr></thead>
                <tbody>
                  {[...data.purchaseOrders].sort((a, b) => b.date.localeCompare(a.date)).map(po => (
                    <tr key={po.id}><td>{po.date}</td><td style={{ fontFamily: 'monospace', fontSize: '8pt' }}>{po.poNumber}</td><td>{po.supplier}</td><td>{po.items}</td><td style={{ color: '#F59E0B', fontWeight: 600 }}>{fmtGHS(po.amount)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="card chart-card"><h4>Expense Breakdown</h4><div className="chart-container"><canvas ref={chartRef} /></div></div>
      </div>

      <div className="card" style={{ padding: '14px' }}>
        <h3 style={{ color: '#fff', marginBottom: '12px' }}>Financial Summary</h3>
        <div className="finance-metric"><span className="fm-label">Gross Revenue</span><span className="fm-value" style={{ color: '#10B981' }}>{fmtGHS(totalRevenue)}</span></div>
        <div className="finance-metric"><span className="fm-label">Total Expenses</span><span className="fm-value" style={{ color: '#E11D48' }}>{fmtGHS(totalExpenses)}</span></div>
        <div className="finance-metric"><span className="fm-label">Purchase Orders</span><span className="fm-value" style={{ color: '#F59E0B' }}>{fmtGHS(totalPOs)}</span></div>
        <div className="finance-metric"><span className="fm-label">Total Outflow</span><span className="fm-value" style={{ color: '#E11D48' }}>{fmtGHS(totalOutflow)}</span></div>
        <div className="finance-metric" style={{ borderBottom: 'none' }}><span className="fm-label" style={{ fontWeight: 700, color: '#fff' }}>Net Position</span><span className="fm-value" style={{ color: netPosition >= 0 ? '#10B981' : '#E11D48', fontSize: '18px' }}>{fmtGHS(netPosition)}</span></div>
      </div>
    </div>
  );
}
