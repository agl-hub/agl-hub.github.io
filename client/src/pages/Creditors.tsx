import { useState, useMemo } from 'react';
import { getData, updateData, fmtGHS } from '../lib/dataStore';
import { useLayout } from '../components/MainLayout';

const fmt = (n: number) => fmtGHS(n);
const today = () => new Date().toISOString().slice(0, 10);

export default function Creditors() {
  const { showToast, openModal, closeModal } = useLayout();
  const [refresh, setRefresh] = useState(0);
  const [filter, setFilter] = useState<'all' | 'open' | 'overdue' | 'paid'>('open');
  const [search, setSearch] = useState('');

  const data = useMemo(() => getData(), [refresh]);
  const creditors = data.creditors || [];
  const payments = data.payments || [];

  // Metrics
  const open = creditors.filter(c => !c.paid);
  const overdue = open.filter(c => c.dueDate && c.dueDate < today());
  const totalOwed = open.reduce((a, b) => a + b.amount, 0);
  const totalOverdue = overdue.reduce((a, b) => a + b.amount, 0);
  const totalPaid = creditors.filter(c => c.paid).reduce((a, b) => a + b.amount, 0);

  const filtered = useMemo(() => {
    let c = creditors;
    if (filter === 'open') c = c.filter(x => !x.paid);
    if (filter === 'overdue') c = c.filter(x => !x.paid && x.dueDate < today());
    if (filter === 'paid') c = c.filter(x => !!x.paid);
    if (search) c = c.filter(x => x.name.toLowerCase().includes(search.toLowerCase()));
    return [...c].sort((a, b) => (b.dueDate || '').localeCompare(a.dueDate || ''));
  }, [creditors, filter, search]);

  const openAddCreditor = () => openModal(<CreditorForm onDone={() => { setRefresh(r => r + 1); showToast('Creditor added', 'success'); closeModal(); }} />);
  const openEditCreditor = (c: any) => openModal(<CreditorForm creditor={c} onDone={() => { setRefresh(r => r + 1); showToast('Creditor updated', 'success'); closeModal(); }} />);
  const openPayment = (c: any) => openModal(<PaymentForm creditor={c} onDone={() => { setRefresh(r => r + 1); showToast('Payment recorded', 'success'); closeModal(); }} />);

  const markPaid = (id: string) => {
    updateData(d => {
      const c = d.creditors.find(x => x.id === id);
      if (c) c.paid = 1;
    });
    setRefresh(r => r + 1);
    showToast('Marked as paid', 'success');
  };

  const deleteCreditor = (id: string) => {
    updateData(d => { d.creditors = d.creditors.filter(x => x.id !== id); });
    setRefresh(r => r + 1);
    showToast('Creditor removed', 'success');
  };

  return (
    <div>
      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px', marginBottom: '10px' }}>
        {[
          { label: 'Total Outstanding', value: fmt(totalOwed), color: '#BE123C' },
          { label: 'Overdue', value: fmt(totalOverdue), color: '#7F1D1D' },
          { label: 'Total Creditors', value: String(open.length), color: '#D97706' },
          { label: 'Total Settled', value: fmt(totalPaid), color: '#059669' },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '7px 10px', borderLeft: `3px solid ${k.color}` }}>
            <div style={{ fontSize: '8px', color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '2px' }}>{k.label}</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '15px', fontWeight: 700, color: k.color, lineHeight: 1.1 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" style={{ fontSize: '10px', padding: '5px 12px' }} onClick={openAddCreditor}>+ Add Creditor</button>
        <input className="form-control" placeholder="Search creditor..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '180px', fontSize: '10px', padding: '4px 8px' }} />
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['all','open','overdue','paid'] as const).map(f => (
            <button key={f} className={`tab-btn ${filter === f ? 'active' : ''}`} style={{ fontSize: '9px', padding: '3px 8px', textTransform: 'capitalize' }} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginLeft: 'auto' }}>{filtered.length} records</span>
      </div>

      {/* Creditors Table */}
      <div className="card" style={{ padding: '12px', marginBottom: '10px' }}>
        <div style={{ overflowY: 'auto', maxHeight: '450px' }}>
          <table>
            <thead>
              <tr>
                <th>Creditor / Supplier</th><th>Category</th><th>Amount (GHS)</th>
                <th>Date Incurred</th><th>Due Date</th><th>Priority</th><th>Status</th><th>Notes</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const isOverdue = !c.paid && c.dueDate < today();
                return (
                  <tr key={c.id} style={{ background: isOverdue ? 'rgba(127,29,29,0.08)' : 'transparent' }}>
                    <td style={{ fontWeight: 700 }}>{c.name}</td>
                    <td style={{ fontSize: '9px' }}>{c.category}</td>
                    <td style={{ color: c.paid ? '#059669' : '#BE123C', fontWeight: 700, fontFamily: 'Georgia,serif' }}>{fmt(c.amount)}</td>
                    <td style={{ fontSize: '8px' }}>{c.date}</td>
                    <td style={{ fontSize: '8px', color: isOverdue ? '#BE123C' : 'var(--text-dim)', fontWeight: isOverdue ? 700 : 400 }}>{c.dueDate || '-'}{isOverdue ? ' ⚠' : ''}</td>
                    <td><span style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '3px', background: c.priority === 'High' ? 'rgba(190,18,60,0.15)' : c.priority === 'Medium' ? 'rgba(217,119,6,0.15)' : 'rgba(255,255,255,0.05)', color: c.priority === 'High' ? '#BE123C' : c.priority === 'Medium' ? '#D97706' : 'var(--text-dim)' }}>{c.priority}</span></td>
                    <td><span className={`status-badge ${c.paid ? 'status-completed' : isOverdue ? 'status-awaiting' : 'status-progress'}`} style={{ fontSize: '7px' }}>{c.paid ? 'PAID' : isOverdue ? 'OVERDUE' : 'OPEN'}</span></td>
                    <td style={{ fontSize: '8px', color: 'var(--text-dim)', maxWidth: '120px' }}>{c.notes || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {!c.paid && <button style={{ fontSize: '7px', padding: '2px 5px', background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.3)', borderRadius: '3px', color: '#059669', cursor: 'pointer' }} onClick={() => openPayment(c)}>Pay</button>}
                        {!c.paid && <button style={{ fontSize: '7px', padding: '2px 5px', background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.3)', borderRadius: '3px', color: '#059669', cursor: 'pointer' }} onClick={() => markPaid(c.id)}>✓ Close</button>}
                        <button style={{ fontSize: '7px', padding: '2px 5px', background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.3)', borderRadius: '3px', color: '#818CF8', cursor: 'pointer' }} onClick={() => openEditCreditor(c)}>Edit</button>
                        <button style={{ fontSize: '7px', padding: '2px 5px', background: 'rgba(190,18,60,0.1)', border: '1px solid rgba(190,18,60,0.3)', borderRadius: '3px', color: '#BE123C', cursor: 'pointer' }} onClick={() => deleteCreditor(c.id)}>✕</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '30px' }}>No creditor records. Click "+ Add Creditor" to begin.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History */}
      {payments.length > 0 && (
        <div className="card" style={{ padding: '12px' }}>
          <div className="chart-title">Payment History</div>
          <div style={{ overflowY: 'auto', maxHeight: '200px' }}>
            <table>
              <thead><tr><th>Date</th><th>Creditor</th><th>Amount</th><th>Method</th><th>Reference</th><th>Notes</th></tr></thead>
              <tbody>
                {[...payments].sort((a, b) => b.date.localeCompare(a.date)).map(p => {
                  const cred = creditors.find(c => c.id === p.creditorId);
                  return (
                    <tr key={p.id}>
                      <td style={{ fontSize: '8px' }}>{p.date}</td>
                      <td style={{ fontWeight: 600 }}>{cred?.name || p.creditorId}</td>
                      <td style={{ color: '#059669', fontWeight: 700 }}>{fmt(p.amount)}</td>
                      <td style={{ fontSize: '9px' }}>{p.method}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '8px' }}>{p.reference}</td>
                      <td style={{ fontSize: '8px', color: 'var(--text-dim)' }}>{p.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function CreditorForm({ creditor, onDone }: { creditor?: any; onDone: () => void }) {
  const [form, setForm] = useState({
    name: creditor?.name || '', contact: creditor?.contact || '', amount: creditor?.amount ? String(creditor.amount) : '',
    date: creditor?.date || new Date().toISOString().slice(0,10), dueDate: creditor?.dueDate || '',
    category: creditor?.category || 'Supplier', priority: creditor?.priority || 'Medium', notes: creditor?.notes || '',
  });
  const submit = () => {
    if (!form.name || !form.amount) return;
    updateData(d => {
      if (creditor) {
        const idx = d.creditors.findIndex(c => c.id === creditor.id);
        if (idx >= 0) d.creditors[idx] = { ...d.creditors[idx], ...form, amount: parseFloat(form.amount) };
      } else {
        d.creditors.push({ id: `cr_${Date.now()}`, ...form, amount: parseFloat(form.amount), paid: 0 });
      }
    });
    onDone();
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div className="form-group"><label className="form-label">Creditor / Supplier *</label><input className="form-control" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} /></div>
        <div className="form-group"><label className="form-label">Contact</label><input className="form-control" value={form.contact} onChange={e => setForm(f=>({...f,contact:e.target.value}))} /></div>
        <div className="form-group"><label className="form-label">Amount (GHS) *</label><input type="number" className="form-control" value={form.amount} onChange={e => setForm(f=>({...f,amount:e.target.value}))} /></div>
        <div className="form-group"><label className="form-label">Category</label>
          <select className="form-control" value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}>
            {['Supplier','Bank Loan','Staff Advance','Utility','Rent','Other'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Date Incurred</label><input type="date" className="form-control" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} /></div>
        <div className="form-group"><label className="form-label">Due Date</label><input type="date" className="form-control" value={form.dueDate} onChange={e => setForm(f=>({...f,dueDate:e.target.value}))} /></div>
        <div className="form-group"><label className="form-label">Priority</label>
          <select className="form-control" value={form.priority} onChange={e => setForm(f=>({...f,priority:e.target.value}))}>
            <option>High</option><option>Medium</option><option>Low</option>
          </select>
        </div>
        <div className="form-group"><label className="form-label">Notes</label><input className="form-control" value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} /></div>
      </div>
      <button className="btn btn-primary" onClick={submit}>{creditor ? 'Update Creditor' : 'Add Creditor'}</button>
    </div>
  );
}

function PaymentForm({ creditor, onDone }: { creditor: any; onDone: () => void }) {
  const [form, setForm] = useState({ amount: String(creditor.amount), method: 'Cash', reference: '', notes: '', date: new Date().toISOString().slice(0,10) });
  const submit = () => {
    if (!form.amount) return;
    updateData(d => {
      d.payments.push({ id: `pay_${Date.now()}`, creditorId: creditor.id, amount: parseFloat(form.amount), date: form.date, method: form.method, reference: form.reference, notes: form.notes });
      if (parseFloat(form.amount) >= creditor.amount) {
        const c = d.creditors.find(x => x.id === creditor.id);
        if (c) c.paid = 1;
      }
    });
    onDone();
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ padding: '8px 12px', background: 'rgba(217,119,6,0.08)', borderRadius: '6px', fontSize: '10px', color: 'var(--text-dim)' }}>Outstanding: <strong style={{ color: '#BE123C', fontFamily: 'Georgia,serif' }}>{fmtGHS(creditor.amount)}</strong></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div className="form-group"><label className="form-label">Payment Amount (GHS)</label><input type="number" className="form-control" value={form.amount} onChange={e => setForm(f=>({...f,amount:e.target.value}))} /></div>
        <div className="form-group"><label className="form-label">Date</label><input type="date" className="form-control" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} /></div>
        <div className="form-group"><label className="form-label">Method</label>
          <select className="form-control" value={form.method} onChange={e => setForm(f=>({...f,method:e.target.value}))}>
            {['Cash','MoMo','Bank Transfer','Cheque'].map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Reference</label><input className="form-control" value={form.reference} onChange={e => setForm(f=>({...f,reference:e.target.value}))} /></div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}><label className="form-label">Notes</label><input className="form-control" value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} /></div>
      </div>
      <button className="btn btn-primary" onClick={submit}>Record Payment</button>
    </div>
  );
}
