import { useState, useMemo } from 'react';
import { getData, updateData } from '../lib/dataStore';
import { useLayout } from '../components/MainLayout';

type Dept = 'sales' | 'mechanics' | 'supervisors' | 'ceo';

export default function Training() {
  const { showToast } = useLayout();
  const data = getData();
  const [dept, setDept] = useState<Dept>('sales');
  const [refresh, setRefresh] = useState(0);

  const modules = useMemo(() => data.training[dept]?.modules || [], [data.training, dept, refresh]);

  const totalModules = modules.length;
  const avgCompletion = useMemo(() => {
    if (!totalModules) return 0;
    let total = 0, count = 0;
    modules.forEach(m => { m.assignees.forEach(a => { total += (m.completion[a] || 0); count++; }); });
    return count > 0 ? Math.round(total / count) : 0;
  }, [modules, totalModules]);

  const fullyComplete = modules.filter(m => m.assignees.every(a => (m.completion[a] || 0) >= 100)).length;
  const overdue = modules.filter(m => new Date(m.deadline) < new Date() && m.assignees.some(a => (m.completion[a] || 0) < 100)).length;

  const updateProgress = (modIdx: number, assignee: string, delta: number) => {
    updateData(d => {
      const mod = d.training[dept]?.modules[modIdx];
      if (mod) {
        const cur = mod.completion[assignee] || 0;
        mod.completion[assignee] = Math.max(0, Math.min(100, cur + delta));
      }
    });
    setRefresh(r => r + 1);
  };

  return (
    <div>
      <div className="grid grid-4" style={{ marginBottom: '8px' }}>
        <div className="card kpi-card navy"><div className="kpi-label">Total Modules</div><div className="kpi-value">{totalModules}</div></div>
        <div className="card kpi-card green"><div className="kpi-label">Avg Completion</div><div className="kpi-value">{avgCompletion}%</div></div>
        <div className="card kpi-card gold"><div className="kpi-label">Fully Complete</div><div className="kpi-value">{fullyComplete}</div></div>
        <div className="card kpi-card red"><div className="kpi-label">Overdue</div><div className="kpi-value">{overdue}</div></div>
      </div>

      <div className="tab-bar" style={{ marginBottom: '8px' }}>
        {(['sales', 'mechanics', 'supervisors', 'ceo'] as Dept[]).map(d => (
          <button key={d} className={`tab-btn ${dept === d ? 'active' : ''}`} onClick={() => setDept(d)}>
            {d === 'ceo' ? 'CEO' : d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-2" style={{ marginBottom: '8px' }}>
        {modules.map((mod, idx) => {
          const isOverdue = new Date(mod.deadline) < new Date();
          const allDone = mod.assignees.every(a => (mod.completion[a] || 0) >= 100);
          return (
            <div key={idx} className="card" style={{ padding: '12px', borderLeft: `3px solid ${allDone ? '#16A085' : isOverdue ? '#E30613' : '#F39C12'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '12px' }}>{mod.name}</div>
                  <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>Deadline: {mod.deadline}</div>
                </div>
                <span className={`status-badge ${allDone ? 'status-completed' : isOverdue ? 'status-awaiting' : 'status-progress'}`}>
                  {allDone ? 'Complete' : isOverdue ? 'Overdue' : 'In Progress'}
                </span>
              </div>
              {mod.assignees.map(a => {
                const pct = mod.completion[a] || 0;
                return (
                  <div key={a} style={{ marginBottom: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', marginBottom: '3px' }}>
                      <span style={{ color: 'var(--text-dim)' }}>{a}</span>
                      <span style={{ color: pct >= 100 ? '#1ABC9C' : pct >= 50 ? '#F39C12' : '#FF2D3A', fontWeight: 600 }}>{pct}%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: pct >= 100 ? '#16A085' : pct >= 50 ? '#F39C12' : '#E30613', borderRadius: '2px', transition: 'width 0.3s' }} />
                      </div>
                      <button className="btn btn-xs btn-secondary" style={{ padding: '0 4px', fontSize: '8px', minWidth: '20px' }} onClick={() => updateProgress(idx, a, 10)}>+10</button>
                      <button className="btn btn-xs btn-secondary" style={{ padding: '0 4px', fontSize: '8px', minWidth: '20px' }} onClick={() => { updateProgress(idx, a, 100 - pct); showToast(`${a} completed ${mod.name}`, 'success'); }}>Done</button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {modules.length === 0 && (
        <div className="card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-dim)' }}>
          No training modules for this department yet
        </div>
      )}
    </div>
  );
}
