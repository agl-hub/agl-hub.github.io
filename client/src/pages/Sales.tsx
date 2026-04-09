import { useState, useMemo } from 'react';
import { getData, updateData, fmtGHS } from '../lib/dataStore';
import { useLayout } from '../components/MainLayout';

export default function Sales() {
  const { showToast, openSlidePanel, filterState } = useLayout();
  const data = getData();
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredSales = useMemo(() => {
    let list = data.sales;
    if (search) list = list.filter(s =>
      s.customer.toLowerCase().includes(search.toLowerCase()) ||
      s.item.toLowerCase().includes(search.toLowerCase()) ||
      s.receipt.toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter !== 'All') list = list.filter(s => s.status === statusFilter);
    if (filterState.channel) list = list.filter(s => s.channel === filterState.channel);
    if (filterState.payment) list = list.filter(s => s.payment === filterState.payment);
    if (filterState.staff) list = list.filter(s => s.rep === filterState.staff);
    return list;
  }, [data.sales, search, statusFilter, filterState, refresh]);

  const totalRev = filteredSales.reduce((s, x) => s + x.total, 0);
  const txnCount = filteredSales.length;
  const avgTicket = txnCount > 0 ? totalRev / txnCount : 0;
  const completedCount = filteredSales.filter(s => s.status === 'Completed').length;

  const addSale = () => {
    openSlidePanel('New Sale Entry', (
      <div style={{ color: 'var(--text)' }}>
        <div className="form-group"><label className="form-label">Customer</label><input className="form-control" id="sale-cust" placeholder="Customer name" /></div>
        <div className="form-group"><label className="form-label">Contact</label><input className="form-control" id="sale-contact" placeholder="Phone" /></div>
        <div className="form-group"><label className="form-label">Item/Service</label><input className="form-control" id="sale-item" placeholder="Item description" /></div>
        <div className="grid grid-2" style={{ gap: '6px' }}>
          <div className="form-group"><label className="form-label">Quantity</label><input className="form-control" id="sale-qty" type="number" defaultValue="1" /></div>
          <div className="form-group"><label className="form-label">Price</label><input className="form-control" id="sale-price" type="number" placeholder="0" /></div>
        </div>
        <div className="form-group"><label className="form-label">Channel</label>
          <select className="form-control" id="sale-channel"><option>Walk-In</option><option>Phone</option><option>WhatsApp</option><option>Online</option><option>Referral</option></select>
        </div>
        <div className="form-group"><label className="form-label">Payment</label>
          <select className="form-control" id="sale-pay"><option>Cash</option><option>MoMo</option><option>Bank Transfer</option><option>Credit</option></select>
        </div>
        <div className="form-group"><label className="form-label">Vehicle</label><input className="form-control" id="sale-vehicle" placeholder="Vehicle (optional)" /></div>
        <div className="form-group"><label className="form-label">Notes</label><input className="form-control" id="sale-notes" placeholder="Notes" /></div>
        <button className="btn btn-primary" style={{ marginTop: '12px' }} onClick={() => {
          const customer = (document.getElementById('sale-cust') as HTMLInputElement)?.value;
          const contact = (document.getElementById('sale-contact') as HTMLInputElement)?.value;
          const item = (document.getElementById('sale-item') as HTMLInputElement)?.value;
          const qty = Number((document.getElementById('sale-qty') as HTMLInputElement)?.value) || 1;
          const price = Number((document.getElementById('sale-price') as HTMLInputElement)?.value) || 0;
          const channel = (document.getElementById('sale-channel') as HTMLSelectElement)?.value;
          const payment = (document.getElementById('sale-pay') as HTMLSelectElement)?.value;
          const vehicle = (document.getElementById('sale-vehicle') as HTMLInputElement)?.value;
          const notes = (document.getElementById('sale-notes') as HTMLInputElement)?.value;
          if (!customer || !item || !price) { showToast('Customer, item, and price are required', 'error'); return; }
          updateData(d => {
            const rcpt = `AGL-${String(d.settings.receiptCounter++).padStart(3, '0')}`;
            d.sales.push({
              id: `s_${Date.now()}`, date: new Date().toISOString().slice(0, 10),
              time: new Date().toTimeString().slice(0, 5), customer, contact,
              channel, rep: 'Admin', item, qty, price, total: qty * price,
              payment, receipt: rcpt, status: 'Completed', vehicle, notes,
            });
          });
          showToast(`Sale recorded: ${item}`, 'success');
          setRefresh(r => r + 1);
        }}>Record Sale</button>
      </div>
    ));
  };

  return (
    <div>
      <div className="grid grid-4" style={{ marginBottom: '8px' }}>
        <div className="card kpi-card green"><div className="kpi-label">Total Revenue</div><div className="kpi-value" style={{ fontSize: '16px' }}>{fmtGHS(totalRev)}</div></div>
        <div className="card kpi-card navy"><div className="kpi-label">Transactions</div><div className="kpi-value">{txnCount}</div></div>
        <div className="card kpi-card gold"><div className="kpi-label">Avg Ticket</div><div className="kpi-value" style={{ fontSize: '16px' }}>{fmtGHS(avgTicket)}</div></div>
        <div className="card kpi-card red"><div className="kpi-label">Completed</div><div className="kpi-value">{completedCount}</div></div>
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <input className="form-control" placeholder="Search customer, item, receipt..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: '200px' }} />
        <select className="form-control" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: '140px' }}>
          <option>All</option><option>Completed</option><option>Pending</option><option>Cancelled</option>
        </select>
        <button className="btn btn-primary" onClick={addSale}>+ New Sale</button>
      </div>

      <div className="card" style={{ padding: '10px' }}>
        <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
          <table>
            <thead style={{ position: 'sticky', top: 0, background: 'rgba(16,20,30,0.95)', zIndex: 1 }}>
              <tr><th>Date</th><th>Time</th><th>Customer</th><th>Item</th><th>Channel</th><th>Qty</th><th>Price</th><th>Total</th><th>Payment</th><th>Receipt</th><th>Rep</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filteredSales.map(s => (
                <tr key={s.id}>
                  <td>{s.date}</td>
                  <td>{s.time}</td>
                  <td style={{ fontWeight: 600 }}>{s.customer}</td>
                  <td>{s.item}</td>
                  <td><span style={{ fontSize: '8px', padding: '1px 5px', borderRadius: '3px', background: 'rgba(22,160,133,0.1)', color: '#1ABC9C' }}>{s.channel}</span></td>
                  <td>{s.qty}</td>
                  <td>{fmtGHS(s.price)}</td>
                  <td style={{ color: '#1ABC9C', fontWeight: 600 }}>{fmtGHS(s.total)}</td>
                  <td>{s.payment}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '8px' }}>{s.receipt}</td>
                  <td>{s.rep}</td>
                  <td><span className={`status-badge ${s.status === 'Completed' ? 'status-completed' : s.status === 'Pending' ? 'status-progress' : 'status-awaiting'}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
