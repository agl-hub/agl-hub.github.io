import { useState } from 'react';
import { useLayout } from '../components/MainLayout';

interface Schedule {
  id: string;
  reportType: string;
  frequency: string;
  recipientEmail: string;
  hourOfDay: number;
  enabled: boolean;
  createdAt: string;
  lastRunAt?: string;
  nextRunAt: string;
  lastRunStatus?: string;
}

const STORAGE_KEY = 'agl_schedules';
const REPORT_TYPES = ['daily-ceo', 'weekly-management', 'monthly-financial', 'full-operations'] as const;
const FREQUENCIES = ['daily', 'weekly', 'monthly'] as const;

function getSchedules(): Schedule[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveSchedules(schedules: Schedule[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
}

function calcNextRun(frequency: string, hourOfDay: number): string {
  const now = new Date();
  const next = new Date(now);
  next.setHours(hourOfDay, 0, 0, 0);
  if (next <= now) {
    if (frequency === 'daily') next.setDate(next.getDate() + 1);
    else if (frequency === 'weekly') next.setDate(next.getDate() + 7);
    else if (frequency === 'monthly') next.setMonth(next.getMonth() + 1);
  }
  return next.toISOString();
}

export default function Schedules() {
  const { showToast } = useLayout();
  const [schedules, setSchedules] = useState<Schedule[]>(getSchedules);
  const [reportType, setReportType] = useState<string>('daily-ceo');
  const [frequency, setFrequency] = useState<string>('daily');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [hourOfDay, setHourOfDay] = useState(8);

  const handleCreate = () => {
    if (!recipientEmail) {
      showToast('Recipient email is required', 'error');
      return;
    }
    const newSchedule: Schedule = {
      id: `sched_${Date.now()}`,
      reportType,
      frequency,
      recipientEmail,
      hourOfDay,
      enabled: true,
      createdAt: new Date().toISOString(),
      nextRunAt: calcNextRun(frequency, hourOfDay),
    };
    const updated = [...schedules, newSchedule];
    saveSchedules(updated);
    setSchedules(updated);
    setRecipientEmail('');
    showToast('Schedule created', 'success');
  };

  const handleDelete = (id: string) => {
    const updated = schedules.filter(s => s.id !== id);
    saveSchedules(updated);
    setSchedules(updated);
    showToast('Schedule deleted', 'success');
  };

  const handleToggle = (id: string) => {
    const updated = schedules.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
    saveSchedules(updated);
    setSchedules(updated);
  };

  const handleRun = (id: string) => {
    const updated = schedules.map(s => s.id === id ? {
      ...s,
      lastRunAt: new Date().toISOString(),
      lastRunStatus: 'ok',
      nextRunAt: calcNextRun(s.frequency, s.hourOfDay),
    } : s);
    saveSchedules(updated);
    setSchedules(updated);
    showToast('Report triggered (demo mode — email not sent in static deployment)', 'info');
  };

  const inputStyle: React.CSSProperties = {
    padding: '6px 8px',
    background: 'var(--card)',
    color: 'var(--text)',
    border: '1px solid var(--card-border)',
    borderRadius: 4,
    fontSize: 12,
    width: '100%',
  };

  return (
    <div>
      <h2 style={{ fontFamily: 'Rajdhani', fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>Scheduled Reports</h2>

      <div className="card" style={{ padding: 16, marginBottom: '8px' }}>
        <h3 style={{ color: '#fff', marginBottom: '12px', fontSize: '13px', fontFamily: 'Rajdhani', fontWeight: 600 }}>Create New Schedule</h3>
        <div className="grid grid-4" style={{ gap: '12px', marginBottom: '12px' }}>
          <div className="form-group">
            <label className="form-label">Report Type</label>
            <select style={inputStyle} value={reportType} onChange={e => setReportType(e.target.value)}>
              {REPORT_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Frequency</label>
            <select style={inputStyle} value={frequency} onChange={e => setFrequency(e.target.value)}>
              {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Recipient Email</label>
            <input type="email" style={inputStyle} value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} placeholder="email@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Hour (0–23)</label>
            <input type="number" min={0} max={23} style={inputStyle} value={hourOfDay} onChange={e => setHourOfDay(Number(e.target.value))} />
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>+ Add Schedule</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {schedules.length === 0 ? (
          <div style={{ padding: 16, fontSize: 12, opacity: 0.7 }}>No schedules yet. Create one above.</div>
        ) : (
          <table style={{ width: '100%', fontSize: 11 }}>
            <thead>
              <tr>
                <th>Report</th>
                <th>Frequency</th>
                <th>Recipient</th>
                <th>Next Run</th>
                <th>Last Run</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {schedules.map(s => (
                <tr key={s.id} style={{ opacity: s.enabled ? 1 : 0.5 }}>
                  <td>{s.reportType}</td>
                  <td>{s.frequency} @ {s.hourOfDay}:00</td>
                  <td>{s.recipientEmail}</td>
                  <td>{new Date(s.nextRunAt).toLocaleString()}</td>
                  <td>{s.lastRunAt ? new Date(s.lastRunAt).toLocaleString() : '—'}</td>
                  <td>
                    {s.lastRunStatus === 'ok' ? (
                      <span style={{ color: '#10b981' }}>ok</span>
                    ) : s.lastRunStatus === 'error' ? (
                      <span style={{ color: '#ef4444' }}>error</span>
                    ) : (
                      <span style={{ opacity: 0.5 }}>—</span>
                    )}
                  </td>
                  <td>
                    <button className="btn btn-xs btn-secondary" onClick={() => handleRun(s.id)} style={{ marginRight: 4 }} title="Run now">▶</button>
                    <button className="btn btn-xs btn-secondary" onClick={() => handleToggle(s.id)} style={{ marginRight: 4 }} title={s.enabled ? 'Pause' : 'Resume'}>
                      {s.enabled ? '⏸' : '▶'}
                    </button>
                    <button className="btn btn-xs btn-secondary" onClick={() => handleDelete(s.id)} style={{ color: 'var(--red)' }} title="Delete">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card" style={{ padding: 12, marginTop: '8px' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
          <strong style={{ color: 'var(--text)' }}>Note:</strong> In this static deployment, schedules are stored locally and email delivery requires a backend server. 
          Use the "Run now" button to preview reports. For automated email delivery, connect to a backend service.
        </p>
      </div>
    </div>
  );
}
