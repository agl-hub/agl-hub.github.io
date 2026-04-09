import { useState, useEffect } from 'react';
import { getData } from '../lib/dataStore';

interface AuditEntry {
  id: string;
  at: string;
  action: string;
  category: string;
  detail?: string;
}

export default function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    // Generate audit log from localStorage data
    const data = getData();
    const log: AuditEntry[] = [];

    data.sales.slice(-50).forEach(s => {
      log.push({
        id: s.id,
        at: `${s.date}T${s.time || '00:00'}:00`,
        action: `sale.create`,
        category: 'mutation',
        detail: `${s.item} — ${s.customer} — GHS ${s.total}`,
      });
    });

    data.expenses.slice(-20).forEach(e => {
      log.push({
        id: e.id,
        at: `${e.date}T00:00:00`,
        action: `expense.create`,
        category: 'mutation',
        detail: `${e.item} — GHS ${e.amount}`,
      });
    });

    data.workshop.slice(-20).forEach(w => {
      log.push({
        id: w.id,
        at: `${w.date}T00:00:00`,
        action: `workshop.create`,
        category: 'mutation',
        detail: `${w.car} — ${w.job} — ${w.status}`,
      });
    });

    data.clockin.slice(-20).forEach(c => {
      log.push({
        id: c.id,
        at: `${c.date}T${c.timeIn || '00:00'}:00`,
        action: `clockin.create`,
        category: 'mutation',
        detail: `${c.staff} clocked in at ${c.timeIn}`,
      });
    });

    log.sort((a, b) => b.at.localeCompare(a.at));
    setEntries(log.slice(0, 200));
  }, [refresh]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h2 style={{ fontFamily: 'Rajdhani', fontSize: '18px', fontWeight: 700, color: '#fff' }}>Audit Log</h2>
        <button
          className="btn btn-secondary"
          onClick={() => setRefresh(r => r + 1)}
          style={{ fontSize: '11px' }}
        >
          ↻ Refresh
        </button>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {entries.length === 0 ? (
          <div style={{ padding: 16, fontSize: 12, opacity: 0.7 }}>
            No audit entries yet. Add sales, expenses, or workshop jobs to see them here.
          </div>
        ) : (
          <table style={{ width: '100%', fontSize: 11 }}>
            <thead>
              <tr>
                <th>Time</th>
                <th>Action</th>
                <th>Category</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(e => (
                <tr key={e.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {new Date(e.at).toLocaleString()}
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>{e.action}</td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '1px 6px',
                        borderRadius: 3,
                        fontSize: 10,
                        background: e.category === 'auth'
                          ? 'rgba(99,102,241,0.2)'
                          : e.category === 'mutation'
                          ? 'rgba(16,185,129,0.2)'
                          : 'rgba(245,158,11,0.2)',
                      }}
                    >
                      {e.category}
                    </span>
                  </td>
                  <td style={{ opacity: 0.8 }}>{e.detail || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
