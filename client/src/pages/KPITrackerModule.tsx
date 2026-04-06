import NewAppLayout from "@/components/NewAppLayout";
import { TrendingUp, TrendingDown, Target, BarChart3 } from "lucide-react";
import { useState } from "react";
import FilterBar from "@/components/FilterBar";

export default function KPITrackerModule() {
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  const kpiMetrics = [
    { name: "Total Revenue", value: "₵45.2K", target: "₵50K", actual: 45200, target_val: 50000, change: "+12.5%", positive: true, trend: [40, 42, 45, 43, 45.2] },
    { name: "Transactions", value: "156", target: "180", actual: 156, target_val: 180, change: "+8.3%", positive: true, trend: [120, 135, 145, 150, 156] },
    { name: "Vehicles Serviced", value: "42", target: "50", actual: 42, target_val: 50, change: "+5.2%", positive: true, trend: [35, 38, 40, 41, 42] },
    { name: "Average Job Time", value: "2.3h", target: "2.0h", actual: 2.3, target_val: 2.0, change: "-8.5%", positive: false, trend: [2.8, 2.6, 2.4, 2.3, 2.3] },
    { name: "Customer Satisfaction", value: "4.7★", target: "4.8★", actual: 4.7, target_val: 4.8, change: "+2.1%", positive: true, trend: [4.5, 4.6, 4.65, 4.7, 4.7] },
    { name: "Mechanic Efficiency", value: "88%", target: "90%", actual: 88, target_val: 90, change: "+3.5%", positive: true, trend: [82, 84, 86, 87, 88] },
    { name: "Parts Inventory", value: "₵125K", target: "₵150K", actual: 125000, target_val: 150000, change: "-5.2%", positive: false, trend: [140, 135, 130, 127, 125] },
    { name: "Staff Attendance", value: "90%", target: "95%", actual: 90, target_val: 95, change: "+1.1%", positive: true, trend: [85, 87, 88, 89, 90] },
  ];

  const getPerformanceColor = (actual: number, target: number) => {
    const percentage = (actual / target) * 100;
    if (percentage >= 95) return "#14b8a6";
    if (percentage >= 85) return "#f59e0b";
    return "#e30613";
  };

  return (
    <NewAppLayout currentPage="kpi">
      <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#0f172a" }}>
        <FilterBar showDateRange showStatus={false} showChannel={false} showPaymentMethod={false} />

        <div style={{ padding: "2rem", flex: 1, overflow: "auto" }}>
          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "0.4375rem", fontWeight: "700", color: "#ffffff", margin: "0 0 0.5rem 0" }}>KPI Tracker</h1>
            <p style={{ fontSize: "0.4375rem", color: "#b0b8c8", margin: 0 }}>Monitor key performance indicators and business metrics</p>
          </div>

          {/* Period Selector */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
            {["day", "week", "month", "quarter", "year"].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: selectedPeriod === period ? "#e30613" : "#1a1f2e",
                  color: selectedPeriod === period ? "#ffffff" : "#b0b8c8",
                  border: selectedPeriod === period ? "1px solid #e30613" : "1px solid #2a3447",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                  whiteSpace: "nowrap",
                  textTransform: "capitalize",
                }}
              >
                {period}
              </button>
            ))}
          </div>

          {/* KPI Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {kpiMetrics.map((kpi, idx) => (
              <div key={idx} style={{
                backgroundColor: "#1a1f2e",
                border: "1px solid #2a3447",
                borderRadius: "12px",
                padding: "1.5rem",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#e30613";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#2a3447";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "0.65rem", fontWeight: "600", color: "#b0b8c8", margin: 0 }}>
                    {kpi.name}
                  </h3>
                  <Target size={18} style={{ color: "#7a8294" }} />
                </div>

                {/* Value */}
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ fontSize: "2rem", fontWeight: "700", color: "#ffffff", marginBottom: "0.5rem" }}>
                    {kpi.value}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.4375rem", color: kpi.positive ? "#14b8a6" : "#e30613" }}>
                    {kpi.positive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {kpi.change}
                  </div>
                </div>

                {/* Target Progress */}
                <div style={{ marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid #2a3447" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.5rem" }}>
                    <span style={{ color: "#7a8294" }}>Target: {kpi.target}</span>
                    <span style={{ color: getPerformanceColor(kpi.actual, kpi.target_val), fontWeight: "600" }}>
                      {((kpi.actual / kpi.target_val) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div style={{
                    width: "100%",
                    height: "8px",
                    backgroundColor: "#2a3447",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${Math.min((kpi.actual / kpi.target_val) * 100, 100)}%`,
                      height: "100%",
                      backgroundColor: getPerformanceColor(kpi.actual, kpi.target_val),
                      transition: "width 0.3s ease",
                    }} />
                  </div>
                </div>

                {/* Mini Trend Chart */}
                <div style={{ height: "40px", display: "flex", alignItems: "flex-end", gap: "2px" }}>
                  {kpi.trend.map((value, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: `${(value / Math.max(...kpi.trend)) * 100}%`,
                        backgroundColor: i === kpi.trend.length - 1 ? "#e30613" : "#6366f1",
                        borderRadius: "2px",
                        transition: "all 0.3s ease",
                        opacity: i === kpi.trend.length - 1 ? 1 : 0.6,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "1";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = i === kpi.trend.length - 1 ? "1" : "0.6";
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Analysis */}
          <div style={{ marginTop: "2rem" }}>
            <h2 style={{ fontSize: "0.4375rem", fontWeight: "600", color: "#ffffff", marginBottom: "1.5rem", margin: "2rem 0 1.5rem 0" }}>
              Performance Analysis
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
              {/* On Track */}
              <div style={{
                backgroundColor: "#1a1f2e",
                border: "1px solid #2a3447",
                borderRadius: "12px",
                padding: "1.5rem",
              }}>
                <h3 style={{ fontSize: "0.5rem", fontWeight: "600", color: "#14b8a6", marginBottom: "1rem", margin: "0 0 1rem 0" }}>
                  On Track KPIs
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {kpiMetrics.filter(k => (k.actual / k.target_val) >= 0.85).map((kpi, idx) => (
                    <div key={idx} style={{
                      padding: "0.75rem",
                      backgroundColor: "#0f172a",
                      borderRadius: "6px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                      <span style={{ color: "#b0b8c8" }}>{kpi.name}</span>
                      <span style={{ color: "#14b8a6", fontWeight: "600" }}>
                        {((kpi.actual / kpi.target_val) * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Needs Attention */}
              <div style={{
                backgroundColor: "#1a1f2e",
                border: "1px solid #2a3447",
                borderRadius: "12px",
                padding: "1.5rem",
              }}>
                <h3 style={{ fontSize: "0.5rem", fontWeight: "600", color: "#f59e0b", marginBottom: "1rem", margin: "0 0 1rem 0" }}>
                  Needs Attention
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {kpiMetrics.filter(k => (k.actual / k.target_val) < 0.85).map((kpi, idx) => (
                    <div key={idx} style={{
                      padding: "0.75rem",
                      backgroundColor: "#0f172a",
                      borderRadius: "6px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                      <span style={{ color: "#b0b8c8" }}>{kpi.name}</span>
                      <span style={{ color: "#f59e0b", fontWeight: "600" }}>
                        {((kpi.actual / kpi.target_val) * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </NewAppLayout>
  );
}
