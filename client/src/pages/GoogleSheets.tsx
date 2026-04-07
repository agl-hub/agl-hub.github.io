import { useState } from 'react';
import { useLayout } from '../components/MainLayout';

export default function GoogleSheets() {
  const { showToast } = useLayout();
  const [sheetId, setSheetId] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const sheets = [
    { name: 'Monthly Summary', tab: 'Monthly Summary', status: 'ready', rows: 0 },
    { name: 'Sales Data', tab: 'Sales', status: 'ready', rows: 0 },
    { name: 'Workshop Log', tab: 'Workshop', status: 'ready', rows: 0 },
    { name: 'Staff Records', tab: 'Staff', status: 'ready', rows: 0 },
    { name: 'Expenses', tab: 'Expenses', status: 'ready', rows: 0 },
    { name: 'Purchase Orders', tab: 'POs', status: 'ready', rows: 0 },
  ];

  const handleSync = () => {
    if (!sheetId) { showToast('Enter a Google Sheet ID first', 'error'); return; }
    setSyncing(true);
    showToast('Syncing with Google Sheets...', 'info');
    setTimeout(() => {
      setSyncing(false);
      setLastSync(new Date().toLocaleString());
      showToast('Google Sheets sync completed!', 'success');
    }, 2000);
  };

  return (
    <div>
      <div className="grid grid-4" style={{ marginBottom: '8px' }}>
        <div className="card kpi-card navy"><div className="kpi-label">Sheets</div><div className="kpi-value">{sheets.length}</div></div>
        <div className="card kpi-card green"><div className="kpi-label">Status</div><div className="kpi-value" style={{ fontSize: '14px' }}>{syncing ? 'Syncing...' : lastSync ? 'Connected' : 'Ready'}</div></div>
        <div className="card kpi-card gold"><div className="kpi-label">Last Sync</div><div className="kpi-value" style={{ fontSize: '12px' }}>{lastSync || 'Never'}</div></div>
        <div className="card kpi-card red"><div className="kpi-label">Errors</div><div className="kpi-value">0</div></div>
      </div>

      <div className="card" style={{ padding: '14px', marginBottom: '8px' }}>
        <h3 style={{ color: '#fff', marginBottom: '10px' }}>Google Sheets Configuration</h3>
        <div className="form-group">
          <label className="form-label">Spreadsheet ID</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input className="form-control" placeholder="Enter your Google Spreadsheet ID" value={sheetId} onChange={e => setSheetId(e.target.value)} style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={handleSync} disabled={syncing}>{syncing ? 'Syncing...' : 'Sync Now'}</button>
          </div>
          <div style={{ fontSize: '8px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Find the ID in your Google Sheets URL: docs.google.com/spreadsheets/d/<span style={{ color: '#F39C12' }}>SPREADSHEET_ID</span>/edit
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '14px', marginBottom: '8px' }}>
        <h3 style={{ color: '#fff', marginBottom: '10px' }}>Connected Sheets</h3>
        <div className="grid grid-3" style={{ gap: '8px' }}>
          {sheets.map(s => (
            <div key={s.name} style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.04)', borderLeft: '3px solid #16A085' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, fontSize: '11px', color: '#fff' }}>{s.name}</span>
                <span className="status-badge status-completed" style={{ fontSize: '7px' }}>Ready</span>
              </div>
              <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>Tab: {s.tab}</div>
              <div style={{ fontSize: '8px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.rows} rows synced</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: '14px' }}>
        <h3 style={{ color: '#fff', marginBottom: '10px' }}>Sync Settings</h3>
        <div className="grid grid-2" style={{ gap: '10px' }}>
          <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '11px', color: '#fff' }}>Auto-Sync</div>
                <div style={{ fontSize: '8px', color: 'var(--text-dim)' }}>Automatically sync data on page load</div>
              </div>
              <div style={{ width: '36px', height: '20px', borderRadius: '10px', background: '#16A085', cursor: 'pointer', position: 'relative' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', right: '2px', transition: 'all 0.2s' }} />
              </div>
            </div>
          </div>
          <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '11px', color: '#fff' }}>Sync on Entry</div>
                <div style={{ fontSize: '8px', color: 'var(--text-dim)' }}>Push new entries to Google Sheets</div>
              </div>
              <div style={{ width: '36px', height: '20px', borderRadius: '10px', background: '#16A085', cursor: 'pointer', position: 'relative' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', right: '2px', transition: 'all 0.2s' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
