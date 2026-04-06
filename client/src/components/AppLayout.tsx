import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  LayoutDashboard,
  FileText,
  Wrench,
  ShoppingCart,
  Users,
  DollarSign,
  Kanban,
  TrendingUp,
  Clock,
  BookOpen,
  Package,
  FileBarChart,
  CreditCard,
  Sheet,
  Menu,
  Bell,
  Download,
  Printer,
  LogOut,
} from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

const NAVIGATION_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "entry", label: "Daily Entry", icon: FileText },
  { id: "workshop", label: "Workshop", icon: Wrench },
  { id: "sales", label: "Sales", icon: ShoppingCart },
  { id: "mechanics", label: "Mechanics", icon: Users },
  { id: "finance", label: "Finance", icon: DollarSign },
  { id: "kanban", label: "Tasks", icon: Kanban },
  { id: "kpi", label: "KPI Tracker", icon: TrendingUp },
  { id: "clockin", label: "Attendance", icon: Clock },
  { id: "training", label: "Training", icon: BookOpen },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "reports", label: "Reports", icon: FileBarChart },
  { id: "creditors", label: "Creditors", icon: CreditCard },
  { id: "sheets", label: "Data Sync", icon: Sheet },
];

export default function AppLayout({ children, currentPage }: AppLayoutProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!isAuthenticated) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--font-bold)", marginBottom: "var(--spacing-lg)" }}>
            AGL Command Center
          </h1>
          <p style={{ color: "var(--text-tertiary)", marginBottom: "var(--spacing-2xl)" }}>
            Automotive Operations Management System
          </p>
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
        <div style={{ padding: "var(--spacing-lg)", borderBottom: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)", marginBottom: "var(--spacing-md)" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "var(--primary)",
                borderRadius: "var(--radius-lg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "var(--font-bold)",
                color: "white",
                fontSize: "var(--text-lg)",
              }}
            >
              AGL
            </div>
            <div>
              <h2 style={{ fontWeight: "var(--font-bold)", fontSize: "var(--text-lg)", color: "var(--text-primary)" }}>
                AGL OPS
              </h2>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                COMMAND CENTER
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "var(--spacing-md)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
            {NAVIGATION_ITEMS.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentPage === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => window.location.href = `/${item.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--spacing-md)",
                    padding: "var(--spacing-md) var(--spacing-lg)",
                    borderRadius: "var(--radius-md)",
                    color: isActive ? "var(--primary)" : "var(--text-secondary)",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    backgroundColor: isActive ? "rgba(227, 6, 19, 0.1)" : "transparent",
                    borderLeft: isActive ? "3px solid var(--primary)" : "3px solid transparent",
                    paddingLeft: isActive ? "calc(var(--spacing-lg) - 3px)" : "var(--spacing-lg)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                      e.currentTarget.style.color = "var(--text-primary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }
                  }}
                >
                  <IconComponent size={18} />
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-medium)" }}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div style={{ padding: "var(--spacing-lg)", borderTop: "1px solid var(--border-color)" }}>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontFamily: "monospace", fontWeight: "var(--font-bold)", letterSpacing: "0.5px", marginBottom: "var(--spacing-sm)" }}>
            AUTOMOBILES GHANA LTD
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--spacing-lg)" }}>
            v4.0 — Command Center
          </div>
          <button
            onClick={() => logout()}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--spacing-sm)",
            }}
            className="btn btn-secondary btn-sm"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main">
        {/* Header */}
        <header className="header">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-lg)" }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn btn-secondary btn-sm"
              style={{ display: "none" }}
            >
              <Menu size={18} />
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: "var(--text-2xl)", fontWeight: "var(--font-bold)" }}>
                {NAVIGATION_ITEMS.find((item) => item.id === currentPage)?.label || "Dashboard"}
              </h1>
              <div style={{ color: "var(--text-tertiary)", fontSize: "var(--text-sm)", fontFamily: "monospace" }} id="clock"></div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-lg)" }}>
            <input
              type="text"
              placeholder="Search..."
              className="form-control"
              style={{ maxWidth: "300px", display: "none" }}
            />
            <button className="btn btn-secondary btn-sm">
              <Bell size={16} />
            </button>
            <button className="btn btn-secondary btn-sm">
              <Download size={16} />
              Export
            </button>
            <button className="btn btn-secondary btn-sm">
              <Printer size={16} />
              Print
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-bold)" }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                  {user?.email}
                </div>
              </div>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  backgroundColor: "var(--primary)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "var(--font-bold)",
                  fontSize: "var(--text-sm)",
                }}
              >
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
