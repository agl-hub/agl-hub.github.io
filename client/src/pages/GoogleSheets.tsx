import { useState, useEffect } from 'react';
import { getData } from '../lib/dataStore';
import { useLayout } from '../components/MainLayout';
import {
  getSyncState, saveSyncState, importSnapshot, exportToCSV,
  pullFromGAS, GAS_TEMPLATE,
  SHEET1_ID, SHEET2_ID, SHEET1_URL, SHEET2_URL,
  type SyncState,
} from '../lib/sheetsSync';
import { snapshotSales, snapshotExpenses, snapshotWorkshop, snapshotPurchaseOrders, snapshotClockIn, snapshotInventory } from '../lib/sheetsSnapshot';
const sheetsSnapshot = { sales: snapshotSales, expenses: snapshotExpenses, workshop: snapshotWorkshop, purchaseOrders: snapshotPurchaseOrders, clockin: snapshotClockIn, inventory: snapshotInventory };

export default function GoogleSheets() {
  const { showToast } = useLayout();
  const [syncState, setSyncState] = useState<SyncState>(getSyncState);
  const [pulling, setPulling] = useState(false);
  const [importing, setImporting] = useState(false);
  const [gasUrl, setGasUrl] = useState(getSyncState().gasUrl);
  const [showGasScript, setShowGasScript] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'import' | 'export' | 'setup'>('overview');
  const [refresh, setRefresh] = useState(0);

  const data = getData();

  useEffect(() => {
    const state = getSyncState();
    setGasUrl(state.gasUrl);
    setSyncState(state);
  }, [refresh]);

  const saveGasUrl = () => {
    const state = getSyncState();
    state.gasUrl = gasUrl;
    saveSyncState(state);
    setSyncState({ ...state });
    showToast('Apps Script URL saved', 'success');
  };

  const handleImportSnapshot = (mode: 'merge' | 'replace') => {
    setImporting(true);
    setTimeout(() => {
      try {
        const result = importSnapshot(sheetsSnapshot as any, mode);
        const total = Object.values(result.added).reduce((a, b) => a + b, 0);
        const skippedTotal = Object.values(result.skipped).reduce((a, b) => a + b, 0);
        showToast(`Imported ${total} records (${skippedTotal} already existed)`, 'success');
        setRefresh(r => r + 1);
      } catch (e: any) {
        showToast(`Import failed: ${e.message}`, 'error');
      } finally {
        setImporting(false);
      }
    }, 100);
  };

  const handleLivePull = async () => {
    if (!gasUrl) { showToast('Please enter your Apps Script URL first', 'error'); return; }
    setPulling(true);
    const result = await pullFromGAS(gasUrl);
    setPulling(false);
    if (result.ok) {
      showToast('Live pull complete!', 'success');
    } else {
      showToast(`Pull failed: ${result.message}`, 'error');
    }
    setRefresh(r => r + 1);
  };

  const handleExport = (type: 'sales' | 'expenses' | 'workshop' | 'purchaseOrders' | 'clockin' | 'inventory') => {
    const csv = exportToCSV(type);
    const names: Record<string, string> = {
      sales: 'AGL_Sales', expenses: 'AGL_Expenses', workshop: 'AGL_Workshop',
      purchaseOrders: 'AGL_PurchaseOrders', clockin: 'AGL_ClockIn', inventory: 'AGL_Inventory',
    };
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${names[type]}_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    showToast(`${names[type]} exported as CSV`, 'success');
  };

  const snapshotStats = {
    sales: sheetsSnapshot.sales.length,
    expenses: sheetsSnapshot.expenses.length,
    workshop: sheetsSnapshot.workshop.length,
    purchaseOrders: sheetsSnapshot.purchaseOrders.length,
    clockin: sheetsSnapshot.clockin.length,
    inventory: sheetsSnapshot.inventory.length,
  };

  const localStats = {
    sales: data.sales.length,
    expenses: data.expenses.length,
    workshop: data.workshop.length,
    purchaseOrders: data.purchaseOrders.length,
    clockin: data.clockin.length,
    inventory: data.inventory.length,
  };

  const sheetSources = [
    { name: 'Sales & Customer Log', tab: 'Sales & Customer Log', rows: snapshotStats.sales, icon: '💰', color: '#1ABC9C', sheetId: SHEET1_ID, gid: '1256735848' },
    { name: 'Expense Log', tab: 'Expense Log', rows: snapshotStats.expenses, icon: '📋', color: '#E74C3C', sheetId: SHEET1_ID, gid: '335134778' },
    { name: 'Workshop Daily Log', tab: 'Workshop Daily Log', rows: snapshotStats.workshop, icon: '⚙', color: '#F39C12', sheetId: SHEET1_ID, gid: '156574273' },
    { name: 'Purchase Orders', tab: 'Purchase Orders', rows: snapshotStats.purchaseOrders, icon: '📦', color: '#9B59B6', sheetId: SHEET1_ID, gid: '493746555' },
    { name: 'Staff Clock-In', tab: 'Staff Clock-In', rows: snapshotStats.clockin, icon: '🕐', color: '#3498DB', sheetId: SHEET1_ID, gid: '597558655' },
    { name: 'Filters & Oil Inventory', tab: '_FilterData', rows: sheetsSnapshot.inventory.filter(i => i.category === 'Filters & Oil').length, icon: '🔧', color: '#16A085', sheetId: SHEET2_ID, gid: '1828113789' },
    { name: 'Spark Plugs Inventory', tab: '_PlugData', rows: sheetsSnapshot.inventory.filter(i => i.category === 'Spark Plugs').length, icon: '⚡', color: '#E67E22', sheetId: SHEET2_ID, gid: '1179141712' },
    { name: 'Services Catalogue', tab: '_ServiceData', rows: sheetsSnapshot.inventory.filter(i => i.category.startsWith('Services')).length, icon: '🛠', color: '#2ECC71', sheetId: SHEET2_ID, gid: '1675124527' },
  ];

  const tabStyle = (t: string): React.CSSProperties => ({
    padding: '6px 14px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
    borderBottom: activeTab === t ? '2px solid #1ABC9C' : '2px solid transparent',
    color: activeTab === t ? '#1ABC9C' : 'var(--text-dim)',
    background: 'none', border: 'none',
    borderBottomStyle: 'solid',
    borderBottomWidth: '2px',
    borderBottomColor: activeTab === t ? '#1ABC9C' : 'transparent',
  });

  return (
    <div>
      {/* KPI Row */}
      <div className="grid grid-4" style={{ marginBottom: '8px' }}>
        <div className="card kpi-card navy">
          <div className="kpi-label">Sheets Connected</div>
          <div className="kpi-value">2</div>
          <div className="kpi-sub">Operations + Inventory</div>
        </div>
        <div className="card kpi-card green">
          <div className="kpi-label">Snapshot Records</div>
          <div className="kpi-value">{Object.values(snapshotStats).reduce((a, b) => a + b, 0).toLocaleString()}</div>
          <div className="kpi-sub">Ready to import</div>
        </div>
        <div className="card kpi-card gold">
          <div className="kpi-label">Local Records</div>
          <div className="kpi-value">{Object.values(localStats).reduce((a, b) => a + b, 0).toLocaleString()}</div>
          <div className="kpi-sub">In browser storage</div>
        </div>
        <div className="card kpi-card" style={{ borderLeft: '3px solid #9B59B6' }}>
          <div className="kpi-label">Last Pull</div>
          <div className="kpi-value" style={{ fontSize: '11px' }}>
            {syncState.lastPull ? new Date(syncState.lastPull).toLocaleString() : 'Never'}
          </div>
          <div className="kpi-sub">{syncState.pullCount} total synced</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card" style={{ padding: 0, marginBottom: '8px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 14px' }}>
          {(['overview', 'import', 'export', 'setup'] as const).map(t => (
            <button key={t} style={tabStyle(t)} onClick={() => setActiveTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div style={{ padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>Connected Google Sheets</h3>
              <div style={{ display: 'flex', gap: '6px' }}>
                <a href={SHEET1_URL} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ fontSize: '10px', padding: '4px 10px' }}>
                  📊 Operations Sheet
                </a>
                <a href={`https://docs.google.com/spreadsheets/d/${SHEET2_ID}/edit`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ fontSize: '10px', padding: '4px 10px' }}>
                  📦 Inventory Sheet
                </a>
              </div>
            </div>
            <div className="grid grid-4" style={{ gap: '8px' }}>
              {sheetSources.map(s => (
                <a
                  key={s.name}
                  href={`https://docs.google.com/spreadsheets/d/${s.sheetId}/edit#gid=${s.gid}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(255,255,255,0.04)', borderLeft: `3px solid ${s.color}`,
                    cursor: 'pointer',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, fontSize: '10px', color: '#fff' }}>{s.icon} {s.name}</span>
                      <span className="status-badge status-completed" style={{ fontSize: '7px' }}>Live</span>
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>Tab: {s.tab}</div>
                    <div style={{ fontSize: '11px', color: s.color, fontWeight: 700, marginTop: '4px' }}>{s.rows.toLocaleString()} rows</div>
                  </div>
                </a>
              ))}
            </div>

            {/* Data comparison table */}
            <div style={{ marginTop: '14px' }}>
              <h3 style={{ color: '#fff', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>Data Comparison</h3>
              <table style={{ width: '100%', fontSize: '11px' }}>
                <thead>
                  <tr>
                    <th>Dataset</th>
                    <th style={{ textAlign: 'right' }}>In Google Sheets</th>
                    <th style={{ textAlign: 'right' }}>In Local Storage</th>
                    <th style={{ textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(Object.entries(snapshotStats) as [keyof typeof snapshotStats, number][]).map(([key, count]) => {
                    const local = localStats[key];
                    const diff = local - count;
                    return (
                      <tr key={key}>
                        <td style={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</td>
                        <td style={{ textAlign: 'right', color: '#1ABC9C' }}>{count.toLocaleString()}</td>
                        <td style={{ textAlign: 'right' }}>{local.toLocaleString()}</td>
                        <td style={{ textAlign: 'right' }}>
                          {diff > 0 ? (
                            <span style={{ color: '#F39C12', fontSize: '9px' }}>+{diff} local only</span>
                          ) : diff < 0 ? (
                            <span style={{ color: '#E74C3C', fontSize: '9px' }}>{Math.abs(diff)} not imported</span>
                          ) : (
                            <span style={{ color: '#1ABC9C', fontSize: '9px' }}>✓ Synced</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* IMPORT TAB */}
        {activeTab === 'import' && (
          <div style={{ padding: '14px' }}>
            <h3 style={{ color: '#fff', fontSize: '13px', fontWeight: 700, marginBottom: '12px' }}>Import from Google Sheets</h3>

            {/* Snapshot Import */}
            <div style={{ padding: '14px', background: 'rgba(26,188,156,0.05)', border: '1px solid rgba(26,188,156,0.15)', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }}>
              <div style={{ fontWeight: 700, fontSize: '12px', color: '#1ABC9C', marginBottom: '6px' }}>📥 Import Snapshot (Instant — No API Required)</div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '10px', lineHeight: 1.6 }}>
                Pre-fetched data from Google Sheets is bundled with this app.{' '}
                <strong style={{ color: '#fff' }}>{Object.values(snapshotStats).reduce((a, b) => a + b, 0).toLocaleString()} records</strong> are ready to import instantly.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '12px' }}>
                {(Object.entries(snapshotStats) as [string, number][]).map(([key, count]) => (
                  <div key={key} style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1ABC9C' }}>{count}</div>
                    <div style={{ fontSize: '8px', color: 'var(--text-dim)', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => handleImportSnapshot('merge')}
                  disabled={importing}
                  style={{ flex: 1 }}
                >
                  {importing ? 'Importing...' : '⬇ Merge (Add new records only)'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    if (confirm('This will replace all sheet-sourced data. Continue?')) {
                      handleImportSnapshot('replace');
                    }
                  }}
                  disabled={importing}
                  style={{ flex: 1 }}
                >
                  🔄 Replace (Overwrite sheet data)
                </button>
              </div>
            </div>

            {/* Live Pull */}
            <div style={{ padding: '14px', background: 'rgba(52,152,219,0.05)', border: '1px solid rgba(52,152,219,0.15)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontWeight: 700, fontSize: '12px', color: '#3498DB', marginBottom: '6px' }}>🔴 Live Pull (Requires Apps Script)</div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '10px', lineHeight: 1.5 }}>
                Pull the latest data directly from Google Sheets in real-time. Requires a Google Apps Script web app. See the <strong style={{ color: '#fff' }}>Setup</strong> tab.
              </div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                <input
                  className="form-control"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={gasUrl}
                  onChange={e => setGasUrl(e.target.value)}
                  style={{ flex: 1, fontSize: '10px' }}
                />
                <button className="btn btn-secondary" onClick={saveGasUrl} style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>Save URL</button>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleLivePull}
                disabled={pulling || !gasUrl}
                style={{ width: '100%' }}
              >
                {pulling ? '⟳ Pulling from Google Sheets...' : '🔴 Pull Live Data Now'}
              </button>
              {syncState.errors.length > 0 && (
                <div style={{ marginTop: '8px', padding: '6px', background: 'rgba(231,76,60,0.1)', borderRadius: '4px', fontSize: '9px', color: '#E74C3C' }}>
                  Last error: {syncState.errors[syncState.errors.length - 1]}
                </div>
              )}
            </div>
          </div>
        )}

        {/* EXPORT TAB */}
        {activeTab === 'export' && (
          <div style={{ padding: '14px' }}>
            <h3 style={{ color: '#fff', fontSize: '13px', fontWeight: 700, marginBottom: '12px' }}>Export to CSV (for Google Sheets)</h3>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '12px', lineHeight: 1.6 }}>
              Export your local data as CSV files. Import them into Google Sheets to push new entries back to the source.
            </div>
            <div className="grid grid-3" style={{ gap: '8px' }}>
              {([
                { key: 'sales', label: 'Sales & Customer Log', icon: '💰', color: '#1ABC9C', count: localStats.sales },
                { key: 'expenses', label: 'Expense Log', icon: '📋', color: '#E74C3C', count: localStats.expenses },
                { key: 'workshop', label: 'Workshop Daily Log', icon: '⚙', color: '#F39C12', count: localStats.workshop },
                { key: 'purchaseOrders', label: 'Purchase Orders', icon: '📦', color: '#9B59B6', count: localStats.purchaseOrders },
                { key: 'clockin', label: 'Staff Clock-In', icon: '🕐', color: '#3498DB', count: localStats.clockin },
                { key: 'inventory', label: 'Inventory', icon: '🔧', color: '#16A085', count: localStats.inventory },
              ] as const).map(item => (
                <div key={item.key} style={{
                  padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(255,255,255,0.04)', borderLeft: `3px solid ${item.color}`,
                }}>
                  <div style={{ fontWeight: 700, fontSize: '11px', color: '#fff', marginBottom: '4px' }}>{item.icon} {item.label}</div>
                  <div style={{ fontSize: '12px', color: item.color, fontWeight: 700, marginBottom: '8px' }}>{item.count.toLocaleString()} records</div>
                  <button
                    className="btn btn-secondary"
                    style={{ width: '100%', fontSize: '10px' }}
                    onClick={() => handleExport(item.key)}
                  >
                    ⇩ Export CSV
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '14px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontWeight: 700, fontSize: '11px', color: '#fff', marginBottom: '6px' }}>📤 Auto-Push to Google Sheets</div>
              <div style={{ fontSize: '9px', color: 'var(--text-dim)', lineHeight: 1.6 }}>
                When you add a new sale, expense, or workshop job in the app, it can be automatically pushed to Google Sheets
                if you have the Apps Script URL configured.
              </div>
              <div style={{ marginTop: '8px', fontSize: '9px', color: syncState.gasUrl ? '#1ABC9C' : '#E74C3C' }}>
                {syncState.gasUrl ? '✓ Apps Script URL configured — push is active' : '✗ No Apps Script URL — configure in Setup tab to enable push'}
              </div>
            </div>
          </div>
        )}

        {/* SETUP TAB */}
        {activeTab === 'setup' && (
          <div style={{ padding: '14px' }}>
            <h3 style={{ color: '#fff', fontSize: '13px', fontWeight: 700, marginBottom: '12px' }}>Apps Script Setup Guide</h3>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', lineHeight: 1.8, marginBottom: '12px' }}>
              To enable live two-way sync, deploy a Google Apps Script as a web app. This acts as a secure bridge between the AGL website and your Google Sheets.
            </div>

            {[
              { step: '1', title: 'Open Google Apps Script', desc: 'Go to script.google.com and create a new project. Name it "AGL Sync Bridge".' },
              { step: '2', title: 'Paste the script', desc: 'Copy the script below and paste it into the editor, replacing all existing code.' },
              { step: '3', title: 'Deploy as Web App', desc: 'Click Deploy → New Deployment → Web App. Set "Execute as: Me" and "Who has access: Anyone". Click Deploy and copy the URL.' },
              { step: '4', title: 'Paste URL here', desc: 'Go to the Import tab, paste the URL into the Apps Script URL field, and click Save URL.' },
            ].map(s => (
              <div key={s.step} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#1ABC9C', color: '#c8b89a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>{s.step}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '11px', color: '#fff', marginBottom: '2px' }}>{s.title}</div>
                  <div style={{ fontSize: '9px', color: 'var(--text-dim)', lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              </div>
            ))}

            <div style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ fontWeight: 700, fontSize: '11px', color: '#fff' }}>Apps Script Code</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn btn-secondary" style={{ fontSize: '9px', padding: '3px 8px' }}
                    onClick={() => navigator.clipboard.writeText(GAS_TEMPLATE).then(() => showToast('Copied!', 'success'))}>
                    📋 Copy
                  </button>
                  <button className="btn btn-secondary" style={{ fontSize: '9px', padding: '3px 8px' }} onClick={() => setShowGasScript(s => !s)}>
                    {showGasScript ? 'Hide' : 'Show'} Script
                  </button>
                </div>
              </div>
              {showGasScript && (
                <pre style={{
                  background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '4px', fontSize: '8px',
                  color: '#A8D8A8', overflowX: 'auto', maxHeight: '300px', overflowY: 'auto',
                  border: '1px solid rgba(255,255,255,0.06)', lineHeight: 1.5,
                }}>
                  {GAS_TEMPLATE}
                </pre>
              )}
            </div>

            <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(243,156,18,0.05)', border: '1px solid rgba(243,156,18,0.2)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontWeight: 700, fontSize: '10px', color: '#F39C12', marginBottom: '4px' }}>⚠ Important Notes</div>
              <ul style={{ fontSize: '9px', color: 'var(--text-dim)', lineHeight: 1.8, paddingLeft: '14px', margin: 0 }}>
                <li>The Apps Script runs under your Google account and has access to your sheets</li>
                <li>The web app URL is unique to your deployment — keep it private</li>
                <li>If you redeploy, you will get a new URL — update it in the Import tab</li>
                <li>The snapshot import works without any setup and is always available</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
