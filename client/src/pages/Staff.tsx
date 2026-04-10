import { useState, useMemo } from 'react';
import { getData, updateData, fmtGHS } from '../lib/dataStore';
import { useLayout } from '../components/MainLayout';

const DEPARTMENTS = ['Sales', 'Workshop', 'Management', 'Admin'];
const ROLES = ['Sales Rep', 'Mechanic', 'Supervisor', 'Manager', 'CEO', 'Admin'];
const fmt = (n: number) => fmtGHS(n);

export default function Staff() {
  const { showToast, openModal, closeModal } = useLayout();
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  const data = useMemo(() => getData(), [refresh]);
  const staff = data.staff || [];

  const filtered = useMemo(() => {
    let s = staff;
    if (deptFilter !== 'All') s = s.filter(m => m.department === deptFilter);
    if (search) s = s.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.role.toLowerCase().includes(search.toLowerCase()));
    return s;
  }, [staff, deptFilter, search]);

  // HR Metrics
  const totalStaff = staff.length;
  const activeStaff = staff.filter(s => s.status === 'Active' || !s.status).length;
  const totalPayroll = staff.reduce((a, b) => a + (b.salary || 0), 0);
  const deptBreakdown = DEPARTMENTS.map(d => ({ dept: d, count: staff.filter(s => s.department === d).length }));

  const openAddStaff = () => openModal(<StaffForm onDone={() => { setRefresh(r => r + 1); showToast('Staff member added', 'success'); closeModal(); }} />);
  const openEditStaff = (member: any) => openModal(<StaffForm member={member} onDone={() => { setRefresh(r => r + 1); showToast('Staff updated', 'success'); closeModal(); }} />);

  const toggleStatus = (id: string) => {
    updateData(d => {
      const m = d.staff.find(s => s.id === id);
      if (m) m.status = m.status === 'Active' ? 'Inactive' : 'Active';
    });
    setRefresh(r => r + 1);
  };

  return (
    <div>
      {/* HR KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '6px', marginBottom: '10px' }}>
        {[
          { label: 'Total Headcount', value: String(totalStaff), color: '#4F46E5' },
          { label: 'Active', value: String(activeStaff), color: '#059669' },
          { label: 'Inactive', value: String(totalStaff - activeStaff), color: '#BE123C' },
          { label: 'Monthly Payroll', value: fmt(totalPayroll), color: '#D97706' },
          { label: 'Departments', value: String(DEPARTMENTS.length), color: '#92400E' },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '7px 10px', borderLeft: `3px solid ${k.color}` }}>
            <div style={{ fontSize: '8px', color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '2px' }}>{k.label}</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '15px', fontWeight: 700, color: k.color, lineHeight: 1.1 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Department Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px', marginBottom: '10px' }}>
        {deptBreakdown.map(d => (
          <div key={d.dept} className="card" style={{ padding: '8px 12px', cursor: 'pointer' }} onClick={() => setDeptFilter(deptFilter === d.dept ? 'All' : d.dept)}>
            <div style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: '2px' }}>{d.dept}</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>{d.count}</div>
            <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{totalStaff > 0 ? ((d.count / totalStaff) * 100).toFixed(0) : 0}% of workforce</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" style={{ fontSize: '10px', padding: '5px 12px' }} onClick={openAddStaff}>+ Add Staff</button>
        <input className="form-control" placeholder="Search name or role..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '200px', fontSize: '10px', padding: '4px 8px' }} />
        <div style={{ display: 'flex', gap: '4px' }}>
          {['All', ...DEPARTMENTS].map(d => (
            <button key={d} className={`tab-btn ${deptFilter === d ? 'active' : ''}`} style={{ fontSize: '9px', padding: '3px 8px' }} onClick={() => setDeptFilter(d)}>{d}</button>
          ))}
        </div>
        <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginLeft: 'auto' }}>{filtered.length} staff</span>
      </div>

      {/* Staff Table */}
      <div className="card" style={{ padding: '12px' }}>
        <div style={{ overflowY: 'auto', maxHeight: '500px' }}>
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Role</th><th>Department</th><th>Phone</th>
                <th>Start Date</th><th>Salary (GHS)</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 700 }}>{m.name}</td>
                  <td style={{ fontSize: '9px' }}>{m.role}</td>
                  <td><span style={{ fontSize: '8px', padding: '2px 6px', background: 'rgba(79,70,229,0.12)', borderRadius: '3px', color: '#818CF8' }}>{m.department}</span></td>
                  <td style={{ fontSize: '9px', fontFamily: 'monospace' }}>{m.phone || '-'}</td>
                  <td style={{ fontSize: '8px' }}>{m.startDate || '-'}</td>
                  <td style={{ color: '#D97706', fontWeight: 700 }}>{m.salary ? fmt(m.salary) : '-'}</td>
                  <td>
                    <span className={`status-badge ${m.status === 'Active' ? 'status-completed' : 'status-awaiting'}`} style={{ fontSize: '7px', cursor: 'pointer' }} onClick={() => toggleStatus(m.id)}>
                      {m.status || 'Active'}
                    </span>
                  </td>
                  <td>
                    <button style={{ fontSize: '8px', padding: '2px 6px', background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.3)', borderRadius: '3px', color: '#818CF8', cursor: 'pointer' }} onClick={() => openEditStaff(m)}>Edit</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '30px' }}>
                  {staff.length === 0 ? 'No staff records. Click "+ Add Staff" to begin.' : 'No staff match the current filter.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StaffForm({ member, onDone }: { member?: any; onDone: () => void }) {
  const [form, setForm] = useState({
    name: member?.name || '', role: member?.role || 'Sales Rep', department: member?.department || 'Sales',
    phone: member?.phone || '', email: member?.email || '', startDate: member?.startDate || new Date().toISOString().slice(0,10),
    salary: member?.salary ? String(member.salary) : '', status: member?.status || 'Active', notes: member?.notes || '',
  });
  const submit = () => {
    if (!form.name) return;
    updateData(d => {
      if (member) {
        const idx = d.staff.findIndex(s => s.id === member.id);
        if (idx >= 0) d.staff[idx] = { ...d.staff[idx], ...form, salary: parseFloat(form.salary) || 0 };
      } else {
        d.staff.push({ id: `st_${Date.now()}`, ...form, salary: parseFloat(form.salary) || 0, clockIn: '', clockOut: '', rating: 0 });
      }
    });
    onDone();
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div className="form-group"><label className="form-label">Full Name *</label><input className="form-control" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} /></div>
        <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} /></div>
        <div className="form-group"><label className="form-label">Role</label>
          <select className="form-control" value={form.role} onChange={e => setForm(f=>({...f,role:e.target.value}))}>
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Department</label>
          <select className="form-control" value={form.department} onChange={e => setForm(f=>({...f,department:e.target.value}))}>
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Start Date</label><input type="date" className="form-control" value={form.startDate} onChange={e => setForm(f=>({...f,startDate:e.target.value}))} /></div>
        <div className="form-group"><label className="form-label">Monthly Salary (GHS)</label><input type="number" className="form-control" value={form.salary} onChange={e => setForm(f=>({...f,salary:e.target.value}))} /></div>
        <div className="form-group"><label className="form-label">Email</label><input className="form-control" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} /></div>
        <div className="form-group"><label className="form-label">Status</label>
          <select className="form-control" value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))}>
            <option>Active</option><option>Inactive</option><option>On Leave</option>
          </select>
        </div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}><label className="form-label">Notes</label><input className="form-control" value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} /></div>
      </div>
      <button className="btn btn-primary" onClick={submit}>{member ? 'Update Staff' : 'Add Staff Member'}</button>
    </div>
  );
}
