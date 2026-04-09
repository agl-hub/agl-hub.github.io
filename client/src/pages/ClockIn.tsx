import { useState, useMemo } from 'react';
import { getData, updateData, fmtGHS } from '../lib/dataStore';
import { useLayout } from '../components/MainLayout';

const STAFF_NAMES = ['Yvonne', 'Abigail', 'Ben', 'Appiah', 'Kojo', 'Fatawu', 'Chris'];
const LATE_PENALTY = 20; // GHS 20 for late arrival
const NO_CLOCKOUT_PENALTY = 5; // GHS 5 for no clock-out
const WORK_START = '08:00';
const fmt = (n: number) => fmtGHS(n);

export default function ClockIn() {
  const { showToast, openModal } = useLayout();
  const [refresh, setRefresh] = useState(0);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10));
  const [staffFilter, setStaffFilter] = useState('All');
  void refresh;

  const data = getData();
  const records = data.clockin || [];

  const filtered = useMemo(() => {
    let r = records;
    if (dateFilter) r = r.filter(c => c.date === dateFilter);
    if (staffFilter !== 'All') r = r.filter(c => c.name === staffFilter);
    return [...r].sort((a, b) => `${b.date} ${b.timeIn}`.localeCompare(`${a.date} ${a.timeIn}`));
  }, [records, dateFilter, staffFilter]);

  // Penalty calculations
  const penaltySummary = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const monthStart = today.slice(0, 7) + '-01';
    const monthRecords = records.filter(r => r.date >= monthStart && r.date <= today);
    return STAFF_NAMES.map(name => {
      const myRecs = monthRecords.filter(r => r.name === name);
      const lateCount = myRecs.filter(r => r.timeIn > WORK_START).length;
      const noClockOut = myRecs.filter(r => !r.timeOut || r.timeOut === '-').length;
      const penalty = (lateCount * LATE_PENALTY) + (noClockOut * NO_CLOCKOUT_PENALTY);
      return { name, lateCount, noClockOut, penalty, days: myRecs.length };
    }).filter(s => s.days > 0 || s.penalty > 0);
  }, [records]);

  const totalPenalties = penaltySummary.reduce((a, b) => a + b.penalty, 0);

  const clockInNow = (name: string) => {
    const now = new Date();
    const time = now.toTimeString().slice(0, 5);
    const date = now.toISOString().slice(0, 10);
    const isLate = time > WORK_START;
    updateData(d => {
      d.clockin.push({ id: `ci_${Date.now()}`, staff: name, date, timeIn: time, timeOut: '', late: isLate, hours: 0 });
    });
    setRefresh(r => r + 1);
    showToast(`${name} clocked in at ${time}${isLate ? ' (LATE — GHS 20 penalty)' : ''}`, isLate ? 'info' : 'success');
  };

  const clockOutNow = (id: string) => {
    const time = new Date().toTimeString().slice(0, 5);
    updateData(d => {
      const r = d.clockin.find(c => c.id === id);
      if (r) {
        r.timeOut = time;
        const [ih, im] = r.timeIn.split(':').map(Number);
        const [oh, om] = time.split(':').map(Number);
        r.hours = parseFloat(((oh * 60 + om - ih * 60 - im) / 60).toFixed(2));
      }
    });
    setRefresh(r => r + 1);
    showToast('Clock-out recorded', 'success');
  };

  const openManualEntry = () => openModal(<ManualEntryForm onDone={() => { setRefresh(r => r + 1); showToast('Entry recorded', 'success'); }} />);

  return (
    <div>
      {/* Quick Clock-In Buttons */}
      <div className="card" style={{ padding: '12px', marginBottom: '10px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Quick Clock-In</div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {STAFF_NAMES.map(name => {
            const todayRecord = records.find(r => r.date === new Date().toISOString().slice(0,10) && r.name === name && !r.timeOut);
            const alreadyIn = records.some(r => r.date === new Date().toISOString().slice(0,10) && r.name === name && r.timeIn);
            return (
              <div key={name} style={{ display: 'flex', gap: '4px' }}>
                <button
                  className={`btn ${alreadyIn ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ fontSize: '10px', padding: '5px 10px' }}
                  onClick={() => !alreadyIn && clockInNow(name)}
                  disabled={alreadyIn}>
                  {alreadyIn ? `✓ ${name}` : `⏱ ${name}`}
                </button>
                {todayRecord && (
                  <button className="btn btn-success" style={{ fontSize: '10px', padding: '5px 8px' }} onClick={() => clockOutNow(todayRecord.id)}>Out</button>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: '8px', color: 'var(--text-dim)', marginTop: '8px' }}>
          Work starts at {WORK_START} · Late arrival: GHS {LATE_PENALTY} penalty · No clock-out: GHS {NO_CLOCKOUT_PENALTY} penalty
        </div>
      </div>

      {/* Penalty Summary */}
      {penaltySummary.length > 0 && (
        <div className="card" style={{ padding: '12px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div className="chart-title" style={{ marginBottom: 0 }}>MTD Penalty Summary</div>
            <span style={{ fontSize: '10px', color: '#BE123C', fontWeight: 700 }}>Total: {fmt(totalPenalties)}</span>
          </div>
          <table>
            <thead><tr><th>Staff</th><th>Days Logged</th><th>Late Arrivals</th><th>Late Penalty</th><th>No Clock-Out</th><th>No-Out Penalty</th><th>Total Penalty</th></tr></thead>
            <tbody>
              {penaltySummary.map(s => (
                <tr key={s.name}>
                  <td style={{ fontWeight: 700 }}>{s.name}</td>
                  <td>{s.days}</td>
                  <td style={{ color: s.lateCount > 0 ? '#D97706' : 'var(--text-dim)' }}>{s.lateCount}</td>
                  <td style={{ color: '#D97706' }}>{fmt(s.lateCount * LATE_PENALTY)}</td>
                  <td style={{ color: s.noClockOut > 0 ? '#BE123C' : 'var(--text-dim)' }}>{s.noClockOut}</td>
                  <td style={{ color: '#BE123C' }}>{fmt(s.noClockOut * NO_CLOCKOUT_PENALTY)}</td>
                  <td style={{ color: '#BE123C', fontWeight: 700, fontFamily: 'Georgia,serif' }}>{fmt(s.penalty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Filters + Manual Entry */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
        <button className="btn btn-secondary" style={{ fontSize: '10px', padding: '5px 12px' }} onClick={openManualEntry}>+ Manual Entry</button>
        <input type="date" className="form-control" value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ width: '140px', fontSize: '10px', padding: '4px 8px' }} />
        <select className="form-control" value={staffFilter} onChange={e => setStaffFilter(e.target.value)} style={{ width: '130px', fontSize: '10px', padding: '4px 8px' }}>
          <option>All</option>
          {STAFF_NAMES.map(n => <option key={n}>{n}</option>)}
        </select>
        <button className="btn btn-secondary" style={{ fontSize: '9px', padding: '4px 8px' }} onClick={() => setDateFilter('')}>Show All Dates</button>
        <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginLeft: 'auto' }}>{filtered.length} records</span>
      </div>

      {/* Records Table */}
      <div className="card" style={{ padding: '12px' }}>
        <div style={{ overflowY: 'auto', maxHeight: '500px' }}>
          <table>
            <thead>
              <tr>
                <th>Date</th><th>Staff</th><th>Clock In</th><th>Clock Out</th>
                <th>Hours</th><th>Late</th><th>Penalty</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const isLate = r.timeIn > WORK_START;
                const noOut = !r.timeOut || r.timeOut === '-';
                const penalty = (isLate ? LATE_PENALTY : 0) + (noOut && r.date < new Date().toISOString().slice(0,10) ? NO_CLOCKOUT_PENALTY : 0);
                return (
                  <tr key={r.id}>
                    <td style={{ fontSize: '8px' }}>{r.date}</td>
                    <td style={{ fontWeight: 700 }}>{r.name}</td>
                    <td style={{ color: isLate ? '#D97706' : '#059669', fontWeight: 600, fontFamily: 'monospace' }}>{r.timeIn}</td>
                    <td style={{ color: noOut ? '#BE123C' : '#fff', fontFamily: 'monospace' }}>{r.timeOut || '—'}</td>
                    <td style={{ textAlign: 'center' }}>{r.hours ? `${r.hours}h` : '—'}</td>
                    <td>{isLate ? <span style={{ fontSize: '8px', color: '#D97706', fontWeight: 700 }}>LATE</span> : <span style={{ fontSize: '8px', color: 'var(--text-dim)' }}>On time</span>}</td>
                    <td style={{ color: penalty > 0 ? '#BE123C' : 'var(--text-dim)', fontWeight: penalty > 0 ? 700 : 400 }}>{penalty > 0 ? fmt(penalty) : '-'}</td>
                    <td>
                      {noOut && (
                        <button style={{ fontSize: '8px', padding: '2px 6px', background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.3)', borderRadius: '3px', color: '#059669', cursor: 'pointer' }} onClick={() => clockOutNow(r.id)}>Clock Out</button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '30px' }}>No records for selected filters</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ManualEntryForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({ name: 'Yvonne', date: new Date().toISOString().slice(0,10), timeIn: '08:00', timeOut: '' });
  const submit = () => {
    const isLate = form.timeIn > WORK_START;
    let hours = 0;
    if (form.timeOut) {
      const [ih, im] = form.timeIn.split(':').map(Number);
      const [oh, om] = form.timeOut.split(':').map(Number);
      hours = parseFloat(((oh * 60 + om - ih * 60 - im) / 60).toFixed(2));
    }
    updateData(d => { d.clockin.push({ id: `ci_${Date.now()}`, staff: form.name, date: form.date, timeIn: form.timeIn, timeOut: form.timeOut, late: isLate, hours }); });
    onDone();
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div className="form-group"><label className="form-label">Staff Name</label>
          <select className="form-control" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))}>
            {STAFF_NAMES.map(n => <option key={n}>{n}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Date</label><input type="date" className="form-control" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} /></div>
        <div className="form-group"><label className="form-label">Clock In Time</label><input type="time" className="form-control" value={form.timeIn} onChange={e => setForm(f=>({...f,timeIn:e.target.value}))} /></div>
        <div className="form-group"><label className="form-label">Clock Out Time</label><input type="time" className="form-control" value={form.timeOut} onChange={e => setForm(f=>({...f,timeOut:e.target.value}))} /></div>
      </div>
      {form.timeIn > WORK_START && <div style={{ padding: '6px 10px', background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.3)', borderRadius: '4px', fontSize: '9px', color: '#D97706' }}>⚠ Late arrival — GHS {LATE_PENALTY} penalty will be applied</div>}
      <button className="btn btn-primary" onClick={submit}>Save Entry</button>
    </div>
  );
}
