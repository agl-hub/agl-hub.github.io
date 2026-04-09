import { useState, useMemo } from 'react';
import { getData, updateData, fmtGHS } from '../lib/dataStore';
import { useLayout } from '../components/MainLayout';

const fmt = (n: number) => fmtGHS(n);

export default function Inventory() {
  const { showToast, openModal } = useLayout();
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  void refresh;

  const data = getData();
  const inventory = data.inventory || [];

  const categories = useMemo(() => ['All', ...Array.from(new Set(inventory.map(i => i.category))).sort()], [inventory]);

  const filtered = useMemo(() => {
    let items = inventory;
    if (catFilter !== 'All') items = items.filter(i => i.category === catFilter);
    if (stockFilter === 'low') items = items.filter(i => i.qty > 0 && i.qty <= (i.reorder || 5));
    if (stockFilter === 'out') items = items.filter(i => i.qty === 0);
    if (search) items = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()));
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }, [inventory, catFilter, stockFilter, search]);

  // Metrics
  const totalValue = inventory.reduce((a, b) => a + b.qty * b.cost, 0);
  const retailValue = inventory.reduce((a, b) => a + b.qty * b.sell, 0);
  const lowStock = inventory.filter(i => i.qty > 0 && i.qty <= (i.reorder || 5)).length;
  const outOfStock = inventory.filter(i => i.qty === 0).length;

  const openAddItem = () => openModal(<ItemForm onDone={() => { setRefresh(r => r + 1); showToast('Item added', 'success'); }} />);
  const openEditItem = (item: any) => openModal(<ItemForm item={item} onDone={() => { setRefresh(r => r + 1); showToast('Item updated', 'success'); }} />);
  const openAdjust = (item: any) => openModal(<AdjustForm item={item} onDone={() => { setRefresh(r => r + 1); showToast('Stock adjusted', 'success'); }} />);

  const deleteItem = (id: string) => {
    updateData(d => { d.inventory = d.inventory.filter(i => i.id !== id); });
    setRefresh(r => r + 1);
    showToast('Item removed', 'success');
  };

  return (
    <div>
      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '6px', marginBottom: '10px' }}>
        {[
          { label: 'Total SKUs', value: String(inventory.length), color: '#4F46E5' },
          { label: 'Stock Value (Cost)', value: fmt(totalValue), color: '#D97706' },
          { label: 'Retail Value', value: fmt(retailValue), color: '#059669' },
          { label: 'Low Stock', value: String(lowStock), color: '#D97706' },
          { label: 'Out of Stock', value: String(outOfStock), color: '#BE123C' },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '7px 10px', borderLeft: `3px solid ${k.color}` }}>
            <div style={{ fontSize: '8px', color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '2px' }}>{k.label}</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '14px', fontWeight: 700, color: k.color, lineHeight: 1.1 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" style={{ fontSize: '10px', padding: '5px 12px' }} onClick={openAddItem}>+ Add Item</button>
        <input className="form-control" placeholder="Search name or SKU..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '200px', fontSize: '10px', padding: '4px 8px' }} />
        <select className="form-control" value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ width: '150px', fontSize: '10px', padding: '4px 8px' }}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['all','low','out'] as const).map(f => (
            <button key={f} className={`tab-btn ${stockFilter === f ? 'active' : ''}`} style={{ fontSize: '9px', padding: '3px 8px' }} onClick={() => setStockFilter(f)}>
              {f === 'all' ? 'All Stock' : f === 'low' ? `Low Stock (${lowStock})` : `Out of Stock (${outOfStock})`}
            </button>
          ))}
        </div>
        <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginLeft: 'auto' }}>{filtered.length} items</span>
      </div>

      {/* Inventory Table */}
      <div className="card" style={{ padding: '12px' }}>
        <div style={{ overflowY: 'auto', maxHeight: '600px' }}>
          <table>
            <thead>
              <tr>
                <th>SKU</th><th>Item Name</th><th>Category</th><th>Qty</th>
                <th>Reorder</th><th>Cost (GHS)</th><th>Sell (GHS)</th><th>Stock Value</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const isOut = item.qty === 0;
                const isLow = !isOut && item.qty <= (item.reorder || 5);
                return (
                  <tr key={item.id} style={{ background: isOut ? 'rgba(127,29,29,0.06)' : isLow ? 'rgba(120,53,15,0.06)' : 'transparent' }}>
                    <td style={{ fontFamily: 'monospace', fontSize: '8px', color: 'var(--text-muted)' }}>{item.sku}</td>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td style={{ fontSize: '9px' }}>{item.category}</td>
                    <td style={{ fontWeight: 700, color: isOut ? '#BE123C' : isLow ? '#D97706' : '#059669', textAlign: 'center', fontSize: '13px' }}>{item.qty}</td>
                    <td style={{ textAlign: 'center', color: 'var(--text-dim)' }}>{item.reorder || 5}</td>
                    <td>{fmt(item.cost)}</td>
                    <td style={{ color: '#059669' }}>{fmt(item.sell)}</td>
                    <td style={{ color: '#D97706', fontWeight: 700 }}>{fmt(item.qty * item.cost)}</td>
                    <td>
                      <span className={`status-badge ${isOut ? 'status-awaiting' : isLow ? 'status-progress' : 'status-completed'}`} style={{ fontSize: '7px' }}>
                        {isOut ? 'OUT' : isLow ? 'LOW' : 'OK'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        <button style={{ fontSize: '7px', padding: '2px 5px', background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.3)', borderRadius: '3px', color: '#D97706', cursor: 'pointer' }} onClick={() => openAdjust(item)}>Adjust</button>
                        <button style={{ fontSize: '7px', padding: '2px 5px', background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.3)', borderRadius: '3px', color: '#818CF8', cursor: 'pointer' }} onClick={() => openEditItem(item)}>Edit</button>
                        <button style={{ fontSize: '7px', padding: '2px 5px', background: 'rgba(190,18,60,0.1)', border: '1px solid rgba(190,18,60,0.3)', borderRadius: '3px', color: '#BE123C', cursor: 'pointer' }} onClick={() => deleteItem(item.id)}>✕</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '30px' }}>No items found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdjustForm({ item, onDone }: { item: any; onDone: () => void }) {
  const [type, setType] = useState<'add' | 'remove' | 'set'>('add');
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('');
  const newQty = type === 'set' ? (parseInt(qty) || 0) : type === 'add' ? item.qty + (parseInt(qty) || 0) : Math.max(0, item.qty - (parseInt(qty) || 0));
  const submit = () => {
    if (!qty) return;
    updateData(d => {
      const i = d.inventory.find(x => x.id === item.id);
      if (i) i.qty = newQty;
    });
    onDone();
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Current Stock: <strong style={{ color: '#fff', fontFamily: 'Georgia,serif', fontSize: '16px' }}>{item.qty}</strong></div>
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        {(['add','remove','set'] as const).map(t => (
          <button key={t} className={`tab-btn ${type === t ? 'active' : ''}`} style={{ fontSize: '9px', padding: '4px 10px', flex: 1, textTransform: 'capitalize' }} onClick={() => setType(t)}>{t === 'add' ? '+ Add' : t === 'remove' ? '- Remove' : '= Set'}</button>
        ))}
      </div>
      <div className="form-group">
        <label className="form-label">{type === 'set' ? 'New Quantity' : `Quantity to ${type}`}</label>
        <input type="number" className="form-control" value={qty} onChange={e => setQty(e.target.value)} min="0" />
      </div>
      {qty && <div style={{ padding: '6px 10px', background: 'rgba(217,119,6,0.08)', borderRadius: '4px', fontSize: '10px', color: 'var(--text-dim)' }}>New quantity will be: <strong style={{ color: newQty < (item.reorder || 5) ? '#D97706' : '#059669', fontFamily: 'Georgia,serif', fontSize: '14px' }}>{newQty}</strong></div>}
      <div className="form-group"><label className="form-label">Reason</label><input className="form-control" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Stock count, sale, damage..." /></div>
      <button className="btn btn-primary" onClick={submit} disabled={!qty}>Apply Adjustment</button>
    </div>
  );
}

function ItemForm({ item, onDone }: { item?: any; onDone: () => void }) {
  const [form, setForm] = useState({
    name: item?.name || '', sku: item?.sku || '', category: item?.category || 'Filters',
    qty: item?.qty ? String(item.qty) : '0', reorder: item?.reorder ? String(item.reorder) : '5',
    cost: item?.cost ? String(item.cost) : '', sell: item?.sell ? String(item.sell) : '',
  });
  const submit = () => {
    if (!form.name) return;
    updateData(d => {
      if (item) {
        const idx = d.inventory.findIndex(i => i.id === item.id);
        if (idx >= 0) d.inventory[idx] = { ...d.inventory[idx], ...form, qty: parseInt(form.qty)||0, reorder: parseInt(form.reorder)||5, cost: parseFloat(form.cost)||0, sell: parseFloat(form.sell)||0 };
      } else {
        const sku = form.sku || `SKU-${Date.now().toString().slice(-6)}`;
        d.inventory.push({ id: `inv_${Date.now()}`, ...form, sku, qty: parseInt(form.qty)||0, reorder: parseInt(form.reorder)||5, cost: parseFloat(form.cost)||0, sell: parseFloat(form.sell)||0 });
      }
    });
    onDone();
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div className="form-group" style={{ gridColumn: 'span 2' }}><label className="form-label">Item Name *</label><input className="form-control" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} /></div>
        <div className="form-group"><label className="form-label">SKU / Part No</label><input className="form-control" value={form.sku} onChange={e => setForm(f=>({...f,sku:e.target.value}))} placeholder="Auto-generated if blank" /></div>
        <div className="form-group"><label className="form-label">Category</label>
          <select className="form-control" value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}>
            {['Filters','Spark Plugs','Oils','Belts','Brakes','Electrical','Services','Other'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Current Qty</label><input type="number" className="form-control" value={form.qty} onChange={e => setForm(f=>({...f,qty:e.target.value}))} min="0" /></div>
        <div className="form-group"><label className="form-label">Reorder Level</label><input type="number" className="form-control" value={form.reorder} onChange={e => setForm(f=>({...f,reorder:e.target.value}))} min="0" /></div>
        <div className="form-group"><label className="form-label">Cost Price (GHS)</label><input type="number" className="form-control" value={form.cost} onChange={e => setForm(f=>({...f,cost:e.target.value}))} /></div>
        <div className="form-group"><label className="form-label">Selling Price (GHS)</label><input type="number" className="form-control" value={form.sell} onChange={e => setForm(f=>({...f,sell:e.target.value}))} /></div>
      </div>
      <button className="btn btn-primary" onClick={submit}>{item ? 'Update Item' : 'Add Item'}</button>
    </div>
  );
}
