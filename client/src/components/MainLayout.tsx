import React, { useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import '../styles/global.css';
import NotificationBell from './NotificationBell';
import QuickEntryDrawer from './QuickEntryDrawer';
import { useAccess } from '@/contexts/AccessContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

function TopBar() {
  const access = useAccess();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 12,
        marginBottom: 14,
        padding: '6px 0',
        borderBottom: '1px solid var(--card-border)',
      }}
    >
      {access.canEdit && <QuickEntryDrawer />}
      <NotificationBell />
      <div style={{ fontSize: 11, opacity: 0.7 }}>
        {access.user?.name || (access.role === 'guest' ? 'Guest' : 'User')} · {access.role}
      </div>
    </div>
  );
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location, navigate] = useLocation();

  const pages = [
    { id: 'dashboard', label: 'Live Dashboard', icon: '■' },
    { id: 'entry', label: 'Daily Entry', icon: '✎' },
    { id: 'workshop', label: 'Workshop Log', icon: '⚙' },
    { id: 'monthly', label: 'Monthly Report', icon: '☀' },
    { id: 'mechanics', label: 'Mechanic Tracker', icon: '★' },
    { id: 'finance', label: 'Finance Summary', icon: '◆' },
    { id: 'kanban', label: 'Project Board', icon: '◻' },
    { id: 'kpi', label: 'KPI Tracker', icon: '▲' },
    { id: 'clockin', label: 'Staff Clock-In', icon: '🕐' },
    { id: 'training', label: 'Staff Training', icon: '☆' },
    { id: 'inventory', label: 'Inventory / POS', icon: '📦' },
    { id: 'reports', label: 'Reports', icon: '📊' },
    { id: 'creditors', label: 'Creditors & Loans', icon: '₵' },
    { id: 'sheets', label: 'Google Sheets', icon: '📄' },
  ];

  const currentPage = location.split('/')[1] || 'dashboard';
  const isActive = (pageId: string) => currentPage === pageId;

  const handleNavClick = (pageId: string) => {
    navigate(`/${pageId}`);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    // TODO: Implement logout
    console.log('Logout clicked');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Hamburger Menu */}
      <div
        className="hamburger"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          display: 'none',
          position: 'fixed',
          top: '14px',
          left: '14px',
          zIndex: 150,
          background: 'var(--card)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 10px',
          cursor: 'pointer',
          color: '#fff',
          fontSize: '18px',
          backdropFilter: 'blur(12px)',
        }}
      >
        ☰
      </div>

      {/* Sidebar */}
      <div
        className={`sidebar ${sidebarOpen ? 'open' : ''}`}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: 'var(--sidebar-w)',
          height: '100vh',
          background: 'linear-gradient(180deg, rgba(10, 12, 18, 0.98), rgba(14, 17, 26, 0.95))',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--card-border)',
          boxShadow: '1px 0 24px rgba(0, 0, 0, 0.3)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s',
        }}
      >
        {/* Sidebar Header */}
        <div
          style={{
            padding: '14px 12px',
            borderBottom: '1px solid var(--card-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              background: 'var(--gradient-red)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Rajdhani',
              fontWeight: 700,
              fontSize: '12px',
              color: '#fff',
              boxShadow: '0 2px 12px rgba(227, 6, 19, 0.3)',
            }}
          >
            AGL
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3
              style={{
                fontSize: '13px',
                color: '#fff',
                letterSpacing: '1.5px',
                fontFamily: 'Rajdhani',
                fontWeight: 700,
                margin: 0,
              }}
            >
              AGL OPS
            </h3>
            <small
              style={{
                fontSize: '9px',
                color: 'var(--text-dim)',
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              COMMAND CENTER
            </small>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 8px',
          }}
        >
          {pages.map((page) => (
            <div
              key={page.id}
              onClick={() => handleNavClick(page.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                color: isActive(page.id) ? 'var(--primary-light)' : 'var(--text-dim)',
                fontSize: '9pt',
                fontWeight: isActive(page.id) ? 600 : 500,
                transition: 'all 0.2s',
                marginBottom: '2px',
                background: isActive(page.id) ? 'var(--primary-bg)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive(page.id)) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = 'var(--text)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(page.id)) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-dim)';
                }
              }}
            >
              <span style={{ width: '16px', textAlign: 'center', fontSize: '11px', flexShrink: 0 }}>
                {page.icon}
              </span>
              <span>{page.label}</span>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div
          style={{
            padding: '10px 12px',
            borderTop: '1px solid var(--card-border)',
            fontSize: '9pt',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'Rajdhani', fontWeight: 600, letterSpacing: '1px' }}>
            AUTOMOBILES GHANA LTD
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
            v4.0 — Command Center
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          marginLeft: 'var(--sidebar-w)',
          minHeight: '100vh',
          padding: '14px 20px 30px',
          flex: 1,
        }}
      >
        {/* Top bar */}
        <TopBar />
        {children}
      </div>
    </div>
  );
}
