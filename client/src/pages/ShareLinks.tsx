import { useState } from 'react';
import { useLayout } from '../components/MainLayout';
import { getData } from '../lib/dataStore';

interface ShareLink {
  id: string;
  label: string;
  scope: string;
  token: string;
  createdAt: string;
  expiresAt?: string;
}

const STORAGE_KEY = 'agl_share_links';

function getLinks(): ShareLink[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLinks(links: ShareLink[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

const SCOPES = ['dashboard', 'kpi', 'reports'] as const;

export default function ShareLinks() {
  const { showToast } = useLayout();
  const [links, setLinks] = useState<ShareLink[]>(getLinks);
  const [scope, setScope] = useState<string>('dashboard');
  const [label, setLabel] = useState('');
  const [ttlDays, setTtlDays] = useState<string>('');

  const handleCreate = () => {
    const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    const newLink: ShareLink = {
      id: `sl_${Date.now()}`,
      label: label || `${scope} link`,
      scope,
      token,
      createdAt: new Date().toISOString(),
      expiresAt: ttlDays ? new Date(Date.now() + Number(ttlDays) * 86400000).toISOString() : undefined,
    };
    const updated = [...links, newLink];
    saveLinks(updated);
    setLinks(updated);
    setLabel('');
    setTtlDays('');
    showToast('Share link created', 'success');
  };

  const buildUrl = (token: string) => `${window.location.origin}/public?token=${token}`;

  const copy = (token: string) => {
    navigator.clipboard.writeText(buildUrl(token)).then(() => {
      showToast('URL copied to clipboard', 'success');
    });
  };

  const handleRevoke = (id: string) => {
    const updated = links.filter(l => l.id !== id);
    saveLinks(updated);
    setLinks(updated);
    showToast('Link revoked', 'success');
  };

  return (
    <div>
      <h2 style={{ fontFamily: 'Rajdhani', fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>Shareable Dashboard Links</h2>

      <div className="card" style={{ padding: 16, marginBottom: '8px' }}>
        <h3 style={{ color: '#fff', marginBottom: '12px', fontSize: '13px', fontFamily: 'Rajdhani', fontWeight: 600 }}>Create New Share Link</h3>
        <div className="grid grid-3" style={{ gap: '12px', marginBottom: '12px' }}>
          <div className="form-group">
            <label className="form-label">Scope</label>
            <select className="form-control" value={scope} onChange={e => setScope(e.target.value)}>
              {SCOPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Label (optional)</label>
            <input className="form-control" placeholder="e.g. Board Members" value={label} onChange={e => setLabel(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Expires in (days, optional)</label>
            <input type="number" className="form-control" placeholder="e.g. 30" value={ttlDays} onChange={e => setTtlDays(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>+ Create Link</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {links.length === 0 ? (
          <div style={{ padding: 16, fontSize: 12, opacity: 0.7 }}>No share links yet. Create one above.</div>
        ) : (
          <table style={{ width: '100%', fontSize: 11 }}>
            <thead>
              <tr>
                <th>Label</th>
                <th>Scope</th>
                <th>Created</th>
                <th>Expires</th>
                <th>URL</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {links.map(l => (
                <tr key={l.id}>
                  <td>{l.label}</td>
                  <td>
                    <span style={{ padding: '2px 6px', borderRadius: 3, background: 'rgba(22,160,133,0.2)', color: '#1ABC9C', fontSize: 10 }}>
                      {l.scope}
                    </span>
                  </td>
                  <td>{new Date(l.createdAt).toLocaleDateString()}</td>
                  <td>{l.expiresAt ? new Date(l.expiresAt).toLocaleDateString() : '—'}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <a href={buildUrl(l.token)} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-light)', fontSize: 10 }}>
                      {buildUrl(l.token)}
                    </a>
                  </td>
                  <td>
                    <button className="btn btn-xs btn-secondary" onClick={() => copy(l.token)} style={{ marginRight: 4 }}>📋 Copy</button>
                    <button className="btn btn-xs btn-secondary" onClick={() => handleRevoke(l.id)} style={{ color: 'var(--red)' }}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card" style={{ padding: 12, marginTop: '8px' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
          <strong style={{ color: 'var(--text)' }}>Note:</strong> Share links provide read-only access to the public dashboard view. 
          Recipients can view key metrics without being able to edit any data. 
          Links are stored locally and will be lost if you clear browser data.
        </p>
      </div>
    </div>
  );
}
