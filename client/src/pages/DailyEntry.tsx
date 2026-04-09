import { useState, useMemo } from 'react';
import { getData, updateData, fmtGHS, today, now } from '../lib/dataStore';
import { useLayout } from '../components/MainLayout';

// Full items list from actual AGL sales history
const ITEMS = [
  // Services & Labour
  'Battery Charge','Battery Repair','Battery System Test','Borescope Inspection',
  'Brake Fluid Test','Brake Pad (Electronics)','Brake Pad (Front)','Brake Pad (Rear)',
  'Bulb Replacement','Carbon Cleaning','Catalytic Cleaning','Coil Testing',
  'Compression Test','Diagnostics','Fixing Oxygen Sensor','Gear Ball Repair',
  'Injector Cleaning','Injector Testing','Labour','Oil Change','Pressure Testing',
  'Smoke Leak Test','Suspension Work',
  // Oils & Fluids
  'Ams Oil 0w-20 EL (4L)','Ams Oil 0w-20 EL (6L)','Ams Oil 5w-30 (4L)','Ams Oil 5w-30 (6L)',
  'Ams Oil CVT (8L)','Ams Oil Coolant','Proxil 0w-20','Proxil 5w-20','Proxil 5w-30',
  'Luquid Moly SAE 5W40','Transmission Oil (4L)','SAE 75W-90 (2L)','Coolant','Zerex Coolant',
  'CVT Fluid','Brake Fluid','ATF Fluid',
  // Filters
  'Air Filter','Oil Filter','Oil Filter 4610','Oil Filter 4459','Ac Filter T5R-A01',
  'Air Filter 5BA','Air Filter 5AA','D3300 Air Filter','F2000 Air Filter',
  // NGK Spark Plugs
  'NGK 5464','NGK 9029','NGK 9723','NGK 92274','NGK 92411','NGK 93175',
  'NGK 93476 (6pcs)','NGK 93710 (6pcs)','NGK 93815','NGK 94207','NGK 94705',
  'NGK 94705 (6pcs)','NGK 95112','NGK 95112 (4pcs)','NGK 95301','NGK 95660',
  'NGK 95706','NGK 96206','NGK 96355 (6pcs)','NGK 97080','NGK 97292','NGK 97506',
  // Denso Spark Plugs
  'Denso 3426','Denso 3499-1','Denso 4701','Denso 4704-2','Denso 4711',
  'Denso 4719','Denso 5303','Denso 5304','Denso 5353','Denso 9055',
  // Champion Spark Plugs
  'Champion 7545','Champion 9201','Champion 9407','Champion 9409',
  'Champion 9410','Champion 9412','Champion 9665',
  // Other Parts
  'ABS Sensor','02 Sensor','Bosch 8165','Brake Pad','Injector','Lucas Treatment',
  'Mahle 12637199','Metal Clip','Ruthenium 90495','Stabilizer','Synthetic Stabilizer',
].sort();

export default function DailyEntry() {
  const { showToast, filterState } = useLayout();
  const data = getData();
  const [form, setForm] = useState({
    customer: '', contact: '', channel: 'Walk-In', rep: 'Yvonne',
    item: '', partNumber: '', qty: '1', price: '', payment: 'Cash',
    vehicle: '', notes: '',
  });
  const [refresh, setRefresh] = useState(0);
  const [customItem, setCustomItem] = useState(false);
  void refresh;

  const todaySales = useMemo(() => {
    let sales = data.sales.filter(s => s.date === today());
    if (filterState.staff) sales = sales.filter(s => s.rep === filterState.staff);
    if (filterState.channel) sales = sales.filter(s => s.channel === filterState.channel);
    return sales.sort((a, b) => (b.time || '').localeCompare(a.time || ''));
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
        vehicle: form.vehicle, notes: form.partNumber ? `PN: ${form.partNumber}${form.notes ? ' | ' + form.notes : ''}` : form.notes,
      });
    });
    showToast(`Sale recorded: ${form.item} x${form.qty} = ${fmtGHS(parseInt(form.qty) * parseFloat(form.price))}`, 'success');
    setForm({ customer: '', contact: '', channel: 'Walk-In', rep: 'Yvonne', item: '', partNumber: '', qty: '1', price: '', payment: 'Cash', vehicle: '', notes: '' });
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
              <select className="form-control" value={form.rep} onChange={e => setForm(f => ({ ...f, rep: e.target.value }))}>{['Yvonne','Abigail','Bright'].map(r => <option key={r}>{r}</option>)}</select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Item / Service *</label>
                <button type="button" style={{ fontSize: '8px', color: '#818CF8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => setCustomItem(c => !c)}>
                  {customItem ? '← Use list' : '+ Custom item'}
                </button>
              </div>
              {customItem
                ? <input className="form-control" value={form.item} onChange={e => setForm(f => ({ ...f, item: e.target.value }))} placeholder="Type custom item name..." />
                : <select className="form-control" value={form.item} onChange={e => setForm(f => ({ ...f, item: e.target.value }))}><option value="">Select item...</option>{ITEMS.map(i => <option key={i}>{i}</option>)}</select>
              }
            </div>
            <div className="form-group"><label className="form-label">Part Number / SKU</label><input className="form-control" value={form.partNumber} onChange={e => setForm(f => ({ ...f, partNumber: e.target.value }))} placeholder="e.g. NGK95112, 4610" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Quantity</label><input type="number" className="form-control" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} min="1" /></div>
            <div className="form-group"><label className="form-label">Unit Price (GHS) *</label><input type="number" className="form-control" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Payment Method</label>
              <select className="form-control" value={form.payment} onChange={e => setForm(f => ({ ...f, payment: e.target.value }))}>{['Cash','MoMo','Bank Transfer','Credit'].map(p => <option key={p}>{p}</option>)}</select>
            </div>
            <div className="form-group"><label className="form-label">Vehicle Reg</label><input className="form-control" value={form.vehicle} onChange={e => setForm(f => ({ ...f, vehicle: e.target.value }))} placeholder="GR-1234-24" /></div>
          </div>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}><label className="form-label">Notes</label><input className="form-control" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes" /></div>
          </div>
          {form.price && form.qty && (
            <div style={{ margin: '10px 0', padding: '8px 12px', background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.2)', borderRadius: 'var(--radius-sm)', fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 700, color: '#059669' }}>
              Total: {fmtGHS((parseInt(form.qty) || 0) * (parseFloat(form.price) || 0))}
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button className="btn btn-primary" onClick={handleSubmit}>Record Sale</button>
            <button className="btn btn-secondary" onClick={() => setForm({ customer: '', contact: '', channel: 'Walk-In', rep: 'Yvonne', item: '', partNumber: '', qty: '1', price: '', payment: 'Cash', vehicle: '', notes: '' })}>Clear</button>
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
                    <td style={{ color: '#059669', fontWeight: 600, fontFamily: 'Georgia,serif' }}>{fmtGHS(s.total)}</td>
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
