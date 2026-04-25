import { ReactNode, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Wrench, Users, Briefcase, Wallet, Repeat,
  Settings, LogOut, Bell, Menu, X,
} from 'lucide-react';

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-canvas">
      <TopBar onMenu={() => setOpen(v => !v)} />
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] min-h-[calc(100vh-72px)]">
        <SideNav open={open} onClose={() => setOpen(false)} />
        <main className="p-4 md:p-8 max-w-[1440px] mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}

function TopBar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-40 h-[72px] bg-black/90 backdrop-blur-md text-white">
      <div className="h-full px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="md:hidden w-10 h-10 grid place-items-center rounded-lg bg-white/10 hover:bg-white/20"
                  onClick={onMenu} aria-label="Menu">
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-brand-500 grid place-items-center font-extrabold">A</span>
            <span className="text-lg font-extrabold tracking-wide">
              AGL<span className="text-brand-500 ml-1">OPS</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 grid place-items-center rounded-lg bg-white/10 hover:bg-white/20">
            <Bell size={18} />
          </button>
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_0_4px_rgba(220,38,38,0.25)]" />
            Welcome, <b>Admin</b>
          </div>
        </div>
      </div>
    </header>
  );
}

function SideNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const items = [
    { to: '/',              icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/workshop',      icon: Wrench,          label: 'Workshop' },
    { to: '/customers',     icon: Users,           label: 'Customers' },
    { to: '/hr',            icon: Briefcase,       label: 'HR' },
    { to: '/finance',       icon: Wallet,          label: 'Finance' },
    { to: '/subscriptions', icon: Repeat,          label: 'Subscriptions' },
    { to: '/settings',      icon: Settings,        label: 'Settings' },
  ];
  return (
    <aside className={`bg-white border-r border-line px-3 py-5 flex-col gap-1
                        ${open ? 'fixed inset-0 z-30 flex' : 'hidden md:flex'}`}>
      {open && (
        <button className="md:hidden self-end mb-2 p-2" onClick={onClose}><X size={18} /></button>
      )}
      <nav className="flex flex-col gap-1">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to} end={to === '/'} onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors
               ${isActive
                  ? 'bg-brand-50 text-brand-600 shadow-[inset_3px_0_0_#DC2626]'
                  : 'text-neutral-600 hover:bg-canvas hover:text-black'}`
            }
          >
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>
      <button className="mt-auto flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                         text-black hover:bg-brand-50 hover:text-brand-600">
        <LogOut size={18} /> Logout
      </button>
    </aside>
  );
}
