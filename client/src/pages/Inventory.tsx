import { useState, useMemo } from 'react';
import { getData, updateData, fmtGHS } from '../lib/dataStore';
import { useLayout } from '../components/MainLayout';

export default function Inventory() {
  const { showToast, openSlidePanel } = useLayout();
  const data = getData();
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState('');

  const items = useMemo(() => {
    let list = data.inventory;
    if (search) list = list.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [data.inventory, search, refresh]);

  const totalItems = data.inventory.length;
  const totalValue = data.inventory.reduce((s, i) => s + i.qty * i.cost, 0);
  const lowStock = data.inventory.filter(i => i.qty <= i.reorder).length;
  const categories = Array.from(new Set(data.inventory.map(i => i.category))).length;

  const addItem = () => {
    openSlidePanel('Add Inventory Item', (
      <div style={{ color: 'var(--text)' }}>
        <div className="form-group"><label className="form-label">Item Name</label><input className="form-control" id="inv-name" placeholder="Item name" /></div>
        <div className="form-group"><label className="form-label">Category</label><input className="form-control" id="inv-cat" placeholder="Category" /></div>
        <div className="form-group"><label className="form-label">SKU</label><input className="form-control" id="inv-sku" placeholder="SKU code" /></div>
        <div className="grid grid-2" style={{ gap: '6px' }}>
          <div className="form-group"><label className="form-label">Quantity</label><input className="form-control" id="inv-qty" type="number" placeholder="0" /></div>
          <div className="form-group"><label className="form-label">Reorder Level</label><input className="form-control" id="inv-reorder" type="number" placeholder="0" /></div>
          <div className="form-group"><label className="form-label">Cost Price</label><input className="form-control" id="inv-cost" type="number" placeholder="0" /></div>
          <div className="form-group"><label className="form-label">Sell Price</label><input className="form-control" id="inv-sell" type="number" placeholder="0" /></div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: '12px' }} onClick={() => {
          const name = (document.getElementById('inv-name') as HTMLInputElement)?.value;
          const category = (document.getElementById('inv-cat') as HTMLInputElement)?.value;
          const sku = (document.getElementById('inv-sku') as HTMLInputElement)?.value;
          const qty = Number((document.getElementById('inv-qty') as HTMLInputElement)?.value) || 0;
          const reorder = Number((document.getElementById('inv-reorder') as HTMLInputElement)?.value) || 0;
          const cost = Number((document.getElementById('inv-cost') as HTMLInputElement)?.value) || 0;
          const sell = Number((document.getElementById('inv-sell') as HTMLInputElement)?.value) || 0;
          if (!name) { showToast('Item name is required', 'error'); return; }
          updateData(d => { d.inventory.push({ id: `inv_${Date.now()}`, name, category, sku, qty, reorder, cost, sell }); });
          showToast(`Added: ${name}`, 'success');
          setRefresh(r => r + 1);
        }}>Add Item</button>
      </div>
    ));
  };

  const quickSale = (item: typeof data.inventory[0]) => {
    openSlidePanel(`Quick Sale: ${item.name}`, (
      <div style={{ color: 'var(--text)' }}>
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', color: '#fff', fontWeight: 600 }}>{item.name}</div>
          <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>SKU: {item.sku} | In Stock: {item.qty}</div>
          <div style={{ fontSize: '12px', color: '#1ABC9C', fontWeight: 700, marginTop: '4px' }}>{fmtGHS(item.sell)} each</div>
        </div>
        <div className="form-group"><label className="form-label">Quantity</label><input className="form-control" id="qs-qty" type="number" defaultValue="1" min="1" /></div>
        <div className="form-group"><label className="form-label">Customer</label><input className="form-control" id="qs-cust" placeholder="Customer name" /></div>
        <div className="form-group"><label className="form-label">Payment</label>
          <select className="form-control" id="qs-pay"><option>Cash</option><option>MoMo</option><option>Bank Transfer</option><option>Credit</option></select>
        </div>
        <button className="btn btn-primary" style={{ marginTop: '12px' }} onClick={() => {
          const qty = Number((document.getElementById('qs-qty') as HTMLInputElement)?.value) || 1;
          const customer = (document.getElementById('qs-cust') as HTMLInputElement)?.value || 'Walk-In';
          const payment = (document.getElementById('qs-pay') as HTMLSelectElement)?.value;
          if (qty > item.qty) { showToast('Insufficient stock!', 'error'); return; }
          updateData(d => {
            const inv = d.inventory.find(i => i.id === item.id);
            if (inv) inv.qty -= qty;
            const rcpt = `AGL-RCT-${String(d.settings.receiptCounter++).padStart(3, '0')}`;
            d.sales.push({
              id: `s_${Date.now()}`, date: new Date().toISOString().slice(0, 10),
              time: new Date().toTimeString().slice(0, 5), customer, contact: '',
              channel: 'Walk-In', rep: 'POS', item: item.name, qty, price: item.sell,
              total: qty * item.sell, payment, receipt: rcpt, status: 'Completed',
              vehicle: '', notes: 'Quick POS sale',
            });
          });
          showToast(`Sold ${qty}x ${item.name} — ${fmtGHS(qty * item.sell)}`, 'success');
          setRefresh(r => r + 1);
        }}>Complete Sale</button>
      </div>
    ));
  };

  return (
    <div>
      <div className="grid grid-4" style={{ marginBottom: '8px' }}>
        <div className="card kpi-card navy"><div className="kpi-label">Total Items</div><div className="kpi-value">{totalItems}</div></div>
        <div className="card kpi-card green"><div className="kpi-label">Stock Value</div><div className="kpi-value" style={{ fontSize: '16px' }}>{fmtGHS(totalValue)}</div></div>
        <div className="card kpi-card red"><div className="kpi-label">Low Stock</div><div className="kpi-value">{lowStock}</div></div>
        <div className="card kpi-card gold"><div className="kpi-label">Categories</div><div className="kpi-value">{categories}</div></div>
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
        <input className="form-control" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={addItem}>+ Add Item</button>
      </div>

      <div className="card" style={{ padding: '10px' }}>
        <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
          <table>
            <thead>
              <tr><th>Item</th><th>Category</th><th>SKU</th><th>Qty</th><th>Reorder</th><th>Cost</th><th>Sell</th><th>Value</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {items.map(item => {
                const isLow = item.qty <= item.reorder;
                const isOut = item.qty === 0;
                return (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td>{item.category}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '9px' }}>{item.sku}</td>
                    <td style={{ color: isOut ? '#FF2D3A' : isLow ? '#F39C12' : '#1ABC9C', fontWeight: 600 }}>{item.qty}</td>
                    <td>{item.reorder}</td>
                    <td>{fmtGHS(item.cost)}</td>
                    <td style={{ color: '#1ABC9C', fontWeight: 600 }}>{fmtGHS(item.sell)}</td>
                    <td>{fmtGHS(item.qty * item.cost)}</td>
                    <td><span className={`status-badge ${isOut ? 'status-awaiting' : isLow ? 'status-progress' : 'status-completed'}`}>{isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}</span></td>
                    <td><button className="btn btn-xs btn-primary" onClick={() => quickSale(item)} disabled={isOut}>Sell</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
