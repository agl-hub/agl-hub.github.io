import { useState, useMemo } from 'react';
import { getData, updateData } from '../lib/dataStore';
import { useLayout } from '../components/MainLayout';

const COLUMNS = ['To Do', 'In Progress', 'Review', 'Done'];
const COL_COLORS: Record<string, string> = { 'To Do': '#3B82F6', 'In Progress': '#F39C12', 'Review': '#8B5CF6', 'Done': '#1ABC9C' };

export default function Kanban() {
  const { showToast, openSlidePanel } = useLayout();
  const data = getData();
  const [refresh, setRefresh] = useState(0);
  const [dragItem, setDragItem] = useState<string | null>(null);

  const tasks = useMemo(() => data.kanban, [data.kanban, refresh]);

  const addTask = () => {
    openSlidePanel('New Task', (
      <div style={{ color: 'var(--text)' }}>
        <div className="form-group"><label className="form-label">Title</label><input className="form-control" id="task-title" placeholder="Task title" /></div>
        <div className="form-group"><label className="form-label">Description</label><input className="form-control" id="task-desc" placeholder="Description" /></div>
        <div className="form-group"><label className="form-label">Assignee</label><input className="form-control" id="task-assign" placeholder="Assignee" /></div>
        <div className="form-group"><label className="form-label">Priority</label>
          <select className="form-control" id="task-prio"><option>Low</option><option>Medium</option><option>High</option></select>
        </div>
        <button className="btn btn-primary" style={{ marginTop: '12px' }} onClick={() => {
          const title = (document.getElementById('task-title') as HTMLInputElement)?.value;
          const desc = (document.getElementById('task-desc') as HTMLInputElement)?.value;
          const assignee = (document.getElementById('task-assign') as HTMLInputElement)?.value;
          const priority = (document.getElementById('task-prio') as HTMLSelectElement)?.value;
          if (!title) { showToast('Title is required', 'error'); return; }
          updateData(d => {
            d.kanban.push({ id: `k_${Date.now()}`, title, desc, assignee, priority, column: 'To Do', created: new Date().toISOString().slice(0, 10) });
          });
          showToast(`Task added: ${title}`, 'success');
          setRefresh(r => r + 1);
        }}>Add Task</button>
      </div>
    ));
  };

  const handleDrop = (col: string) => {
    if (!dragItem) return;
    updateData(d => {
      const task = d.kanban.find(t => t.id === dragItem);
      if (task) task.column = col;
    });
    setDragItem(null);
    setRefresh(r => r + 1);
    showToast(`Task moved to ${col}`, 'info');
  };

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.column === 'Done').length;
  const inProgress = tasks.filter(t => t.column === 'In Progress').length;
  const highPriority = tasks.filter(t => t.priority === 'High' && t.column !== 'Done').length;

  return (
    <div>
      <div className="grid grid-4" style={{ marginBottom: '8px' }}>
        <div className="card kpi-card navy"><div className="kpi-label">Total Tasks</div><div className="kpi-value">{totalTasks}</div></div>
        <div className="card kpi-card green"><div className="kpi-label">Completed</div><div className="kpi-value">{doneTasks}</div></div>
        <div className="card kpi-card gold"><div className="kpi-label">In Progress</div><div className="kpi-value">{inProgress}</div></div>
        <div className="card kpi-card red"><div className="kpi-label">High Priority</div><div className="kpi-value">{highPriority}</div></div>
      </div>

      <div style={{ marginBottom: '8px' }}><button className="btn btn-primary" onClick={addTask}>+ New Task</button></div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.column === col);
          return (
            <div key={col}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(col)}
              style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', padding: '8px', minHeight: '300px', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '6px', borderBottom: `2px solid ${COL_COLORS[col]}` }}>
                <span style={{ fontWeight: 700, fontSize: '11px', color: COL_COLORS[col], fontFamily: 'Rajdhani' }}>{col.toUpperCase()}</span>
                <span style={{ fontSize: '9px', background: 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: '8px', color: 'var(--text-dim)' }}>{colTasks.length}</span>
              </div>
              {colTasks.map(task => (
                <div key={task.id}
                  draggable
                  onDragStart={() => setDragItem(task.id)}
                  style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', padding: '8px', marginBottom: '6px', cursor: 'grab', borderLeft: `3px solid ${task.priority === 'High' ? '#E30613' : task.priority === 'Medium' ? '#F39C12' : '#1ABC9C'}`, transition: 'transform 0.15s' }}
                >
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#fff', marginBottom: '3px' }}>{task.title}</div>
                  <div style={{ fontSize: '8px', color: 'var(--text-dim)', marginBottom: '4px' }}>{task.desc}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{task.assignee}</span>
                    <span style={{ fontSize: '7px', padding: '1px 4px', borderRadius: '3px', background: task.priority === 'High' ? 'rgba(227,6,19,0.15)' : task.priority === 'Medium' ? 'rgba(243,156,18,0.15)' : 'rgba(26,188,156,0.15)', color: task.priority === 'High' ? '#FF2D3A' : task.priority === 'Medium' ? '#F39C12' : '#1ABC9C', fontWeight: 600 }}>{task.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
