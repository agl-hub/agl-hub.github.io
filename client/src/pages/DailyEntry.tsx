import { useState, useMemo } from 'react';
import { getData, updateData, fmtGHS, today, now } from '../lib/dataStore';
import { useLayout } from '../components/MainLayout';

export default function DailyEntry() {
  const { showToast, filterState } = useLayout();
  const data = getData();
  const [form, setForm] = useState({
    customer: '', contact: '', channel: 'Walk-In', rep: 'Yvonne', item: '',
    qty: '1', price: '', payment: 'Cash', vehicle: '', notes: '',
  });
  const [refresh, setRefresh] = useState(0);

  const items = ['Brake Pads','Oil Filter','Spark Plugs','Air Filter','Timing Belt','Battery','Alternator','Radiator Hose','Wiper Blades','Clutch Plate','CV Joint','Wheel Bearing','Shock Absorber','Fuel Pump','Headlight Bulb','Engine Oil 5L','Transmission Fluid','Power Steering Fluid','Brake Disc','Fan Belt'];

  const todaySales = useMemo(() => {
    let sales = data.sales.filter(s => s.date === today());
    if (filterState.staff) sales = sales.filter(s => s.rep === filterState.staff);
    if (filterState.channel) sales = sales.filter(s => s.channel === filterState.channel);
    return sales.sort((a, b) => b.time.localeCompare(a.time));
  }, [data.sales, filterState, refresh]);

  const todayRevenue = todaySales.reduce((s, x) => s + x.total, 0);
  const todayTxns = todaySales.length;

  const handleSubmit = () => {
    if (!form.customer || !form.item || !form.price) {
      showToast('Please fill in Customer, Item, and Price', 'error');
      return;
    }
    const qty = parseInt(form.qty) || 1;
    const price = parseFloat(form.price) || 0;
    updateData(d => {
      const receipt = `AGL-RCT-${String(d.settings.receiptCounter++).padStart(3, '0')}`;
      d.sales.push({
        id: `s_${Date.now()}`, date: today(), time: now(),
        customer: form.customer, contact: form.contact, channel: form.channel,
        rep: form.rep, item: form.item, qty, price, total: qty * price,
        payment: form.payment, receipt, status: 'Completed',
        vehicle: form.vehicle, notes: form.notes,
      });
    });
    showToast(`Sale recorded: ${form.item} x${form.qty} = ${fmtGHS(parseInt(form.qty) * parseFloat(form.price))}`, 'success');
    setForm({ customer: '', contact: '', channel: 'Walk-In', rep: 'Yvonne', item: '', qty: '1', price: '', payment: 'Cash', vehicle: '', notes: '' });
    setRefresh(r => r + 1);
  };

  return (
    <div>
      {/* Quick Stats */}
      <div className="grid grid-4" style={{ marginBottom: '8px' }}>
        <div className="card kpi-card green"><div className="kpi-label">Today Revenue</div><div className="kpi-value">{fmtGHS(todayRevenue)}</div></div>
        <div className="card kpi-card navy"><div className="kpi-label">Transactions</div><div className="kpi-value">{todayTxns}</div></div>
        <div className="card kpi-card gold"><div className="kpi-label">Avg Transaction</div><div className="kpi-value">{fmtGHS(todayTxns ? todayRevenue / todayTxns : 0)}</div></div>
        <div className="card kpi-card amber"><div className="kpi-label">Cash Collected</div><div className="kpi-value">{fmtGHS(todaySales.filter(s => s.payment === 'Cash').reduce((a, b) => a + b.total, 0))}</div></div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: '8px' }}>
        {/* Entry Form */}
        <div className="card" style={{ padding: '14px' }}>
          <h3 style={{ marginBottom: '12px', color: '#fff' }}>New Sale / Transaction</h3>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Customer Name *</label><input className="form-control" value={form.customer} onChange={e => setForm(f => ({ ...f, customer: e.target.value }))} placeholder="Enter customer name" /></div>
            <div className="form-group"><label className="form-label">Contact</label><input className="form-control" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} placeholder="Phone number" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Sales Channel</label>
              <select className="form-control" value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}>{['Walk-In','WhatsApp','Phone','Facebook','Instagram','Wholesale','Workshop'].map(c => <option key={c}>{c}</option>)}</select>
            </div>
            <div className="form-group"><label className="form-label">Sales Rep</label>
              <select className="form-control" value={form.rep} onChange={e => setForm(f => ({ ...f, rep: e.target.value }))}>{['Yvonne','Abigail'].map(r => <option key={r}>{r}</option>)}</select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Item / Service *</label>
              <select className="form-control" value={form.item} onChange={e => setForm(f => ({ ...f, item: e.target.value }))}><option value="">Select item...</option>{items.map(i => <option key={i}>{i}</option>)}</select>
            </div>
            <div className="form-group"><label className="form-label">Quantity</label><input type="number" className="form-control" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} min="1" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Unit Price (GHS) *</label><input type="number" className="form-control" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" /></div>
            <div className="form-group"><label className="form-label">Payment Method</label>
              <select className="form-control" value={form.payment} onChange={e => setForm(f => ({ ...f, payment: e.target.value }))}>{['Cash','MoMo','Bank Transfer','Credit'].map(p => <option key={p}>{p}</option>)}</select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Vehicle Reg</label><input className="form-control" value={form.vehicle} onChange={e => setForm(f => ({ ...f, vehicle: e.target.value }))} placeholder="GR-1234-24" /></div>
            <div className="form-group"><label className="form-label">Notes</label><input className="form-control" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes" /></div>
          </div>
          {form.price && form.qty && (
            <div style={{ margin: '10px 0', padding: '8px 12px', background: 'rgba(22,160,133,0.1)', border: '1px solid rgba(22,160,133,0.2)', borderRadius: 'var(--radius-sm)', fontFamily: 'Rajdhani', fontSize: '16px', fontWeight: 700, color: '#1ABC9C' }}>
              Total: {fmtGHS((parseInt(form.qty) || 0) * (parseFloat(form.price) || 0))}
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button className="btn btn-primary" onClick={handleSubmit}>Record Sale</button>
            <button className="btn btn-secondary" onClick={() => setForm({ customer: '', contact: '', channel: 'Walk-In', rep: 'Yvonne', item: '', qty: '1', price: '', payment: 'Cash', vehicle: '', notes: '' })}>Clear</button>
          </div>
        </div>

        {/* Recent Entries */}
        <div className="card" style={{ padding: '14px' }}>
          <h3 style={{ marginBottom: '12px', color: '#fff' }}>Today's Entries</h3>
          <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
            <table>
              <thead><tr><th>Time</th><th>Customer</th><th>Item</th><th>Qty</th><th>Total</th><th>Payment</th><th>Receipt</th></tr></thead>
              <tbody>
                {todaySales.map(s => (
                  <tr key={s.id}>
                    <td>{s.time}</td><td>{s.customer}</td><td>{s.item}</td><td>{s.qty}</td>
                    <td style={{ color: '#1ABC9C', fontWeight: 600 }}>{fmtGHS(s.total)}</td>
                    <td>{s.payment}</td><td style={{ fontFamily: 'monospace', fontSize: '8pt' }}>{s.receipt}</td>
                  </tr>
                ))}
                {todaySales.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px' }}>No entries today yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
