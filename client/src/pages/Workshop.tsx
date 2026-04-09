import { useState, useMemo, useEffect, useRef } from 'react';
import { getData, updateData, fmtGHS } from '../lib/dataStore';
import { useLayout } from '../components/MainLayout';

declare const Chart: any;

export default function Workshop() {
  const { showToast, openSlidePanel } = useLayout();
  const data = getData();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInst = useRef<any>(null);
  const [refresh, setRefresh] = useState(0);

  const jobs = useMemo(() => [...data.workshop].sort((a, b) => b.date.localeCompare(a.date)), [data.workshop, refresh]);

  const queued = jobs.filter(j => j.status === 'Queued').length;
  const inProgress = jobs.filter(j => j.status === 'In Progress').length;
  const awaiting = jobs.filter(j => j.status === 'Awaiting Parts').length;
  const completed = jobs.filter(j => j.status === 'Completed').length;
  const totalEstCost = jobs.reduce((s, j) => s + (j.estCost ?? 0), 0);

  useEffect(() => {
    if (typeof Chart === 'undefined' || !chartRef.current) return;
    chartInst.current?.destroy();
    const mechMap: Record<string, number> = {};
    jobs.forEach(j => { mechMap[j.mechanic] = (mechMap[j.mechanic] || 0) + 1; });
    chartInst.current = new Chart(chartRef.current, {
      type: 'bar',
      data: { labels: Object.keys(mechMap), datasets: [{ data: Object.values(mechMap), backgroundColor: ['#BE123C','#D97706','#F59E0B','#4F46E5'], borderRadius: 4 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#718096', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.03)' } }, y: { ticks: { color: '#718096', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.03)' } } } },
    });
    return () => { chartInst.current?.destroy(); };
  }, [jobs]);

  const statusColor = (s: string) => {
    if (s === 'Queued') return 'status-queued';
    if (s === 'In Progress') return 'status-progress';
    if (s === 'Awaiting Parts') return 'status-awaiting';
    if (s === 'Completed') return 'status-completed';
    return '';
  };

  const openNewJobForm = () => {
    openSlidePanel('New Workshop Job', (
      <div style={{ color: 'var(--text)' }}>
        <div className="form-group"><label className="form-label">Vehicle Reg</label><input className="form-control" placeholder="GR-1234-24" id="ws-reg" /></div>
        <div className="form-group"><label className="form-label">Car</label><input className="form-control" placeholder="Toyota Camry" id="ws-car" /></div>
        <div className="form-group"><label className="form-label">Owner</label><input className="form-control" placeholder="Customer name" id="ws-owner" /></div>
        <div className="form-group"><label className="form-label">Job Description</label><input className="form-control" placeholder="Full service, brake repair..." id="ws-job" /></div>
        <div className="form-group"><label className="form-label">Mechanic</label>
          <select className="form-control" id="ws-mech">{['Appiah','Kojo','Fatawu','Chris'].map(m => <option key={m}>{m}</option>)}</select>
        </div>
        <div className="form-group"><label className="form-label">Est. Cost (GHS)</label><input type="number" className="form-control" placeholder="0" id="ws-cost" /></div>
        <button className="btn btn-primary" style={{ marginTop: '12px' }} onClick={() => {
          const reg = (document.getElementById('ws-reg') as HTMLInputElement)?.value;
          const car = (document.getElementById('ws-car') as HTMLInputElement)?.value;
          const owner = (document.getElementById('ws-owner') as HTMLInputElement)?.value;
          const job = (document.getElementById('ws-job') as HTMLInputElement)?.value;
          const mech = (document.getElementById('ws-mech') as HTMLSelectElement)?.value;
          const cost = parseFloat((document.getElementById('ws-cost') as HTMLInputElement)?.value) || 0;
          if (!reg || !job) { showToast('Please fill in Vehicle Reg and Job', 'error'); return; }
          updateData(d => {
            d.workshop.push({ id: `w_${Date.now()}`, date: new Date().toISOString().slice(0, 10), reg, car, owner, job, mechanic: mech, status: 'Queued', estCost: cost, notes: '' });
          });
          showToast(`Workshop job added: ${reg}`, 'success');
          setRefresh(r => r + 1);
        }}>Add Job</button>
      </div>
    ));
  };

  return (
    <div>
      <div className="grid grid-5" style={{ marginBottom: '8px' }}>
        <div className="card kpi-card amber"><div className="kpi-label">Queued</div><div className="kpi-value">{queued}</div></div>
        <div className="card kpi-card green"><div className="kpi-label">In Progress</div><div className="kpi-value">{inProgress}</div></div>
        <div className="card kpi-card gold"><div className="kpi-label">Awaiting Parts</div><div className="kpi-value">{awaiting}</div></div>
        <div className="card kpi-card navy"><div className="kpi-label">Completed</div><div className="kpi-value">{completed}</div></div>
        <div className="card kpi-card red"><div className="kpi-label">Total Est. Cost</div><div className="kpi-value">{fmtGHS(totalEstCost)}</div></div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <button className="btn btn-primary" onClick={openNewJobForm}>+ New Workshop Job</button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', marginBottom: '8px' }}>
        <div>
          <h3 style={{ color: '#fff', marginBottom: '8px' }}>Active Jobs</h3>
          <div className="grid grid-2">
            {jobs.filter(j => j.status !== 'Completed').map(j => (
              <div key={j.id} className="vehicle-card">
                <div className="vc-header">
                  <span className="vc-reg">{j.reg}</span>
                  <span className={`status-badge ${statusColor(j.status)}`}>{j.status}</span>
                </div>
                <div className="vc-info">{j.car} &mdash; {j.owner}</div>
                <div className="vc-mechanic">{'\u{1F527}'} {j.mechanic}</div>
                <div className="vc-job">{j.job}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{j.date}</span>
                  <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, color: '#10B981' }}>{fmtGHS(j.estCost ?? 0)}</span>
                </div>
                <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                  {j.status === 'Queued' && <button className="btn btn-xs btn-success" onClick={() => { updateData(d => { const f = d.workshop.find(w => w.id === j.id); if (f) f.status = 'In Progress'; }); setRefresh(r => r + 1); showToast(`${j.reg} started`, 'success'); }}>Start</button>}
                  {j.status === 'In Progress' && <button className="btn btn-xs btn-primary" onClick={() => { updateData(d => { const f = d.workshop.find(w => w.id === j.id); if (f) f.status = 'Completed'; }); setRefresh(r => r + 1); showToast(`${j.reg} completed`, 'success'); }}>Complete</button>}
                  {j.status === 'In Progress' && <button className="btn btn-xs btn-amber" onClick={() => { updateData(d => { const f = d.workshop.find(w => w.id === j.id); if (f) f.status = 'Awaiting Parts'; }); setRefresh(r => r + 1); showToast(`${j.reg} awaiting parts`, 'info'); }}>Await Parts</button>}
                  {j.status === 'Awaiting Parts' && <button className="btn btn-xs btn-success" onClick={() => { updateData(d => { const f = d.workshop.find(w => w.id === j.id); if (f) f.status = 'In Progress'; }); setRefresh(r => r + 1); showToast(`${j.reg} resumed`, 'success'); }}>Resume</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card chart-card">
          <h4>Mechanic Workload</h4>
          <div className="chart-container"><canvas ref={chartRef} /></div>
        </div>
      </div>

      <div className="card" style={{ padding: '10px' }}>
        <h3 style={{ color: '#fff', marginBottom: '8px' }}>Completed Jobs</h3>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead><tr><th>Date</th><th>Reg</th><th>Car</th><th>Owner</th><th>Job</th><th>Mechanic</th><th>Cost</th><th>Status</th></tr></thead>
            <tbody>
              {jobs.filter(j => j.status === 'Completed').map(j => (
                <tr key={j.id}>
                  <td>{j.date}</td><td style={{ fontWeight: 600 }}>{j.reg}</td><td>{j.car}</td><td>{j.owner}</td>
                  <td>{j.job}</td><td style={{ color: '#F59E0B' }}>{j.mechanic}</td>
                  <td style={{ color: '#10B981', fontWeight: 600 }}>{fmtGHS(j.estCost ?? 0)}</td>
                  <td><span className="status-badge status-completed">Completed</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
