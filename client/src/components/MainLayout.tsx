import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useLocation } from 'wouter';
import '../styles/global.css';
import NotificationBell from './NotificationBell';
import QuickEntryDrawer from './QuickEntryDrawer';
import { useAccess } from '@/contexts/AccessContext';

// ========== CONTEXT FOR GLOBAL FEATURES ==========
interface LayoutContextType {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
  openSlidePanel: (title: string, content: React.ReactNode) => void;
  closeSlidePanel: () => void;
  openNotifications: () => void;
  notifications: Notification[];
  addNotification: (title: string, body: string) => void;
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
}

interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

interface FilterState {
  preset: string;
  dateFrom: string;
  dateTo: string;
  staff: string;
  channel: string;
  payment: string;
}

const LayoutContext = createContext<LayoutContextType | null>(null);
export const useLayout = () => {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout must be used within MainLayout');
  return ctx;
};

// ========== PAGE CONFIG ==========
const pages = [
  { id: 'dashboard', label: 'Live Dashboard', icon: '\u25A0', path: '/' },
  { id: 'entry', label: 'Daily Entry', icon: '\u270E', path: '/entry' },
  { id: 'sales', label: 'Sales', icon: '\uD83D\uDCB0', path: '/sales' },
  { id: 'staff', label: 'Staff', icon: '\uD83D\uDC65', path: '/staff' },
  { id: 'workshop', label: 'Workshop Log', icon: '\u2699', path: '/workshop' },
  { id: 'monthly', label: 'Monthly Report', icon: '\u2617', path: '/monthly' },
  { id: 'mechanics', label: 'Mechanic Tracker', icon: '\u2605', path: '/mechanics' },
  { id: 'finance', label: 'Finance Summary', icon: '\u2666', path: '/finance' },
  { id: 'kanban', label: 'Project Board', icon: '\u25FB', path: '/kanban' },
  { id: 'kpi', label: 'KPI Tracker', icon: '\u25B2', path: '/kpi' },
  { id: 'clockin', label: 'Staff Clock-In', icon: '\uD83D\uDD50', path: '/clockin' },
  { id: 'training', label: 'Staff Training', icon: '\u2606', path: '/training' },
  { id: 'inventory', label: 'Inventory / POS', icon: '\uD83D\uDCE6', path: '/inventory' },
  { id: 'reports', label: 'Reports', icon: '\uD83D\uDCCA', path: '/reports' },
  { id: 'creditors', label: 'Creditors & Loans', icon: '\u20B5', path: '/creditors' },
  { id: 'sheets', label: 'Google Sheets', icon: '\uD83D\uDCC4', path: '/sheets' },
  { id: 'audit', label: 'Audit Log', icon: '\uD83D\uDEE1', path: '/audit' },
  { id: 'settings', label: 'Settings', icon: '\u2699', path: '/settings' },
  { id: 'share', label: 'Share Links', icon: '\uD83D\uDD17', path: '/share' },
  { id: 'schedules', label: 'Scheduled Reports', icon: '\u23F1', path: '/schedules' },
];

const pageTitles: Record<string, string> = {
  dashboard: 'Live Dashboard',
  entry: 'Daily Entry',
  sales: 'Sales',
  staff: 'Staff',
  workshop: 'Workshop Log',
  monthly: 'Monthly Report',
  mechanics: 'Mechanic Tracker',
  finance: 'Finance Summary',
  kanban: 'Project Board',
  kpi: 'KPI Tracker',
  clockin: 'Staff Clock-In',
  training: 'Staff Training',
  inventory: 'Inventory / POS',
  reports: 'Reports',
  creditors: 'Creditors & Loans',
  sheets: 'Google Sheets',
  audit: 'Audit Log',
  settings: 'Settings',
  share: 'Share Links',
  schedules: 'Scheduled Reports',
};

