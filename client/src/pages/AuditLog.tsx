import { useState, useMemo, useEffect } from 'react';
import { getData, fmtGHS } from '../lib/dataStore';
import { useDataRefresh } from '../lib/usePeriodData';

const fmt = (n: number) => fmtGHS(n);

type EventType = 'sale' | 'expense' | 'workshop' | 'clockin' | 'purchase_order';

interface AuditEvent {
  id: string; date: string; time: string; type: EventType;
  description: string; amount: number; ref: string; user: string; raw: any;
}

export default function AuditLog() {
  const refresh = useDataRefresh();
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [groupBy, setGroupBy] = useState<'none' | 'date' | 'type'>('none');
  const [drill, setDrill] = useState<AuditEvent | null>(null);

  const data = useMemo(() => getData(), [refresh]);

  const allEvents = useMemo((): AuditEvent[] => {
    const events: AuditEvent[] = [];

    // Sales
    data.sales.forEach(s => events.push({
      id: s.id, date: s.date, time: s.time || '00:00', type: 'sale',
      description: `Sale: ${s.item} × ${s.qty} — ${s.customer} (${s.channel})`,
      amount: s.total, ref: s.receipt, user: s.rep, raw: s,
    }));

    // Expenses
    data.expenses.forEach(e => events.push({
      id: e.id, date: e.date, time: '00:00', type: 'expense',
      description: `Expense: ${e.item}${e.supplier ? ` — ${e.supplier}` : ''}`,
      amount: -e.amount, ref: e.id, user: 'Admin', raw: e,
    }));

    // Purchase Orders
    data.purchaseOrders.forEach(po => events.push({
      id: po.id, date: po.date, time: '00:00', type: 'purchase_order',
      description: `PO: ${po.items} — ${po.supplier}`,
      amount: -po.amount, ref: po.poNumber, user: 'Admin', raw: po,
    }));

    // Workshop
    data.workshop.forEach(w => events.push({
      id: w.id, date: w.date || '2000-01-01', time: '00:00', type: 'workshop',
      description: `Workshop: ${w.car} — ${w.job} (${w.mechanic})`,
      amount: w.estCost || 0, ref: w.id, user: w.mechanic, raw: w,
    }));

    // Clock-In
    data.clockin.forEach(c => events.push({
      id: c.id, date: c.date, time: c.timeIn ?? "", type: 'clockin',
      description: `Clock-In: ${c.staff} at ${c.timeIn}${c.timeOut ? ` → ${c.timeOut}` : ' (no clock-out)'}${c.late ? ' [LATE]' : ''}`,
      amount: 0, ref: c.id, user: c.staff ?? "", raw: c,
    }));

    return events.sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
  }, [data]);

  const filtered = useMemo(() => {
    let ev = allEvents;
    if (typeFilter !== 'all') ev = ev.filter(e => e.type === typeFilter);
    if (dateFrom) ev = ev.filter(e => e.date >= dateFrom);
    if (dateTo) ev = ev.filter(e => e.date <= dateTo);
    if (search) ev = ev.filter(e => e.description.toLowerCase().includes(search.toLowerCase()) || e.ref.toLowerCase().includes(search.toLowerCase()) || e.user.toLowerCase().includes(search.toLowerCase()));
    return ev;
  }, [allEvents, typeFilter, dateFrom, dateTo, search]);

  const grouped = useMemo(() => {
    if (groupBy === 'none') return null;
    const groups: Record<string, AuditEvent[]> = {};
    filtered.forEach(e => {
      const key = groupBy === 'date' ? e.date : e.type;
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered, groupBy]);

  const totalRevenue = filtered.filter(e => e.type === 'sale').reduce((a, b) => a + b.amount, 0);
  const totalExpenses = filtered.filter(e => e.type === 'expense' || e.type === 'purchase_order').reduce((a, b) => a + Math.abs(b.amount), 0);

  const typeColor = (t: EventType) => ({ sale: '#059669', expense: '#BE123C', workshop: '#4F46E5', clockin: '#D97706', purchase_order: '#7F1D1D' }[t]);
  const typeLabel = (t: EventType) => ({ sale: 'SALE', expense: 'EXPENSE', workshop: 'WORKSHOP', clockin: 'CLOCK-IN', purchase_order: 'PO' }[t]);

  const renderTable = (events: AuditEvent[]) => (
    <table>
      <thead>
        <tr><th>Date</th><th>Time</th><th>Type</th><th>Description</th><th>Amount</th><th>Reference</th><th>User</th></tr>
      </thead>
      <tbody>
        {events.map(e => (
          <tr key={e.id} style={{ cursor: 'pointer' }} onClick={() => setDrill(e)}>
            <td style={{ fontSize: '8px' }}>{e.date}</td>
            <td style={{ fontSize: '8px', fontFamily: 'monospace' }}>{e.time}</td>
            <td><span style={{ fontSize: '7px', padding: '2px 5px', borderRadius: '3px', background: `${typeColor(e.type)}22`, color: typeColor(e.type), fontWeight: 700 }}>{typeLabel(e.type)}</span></td>
            <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.description}</td>
            <td style={{ color: e.amount > 0 ? '#059669' : e.amount < 0 ? '#BE123C' : 'var(--text-dim)', fontWeight: e.amount !== 0 ? 700 : 400, fontFamily: 'Georgia,serif' }}>
              {e.amount !== 0 ? fmt(Math.abs(e.amount)) : '-'}
            </td>
            <td style={{ fontFamily: 'monospace', fontSize: '8px', color: 'var(--text-muted)' }}>{e.ref}</td>
            <td style={{ fontSize: '9px' }}>{e.user}</td>
          </tr>
        ))}
        {events.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px' }}>No events</td></tr>}
      </tbody>
    </table>
  );

  return (
    <div>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px', marginBottom: '10px' }}>
        {[
          { label: 'Total Events', value: String(filtered.length), color: '#4F46E5' },
          { label: 'Sales Revenue', value: fmt(totalRevenue), color: '#059669' },
          { label: 'Total Outflow', value: fmt(totalExpenses), color: '#BE123C' },
          { label: 'Net', value: fmt(totalRevenue - totalExpenses), color: totalRevenue >= totalExpenses ? '#059669' : '#BE123C' },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '7px 10px', borderLeft: `3px solid ${k.color}` }}>
            <div style={{ fontSize: '8px', color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '2px' }}>{k.label}</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '14px', fontWeight: 700, color: k.color, lineHeight: 1.1 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
        <input className="form-control" placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '200px', fontSize: '10px', padding: '4px 8px' }} />
        <input type="date" className="form-control" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: '130px', fontSize: '10px', padding: '4px 8px' }} />
        <span style={{ fontSize: '9px', color: 'var(--text-dim)' }}>to</span>
        <input type="date" className="form-control" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: '130px', fontSize: '10px', padding: '4px 8px' }} />
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['all','sale','expense','workshop','clockin','purchase_order'] as const).map(t => (
            <button key={t} className={`tab-btn ${typeFilter === t ? 'active' : ''}`} style={{ fontSize: '8px', padding: '3px 7px', textTransform: 'capitalize' }} onClick={() => setTypeFilter(t)}>
              {t === 'all' ? 'All' : t === 'purchase_order' ? 'PO' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
          <span style={{ fontSize: '9px', color: 'var(--text-dim)', alignSelf: 'center' }}>Group:</span>
          {(['none','date','type'] as const).map(g => (
            <button key={g} className={`tab-btn ${groupBy === g ? 'active' : ''}`} style={{ fontSize: '8px', padding: '3px 7px', textTransform: 'capitalize' }} onClick={() => setGroupBy(g)}>{g}</button>
          ))}
        </div>
        <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{filtered.length} events</span>
      </div>

      {/* Events */}
      <div className="card" style={{ padding: '12px' }}>
        {grouped ? (
          <div>
            {grouped.map(([key, events]) => (
              <div key={key} style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#fff', padding: '5px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{key}</span>
                  <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>{events.length} events · {fmt(events.filter(e => e.amount > 0).reduce((a, b) => a + b.amount, 0))}</span>
                </div>
                <div style={{ overflowX: 'auto' }}>{renderTable(events)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ overflowY: 'auto', maxHeight: '600px' }}>{renderTable(filtered)}</div>
        )}
      </div>

      {/* Drill-through Modal */}
      {drill && (
        <div className="drillthrough-overlay" onClick={() => setDrill(null)}>
          <div className="drillthrough-panel" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>Event Detail</h3>
              <button className="btn btn-secondary" style={{ fontSize: '9px', padding: '3px 8px' }} onClick={() => setDrill(null)}>✕ Close</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {Object.entries(drill.raw).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px' }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{k}</span>
                  <span style={{ fontSize: '10px', color: '#fff', fontWeight: 600, maxWidth: '250px', textAlign: 'right', wordBreak: 'break-word' }}>{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
