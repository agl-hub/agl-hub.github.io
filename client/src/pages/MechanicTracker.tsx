import { useState, useMemo } from 'react';
import { getData, updateData, fmtGHS } from '../lib/dataStore';
import { useLayout } from '../components/MainLayout';

const MECHANICS = ['Appiah', 'Kojo', 'Fatawu', 'Chris'];
const fmt = (n: number) => fmtGHS(n);

export default function MechanicTracker() {
  const { showToast, openModal, closeModal } = useLayout();
  const [refresh, setRefresh] = useState(0);
  const [selectedMech, setSelectedMech] = useState<string | null>(null);
  const [recallFilter, setRecallFilter] = useState(false);

  const data = useMemo(() => getData(), [refresh]);
  const jobs = data.workshop;

  const stats = useMemo(() => {
    return MECHANICS.map(name => {
      const myJobs = jobs.filter(j => j.mechanic === name);
      const completed = myJobs.filter(j => j.status === 'Completed');
      const recalls = myJobs.filter(j => (j as any).recall);
      const rate = myJobs.length ? Math.round((completed.length / myJobs.length) * 100) : 0;
      const mechData = data.mechanics[name] || { jobs: 0, recalls: 0, deductions: 0 };
      const penalty = recalls.length * 50; // GHS 50 per recall
      const rating = rate >= 90 ? 5 : rate >= 80 ? 4 : rate >= 70 ? 3 : rate >= 60 ? 2 : 1;
      return { name, total: myJobs.length, completed: completed.length, active: myJobs.filter(j => j.status !== 'Completed').length, recalls: recalls.length, rate, rating, penalty, deductions: mechData.deductions };
    });
  }, [jobs, data.mechanics]);

  const displayJobs = useMemo(() => {
    let filtered = selectedMech ? jobs.filter(j => j.mechanic === selectedMech) : jobs;
    if (recallFilter) filtered = filtered.filter(j => (j as any).recall);
    return [...filtered].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [jobs, selectedMech, recallFilter]);

  const openAddRecall = (jobId: string) => {
    openModal(<RecallForm jobId={jobId} onDone={() => { setRefresh(r => r + 1); showToast('Recall logged — penalty applied', 'info'); closeModal(); }} />);
  };

  const openAddJob = () => {
    openModal(<JobForm onDone={() => { setRefresh(r => r + 1); showToast('Job added', 'success'); closeModal(); }} />);
  };

  const updateStatus = (id: string, status: string) => {
    updateData(d => {
      const j = d.workshop.find(w => w.id === id);
      if (j) j.status = status;
    });
    setRefresh(r => r + 1);
    showToast(`Status updated to ${status}`, 'success');
  };

  return (
    <div>
      {/* Mechanic Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '12px' }}>
        {stats.map(m => (
          <div key={m.name} className="card" style={{ padding: '10px 12px', borderLeft: `3px solid ${m.rating >= 4 ? '#059669' : m.rating >= 3 ? '#D97706' : '#BE123C'}`, cursor: 'pointer', outline: selectedMech === m.name ? '2px solid #D97706' : 'none' }}
            onClick={() => setSelectedMech(selectedMech === m.name ? null : m.name)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{m.name}</div>
              <div style={{ display: 'flex', gap: '1px' }}>
                {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: '9px', color: s <= m.rating ? '#D97706' : 'rgba(255,255,255,0.15)' }}>★</span>)}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              <Stat label="Jobs" value={String(m.total)} color="#4F46E5" />
              <Stat label="Done" value={String(m.completed)} color="#059669" />
              <Stat label="Active" value={String(m.active)} color="#D97706" />
              <Stat label="Rate" value={`${m.rate}%`} color={m.rate >= 85 ? '#059669' : m.rate >= 70 ? '#D97706' : '#BE123C'} />
            </div>
            {m.recalls > 0 && (
              <div style={{ marginTop: '6px', padding: '3px 6px', background: 'rgba(190,18,60,0.15)', border: '1px solid rgba(190,18,60,0.3)', borderRadius: '4px', fontSize: '8px', color: '#BE123C', fontWeight: 600 }}>
                {m.recalls} recall{m.recalls > 1 ? 's' : ''} · Penalty: {fmt(m.penalty)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" style={{ fontSize: '10px', padding: '5px 12px' }} onClick={openAddJob}>+ New Job</button>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button className={`tab-btn ${!selectedMech ? 'active' : ''}`} style={{ fontSize: '9px', padding: '3px 8px' }} onClick={() => setSelectedMech(null)}>All Mechanics</button>
          {MECHANICS.map(m => (
            <button key={m} className={`tab-btn ${selectedMech === m ? 'active' : ''}`} style={{ fontSize: '9px', padding: '3px 8px' }} onClick={() => setSelectedMech(selectedMech === m ? null : m)}>{m}</button>
          ))}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: 'var(--text-dim)', cursor: 'pointer', marginLeft: 'auto' }}>
          <input type="checkbox" checked={recallFilter} onChange={e => setRecallFilter(e.target.checked)} />
          Show recalls only
        </label>
        <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{displayJobs.length} jobs</span>
      </div>

      {/* Jobs Table */}
      <div className="card" style={{ padding: '12px' }}>
        <div style={{ overflowY: 'auto', maxHeight: '500px' }}>
          <table>
            <thead>
              <tr>
                <th>Date</th><th>Vehicle</th><th>Job Description</th><th>Mechanic</th>
                <th>Status</th><th>Est. Cost</th><th>Recall</th><th>Notes</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayJobs.map(j => (
                <tr key={j.id} style={{ background: (j as any).recall ? 'rgba(190,18,60,0.06)' : 'transparent' }}>
                  <td style={{ fontSize: '8px' }}>{j.date}</td>
                  <td style={{ fontWeight: 700 }}>{j.car}</td>
                  <td style={{ maxWidth: '200px' }}>{j.job}</td>
                  <td style={{ fontWeight: 600 }}>{j.mechanic}</td>
                  <td>
                    <select value={j.status} onChange={e => updateStatus(j.id, e.target.value)}
                      style={{ fontSize: '8px', padding: '2px 4px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '3px', color: j.status === 'Completed' ? '#059669' : j.status === 'In Progress' ? '#D97706' : '#718096' }}>
                      {['Queued','In Progress','Completed','On Hold'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ color: '#D97706' }}>{j.estCost ? fmt(j.estCost) : '-'}</td>
                  <td>
                    {(j as any).recall
                      ? <span style={{ fontSize: '8px', color: '#BE123C', fontWeight: 700 }}>⚠ RECALL</span>
                      : j.status === 'Completed'
                        ? <button style={{ fontSize: '8px', padding: '2px 6px', background: 'rgba(190,18,60,0.1)', border: '1px solid rgba(190,18,60,0.3)', borderRadius: '3px', color: '#BE123C', cursor: 'pointer' }} onClick={() => openAddRecall(j.id)}>Log Recall</button>
                        : <span style={{ fontSize: '8px', color: 'var(--text-dim)' }}>-</span>}
                  </td>
                  <td style={{ fontSize: '8px', color: 'var(--text-dim)', maxWidth: '120px' }}>{(j as any).notes || '-'}</td>
                  <td>
                    <button style={{ fontSize: '8px', padding: '2px 6px', background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.3)', borderRadius: '3px', color: '#818CF8', cursor: 'pointer' }}
                      onClick={() => openModal(<JobForm job={j} onDone={() => { setRefresh(r => r + 1); showToast('Job updated', 'success'); closeModal(); }} />)}>Edit</button>
                  </td>
                </tr>
              ))}
              {displayJobs.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '30px' }}>No jobs found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Penalty Summary */}
      <div className="card" style={{ padding: '12px', marginTop: '10px' }}>
        <div className="chart-title">Penalty & Deduction Summary</div>
        <table>
          <thead><tr><th>Mechanic</th><th>Recalls</th><th>Recall Penalty (GHS 50 each)</th><th>Other Deductions</th><th>Total Deductions</th></tr></thead>
          <tbody>
            {stats.map(m => (
              <tr key={m.name}>
                <td style={{ fontWeight: 700 }}>{m.name}</td>
                <td style={{ color: m.recalls > 0 ? '#BE123C' : 'var(--text-dim)' }}>{m.recalls}</td>
                <td style={{ color: '#BE123C', fontWeight: m.recalls > 0 ? 700 : 400 }}>{fmt(m.penalty)}</td>
                <td style={{ color: 'var(--text-dim)' }}>{fmt(m.deductions)}</td>
                <td style={{ color: '#BE123C', fontWeight: 700, fontFamily: 'Georgia,serif' }}>{fmt(m.penalty + m.deductions)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '3px', padding: '3px 5px' }}>
      <div style={{ fontSize: '7px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{label}</div>
      <div style={{ fontSize: '11px', fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function RecallForm({ jobId, onDone }: { jobId: string; onDone: () => void }) {
  const [notes, setNotes] = useState('');
  const submit = () => {
    updateData(d => {
      const j = d.workshop.find(w => w.id === jobId);
      if (j) {
        (j as any).recall = true;
        (j as any).recallNotes = notes;
        const mech = j.mechanic;
        if (mech && d.mechanics[mech]) {
          d.mechanics[mech].recalls++;
          d.mechanics[mech].deductions += 50;
        }
      }
    });
    onDone();
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ padding: '8px 12px', background: 'rgba(190,18,60,0.1)', border: '1px solid rgba(190,18,60,0.3)', borderRadius: '6px', fontSize: '10px', color: '#BE123C' }}>
        ⚠ Logging a recall will apply a GHS 50 penalty deduction to the assigned mechanic.
      </div>
      <div className="form-group">
        <label className="form-label">Recall Reason / Notes *</label>
        <textarea className="form-control" value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Describe the issue that required the vehicle to return..." style={{ resize: 'vertical' }} />
      </div>
      <button className="btn btn-danger" onClick={submit} disabled={!notes.trim()}>Confirm Recall &amp; Apply Penalty</button>
    </div>
  );
}

function JobForm({ job, onDone }: { job?: any; onDone: () => void }) {
  const [form, setForm] = useState({
    car: job?.car || '', job: job?.job || '', mechanic: job?.mechanic || 'Appiah',
    status: job?.status || 'Queued', estCost: job?.estCost ? String(job.estCost) : '',
    notes: (job as any)?.notes || '', owner: (job as any)?.owner || '',
  });
  const submit = () => {
    if (!form.car || !form.job) return;
    updateData(d => {
      if (job) {
        const idx = d.workshop.findIndex(w => w.id === job.id);
        if (idx >= 0) d.workshop[idx] = { ...d.workshop[idx], ...form, estCost: parseFloat(form.estCost) || 0 };
      } else {
        d.workshop.push({ id: `w_${Date.now()}`, date: new Date().toISOString().slice(0,10), car: form.car, job: form.job, mechanic: form.mechanic, status: form.status, estCost: parseFloat(form.estCost) || 0, owner: form.owner, notes: form.notes } as any);
      }
    });
    onDone();
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div className="form-group"><label className="form-label">Vehicle Reg *</label><input className="form-control" value={form.car} onChange={e => setForm(f=>({...f,car:e.target.value}))} placeholder="GR-1234-24" /></div>
        <div className="form-group"><label className="form-label">Owner / Customer</label><input className="form-control" value={form.owner} onChange={e => setForm(f=>({...f,owner:e.target.value}))} /></div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}><label className="form-label">Job Description *</label><input className="form-control" value={form.job} onChange={e => setForm(f=>({...f,job:e.target.value}))} /></div>
        <div className="form-group"><label className="form-label">Mechanic</label>
          <select className="form-control" value={form.mechanic} onChange={e => setForm(f=>({...f,mechanic:e.target.value}))}>
            {MECHANICS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Status</label>
          <select className="form-control" value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))}>
            {['Queued','In Progress','Completed','On Hold'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Est. Cost (GHS)</label><input type="number" className="form-control" value={form.estCost} onChange={e => setForm(f=>({...f,estCost:e.target.value}))} /></div>
        <div className="form-group"><label className="form-label">Notes</label><input className="form-control" value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} /></div>
      </div>
      <button className="btn btn-primary" onClick={submit}>{job ? 'Update Job' : 'Add Job'}</button>
    </div>
  );
}
