import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

const NAVIGATION_ITEMS = [
  { id: "dashboard", label: "Live Dashboard", icon: "📊" },
  { id: "entry", label: "Daily Entry", icon: "📝" },
  { id: "workshop", label: "Workshop Log", icon: "🔧" },
  { id: "sales", label: "Sales Log", icon: "💳" },
  { id: "mechanics", label: "Mechanic Tracker", icon: "⭐" },
  { id: "finance", label: "Finance Summary", icon: "💰" },
  { id: "kanban", label: "Project Board", icon: "📋" },
  { id: "kpi", label: "KPI Tracker", icon: "📈" },
  { id: "clockin", label: "Staff Clock-In", icon: "🕐" },
  { id: "training", label: "Staff Training", icon: "🎓" },
  { id: "inventory", label: "Inventory / POS", icon: "📦" },
  { id: "reports", label: "Reports", icon: "📄" },
  { id: "creditors", label: "Creditors & Loans", icon: "💳" },
  { id: "sheets", label: "Google Sheets", icon: "📊" },
];

export default function AppLayout({ children, currentPage }: AppLayoutProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-lg">AGL Command Center</h1>
          <p className="text-text-tertiary mb-2xl">Automotive Operations Dashboard</p>
          <a href={getLoginUrl()} className="btn btn-primary btn-lg">
            Login with Manus
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Logo */}
        <div className="p-lg border-b border-border-color">
          <div className="flex items-center gap-md mb-md">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center font-bold text-white">
              AGL
            </div>
            <div>
              <h2 className="font-bold text-lg">AGL OPS</h2>
              <p className="text-xs text-text-tertiary">COMMAND CENTER</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-md">
          <div className="flex flex-col gap-sm">
            {NAVIGATION_ITEMS.map((item) => (
              <Link key={item.id} href={`/${item.id}`}>
                <a className={`flex items-center gap-md px-md py-sm rounded-md transition-all ${
                  currentPage === item.id
                    ? "bg-primary/20 text-primary-light border-l-2 border-primary"
                    : "text-text-secondary hover:bg-bg-tertiary"
                }`}>
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </a>
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-lg border-t border-border-color">
          <div className="text-xs text-text-muted font-mono font-bold tracking-wider mb-sm">
            AUTOMOBILES GHANA LTD
          </div>
          <div className="text-xs text-text-muted mb-lg">v4.0 — Command Center</div>
          <button
            onClick={() => logout()}
            className="w-full btn btn-secondary btn-sm text-xs"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main">
        {/* Header */}
        <header className="header">
          <div className="flex items-center gap-lg">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn btn-secondary btn-sm md:hidden"
            >
              ☰
            </button>
            <div>
              <h1 className="text-2xl font-bold">
                {NAVIGATION_ITEMS.find((item) => item.id === currentPage)?.label || "Dashboard"}
              </h1>
              <div className="text-text-tertiary text-sm font-mono" id="clock"></div>
            </div>
          </div>

          <div className="flex items-center gap-lg">
            <input
              type="text"
              placeholder="Search anything..."
              className="form-control hidden md:block max-w-xs"
            />
            <button className="btn btn-secondary btn-sm">🔔</button>
            <button className="btn btn-secondary btn-sm">📥 Export CSV</button>
            <button className="btn btn-primary btn-sm">🖨️ Print</button>
            <div className="flex items-center gap-md">
              <div className="text-right">
                <div className="text-sm font-bold">{user?.name}</div>
                <div className="text-xs text-text-tertiary">{user?.email}</div>
              </div>
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0) || "U"}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="content">
          {children}
        </div>
      </main>

      {/* Clock Update */}
      <script>{`
        function updateClock() {
          const clock = document.getElementById('clock');
          if (clock) {
            const now = new Date();
            clock.textContent = now.toLocaleTimeString();
          }
        }
        updateClock();
        setInterval(updateClock, 1000);
      `}</script>
    </div>
  );
}
