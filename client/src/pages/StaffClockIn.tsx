import { useState, useMemo } from 'react';
import { getData, updateData, today, now } from '../lib/dataStore';
import { useLayout } from '../components/MainLayout';

const STAFF = ['Yvonne','Abigail','Bright','Ben','Appiah','Kojo','Fatawu','Chris'];

export default function StaffClockIn() {
  const { showToast } = useLayout();
  const data = getData();
  const [refresh, setRefresh] = useState(0);

  const todayRecords = useMemo(() => data.clockin.filter(c => c.date === today()), [data.clockin, refresh]);
  const clockedIn = todayRecords.filter(c => c.timeIn && !c.timeOut).length;
  const clockedOut = todayRecords.filter(c => c.timeOut).length;
  const absent = STAFF.length - todayRecords.length;
  const lateCount = todayRecords.filter(c => { const [h, m] = c.timeIn.split(':').map(Number); return h > 8 || (h === 8 && m > 15); }).length;

  const clockIn = (staff: string) => {
    const existing = todayRecords.find(c => c.staff === staff);
    if (existing) { showToast(`${staff} already clocked in today`, 'info'); return; }
    updateData(d => {
      d.clockin.push({ id: `ci_${Date.now()}`, staff, date: today(), timeIn: now(), timeOut: '' });
    });
    showToast(`${staff} clocked in at ${now()}`, 'success');
    setRefresh(r => r + 1);
  };

  const clockOut = (staff: string) => {
    updateData(d => {
      const rec = d.clockin.find(c => c.staff === staff && c.date === today() && !c.timeOut);
      if (rec) rec.timeOut = now();
    });
    showToast(`${staff} clocked out at ${now()}`, 'success');
    setRefresh(r => r + 1);
  };

  // Weekly attendance
  const weekDates = useMemo(() => {
    const dates: string[] = [];
    const d = new Date();
    for (let i = 6; i >= 0; i--) {
      const dd = new Date(d);
      dd.setDate(dd.getDate() - i);
      dates.push(dd.toISOString().slice(0, 10));
    }
    return dates;
  }, []);

  return (
    <div>
      <div className="grid grid-4" style={{ marginBottom: '8px' }}>
        <div className="card kpi-card green"><div className="kpi-label">Clocked In</div><div className="kpi-value">{clockedIn}</div></div>
        <div className="card kpi-card navy"><div className="kpi-label">Clocked Out</div><div className="kpi-value">{clockedOut}</div></div>
        <div className="card kpi-card red"><div className="kpi-label">Absent</div><div className="kpi-value">{absent}</div></div>
        <div className="card kpi-card gold"><div className="kpi-label">Late Arrivals</div><div className="kpi-value">{lateCount}</div></div>
      </div>

      {/* Quick Clock-In */}
      <div className="card" style={{ padding: '14px', marginBottom: '8px' }}>
        <h3 style={{ color: '#fff', marginBottom: '10px' }}>Quick Clock-In / Out</h3>
        <div className="grid grid-4" style={{ gap: '6px' }}>
          {STAFF.map(s => {
            const rec = todayRecords.find(c => c.staff === s);
            const isIn = rec && rec.timeIn && !rec.timeOut;
            const isOut = rec && rec.timeOut;
            return (
              <div key={s} style={{ padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: `1px solid ${isOut ? 'rgba(22,160,133,0.3)' : isIn ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)'}`, textAlign: 'center' }}>
                <div style={{ fontWeight: 600, fontSize: '11px', color: '#fff', marginBottom: '4px' }}>{s}</div>
                {!rec && <button className="btn btn-xs btn-success" onClick={() => clockIn(s)}>Clock In</button>}
                {isIn && (
                  <div>
                    <div style={{ fontSize: '8px', color: '#3B82F6', marginBottom: '4px' }}>In: {rec.timeIn}</div>
                    <button className="btn btn-xs btn-amber" onClick={() => clockOut(s)}>Clock Out</button>
                  </div>
                )}
                {isOut && (
                  <div style={{ fontSize: '8px', color: '#1ABC9C' }}>
                    {rec.timeIn} — {rec.timeOut}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Attendance Grid */}
      <div className="card" style={{ padding: '14px', marginBottom: '8px' }}>
        <h3 style={{ color: '#fff', marginBottom: '10px' }}>Weekly Attendance</h3>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Staff</th>
                {weekDates.map(d => <th key={d} style={{ fontSize: '8px' }}>{d.slice(5)}</th>)}
                <th>Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {STAFF.map(s => {
                const presentDays = weekDates.filter(d => data.clockin.some(c => c.staff === s && c.date === d)).length;
                const pct = Math.round((presentDays / 7) * 100);
                return (
                  <tr key={s}>
                    <td style={{ fontWeight: 600 }}>{s}</td>
                    {weekDates.map(d => {
                      const rec = data.clockin.find(c => c.staff === s && c.date === d);
                      if (!rec) return <td key={d} style={{ textAlign: 'center' }}><span style={{ color: '#FF2D3A', fontSize: '10px' }}>✗</span></td>;
                      const [h, m] = rec.timeIn.split(':').map(Number);
                      const late = h > 8 || (h === 8 && m > 15);
                      return <td key={d} style={{ textAlign: 'center' }}><span style={{ color: late ? '#F39C12' : '#1ABC9C', fontSize: '10px' }}>{late ? '⏰' : '✓'}</span></td>;
                    })}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: pct >= 80 ? '#16A085' : pct >= 60 ? '#F39C12' : '#E30613', borderRadius: '2px' }} />
                        </div>
                        <span style={{ fontSize: '9px', color: 'var(--text-dim)', minWidth: '28px' }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Today's Log */}
      <div className="card" style={{ padding: '10px' }}>
        <h3 style={{ color: '#fff', marginBottom: '8px' }}>Today's Attendance Log</h3>
        <table>
          <thead><tr><th>Staff</th><th>Clock In</th><th>Clock Out</th><th>Hours</th><th>Status</th></tr></thead>
          <tbody>
            {todayRecords.map(c => {
              const [h1, m1] = c.timeIn.split(':').map(Number);
              const late = h1 > 8 || (h1 === 8 && m1 > 15);
              let hours = '';
              if (c.timeOut) {
                const [h2, m2] = c.timeOut.split(':').map(Number);
                const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
                hours = `${(diff / 60).toFixed(1)}h`;
              }
              return (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.staff}</td>
                  <td style={{ color: late ? '#F39C12' : '#1ABC9C' }}>{c.timeIn}{late ? ' (Late)' : ''}</td>
                  <td>{c.timeOut || '—'}</td>
                  <td>{hours || '—'}</td>
                  <td><span className={`status-badge ${c.timeOut ? 'status-completed' : 'status-progress'}`}>{c.timeOut ? 'Completed' : 'Working'}</span></td>
                </tr>
              );
            })}
            {todayRecords.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px' }}>No clock-in records today</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
