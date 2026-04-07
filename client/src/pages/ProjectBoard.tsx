import { useState } from 'react';
import { getData, updateData } from '../lib/dataStore';
import { useLayout } from '../components/MainLayout';

const COLUMNS = ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];
const COLUMN_COLORS: Record<string, string> = { 'Backlog': '#718096', 'To Do': '#F39C12', 'In Progress': '#3B82F6', 'Review': '#8B5CF6', 'Done': '#16A085' };

export default function ProjectBoard() {
  const { showToast, openSlidePanel } = useLayout();
  const data = getData();
  const [refresh, setRefresh] = useState(0);
  const [dragId, setDragId] = useState<string | null>(null);

  const tasks = data.kanban;
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.column === 'Done').length;
  const inProgressTasks = tasks.filter(t => t.column === 'In Progress').length;

  const addTask = () => {
    openSlidePanel('New Task', (
      <div style={{ color: 'var(--text)' }}>
        <div className="form-group"><label className="form-label">Title</label><input className="form-control" id="kb-title" placeholder="Task title" /></div>
        <div className="form-group"><label className="form-label">Description</label><input className="form-control" id="kb-desc" placeholder="Task description" /></div>
        <div className="form-group"><label className="form-label">Assignee</label>
          <select className="form-control" id="kb-assign">{['Yvonne','Abigail','Appiah','Kojo','Fatawu'].map(n => <option key={n}>{n}</option>)}</select>
        </div>
        <div className="form-group"><label className="form-label">Priority</label>
          <select className="form-control" id="kb-prio"><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option></select>
        </div>
        <div className="form-group"><label className="form-label">Column</label>
          <select className="form-control" id="kb-col">{COLUMNS.map(c => <option key={c}>{c}</option>)}</select>
        </div>
        <button className="btn btn-primary" style={{ marginTop: '12px' }} onClick={() => {
          const title = (document.getElementById('kb-title') as HTMLInputElement)?.value;
          const desc = (document.getElementById('kb-desc') as HTMLInputElement)?.value;
          const assignee = (document.getElementById('kb-assign') as HTMLSelectElement)?.value;
          const priority = (document.getElementById('kb-prio') as HTMLSelectElement)?.value;
          const column = (document.getElementById('kb-col') as HTMLSelectElement)?.value;
          if (!title) { showToast('Title is required', 'error'); return; }
          updateData(d => {
            d.kanban.push({ id: `k_${Date.now()}`, title, desc, assignee, priority, column, created: new Date().toISOString().slice(0, 10) });
          });
          showToast(`Task added: ${title}`, 'success');
          setRefresh(r => r + 1);
        }}>Add Task</button>
      </div>
    ));
  };

  const moveTask = (taskId: string, newColumn: string) => {
    updateData(d => {
      const t = d.kanban.find(k => k.id === taskId);
      if (t) t.column = newColumn;
    });
    setRefresh(r => r + 1);
  };

  const prioColor = (p: string) => {
    if (p === 'Urgent') return '#E30613';
    if (p === 'High') return '#F39C12';
    if (p === 'Medium') return '#3B82F6';
    return '#718096';
  };

  return (
    <div>
      {/* KPIs */}
      <div className="grid grid-4" style={{ marginBottom: '8px' }}>
        <div className="card kpi-card navy"><div className="kpi-label">Total Tasks</div><div className="kpi-value">{totalTasks}</div></div>
        <div className="card kpi-card green"><div className="kpi-label">Done</div><div className="kpi-value">{doneTasks}</div></div>
        <div className="card kpi-card gold"><div className="kpi-label">In Progress</div><div className="kpi-value">{inProgressTasks}</div></div>
        <div className="card kpi-card red"><div className="kpi-label">Completion</div><div className="kpi-value">{totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0}%</div></div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <button className="btn btn-primary" onClick={addTask}>+ New Task</button>
      </div>

      {/* Kanban Board */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
        {COLUMNS.map(col => (
          <div
            key={col}
            style={{ flex: '1 0 200px', minWidth: '200px' }}
            onDragOver={e => e.preventDefault()}
            onDrop={() => { if (dragId) { moveTask(dragId, col); setDragId(null); } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${COLUMN_COLORS[col]}` }}>
              <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '11px', color: COLUMN_COLORS[col], textTransform: 'uppercase', letterSpacing: '0.5px' }}>{col}</span>
              <span style={{ marginLeft: 'auto', fontSize: '9px', background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: '8px', color: 'var(--text-dim)' }}>{tasks.filter(t => t.column === col).length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '100px' }}>
              {tasks.filter(t => t.column === col).map(t => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={() => setDragId(t.id)}
                  className="card"
                  style={{ padding: '8px', cursor: 'grab', transition: 'transform 0.15s, box-shadow 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '10px', color: '#fff' }}>{t.title}</span>
                    <span style={{ fontSize: '7px', padding: '1px 4px', borderRadius: '3px', background: `${prioColor(t.priority)}22`, color: prioColor(t.priority), fontWeight: 600 }}>{t.priority}</span>
                  </div>
                  {t.desc && <div style={{ fontSize: '8px', color: 'var(--text-dim)', marginBottom: '4px' }}>{t.desc}</div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{t.assignee}</span>
                    <span style={{ fontSize: '7px', color: 'var(--text-muted)' }}>{t.created}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
