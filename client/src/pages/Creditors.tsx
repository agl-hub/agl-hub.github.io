import { useState, useMemo } from 'react';
import { getData, updateData, fmtGHS } from '../lib/dataStore';
import { useLayout } from '../components/MainLayout';

export default function Creditors() {
  const { showToast, openSlidePanel } = useLayout();
  const data = getData();
  const [refresh, setRefresh] = useState(0);

  const creditors = useMemo(() => data.creditors, [data.creditors, refresh]);
  const totalOwed = creditors.reduce((s, c) => s + (c.amount - c.paid), 0);
  const totalPaid = creditors.reduce((s, c) => s + c.paid, 0);
  const urgentCount = creditors.filter(c => c.priority === 'Urgent' && c.paid < c.amount).length;
  const overdueCount = creditors.filter(c => new Date(c.dueDate) < new Date() && c.paid < c.amount).length;

  const addCreditor = () => {
    openSlidePanel('Add Creditor', (
      <div style={{ color: 'var(--text)' }}>
        <div className="form-group"><label className="form-label">Name</label><input className="form-control" id="cr-name" placeholder="Creditor name" /></div>
        <div className="form-group"><label className="form-label">Contact</label><input className="form-control" id="cr-contact" placeholder="Phone number" /></div>
        <div className="form-group"><label className="form-label">Amount Owed</label><input className="form-control" id="cr-amount" type="number" placeholder="0" /></div>
        <div className="form-group"><label className="form-label">Category</label>
          <select className="form-control" id="cr-cat"><option>Parts Supplier</option><option>Service Provider</option><option>Staff Advance</option><option>Rent/Utilities</option><option>Other</option></select>
        </div>
        <div className="form-group"><label className="form-label">Priority</label>
          <select className="form-control" id="cr-prio"><option>Normal</option><option>High</option><option>Urgent</option></select>
        </div>
        <div className="form-group"><label className="form-label">Due Date</label><input className="form-control" id="cr-due" type="date" /></div>
        <button className="btn btn-primary" style={{ marginTop: '12px' }} onClick={() => {
          const name = (document.getElementById('cr-name') as HTMLInputElement)?.value;
          const contact = (document.getElementById('cr-contact') as HTMLInputElement)?.value;
          const amount = Number((document.getElementById('cr-amount') as HTMLInputElement)?.value) || 0;
          const category = (document.getElementById('cr-cat') as HTMLSelectElement)?.value;
          const priority = (document.getElementById('cr-prio') as HTMLSelectElement)?.value;
          const dueDate = (document.getElementById('cr-due') as HTMLInputElement)?.value;
          if (!name || !amount) { showToast('Name and amount required', 'error'); return; }
          updateData(d => {
            d.creditors.push({ id: `cr_${Date.now()}`, name, contact, amount, date: new Date().toISOString().slice(0, 10), dueDate, category, priority, notes: '', paid: 0 });
          });
          showToast(`Creditor added: ${name}`, 'success');
          setRefresh(r => r + 1);
        }}>Add Creditor</button>
      </div>
    ));
  };

  const makePayment = (creditor: typeof creditors[0]) => {
    openSlidePanel(`Payment: ${creditor.name}`, (
      <div style={{ color: 'var(--text)' }}>
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', color: '#fff', fontWeight: 600 }}>{creditor.name}</div>
          <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>Total: {fmtGHS(creditor.amount)} | Paid: {fmtGHS(creditor.paid)} | Balance: {fmtGHS(creditor.amount - creditor.paid)}</div>
        </div>
        <div className="form-group"><label className="form-label">Payment Amount</label><input className="form-control" id="pay-amt" type="number" placeholder="0" /></div>
        <div className="form-group"><label className="form-label">Method</label>
          <select className="form-control" id="pay-method"><option>Cash</option><option>MoMo</option><option>Bank Transfer</option><option>Cheque</option></select>
        </div>
        <div className="form-group"><label className="form-label">Reference</label><input className="form-control" id="pay-ref" placeholder="Payment reference" /></div>
        <button className="btn btn-primary" style={{ marginTop: '12px' }} onClick={() => {
          const amount = Number((document.getElementById('pay-amt') as HTMLInputElement)?.value) || 0;
          const method = (document.getElementById('pay-method') as HTMLSelectElement)?.value;
          const reference = (document.getElementById('pay-ref') as HTMLInputElement)?.value;
          if (!amount) { showToast('Enter payment amount', 'error'); return; }
          const balance = creditor.amount - creditor.paid;
          if (amount > balance) { showToast('Amount exceeds balance', 'error'); return; }
          updateData(d => {
            const cr = d.creditors.find(c => c.id === creditor.id);
            if (cr) cr.paid += amount;
            d.payments.push({ id: `pay_${Date.now()}`, creditorId: creditor.id, amount, date: new Date().toISOString().slice(0, 10), method, reference, notes: '' });
          });
          showToast(`Payment of ${fmtGHS(amount)} recorded`, 'success');
          setRefresh(r => r + 1);
        }}>Record Payment</button>
      </div>
    ));
  };

  return (
    <div>
      <div className="grid grid-4" style={{ marginBottom: '8px' }}>
        <div className="card kpi-card red"><div className="kpi-label">Total Owed</div><div className="kpi-value" style={{ fontSize: '16px' }}>{fmtGHS(totalOwed)}</div></div>
        <div className="card kpi-card green"><div className="kpi-label">Total Paid</div><div className="kpi-value" style={{ fontSize: '16px' }}>{fmtGHS(totalPaid)}</div></div>
        <div className="card kpi-card gold"><div className="kpi-label">Urgent</div><div className="kpi-value">{urgentCount}</div></div>
        <div className="card kpi-card navy"><div className="kpi-label">Overdue</div><div className="kpi-value">{overdueCount}</div></div>
      </div>

      <div style={{ marginBottom: '8px' }}><button className="btn btn-primary" onClick={addCreditor}>+ Add Creditor</button></div>

      <div className="card" style={{ padding: '10px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead><tr><th>Name</th><th>Contact</th><th>Category</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Due Date</th><th>Priority</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {creditors.map(c => {
                const balance = c.amount - c.paid;
                const isOverdue = new Date(c.dueDate) < new Date() && balance > 0;
                const isPaid = balance <= 0;
                return (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td style={{ fontSize: '9px' }}>{c.contact}</td>
                    <td>{c.category}</td>
                    <td style={{ fontWeight: 600 }}>{fmtGHS(c.amount)}</td>
                    <td style={{ color: '#1ABC9C' }}>{fmtGHS(c.paid)}</td>
                    <td style={{ color: balance > 0 ? '#FF2D3A' : '#1ABC9C', fontWeight: 600 }}>{fmtGHS(balance)}</td>
                    <td style={{ color: isOverdue ? '#FF2D3A' : 'var(--text-dim)' }}>{c.dueDate}</td>
                    <td><span style={{ fontSize: '8px', padding: '1px 5px', borderRadius: '3px', background: c.priority === 'Urgent' ? 'rgba(227,6,19,0.15)' : c.priority === 'High' ? 'rgba(243,156,18,0.15)' : 'rgba(255,255,255,0.05)', color: c.priority === 'Urgent' ? '#FF2D3A' : c.priority === 'High' ? '#F39C12' : 'var(--text-dim)', fontWeight: 600 }}>{c.priority}</span></td>
                    <td><span className={`status-badge ${isPaid ? 'status-completed' : isOverdue ? 'status-awaiting' : 'status-progress'}`}>{isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Active'}</span></td>
                    <td>{!isPaid && <button className="btn btn-xs btn-primary" onClick={() => makePayment(c)}>Pay</button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {data.payments.length > 0 && (
        <div className="card" style={{ padding: '10px', marginTop: '8px' }}>
          <h3 style={{ color: '#fff', marginBottom: '8px' }}>Payment History</h3>
          <table>
            <thead><tr><th>Date</th><th>Creditor</th><th>Amount</th><th>Method</th><th>Reference</th></tr></thead>
            <tbody>
              {[...data.payments].sort((a, b) => b.date.localeCompare(a.date)).map(p => {
                const cr = data.creditors.find(c => c.id === p.creditorId);
                return (
                  <tr key={p.id}>
                    <td>{p.date}</td>
                    <td style={{ fontWeight: 600 }}>{cr?.name || 'Unknown'}</td>
                    <td style={{ color: '#1ABC9C', fontWeight: 600 }}>{fmtGHS(p.amount)}</td>
                    <td>{p.method}</td>
                    <td style={{ fontSize: '9px', color: 'var(--text-dim)' }}>{p.reference || '\u2014'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
