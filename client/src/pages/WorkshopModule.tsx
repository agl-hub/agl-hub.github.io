import NewAppLayout from "@/components/NewAppLayout";
import { Wrench, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import FilterBar from "@/components/FilterBar";

export default function WorkshopModule() {
  const [selectedStatus, setSelectedStatus] = useState("All");

  const vehicleData = [
    { id: 1, regNum: "GN-2024-001", customer: "John Mensah", vehicle: "Toyota Corolla", mechanic: "Kofi Mensah", job: "Engine Overhaul", status: "In Progress", progress: 65, startDate: "2026-04-04", estimatedDays: 3 },
    { id: 2, regNum: "GN-2024-002", customer: "Ama Boateng", vehicle: "Honda Civic", mechanic: "Yaw Asare", job: "Brake Replacement", status: "Completed", progress: 100, startDate: "2026-04-02", estimatedDays: 2 },
    { id: 3, regNum: "GN-2024-003", customer: "Kwame Asare", vehicle: "Nissan Altima", mechanic: "Kofi Mensah", job: "Oil Change & Filter", status: "In Progress", progress: 30, startDate: "2026-04-06", estimatedDays: 1 },
    { id: 4, regNum: "GN-2024-004", customer: "Nana Owusu", vehicle: "Mazda 3", mechanic: "Ama Mensah", job: "Transmission Repair", status: "Pending", progress: 0, startDate: "2026-04-07", estimatedDays: 4 },
    { id: 5, regNum: "GN-2024-005", customer: "Yaw Mensah", vehicle: "Ford Focus", mechanic: "Yaw Asare", job: "Suspension Work", status: "In Progress", progress: 45, startDate: "2026-04-05", estimatedDays: 3 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "#14b8a6";
      case "In Progress": return "#f59e0b";
      case "Pending": return "#b0b8c8";
      default: return "#6366f1";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed": return <CheckCircle size={18} />;
      case "In Progress": return <Clock size={18} />;
      case "Pending": return <AlertCircle size={18} />;
      default: return <Wrench size={18} />;
    }
  };

  const filteredData = selectedStatus === "All" ? vehicleData : vehicleData.filter(v => v.status === selectedStatus);

  return (
    <NewAppLayout currentPage="workshop">
      <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#0f172a" }}>
        <FilterBar showDateRange showStatus showChannel={false} showPaymentMethod={false} />

        <div style={{ padding: "2rem", flex: 1, overflow: "auto" }}>
          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.875rem", fontWeight: "700", color: "#ffffff", margin: "0 0 0.5rem 0" }}>Workshop Daily Log</h1>
            <p style={{ fontSize: "0.875rem", color: "#b0b8c8", margin: 0 }}>Track vehicle services and mechanic assignments</p>
          </div>

          {/* Status Filter */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
            {["All", "Pending", "In Progress", "Completed"].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: selectedStatus === status ? "#e30613" : "#1a1f2e",
                  color: selectedStatus === status ? "#ffffff" : "#b0b8c8",
                  border: selectedStatus === status ? "1px solid #e30613" : "1px solid #2a3447",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Vehicle Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1.5rem" }}>
            {filteredData.map((vehicle) => (
              <div key={vehicle.id} style={{
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
                    <div style={{ fontSize: "0.75rem", color: "#7a8294", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.25rem" }}>
                      Registration
                    </div>
                    <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "#ffffff" }}>
                      {vehicle.regNum}
                    </div>
                  </div>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 0.75rem",
                    backgroundColor: `${getStatusColor(vehicle.status)}33`,
                    color: getStatusColor(vehicle.status),
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                  }}>
                    {getStatusIcon(vehicle.status)}
                    {vehicle.status}
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid #2a3447" }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#7a8294", marginBottom: "0.25rem" }}>Customer</div>
                    <div style={{ fontSize: "0.875rem", color: "#ffffff", fontWeight: "500" }}>{vehicle.customer}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#7a8294", marginBottom: "0.25rem" }}>Vehicle</div>
                    <div style={{ fontSize: "0.875rem", color: "#ffffff", fontWeight: "500" }}>{vehicle.vehicle}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#7a8294", marginBottom: "0.25rem" }}>Mechanic</div>
                    <div style={{ fontSize: "0.875rem", color: "#ffffff", fontWeight: "500" }}>{vehicle.mechanic}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#7a8294", marginBottom: "0.25rem" }}>Est. Days</div>
                    <div style={{ fontSize: "0.875rem", color: "#ffffff", fontWeight: "500" }}>{vehicle.estimatedDays} days</div>
                  </div>
                </div>

                {/* Job */}
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "#7a8294", marginBottom: "0.5rem" }}>Job Description</div>
                  <div style={{ fontSize: "0.875rem", color: "#b0b8c8" }}>{vehicle.job}</div>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <div style={{ fontSize: "0.75rem", color: "#7a8294" }}>Progress</div>
                    <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "#ffffff" }}>{vehicle.progress}%</div>
                  </div>
                  <div style={{
                    width: "100%",
                    height: "6px",
                    backgroundColor: "#2a3447",
                    borderRadius: "3px",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${vehicle.progress}%`,
                      height: "100%",
                      backgroundColor: getStatusColor(vehicle.status),
                      transition: "width 0.3s ease",
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </NewAppLayout>
  );
}
