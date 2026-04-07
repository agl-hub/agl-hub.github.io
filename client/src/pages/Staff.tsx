import { useState, useMemo } from 'react';
import { getData, fmtGHS } from '../lib/dataStore';

export default function Staff() {
  const data = getData();
  const [search, setSearch] = useState('');

  const staff = useMemo(() => {
    let list = data.staff;
    if (search) list = list.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [data.staff, search]);

  const totalStaff = data.staff.length;
  const activeToday = data.staff.filter(s => s.clockIn).length;
  const avgRating = data.staff.length > 0 ? (data.staff.reduce((s, x) => s + x.rating, 0) / data.staff.length).toFixed(1) : '0';
  const totalSalaries = data.staff.reduce((s, x) => s + x.salary, 0);

  return (
    <div>
      <div className="grid grid-4" style={{ marginBottom: '8px' }}>
        <div className="card kpi-card navy"><div className="kpi-label">Total Staff</div><div className="kpi-value">{totalStaff}</div></div>
        <div className="card kpi-card green"><div className="kpi-label">Active Today</div><div className="kpi-value">{activeToday}</div></div>
        <div className="card kpi-card gold"><div className="kpi-label">Avg Rating</div><div className="kpi-value">{avgRating}</div></div>
        <div className="card kpi-card red"><div className="kpi-label">Payroll</div><div className="kpi-value" style={{ fontSize: '16px' }}>{fmtGHS(totalSalaries)}</div></div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <input className="form-control" placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card" style={{ padding: '10px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr><th>Name</th><th>Role</th><th>Department</th><th>Phone</th><th>Clock In</th><th>Clock Out</th><th>Status</th><th>Rating</th><th>Salary</th></tr>
            </thead>
            <tbody>
              {staff.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="staff-avatar">{s.name.charAt(0)}</div>
                      <span style={{ fontWeight: 600 }}>{s.name}</span>
                    </div>
                  </td>
                  <td>{s.role}</td>
                  <td>{s.department}</td>
                  <td style={{ fontSize: '9px' }}>{s.phone}</td>
                  <td style={{ color: s.clockIn ? '#1ABC9C' : 'var(--text-muted)' }}>{s.clockIn || '\u2014'}</td>
                  <td style={{ color: s.clockOut ? '#F39C12' : 'var(--text-muted)' }}>{s.clockOut || '\u2014'}</td>
                  <td><span className={`status-badge ${s.clockIn && !s.clockOut ? 'status-completed' : s.clockOut ? 'status-progress' : 'status-awaiting'}`}>{s.clockIn && !s.clockOut ? 'Active' : s.clockOut ? 'Clocked Out' : 'Absent'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '1px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} style={{ color: star <= s.rating ? '#F39C12' : 'rgba(255,255,255,0.1)', fontSize: '10px' }}>{'\u2605'}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{fmtGHS(s.salary)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
