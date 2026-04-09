import { useState } from 'react';
import { getData, updateData } from '../lib/dataStore';
import { useLayout } from '../components/MainLayout';

const DEFAULTS = {
  dailyRevenueTarget: 5000,
  monthlyRevenueTarget: 120000,
  lowStockThreshold: 5,
  overdueJobHours: 48,
  businessName: 'Automobiles Ghana Ltd',
  currency: 'GHS',
};

export default function Settings() {
  const { showToast } = useLayout();
  const data = getData();
  const saved = (data.settings as any)?.config || DEFAULTS;

  const [form, setForm] = useState({
    dailyRevenueTarget: saved.dailyRevenueTarget ?? DEFAULTS.dailyRevenueTarget,
    monthlyRevenueTarget: saved.monthlyRevenueTarget ?? DEFAULTS.monthlyRevenueTarget,
    lowStockThreshold: saved.lowStockThreshold ?? DEFAULTS.lowStockThreshold,
    overdueJobHours: saved.overdueJobHours ?? DEFAULTS.overdueJobHours,
    businessName: saved.businessName ?? DEFAULTS.businessName,
    currency: saved.currency ?? DEFAULTS.currency,
  });

  const setField = (k: string, v: string | number) =>
    setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    updateData(d => {
      if (!d.settings) d.settings = { receiptCounter: 1, poCounter: 1 } as any;
      (d.settings as any).config = { ...form };
    });
    showToast('Settings saved', 'success');
  };

  const doReset = () => {
    setForm({ ...DEFAULTS });
    updateData(d => {
      if (!d.settings) d.settings = { receiptCounter: 1, poCounter: 1 } as any;
      (d.settings as any).config = { ...DEFAULTS };
    });
    showToast('Reset to defaults', 'success');
  };

  return (
    <div>
      <h2 style={{ fontFamily: 'Rajdhani', fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>Settings</h2>

      <div className="card" style={{ padding: 16, marginBottom: '8px' }}>
        <h3 style={{ color: '#fff', marginBottom: '12px', fontSize: '13px', fontFamily: 'Rajdhani', fontWeight: 600 }}>Business Information</h3>
        <div className="grid grid-2" style={{ gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Business Name</label>
            <input className="form-control" value={form.businessName} onChange={e => setField('businessName', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Currency</label>
            <select className="form-control" value={form.currency} onChange={e => setField('currency', e.target.value)}>
              <option value="GHS">GHS (Ghana Cedi)</option>
              <option value="USD">USD (US Dollar)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="GBP">GBP (British Pound)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: '8px' }}>
        <h3 style={{ color: '#fff', marginBottom: '12px', fontSize: '13px', fontFamily: 'Rajdhani', fontWeight: 600 }}>Revenue Targets</h3>
        <div className="grid grid-2" style={{ gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Daily Revenue Target (GHS)</label>
            <input type="number" className="form-control" value={form.dailyRevenueTarget} onChange={e => setField('dailyRevenueTarget', parseFloat(e.target.value) || 0)} />
          </div>
          <div className="form-group">
            <label className="form-label">Monthly Revenue Target (GHS)</label>
            <input type="number" className="form-control" value={form.monthlyRevenueTarget} onChange={e => setField('monthlyRevenueTarget', parseFloat(e.target.value) || 0)} />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: '8px' }}>
        <h3 style={{ color: '#fff', marginBottom: '12px', fontSize: '13px', fontFamily: 'Rajdhani', fontWeight: 600 }}>Alert Thresholds</h3>
        <div className="grid grid-2" style={{ gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Low Stock Threshold (units)</label>
            <input type="number" className="form-control" value={form.lowStockThreshold} onChange={e => setField('lowStockThreshold', parseFloat(e.target.value) || 0)} />
          </div>
          <div className="form-group">
            <label className="form-label">Overdue Job Hours</label>
            <input type="number" className="form-control" value={form.overdueJobHours} onChange={e => setField('overdueJobHours', parseFloat(e.target.value) || 0)} />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: '8px' }}>
        <h3 style={{ color: '#fff', marginBottom: '12px', fontSize: '13px', fontFamily: 'Rajdhani', fontWeight: 600 }}>Data Management</h3>
        <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '12px' }}>
          All data is stored locally in your browser. Export regularly to avoid data loss.
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => {
            const d = getData();
            const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `agl-backup-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('Data exported successfully', 'success');
          }}>
            📥 Export Data (JSON)
          </button>
          <button className="btn btn-secondary" style={{ color: 'var(--red)' }} onClick={() => {
            if (confirm('Clear ALL data? This cannot be undone.')) {
              localStorage.removeItem('agl_data');
              showToast('All data cleared. Reload to see changes.', 'info');
            }
          }}>
            🗑️ Clear All Data
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button className="btn btn-primary" onClick={save}>💾 Save Settings</button>
        <button className="btn btn-secondary" onClick={doReset}>Reset to Defaults</button>
      </div>
    </div>
  );
}
