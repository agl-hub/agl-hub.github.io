// import NewAppLayout from "@/components/NewAppLayout";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";
import FilterBar from "@/components/FilterBar";
import LiveInsightsBanner from "@/components/LiveInsightsBanner";

// Color scheme: Red (#e30613), Teal (#14b8a6), Amber (#f59e0b), Indigo (#6366f1)

export default function NewDashboardPage() {
  const kpiData = [
    { title: "Total Revenue", value: "₵45.2K", change: "+12.5%", positive: true },
    { title: "Transactions", value: "156", change: "+8.3%", positive: true },
    { title: "Vehicles Serviced", value: "42", change: "+5.2%", positive: true },
    { title: "Net Position", value: "₵38.9K", change: "+14.1%", positive: true },
  ];

  const notifications = [
    { type: "alert", title: "Revenue Target Alert", message: "Daily target not met. Current: ₵45.2K vs Target: ₵50K", time: "Just now" },
    { type: "user", title: "New Staff Member", message: "Kofi Mensah has been added to the system", time: "2 hours ago" },
    { type: "check", title: "Vehicle Completed", message: "Toyota Corolla (GN-2024-001) service completed", time: "3 hours ago" },
    { type: "success", title: "Payment Received", message: "Payment of ₵5,200 received from customer", time: "5 hours ago" },
    { type: "info", title: "Report Generated", message: "Weekly operations report is ready for review", time: "Today, 11:30 AM" },
    { type: "alert", title: "Attendance Issue", message: "Mechanic Yaw was 15 minutes late today", time: "Today, 8:45 AM" },
  ];

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#0f172a" }}>
        <FilterBar showDateRange showStatus showChannel showPaymentMethod />
        <div style={{ padding: "0 2rem" }}>
          <LiveInsightsBanner maxAlerts={3} />
        </div>
        <div style={{ display: "flex", gap: "2rem", padding: "2rem", height: "100%", overflow: "auto", flex: 1 }}>
          {/* Main Panel */}
          <div style={{ flex: 1 }}>
            {/* KPI Section */}
            <div style={{ marginBottom: "2rem" }}>
              <div style={{ fontSize: "0.875rem", color: "#7a8294", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "1rem", fontWeight: "600" }}>
                Today
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                {kpiData.map((kpi, idx) => (
                  <div key={idx} style={{
                    background: "linear-gradient(135deg, rgba(227, 6, 19, 0.05) 0%, rgba(20, 184, 166, 0.05) 100%)",
                    border: "1px solid #2a3447",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#e30613";
                      e.currentTarget.style.background = "linear-gradient(135deg, rgba(227, 6, 19, 0.1) 0%, rgba(20, 184, 166, 0.08) 100%)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#2a3447";
                      e.currentTarget.style.background = "linear-gradient(135deg, rgba(227, 6, 19, 0.05) 0%, rgba(20, 184, 166, 0.05) 100%)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{ fontSize: "0.875rem", color: "#b0b8c8", marginBottom: "0.5rem", fontWeight: "500" }}>
                      {kpi.title}
                    </div>
                    <div style={{ fontSize: "2rem", fontWeight: "700", color: "#ffffff", marginBottom: "0.5rem" }}>
                      {kpi.value}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: kpi.positive ? "#14b8a6" : "#e30613" }}>
                      {kpi.positive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      {kpi.change}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts Section */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "2rem", marginBottom: "2rem" }}>
              <div style={{
                backgroundColor: "#1a1f2e",
                border: "1px solid #2a3447",
                borderRadius: "12px",
                padding: "1.5rem",
              }}>
                <div style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1.5rem", color: "#ffffff" }}>
                  Revenue Trend
                </div>
                <svg style={{ width: "100%", height: "250px" }} viewBox="0 0 400 250">
                  <defs>
                    <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: "#e30613", stopOpacity: 0.3 }} />
                      <stop offset="100%" style={{ stopColor: "#e30613", stopOpacity: 0 }} />
                    </linearGradient>
                  </defs>
                  <polyline points="20,180 80,120 140,140 200,80 260,100 320,60 380,40" style={{ fill: "none", stroke: "#e30613", strokeWidth: 3 }} />
                  <polygon points="20,180 80,120 140,140 200,80 260,100 320,60 380,40 380,250 20,250" style={{ fill: "url(#redGradient)" }} />
                  <circle cx="20" cy="180" r="4" style={{ fill: "#e30613" }} />
                  <circle cx="80" cy="120" r="4" style={{ fill: "#e30613" }} />
                  <circle cx="140" cy="140" r="4" style={{ fill: "#e30613" }} />
                  <circle cx="200" cy="80" r="4" style={{ fill: "#e30613" }} />
                  <circle cx="260" cy="100" r="4" style={{ fill: "#e30613" }} />
                  <circle cx="320" cy="60" r="4" style={{ fill: "#e30613" }} />
                  <circle cx="380" cy="40" r="4" style={{ fill: "#e30613" }} />
                </svg>
              </div>

              <div style={{
                backgroundColor: "#1a1f2e",
                border: "1px solid #2a3447",
                borderRadius: "12px",
                padding: "1.5rem",
              }}>
                <div style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1.5rem", color: "#ffffff" }}>
                  Sales by Channel
                </div>
                <svg style={{ width: "100%", height: "250px" }} viewBox="0 0 250 250">
                  <circle cx="125" cy="125" r="100" style={{ fill: "#e30613" }} />
                  <circle cx="125" cy="125" r="80" style={{ fill: "#14b8a6" }} />
                  <circle cx="125" cy="125" r="60" style={{ fill: "#f59e0b" }} />
                  <circle cx="125" cy="125" r="40" style={{ fill: "#6366f1" }} />
                </svg>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "2rem" }}>
              <div style={{
                backgroundColor: "#1a1f2e",
                border: "1px solid #2a3447",
                borderRadius: "12px",
                padding: "1.5rem",
              }}>
                <div style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1.5rem", color: "#ffffff" }}>
                  Mechanic Performance
                </div>
                <svg style={{ width: "100%", height: "250px" }} viewBox="0 0 400 250">
                  <rect x="30" y="150" width="40" height="80" style={{ fill: "#e30613" }} />
                  <rect x="90" y="100" width="40" height="130" style={{ fill: "#14b8a6" }} />
                  <rect x="150" y="120" width="40" height="110" style={{ fill: "#f59e0b" }} />
                  <rect x="210" y="80" width="40" height="150" style={{ fill: "#6366f1" }} />
                  <rect x="270" y="140" width="40" height="90" style={{ fill: "#e30613" }} />
                  <rect x="330" y="110" width="40" height="120" style={{ fill: "#14b8a6" }} />
                </svg>
              </div>

              <div style={{
                backgroundColor: "#1a1f2e",
                border: "1px solid #2a3447",
                borderRadius: "12px",
                padding: "1.5rem",
              }}>
                <div style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1.5rem", color: "#ffffff" }}>
                  Expense Breakdown
                </div>
                <svg style={{ width: "100%", height: "250px" }} viewBox="0 0 250 250">
                  <defs>
                    <linearGradient id="donut1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: "#e30613" }} />
                      <stop offset="100%" style={{ stopColor: "#b80410" }} />
                    </linearGradient>
                    <linearGradient id="donut2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: "#14b8a6" }} />
                      <stop offset="100%" style={{ stopColor: "#0d9488" }} />
                    </linearGradient>
                    <linearGradient id="donut3" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: "#f59e0b" }} />
                      <stop offset="100%" style={{ stopColor: "#d97706" }} />
                    </linearGradient>
                    <linearGradient id="donut4" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: "#6366f1" }} />
                      <stop offset="100%" style={{ stopColor: "#4f46e5" }} />
                    </linearGradient>
                  </defs>
                  <circle cx="125" cy="125" r="100" style={{ fill: "url(#donut1)" }} />
                  <circle cx="125" cy="125" r="70" style={{ fill: "#1a1f2e" }} />
                  <path d="M 125 25 A 100 100 0 0 1 225 125" style={{ fill: "none", stroke: "url(#donut2)", strokeWidth: 20 }} />
                  <path d="M 225 125 A 100 100 0 0 1 125 225" style={{ fill: "none", stroke: "url(#donut3)", strokeWidth: 20 }} />
                  <path d="M 125 225 A 100 100 0 0 1 25 125" style={{ fill: "none", stroke: "url(#donut4)", strokeWidth: 20 }} />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Panel - Notifications */}
          <div style={{
            width: "320px",
            backgroundColor: "#1a1f2e",
            borderRadius: "12px",
            border: "1px solid #2a3447",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}>
            <div style={{
              padding: "1.5rem",
              borderBottom: "1px solid #2a3447",
              fontWeight: "600",
              color: "#ffffff",
            }}>
              Notifications
            </div>
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: "1.5rem",
            }}>
              {notifications.map((notif, idx) => {
                let IconComponent = AlertCircle;
                let iconColor = "#e30613";

                if (notif.type === "user") {
                  iconColor = "#b0b8c8";
                } else if (notif.type === "check" || notif.type === "success") {
                  IconComponent = CheckCircle;
                  iconColor = "#14b8a6";
                }

                return (
                  <div key={idx} style={{
                    paddingBottom: "1rem",
                    marginBottom: "1rem",
                    borderBottom: idx < notifications.length - 1 ? "1px solid #2a3447" : "none",
                    display: "flex",
                    gap: "1rem",
                    alignItems: "flex-start",
                  }}>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      background: `linear-gradient(135deg, ${iconColor}33 0%, ${iconColor}22 100%)`,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: iconColor,
                    }}>
                      <IconComponent size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.95rem", marginBottom: "0.25rem", color: "#ffffff", fontWeight: "500" }}>
                        {notif.title}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "#b0b8c8", marginBottom: "0.5rem" }}>
                        {notif.message}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#7a8294" }}>
                        {notif.time}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