// ========== MAIN LAYOUT ==========
export default function MainLayout({ children }: { children: React.ReactNode }) {
  const access = useAccess();
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clock, setClock] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Toast state
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [toastVisible, setToastVisible] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  // Slide panel state
  const [slidePanelOpen, setSlidePanelOpen] = useState(false);
  const [slidePanelTitle, setSlidePanelTitle] = useState('');
  const [slidePanelContent, setSlidePanelContent] = useState<React.ReactNode>(null);

  // Filter state
  const [filterState, setFilterState] = useState<FilterState>({
    preset: 'month',
    dateFrom: '',
    dateTo: '',
    staff: '',
    channel: '',
    payment: '',
  });

  const currentPage = location === '/' ? 'dashboard' : location.split('/')[1] || 'dashboard';

  // Live clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Toast
  const showToast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  }, []);

  // Modal
  const openModal = useCallback((content: React.ReactNode) => { setModalContent(content); setModalOpen(true); }, []);
  const closeModal = useCallback(() => { setModalOpen(false); setModalContent(null); }, []);

  // Slide panel
  const openSlidePanel = useCallback((title: string, content: React.ReactNode) => {
    setSlidePanelTitle(title); setSlidePanelContent(content); setSlidePanelOpen(true);
  }, []);
  const closeSlidePanel = useCallback(() => { setSlidePanelOpen(false); }, []);

  // Notifications
  const addNotification = useCallback((title: string, body: string) => {
    setNotifications(prev => [{ id: Date.now().toString(), title, body, time: new Date().toLocaleTimeString(), read: false }, ...prev]);
  }, []);

  const contextValue: LayoutContextType = {
    showToast, openModal, closeModal, openSlidePanel, closeSlidePanel,
    openNotifications: () => setNotifOpen(true), notifications, addNotification,
    filterState, setFilterState,
  };

  return (
    <LayoutContext.Provider value={contextValue}>
      {/* Hamburger */}
      <div className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>&#9776;</div>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">AGL</div>
          <div className="brand">
            <h3>AGL OPS</h3>
            <small>COMMAND CENTER</small>
          </div>
        </div>
        <div className="sidebar-nav">
          {pages.map(p => (
            <div
              key={p.id}
              className={`nav-item ${currentPage === p.id ? 'active' : ''}`}
              onClick={() => { navigate(p.path); setSidebarOpen(false); }}
            >
              <span className="icon">{p.icon}</span>
              {p.label}
            </div>
          ))}
        </div>
        <div className="sidebar-footer">
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'Rajdhani', fontWeight: 600, letterSpacing: '1px' }}>
            AUTOMOBILES GHANA LTD
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
            v4.0 &mdash; Command Center
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="main">
        {/* Top Bar */}
        <div className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="btn btn-secondary"
              onClick={() => window.history.back()}
              title="Back"
              style={{ padding: '4px 10px' }}
            >
              &larr;
            </button>
            <div>
              <h1>{pageTitles[currentPage] || 'Dashboard'}</h1>
              <div className="clock">{clock}</div>
            </div>
          </div>
          <div className="top-bar-actions">
            <input
              type="text"
              className="search-box"
              placeholder="Search anything..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {access.canEdit && <QuickEntryDrawer />}
            <NotificationBell />
            <button className="btn btn-secondary" onClick={() => showToast('CSV export coming soon', 'info')}>
              &#8681; Export CSV
            </button>
            <button className="btn btn-primary" onClick={() => window.print()}>
              &#128438; Print Summary
            </button>
            <div style={{ fontSize: 11, opacity: 0.7 }}>
              {access.user?.name || (access.role === 'guest' ? 'Guest' : 'User')} &middot; {access.role}
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <label>Period:</label>
          {['today', 'week', 'month', 'custom'].map(p => (
            <button
              key={p}
              className={`filter-preset ${filterState.preset === p ? 'active' : ''}`}
              onClick={() => setFilterState(prev => ({ ...prev, preset: p }))}
            >
              {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'Custom'}
            </button>
          ))}
          {filterState.preset === 'custom' && (
            <>
              <input type="date" className="filter-pill" value={filterState.dateFrom} onChange={e => setFilterState(prev => ({ ...prev, dateFrom: e.target.value }))} />
              <input type="date" className="filter-pill" value={filterState.dateTo} onChange={e => setFilterState(prev => ({ ...prev, dateTo: e.target.value }))} />
            </>
          )}
          <div className="filter-divider" />
          <label>Staff:</label>
          <select className="filter-pill" value={filterState.staff} onChange={e => setFilterState(prev => ({ ...prev, staff: e.target.value }))}>
            <option value="">All Staff</option>
            <option>Yvonne</option><option>Abigail</option><option>Ben</option>
            <option>Appiah</option><option>Kojo</option><option>Fatawu</option><option>Chris</option>
          </select>
          <div className="filter-divider" />
          <label>Channel:</label>
          <select className="filter-pill" value={filterState.channel} onChange={e => setFilterState(prev => ({ ...prev, channel: e.target.value }))}>
            <option value="">All Channels</option>
            <option>Walk-In</option><option>WhatsApp</option><option>Phone</option>
            <option>Facebook</option><option>Instagram</option><option>Wholesale</option><option>Workshop</option>
          </select>
          <div className="filter-divider" />
          <label>Payment:</label>
          <select className="filter-pill" value={filterState.payment} onChange={e => setFilterState(prev => ({ ...prev, payment: e.target.value }))}>
            <option value="">All Methods</option>
            <option>Cash</option><option>MoMo</option><option>Bank Transfer</option><option>Credit</option>
          </select>
        </div>

        {/* Page Content */}
        <div className="fade-in">
          {children}
        </div>
      </div>

      {/* Notification Panel */}
      <div className={`notification-panel ${notifOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px' }}>Notifications</h3>
          <button className="btn btn-xs btn-secondary" onClick={() => setNotifOpen(false)}>Close</button>
        </div>
        {notifications.length === 0 ? (
          <div style={{ color: 'var(--text-dim)', fontSize: '12px' }}>No notifications yet</div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className="notif-item" onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}>
              <div className="notif-title">{n.title}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>{n.body}</div>
              <div className="notif-time">{n.time}</div>
            </div>
          ))
        )}
      </div>

      {/* Modal Overlay */}
      {modalOpen && (
        <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
              <button className="btn btn-xs btn-secondary" onClick={closeModal}>&times; Close</button>
            </div>
            {modalContent}
          </div>
        </div>
      )}

      {/* Slide-Out Drawer */}
      {slidePanelOpen && <div className="slide-overlay open" onClick={closeSlidePanel} />}
      <div className={`slide-panel ${slidePanelOpen ? 'open' : ''}`}>
        <div className="slide-panel-header">
          <h3>{slidePanelTitle}</h3>
          <button className="slide-panel-close" onClick={closeSlidePanel}>&times;</button>
        </div>
        <div className="slide-panel-body">
          {slidePanelContent}
        </div>
      </div>

      {/* Toast */}
      <div className={`toast ${toastType} ${toastVisible ? 'show' : ''}`}>
        {toastMsg}
      </div>
    </LayoutContext.Provider>
  );
}
