import NewAppLayout from "@/components/NewAppLayout";
import { Star, TrendingUp, Clock, Wrench } from "lucide-react";
import { useState } from "react";
import FilterBar from "@/components/FilterBar";

export default function MechanicTrackerModule() {
  const [selectedMetric, setSelectedMetric] = useState("efficiency");

  const mechanicData = [
    { id: 1, name: "Kofi Mensah", specialty: "Engine Work", jobsCompleted: 24, avgTime: "2.5 hrs", rating: 4.8, efficiency: 92, revenue: "₵12,500", status: "Active" },
    { id: 2, name: "Yaw Asare", specialty: "Electrical", jobsCompleted: 18, avgTime: "1.8 hrs", rating: 4.6, efficiency: 88, revenue: "₵9,800", status: "Active" },
    { id: 3, name: "Ama Mensah", specialty: "Transmission", jobsCompleted: 15, avgTime: "3.2 hrs", rating: 4.7, efficiency: 85, revenue: "₵8,200", status: "Active" },
    { id: 4, name: "Kwesi Boateng", specialty: "Suspension", jobsCompleted: 12, avgTime: "2.1 hrs", rating: 4.5, efficiency: 80, revenue: "₵6,500", status: "On Leave" },
    { id: 5, name: "Abena Kuma", specialty: "General Maintenance", jobsCompleted: 28, avgTime: "1.5 hrs", rating: 4.9, efficiency: 95, revenue: "₵14,200", status: "Active" },
  ];

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return "#14b8a6";
    if (efficiency >= 80) return "#f59e0b";
    return "#e30613";
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.7) return "#14b8a6";
    if (rating >= 4.5) return "#f59e0b";
    return "#e30613";
  };

  return (
    <NewAppLayout currentPage="mechanics">
      <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#0f172a" }}>
        <FilterBar showDateRange showStatus={false} showChannel={false} showPaymentMethod={false} />

        <div style={{ padding: "2rem", flex: 1, overflow: "auto" }}>
          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.875rem", fontWeight: "700", color: "#ffffff", margin: "0 0 0.5rem 0" }}>Mechanic Performance Tracker</h1>
            <p style={{ fontSize: "0.875rem", color: "#b0b8c8", margin: 0 }}>Monitor mechanic efficiency, ratings, and productivity</p>
          </div>

          {/* Metric Selector */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
            {[
              { id: "efficiency", label: "Efficiency", icon: "⚡" },
              { id: "rating", label: "Rating", icon: "⭐" },
              { id: "revenue", label: "Revenue", icon: "💰" },
              { id: "jobs", label: "Jobs Completed", icon: "✓" },
            ].map((metric) => (
              <button
                key={metric.id}
                onClick={() => setSelectedMetric(metric.id)}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: selectedMetric === metric.id ? "#e30613" : "#1a1f2e",
                  color: selectedMetric === metric.id ? "#ffffff" : "#b0b8c8",
                  border: selectedMetric === metric.id ? "1px solid #e30613" : "1px solid #2a3447",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                {metric.label}
              </button>
            ))}
          </div>

          {/* Mechanic Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
            {mechanicData.map((mechanic) => (
              <div key={mechanic.id} style={{
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
                  <div>
                    <div style={{ fontSize: "1.125rem", fontWeight: "700", color: "#ffffff", marginBottom: "0.25rem" }}>
                      {mechanic.name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#7a8294" }}>
                      {mechanic.specialty}
                    </div>
                  </div>
                  <div style={{
                    padding: "0.5rem 0.75rem",
                    backgroundColor: mechanic.status === "Active" ? "#14b8a633" : "#f59e0b33",
                    color: mechanic.status === "Active" ? "#14b8a6" : "#f59e0b",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                  }}>
                    {mechanic.status}
                  </div>
                </div>

                {/* Metrics Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid #2a3447" }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#7a8294", marginBottom: "0.5rem" }}>Jobs Completed</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#ffffff" }}>{mechanic.jobsCompleted}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#7a8294", marginBottom: "0.5rem" }}>Avg Time</div>
                    <div style={{ fontSize: "1rem", fontWeight: "600", color: "#b0b8c8" }}>{mechanic.avgTime}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#7a8294", marginBottom: "0.5rem" }}>Rating</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Star size={16} style={{ color: getRatingColor(mechanic.rating), fill: getRatingColor(mechanic.rating) }} />
                      <span style={{ fontSize: "1rem", fontWeight: "600", color: getRatingColor(mechanic.rating) }}>
                        {mechanic.rating}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#7a8294", marginBottom: "0.5rem" }}>Efficiency</div>
                    <div style={{ fontSize: "1rem", fontWeight: "600", color: getEfficiencyColor(mechanic.efficiency) }}>
                      {mechanic.efficiency}%
                    </div>
                  </div>
                </div>

                {/* Revenue and Progress */}
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <div style={{ fontSize: "0.75rem", color: "#7a8294" }}>Revenue Generated</div>
                    <div style={{ fontSize: "0.875rem", fontWeight: "600", color: "#14b8a6" }}>{mechanic.revenue}</div>
                  </div>
                </div>

                {/* Efficiency Bar */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <div style={{ fontSize: "0.75rem", color: "#7a8294" }}>Efficiency Score</div>
                    <div style={{ fontSize: "0.75rem", fontWeight: "600", color: getEfficiencyColor(mechanic.efficiency) }}>
                      {mechanic.efficiency}%
                    </div>
                  </div>
                  <div style={{
                    width: "100%",
                    height: "6px",
                    backgroundColor: "#2a3447",
                    borderRadius: "3px",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${mechanic.efficiency}%`,
                      height: "100%",
                      backgroundColor: getEfficiencyColor(mechanic.efficiency),
                      transition: "width 0.3s ease",
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
            <div style={{
              backgroundColor: "#1a1f2e",
              border: "1px solid #2a3447",
              borderRadius: "12px",
              padding: "1.5rem",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "0.75rem", color: "#7a8294", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Team Average Efficiency
              </div>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: "#14b8a6" }}>88%</div>
            </div>
            <div style={{
              backgroundColor: "#1a1f2e",
              border: "1px solid #2a3447",
              borderRadius: "12px",
              padding: "1.5rem",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "0.75rem", color: "#7a8294", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Team Average Rating
              </div>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: "#14b8a6" }}>4.7★</div>
            </div>
            <div style={{
              backgroundColor: "#1a1f2e",
              border: "1px solid #2a3447",
              borderRadius: "12px",
              padding: "1.5rem",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "0.75rem", color: "#7a8294", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Total Revenue
              </div>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: "#14b8a6" }}>₵51.2K</div>
            </div>
          </div>
        </div>
      </div>
    </NewAppLayout>
  );
}
