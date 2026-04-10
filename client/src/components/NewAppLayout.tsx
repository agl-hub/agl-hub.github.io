import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
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
  Bell,
  Download,
  Printer,
  LogOut,
  Search,
  Moon,
  RotateCcw,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

interface NewAppLayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

const NAVIGATION_ITEMS = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
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

export default function NewAppLayout({ children, currentPage }: NewAppLayoutProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof NAVIGATION_ITEMS>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = NAVIGATION_ITEMS.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#0f1419" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "700", marginBottom: "1rem", color: "#ffffff" }}>
            AGL Command Center
          </h1>
          <p style={{ color: "#b0b8c8", marginBottom: "2rem", fontSize: "1.125rem" }}>
            Automotive Operations Management System
          </p>
          <a href={getLoginUrl()} style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #e30613 0%, #b80410 100%)",
            color: "white",
            padding: "0.75rem 1.5rem",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: "600",
          }}>
            Login with Manus
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100dvh", backgroundColor: "#0f172a", color: "#ffffff" }}>
      {/* Sidebar */}
      <aside style={{
        width: "260px",
        backgroundColor: "#1a1f2e",
        borderRight: "1px solid #2a3447",
        padding: "2rem 1.5rem",
        overflowY: "auto",
        position: "fixed",
        height: "100vh",
        left: 0,
        top: 0,
        zIndex: 100,
        display: sidebarOpen ? "block" : "none",
      }}>
        {/* Sidebar Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
          <div style={{
            width: "40px",
            height: "40px",
            background: "linear-gradient(135deg, #e30613 0%, #b80410 100%)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "1.25rem",
            color: "white",
          }}>
            AGL
          </div>
          <div>
            <div style={{ fontSize: "0.875rem", fontWeight: "600", color: "#ffffff" }}>AGL Command</div>
            <div style={{ fontSize: "0.75rem", color: "#7a8294" }}>Center</div>
          </div>
        </div>

        {/* Favorites */}
        <div style={{ fontSize: "0.875rem", color: "#7a8294", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "1rem", fontWeight: "600" }}>
          Favorites
        </div>
        <div style={{ marginBottom: "2rem" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.75rem 1rem",
            color: "#b0b8c8",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(227, 6, 19, 0.1)";
              e.currentTarget.style.color = "#e30613";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#b0b8c8";
            }}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </div>
        </div>

        {/* Dashboards */}
        <div style={{ fontSize: "0.875rem", color: "#7a8294", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "1rem", fontWeight: "600" }}>
          Dashboards
        </div>
        <div style={{ marginBottom: "2rem" }}>
          {NAVIGATION_ITEMS.slice(0, 5).map((item) => {
            const IconComponent = item.icon;
            const isActive = currentPage === item.id;
            return (
              <div
                key={item.id}
                onClick={() => window.location.href = `/${item.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  color: isActive ? "#e30613" : "#b0b8c8",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  backgroundColor: isActive ? "rgba(227, 6, 19, 0.15)" : "transparent",
                  borderLeft: isActive ? "3px solid #e30613" : "3px solid transparent",
                  paddingLeft: isActive ? "calc(1rem - 3px)" : "1rem",
                  marginBottom: "0.5rem",
                  fontWeight: isActive ? "600" : "400",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "rgba(227, 6, 19, 0.1)";
                    e.currentTarget.style.color = "#e30613";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#b0b8c8";
                  }
                }}
              >
                <IconComponent size={18} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Pages */}
        <div style={{ fontSize: "0.875rem", color: "#7a8294", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "1rem", fontWeight: "600" }}>
          Pages
        </div>
        <div style={{ marginBottom: "2rem" }}>
          {NAVIGATION_ITEMS.slice(5).map((item) => {
            const IconComponent = item.icon;
            const isActive = currentPage === item.id;
            return (
              <div
                key={item.id}
                onClick={() => window.location.href = `/${item.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  color: isActive ? "#e30613" : "#b0b8c8",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  backgroundColor: isActive ? "rgba(227, 6, 19, 0.15)" : "transparent",
                  borderLeft: isActive ? "3px solid #e30613" : "3px solid transparent",
                  paddingLeft: isActive ? "calc(1rem - 3px)" : "1rem",
                  marginBottom: "0.5rem",
                  fontWeight: isActive ? "600" : "400",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "rgba(227, 6, 19, 0.1)";
                    e.currentTarget.style.color = "#e30613";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#b0b8c8";
                  }
                }}
              >
                <IconComponent size={18} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Account */}
        <div style={{ fontSize: "0.875rem", color: "#7a8294", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "1rem", fontWeight: "600" }}>
          Account
        </div>
        <button
          onClick={() => logout()}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            padding: "0.75rem 1rem",
            backgroundColor: "#252d3d",
            color: "#b0b8c8",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            fontSize: "0.95rem",
            fontWeight: "500",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(227, 6, 19, 0.2)";
            e.currentTarget.style.color = "#e30613";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#252d3d";
            e.currentTarget.style.color = "#b0b8c8";
          }}
        >
          <LogOut size={16} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <div style={{ marginLeft: sidebarOpen ? "260px" : "0", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <header style={{
          backgroundColor: "#1a1f2e",
          borderBottom: "1px solid #2a3447",
          padding: "1.5rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: "none",
                border: "none",
                color: "#b0b8c8",
                cursor: "pointer",
                fontSize: "1.25rem",
              }}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "700" }}>Dashboard</h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "#252d3d",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              flex: "0 0 200px",
              position: "relative",
            }}>
              <Search size={18} color="#7a8294" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => { if (searchQuery.trim()) setShowSearchResults(true); }}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ffffff",
                  outline: "none",
                  flex: 1,
                  fontSize: "0.95rem",
                }}
              />
              {showSearchResults && searchResults.length > 0 && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  backgroundColor: "#1a1f2e",
                  border: "1px solid #2a3447",
                  borderRadius: "0 0 6px 6px",
                  zIndex: 200,
                  maxHeight: "240px",
                  overflowY: "auto",
                }}>
                  {searchResults.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <a
                        key={item.id}
                        href={`/${item.id}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.75rem 1rem",
                          color: "#b0b8c8",
                          textDecoration: "none",
                          cursor: "pointer",
                          borderBottom: "1px solid #2a3447",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(227,6,19,0.1)"; e.currentTarget.style.color = "#ffffff"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#b0b8c8"; }}
                      >
                        <IconComponent size={16} />
                        <span style={{ fontSize: "0.875rem" }}>{item.label}</span>
                      </a>
                    );
                  })}
                </div>
              )}
              {showSearchResults && searchQuery.trim() && searchResults.length === 0 && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  backgroundColor: "#1a1f2e",
                  border: "1px solid #2a3447",
                  borderRadius: "0 0 6px 6px",
                  padding: "0.75rem 1rem",
                  color: "#7a8294",
                  fontSize: "0.875rem",
                  zIndex: 200,
                }}>
                  No results found
                </div>
              )}
            </div>

            <button style={{
              width: "36px",
              height: "36px",
              backgroundColor: "#252d3d",
              border: "none",
              borderRadius: "6px",
              color: "#b0b8c8",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(227, 6, 19, 0.2)";
                e.currentTarget.style.color = "#e30613";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#252d3d";
                e.currentTarget.style.color = "#b0b8c8";
              }}
            >
              <Moon size={18} />
            </button>

            <button style={{
              width: "36px",
              height: "36px",
              backgroundColor: "#252d3d",
              border: "none",
              borderRadius: "6px",
              color: "#b0b8c8",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(227, 6, 19, 0.2)";
                e.currentTarget.style.color = "#e30613";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#252d3d";
                e.currentTarget.style.color = "#b0b8c8";
              }}
            >
              <RotateCcw size={18} />
            </button>

            <button style={{
              width: "36px",
              height: "36px",
              backgroundColor: "#252d3d",
              border: "none",
              borderRadius: "6px",
              color: "#b0b8c8",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(227, 6, 19, 0.2)";
                e.currentTarget.style.color = "#e30613";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#252d3d";
                e.currentTarget.style.color = "#b0b8c8";
              }}
            >
              <Bell size={18} />
            </button>

            <div style={{
              width: "36px",
              height: "36px",
              background: "linear-gradient(135deg, #e30613 0%, #b80410 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              cursor: "pointer",
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
