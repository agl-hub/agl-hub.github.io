import { useState, useMemo } from 'react';
import { getData, updateData } from '../lib/dataStore';
import { useLayout } from '../components/MainLayout';

export default function ClockIn() {
  const { showToast } = useLayout();
  const data = getData();
  const [refresh, setRefresh] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedStaff, setSelectedStaff] = useState('');

  const staffNames = useMemo(() => data.staff.map(s => s.name), [data.staff]);

  const todayRecords = useMemo(() => {
    return data.clockin.filter(r => r.date === selectedDate);
  }, [data.clockin, selectedDate, refresh]);

  const presentCount = todayRecords.filter(r => r.timeIn).length;
  const lateCount = todayRecords.filter(r => {
    if (!r.timeIn) return false;
    const [h, m] = r.timeIn.split(':').map(Number);
    return h > 8 || (h === 8 && m > 15);
  }).length;
  const absentCount = staffNames.length - presentCount;

  const doClockIn = () => {
    if (!selectedStaff) { showToast('Select a staff member', 'error'); return; }
    const existing = data.clockin.find(r => r.staff === selectedStaff && r.date === selectedDate);
    if (existing && existing.timeIn) { showToast(`${selectedStaff} already clocked in`, 'error'); return; }
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    updateData(d => {
      d.clockin.push({ id: `ci_${Date.now()}`, staff: selectedStaff, date: selectedDate, timeIn: timeStr, timeOut: '' });
    });
    showToast(`${selectedStaff} clocked in at ${timeStr}`, 'success');
    setRefresh(r => r + 1);
  };

  const doClockOut = () => {
    if (!selectedStaff) { showToast('Select a staff member', 'error'); return; }
    const existing = data.clockin.find(r => r.staff === selectedStaff && r.date === selectedDate && r.timeIn && !r.timeOut);
    if (!existing) { showToast(`${selectedStaff} has not clocked in or already clocked out`, 'error'); return; }
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    updateData(d => {
      const rec = d.clockin.find(r => r.staff === selectedStaff && r.date === selectedDate && r.timeIn && !r.timeOut);
      if (rec) rec.timeOut = timeStr;
    });
    showToast(`${selectedStaff} clocked out at ${timeStr}`, 'success');
    setRefresh(r => r + 1);
  };

  const getHoursWorked = (timeIn: string, timeOut: string): string => {
    if (!timeIn || !timeOut) return '—';
    const [h1, m1] = timeIn.split(':').map(Number);
    const [h2, m2] = timeOut.split(':').map(Number);
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    return `${(diff / 60).toFixed(1)}h`;
  };

  const isLate = (timeIn: string): boolean => {
    if (!timeIn) return false;
    const [h, m] = timeIn.split(':').map(Number);
    return h > 8 || (h === 8 && m > 15);
  };

  return (
    <div>
      <div className="grid grid-4" style={{ marginBottom: '8px' }}>
        <div className="card kpi-card green"><div className="kpi-label">Present</div><div className="kpi-value">{presentCount}</div><div className="kpi-sub">Clocked in today</div></div>
        <div className="card kpi-card gold"><div className="kpi-label">Late</div><div className="kpi-value">{lateCount}</div><div className="kpi-sub">After 8:15 AM</div></div>
        <div className="card kpi-card red"><div className="kpi-label">Absent</div><div className="kpi-value">{absentCount}</div><div className="kpi-sub">Not clocked in</div></div>
        <div className="card kpi-card navy"><div className="kpi-label">Total Staff</div><div className="kpi-value">{staffNames.length}</div><div className="kpi-sub">Expected today</div></div>
      </div>

      {/* Quick Clock In/Out */}
      <div className="card" style={{ padding: '12px', marginBottom: '8px' }}>
        <h4 style={{ color: 'var(--text-dim)', marginBottom: '8px', fontSize: '10px', fontFamily: 'Rajdhani', fontWeight: 600 }}>QUICK CLOCK IN / OUT</h4>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label className="form-label">Staff Member</label>
            <select className="form-control" value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)}>
              <option value="">Select staff...</option>
              {staffNames.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div style={{ minWidth: '140px' }}>
            <label className="form-label">Date</label>
            <input type="date" className="form-control" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
          </div>
          <button className="btn" style={{ background: '#1ABC9C', color: '#fff', fontWeight: 600 }} onClick={doClockIn}>Clock In</button>
          <button className="btn" style={{ background: '#E30613', color: '#fff', fontWeight: 600 }} onClick={doClockOut}>Clock Out</button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card" style={{ padding: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h4 style={{ color: 'var(--text-dim)', fontSize: '10px', fontFamily: 'Rajdhani', fontWeight: 600 }}>ATTENDANCE RECORDS — {selectedDate}</h4>
          <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{todayRecords.length} records</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr><th>Staff</th><th>Clock In</th><th>Clock Out</th><th>Hours</th><th>Status</th></tr>
            </thead>
            <tbody>
              {todayRecords.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No records for this date</td></tr>
              ) : todayRecords.map(r => (
                <tr key={r.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="staff-avatar">{r.staff.charAt(0)}</div>
                      <span style={{ fontWeight: 600 }}>{r.staff}</span>
                    </div>
                  </td>
                  <td style={{ color: '#1ABC9C', fontFamily: 'monospace' }}>{r.timeIn || '—'}</td>
                  <td style={{ color: '#F39C12', fontFamily: 'monospace' }}>{r.timeOut || '—'}</td>
                  <td style={{ fontWeight: 600 }}>{getHoursWorked(r.timeIn, r.timeOut)}</td>
                  <td>
                    <span className={`status-badge ${isLate(r.timeIn) ? 'status-progress' : 'status-completed'}`}>
                      {isLate(r.timeIn) ? 'Late' : 'On Time'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="card" style={{ padding: '10px', marginTop: '8px' }}>
        <h4 style={{ color: 'var(--text-dim)', marginBottom: '8px', fontSize: '10px', fontFamily: 'Rajdhani', fontWeight: 600 }}>MONTHLY ATTENDANCE SUMMARY</h4>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr><th>Staff</th><th>Days Present</th><th>Days Late</th><th>Total Hours</th><th>Attendance %</th></tr>
            </thead>
            <tbody>
              {staffNames.map(name => {
                const records = data.clockin.filter(r => r.staff === name);
                const present = records.filter(r => r.timeIn).length;
                const late = records.filter(r => isLate(r.timeIn)).length;
                const totalMins = records.reduce((sum, r) => {
                  if (!r.timeIn || !r.timeOut) return sum;
                  const [h1, m1] = r.timeIn.split(':').map(Number);
                  const [h2, m2] = r.timeOut.split(':').map(Number);
                  return sum + (h2 * 60 + m2) - (h1 * 60 + m1);
                }, 0);
                const pct = records.length > 0 ? Math.round((present / Math.max(records.length, 1)) * 100) : 0;
                return (
                  <tr key={name}>
                    <td style={{ fontWeight: 600 }}>{name}</td>
                    <td>{present}</td>
                    <td style={{ color: late > 0 ? '#F39C12' : 'inherit' }}>{late}</td>
                    <td>{(totalMins / 60).toFixed(1)}h</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div className="progress-bar" style={{ flex: 1 }}>
                          <div className="fill" style={{ width: `${pct}%`, background: pct >= 90 ? '#1ABC9C' : pct >= 75 ? '#F39C12' : '#E30613' }} />
                        </div>
                        <span style={{ fontSize: '9px', fontWeight: 600, color: pct >= 90 ? '#1ABC9C' : pct >= 75 ? '#F39C12' : '#E30613' }}>{pct}%</span>
                      </div>
                    </td>
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
