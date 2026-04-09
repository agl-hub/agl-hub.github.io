import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getData, updateData, fmtGHS } from '../lib/dataStore';
import { useLayout } from '../components/MainLayout';

const MECHANICS = ['Appiah', 'Kojo', 'Fatawu', 'Chris', 'Samuel', 'Emmanuel'];
const STATUSES = ['Queued', 'In Progress', 'Awaiting Parts', 'Completed'];
const STATUS_COLORS: Record<string, string> = {
  'Queued': '#D97706', 'In Progress': '#4F46E5', 'Awaiting Parts': '#7F1D1D', 'Completed': '#059669'
};
const CHART_COLORS = ['#BE123C','#D97706','#4F46E5','#059669','#7F1D1D','#92400E'];

function statusClass(s: string) {
  if (s === 'Queued') return 'status-queued';
  if (s === 'In Progress') return 'status-progress';
  if (s === 'Awaiting Parts') return 'status-awaiting';
  if (s === 'Completed') return 'status-completed';
  return '';
}

function JobForm({ job, onDone }: { job?: any; onDone: () => void }) {
  const { showToast } = useLayout();
  const [form, setForm] = useState({
    reg: job?.reg || '', car: job?.car || '', owner: job?.owner || '',
    job: job?.job || '', mechanic: job?.mechanic || MECHANICS[0],
    estCost: job?.estCost ? String(job.estCost) : '', notes: job?.notes || '',
    status: job?.status || 'Queued',
  });
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const submit = () => {
    if (!form.reg.trim() || !form.job.trim()) {
      showToast('Vehicle Reg and Job Description are required', 'error'); return;
    }
    updateData(d => {
      if (job) {
        const idx = d.workshop.findIndex(w => w.id === job.id);
        if (idx >= 0) d.workshop[idx] = { ...d.workshop[idx], ...form, estCost: parseFloat(form.estCost) || 0 };
      } else {
        d.workshop.push({
          id: `w_${Date.now()}`, date: new Date().toISOString().slice(0, 10),
          reg: form.reg, car: form.car, owner: form.owner, job: form.job,
          mechanic: form.mechanic, status: form.status, estCost: parseFloat(form.estCost) || 0, notes: form.notes,
        });
      }
    });
    showToast(job ? `Job updated: ${form.reg}` : `Job added: ${form.reg}`, 'success');
    onDone();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div className="form-group">
          <label className="form-label">Vehicle Reg *</label>
          <input className="form-control" placeholder="GR-1234-24" value={form.reg} onChange={f('reg')} />
        </div>
        <div className="form-group">
          <label className="form-label">Car Make / Model</label>
          <input className="form-control" placeholder="Toyota Camry" value={form.car} onChange={f('car')} />
        </div>
        <div className="form-group">
          <label className="form-label">Owner / Customer</label>
          <input className="form-control" value={form.owner} onChange={f('owner')} />
        </div>
        <div className="form-group">
          <label className="form-label">Mechanic</label>
          <select className="form-control" value={form.mechanic} onChange={f('mechanic')}>
            {MECHANICS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label className="form-label">Job Description *</label>
          <textarea className="form-control" rows={2} placeholder="Full service, brake pad replacement..." value={form.job} onChange={f('job')} />
        </div>
        <div className="form-group">
          <label className="form-label">Est. Cost (GHS)</label>
          <input type="number" className="form-control" placeholder="0" value={form.estCost} onChange={f('estCost')} />
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-control" value={form.status} onChange={f('status')}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label className="form-label">Notes</label>
          <input className="form-control" value={form.notes} onChange={f('notes')} />
        </div>
      </div>
      <button className="btn btn-primary" onClick={submit}>{job ? 'Update Job' : 'Add Job'}</button>
    </div>
  );
}

export default function Workshop() {
  const { showToast, openModal, closeModal } = useLayout();
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [mechFilter, setMechFilter] = useState('All');

  const data = useMemo(() => getData(), [refresh]);
  const jobs = useMemo(() => {
    let j = [...data.workshop].sort((a, b) => b.date.localeCompare(a.date));
    if (statusFilter !== 'All') j = j.filter(x => x.status === statusFilter);
    if (mechFilter !== 'All') j = j.filter(x => x.mechanic === mechFilter);
    if (search) j = j.filter(x =>
      x.reg.toLowerCase().includes(search.toLowerCase()) ||
      x.car.toLowerCase().includes(search.toLowerCase()) ||
      x.job.toLowerCase().includes(search.toLowerCase()) ||
      (x.owner || '').toLowerCase().includes(search.toLowerCase())
    );
    return j;
  }, [data.workshop, statusFilter, mechFilter, search, refresh]);

  const queued    = data.workshop.filter(j => j.status === 'Queued').length;
  const inProg    = data.workshop.filter(j => j.status === 'In Progress').length;
  const awaiting  = data.workshop.filter(j => j.status === 'Awaiting Parts').length;
  const completed = data.workshop.filter(j => j.status === 'Completed').length;
  const totalCost = data.workshop.reduce((s, j) => s + (j.estCost ?? 0), 0);

  const mechChart = useMemo(() => {
    const map: Record<string, number> = {};
    data.workshop.filter(j => j.status === 'Completed').forEach(j => {
      if (j.mechanic) map[j.mechanic] = (map[j.mechanic] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [data.workshop, refresh]);

  const done = (msg: string) => { setRefresh(r => r + 1); showToast(msg, 'success'); closeModal(); };
  const openAdd  = () => openModal(<JobForm onDone={() => done('Job added successfully')} />);
  const openEdit = (job: any) => openModal(<JobForm job={job} onDone={() => done('Job updated successfully')} />);

  const advance = (id: string, from: string, to: string, label: string) => {
    updateData(d => { const f = d.workshop.find(w => w.id === id); if (f && f.status === from) f.status = to; });
    setRefresh(r => r + 1);
    showToast(label, 'success');
  };
  const deleteJob = (id: string) => {
    if (!confirm('Delete this job?')) return;
    updateData(d => { d.workshop = d.workshop.filter(w => w.id !== id); });
    setRefresh(r => r + 1);
    showToast('Job removed', 'info');
  };

  return (
    <div>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '6px', marginBottom: '10px' }}>
        {[
          { label: 'Queued', value: queued, color: STATUS_COLORS['Queued'] },
          { label: 'In Progress', value: inProg, color: STATUS_COLORS['In Progress'] },
          { label: 'Awaiting Parts', value: awaiting, color: STATUS_COLORS['Awaiting Parts'] },
          { label: 'Completed', value: completed, color: STATUS_COLORS['Completed'] },
          { label: 'Total Est. Cost', value: fmtGHS(totalCost), color: '#BE123C' },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '7px 10px', borderLeft: `3px solid ${k.color}` }}>
            <div style={{ fontSize: '8px', color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '2px' }}>{k.label}</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: typeof k.value === 'string' ? '13px' : '22px', fontWeight: 700, color: k.color, lineHeight: 1.1 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Controls + Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '8px', marginBottom: '10px' }}>
        <div className="card" style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="btn btn-primary" style={{ fontSize: '10px', padding: '5px 12px' }} onClick={openAdd}>+ New Job</button>
            <input className="form-control" placeholder="Search reg, car, owner, job..." value={search}
              onChange={e => setSearch(e.target.value)} style={{ width: '200px', fontSize: '10px', padding: '4px 8px' }} />
            <select className="form-control" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ width: '130px', fontSize: '10px', padding: '4px 8px' }}>
              <option>All</option>{STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <select className="form-control" value={mechFilter} onChange={e => setMechFilter(e.target.value)}
              style={{ width: '120px', fontSize: '10px', padding: '4px 8px' }}>
              <option>All</option>{MECHANICS.map(m => <option key={m}>{m}</option>)}
            </select>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginLeft: 'auto' }}>{jobs.length} jobs shown</span>
          </div>
        </div>
        <div className="card" style={{ padding: '10px' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Completed by Mechanic</div>
          {mechChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={mechChart} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 8, fill: 'var(--text-dim)' }} />
                <YAxis tick={{ fontSize: 8, fill: 'var(--text-dim)' }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', fontSize: '10px' }} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {mechChart.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '9px', paddingTop: '20px' }}>No completed jobs yet</div>
          )}
        </div>
      </div>

      {/* Jobs Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', fontSize: '10px' }}>
            <thead>
              <tr>
                <th>Date</th><th>Reg</th><th>Car</th><th>Owner</th>
                <th>Job</th><th>Mechanic</th><th>Est. Cost</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '9px' }}>{j.date}</td>
                  <td><strong style={{ color: '#D97706' }}>{j.reg}</strong></td>
                  <td>{j.car}</td>
                  <td style={{ fontSize: '9px', color: 'var(--text-dim)' }}>{j.owner || '-'}</td>
                  <td style={{ maxWidth: '200px' }}>{j.job}</td>
                  <td><span style={{ background: 'rgba(79,70,229,0.12)', color: '#818CF8', padding: '1px 6px', borderRadius: '3px', fontSize: '9px' }}>{j.mechanic}</span></td>
                  <td style={{ fontFamily: 'Georgia, serif', color: '#D97706' }}>{fmtGHS(j.estCost ?? 0)}</td>
                  <td><span className={`status-badge ${statusClass(j.status)}`} style={{ fontSize: '8px' }}>{j.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                      {j.status === 'Queued' && <button className="btn btn-xs btn-success" onClick={() => advance(j.id, 'Queued', 'In Progress', `${j.reg} started`)}>Start</button>}
                      {j.status === 'In Progress' && <button className="btn btn-xs btn-primary" onClick={() => advance(j.id, 'In Progress', 'Completed', `${j.reg} completed`)}>Complete</button>}
                      {j.status === 'In Progress' && <button className="btn btn-xs btn-amber" onClick={() => advance(j.id, 'In Progress', 'Awaiting Parts', `${j.reg} awaiting parts`)}>Await Parts</button>}
                      {j.status === 'Awaiting Parts' && <button className="btn btn-xs btn-success" onClick={() => advance(j.id, 'Awaiting Parts', 'In Progress', `${j.reg} resumed`)}>Resume</button>}
                      <button className="btn btn-xs btn-secondary" onClick={() => openEdit(j)}>Edit</button>
                      <button className="btn btn-xs" style={{ background: 'rgba(190,18,60,0.1)', color: '#BE123C', border: '1px solid rgba(190,18,60,0.3)', borderRadius: '3px', padding: '1px 5px', cursor: 'pointer', fontSize: '8px' }} onClick={() => deleteJob(j.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                  {data.workshop.length === 0 ? 'No workshop jobs. Click "+ New Job" to begin.' : 'No jobs match the current filter.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
