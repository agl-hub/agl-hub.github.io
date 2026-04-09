import { useState, useMemo } from 'react';
import { getData, updateData } from '../lib/dataStore';
import { useLayout } from '../components/MainLayout';

const STAFF_NAMES = ['Yvonne', 'Abigail', 'Bright', 'Ben', 'Appiah', 'Kojo', 'Fatawu', 'Chris'];
const DEPTS = ['sales', 'mechanics', 'supervisors', 'ceo'] as const;
type Dept = typeof DEPTS[number];

const DEPT_LABELS: Record<Dept, string> = { sales: 'Sales Team', mechanics: 'Mechanics', supervisors: 'Supervisors', ceo: 'Management' };

export default function Training() {
  const { showToast, openModal, closeModal } = useLayout();
  const [refresh, setRefresh] = useState(0);
  const [activeDept, setActiveDept] = useState<Dept>('sales');

  const data = useMemo(() => getData(), [refresh]);
  const modules = data.training[activeDept]?.modules || [];

  const stats = useMemo(() => DEPTS.map(d => ({
    dept: d,
    total: data.training[d]?.modules?.length || 0,
    completed: data.training[d]?.modules?.filter((m: any) => m.status === 'Completed')?.length || 0,
    overdue: data.training[d]?.modules?.filter((m: any) => m.deadline && m.deadline < new Date().toISOString().slice(0,10) && m.status !== 'Completed')?.length || 0,
  })), [data.training]);

  const openAddModule = () => openModal(<ModuleForm dept={activeDept} onDone={() => { setRefresh(r => r + 1); showToast('Module added', 'success'); }} />);
  const openEditModule = (mod: any, idx: number) => openModal(<ModuleForm dept={activeDept} module={mod} moduleIdx={idx} onDone={() => { setRefresh(r => r + 1); showToast('Module updated', 'success'); }} />);

  const deleteModule = (idx: number) => {
    updateData(d => { d.training[activeDept].modules.splice(idx, 1); });
    setRefresh(r => r + 1);
    showToast('Module removed', 'success');
  };

  const toggleStatus = (idx: number) => {
    updateData(d => {
      const m = d.training[activeDept].modules[idx];
      if (m) m.status = m.status === 'Completed' ? 'Pending' : 'Completed';
    });
    setRefresh(r => r + 1);
  };

  return (
    <div>
      {/* Dept Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px', marginBottom: '10px' }}>
        {stats.map(s => (
          <div key={s.dept} className="card" style={{ padding: '8px 12px', cursor: 'pointer', outline: activeDept === s.dept ? '2px solid #D97706' : 'none' }} onClick={() => setActiveDept(s.dept)}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{DEPT_LABELS[s.dept]}</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ fontSize: '8px', color: 'var(--text-dim)' }}>Total: <span style={{ color: '#fff', fontWeight: 700 }}>{s.total}</span></div>
              <div style={{ fontSize: '8px', color: '#059669' }}>Done: <span style={{ fontWeight: 700 }}>{s.completed}</span></div>
              {s.overdue > 0 && <div style={{ fontSize: '8px', color: '#BE123C' }}>Overdue: <span style={{ fontWeight: 700 }}>{s.overdue}</span></div>}
            </div>
            {s.total > 0 && (
              <div style={{ marginTop: '6px', height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                <div style={{ height: '100%', width: `${(s.completed / s.total) * 100}%`, background: '#059669', borderRadius: '2px', transition: 'width 0.3s' }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
        <button className="btn btn-primary" style={{ fontSize: '10px', padding: '5px 12px' }} onClick={openAddModule}>+ Add Module</button>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>{DEPT_LABELS[activeDept]}</span>
        <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{modules.length} modules</span>
      </div>

      {/* Modules Table */}
      <div className="card" style={{ padding: '12px' }}>
        <div style={{ overflowY: 'auto', maxHeight: '500px' }}>
          <table>
            <thead>
              <tr><th>Module / Task</th><th>Assigned To</th><th>Deadline</th><th>Status</th><th>Notes</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {modules.map((mod: any, idx: number) => {
                const isOverdue = mod.deadline && mod.deadline < new Date().toISOString().slice(0,10) && mod.status !== 'Completed';
                return (
                  <tr key={idx} style={{ background: isOverdue ? 'rgba(127,29,29,0.06)' : 'transparent' }}>
                    <td style={{ fontWeight: 600 }}>{mod.name}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                        {(mod.assignees || []).map((a: string) => (
                          <span key={a} style={{ fontSize: '7px', padding: '1px 5px', background: 'rgba(79,70,229,0.15)', borderRadius: '3px', color: '#818CF8' }}>{a}</span>
                        ))}
                        {(!mod.assignees || mod.assignees.length === 0) && <span style={{ fontSize: '8px', color: 'var(--text-dim)' }}>Unassigned</span>}
                      </div>
                    </td>
                    <td style={{ fontSize: '8px', color: isOverdue ? '#BE123C' : 'var(--text-dim)', fontWeight: isOverdue ? 700 : 400 }}>{mod.deadline || '-'}{isOverdue ? ' ⚠' : ''}</td>
                    <td>
                      <span className={`status-badge ${mod.status === 'Completed' ? 'status-completed' : mod.status === 'In Progress' ? 'status-progress' : 'status-awaiting'}`} style={{ fontSize: '7px', cursor: 'pointer' }} onClick={() => toggleStatus(idx)}>
                        {mod.status || 'Pending'}
                      </span>
                    </td>
                    <td style={{ fontSize: '8px', color: 'var(--text-dim)', maxWidth: '150px' }}>{mod.notes || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        <button style={{ fontSize: '7px', padding: '2px 5px', background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.3)', borderRadius: '3px', color: '#818CF8', cursor: 'pointer' }} onClick={() => openEditModule(mod, idx)}>Edit</button>
                        <button style={{ fontSize: '7px', padding: '2px 5px', background: 'rgba(190,18,60,0.1)', border: '1px solid rgba(190,18,60,0.3)', borderRadius: '3px', color: '#BE123C', cursor: 'pointer' }} onClick={() => deleteModule(idx)}>✕</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {modules.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '30px' }}>No modules for {DEPT_LABELS[activeDept]}. Click "+ Add Module" to begin.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ModuleForm({ dept, module, moduleIdx, onDone }: { dept: Dept; module?: any; moduleIdx?: number; onDone: () => void }) {
  const [form, setForm] = useState({
    name: module?.name || '', assignees: module?.assignees || [] as string[],
    deadline: module?.deadline || '', status: module?.status || 'Pending', notes: module?.notes || '',
  });
  const toggleAssignee = (name: string) => {
    setForm(f => ({ ...f, assignees: f.assignees.includes(name) ? f.assignees.filter((a: string) => a !== name) : [...f.assignees, name] }));
  };
  const submit = () => {
    if (!form.name) return;
    updateData(d => {
      if (!d.training[dept]) d.training[dept] = { modules: [] };
      if (moduleIdx !== undefined) {
        d.training[dept].modules[moduleIdx] = { ...form };
      } else {
        d.training[dept].modules.push({ ...form });
      }
    });
    onDone();
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div className="form-group"><label className="form-label">Module / Task Name *</label><input className="form-control" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} /></div>
      <div className="form-group">
        <label className="form-label">Assign To (select all that apply)</label>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
          {STAFF_NAMES.map(name => (
            <button key={name} type="button" onClick={() => toggleAssignee(name)}
              style={{ fontSize: '9px', padding: '3px 8px', borderRadius: '4px', border: '1px solid', cursor: 'pointer',
                background: form.assignees.includes(name) ? 'rgba(79,70,229,0.2)' : 'rgba(255,255,255,0.04)',
                borderColor: form.assignees.includes(name) ? '#818CF8' : 'var(--border-color)',
                color: form.assignees.includes(name) ? '#818CF8' : 'var(--text-dim)' }}>
              {name}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div className="form-group"><label className="form-label">Deadline</label><input type="date" className="form-control" value={form.deadline} onChange={e => setForm(f=>({...f,deadline:e.target.value}))} /></div>
        <div className="form-group"><label className="form-label">Status</label>
          <select className="form-control" value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))}>
            <option>Pending</option><option>In Progress</option><option>Completed</option>
          </select>
        </div>
      </div>
      <div className="form-group"><label className="form-label">Notes</label><textarea className="form-control" value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} rows={2} style={{ resize: 'vertical' }} /></div>
      <button className="btn btn-primary" onClick={submit}>{moduleIdx !== undefined ? 'Update Module' : 'Add Module'}</button>
    </div>
  );
}
