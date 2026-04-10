import NewAppLayout from "@/components/NewAppLayout";
import { Clock, CheckCircle, AlertCircle, User } from "lucide-react";
import { useState } from "react";
import FilterBar from "@/components/FilterBar";

export default function StaffModule() {
  const [selectedStatus, setSelectedStatus] = useState("All");

  const staffData = [
    { id: 1, name: "Kofi Mensah", role: "Senior Mechanic", clockIn: "08:00 AM", clockOut: "05:30 PM", status: "Present", hoursWorked: 9.5, attendance: 95 },
    { id: 2, name: "Yaw Asare", role: "Mechanic", clockIn: "08:15 AM", clockOut: "05:45 PM", status: "Present", hoursWorked: 9.5, attendance: 92 },
    { id: 3, name: "Ama Mensah", role: "Mechanic", clockIn: "08:30 AM", clockOut: "06:00 PM", status: "Present", hoursWorked: 9.5, attendance: 88 },
    { id: 4, name: "Kwesi Boateng", role: "Mechanic", clockIn: "N/A", clockOut: "N/A", status: "On Leave", hoursWorked: 0, attendance: 75 },
    { id: 5, name: "Abena Kuma", role: "Workshop Manager", clockIn: "07:45 AM", clockOut: "05:00 PM", status: "Present", hoursWorked: 9.25, attendance: 98 },
    { id: 6, name: "Nana Owusu", role: "Sales Representative", clockIn: "09:00 AM", clockOut: "06:00 PM", status: "Present", hoursWorked: 9, attendance: 90 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present": return "#14b8a6";
      case "On Leave": return "#f59e0b";
      case "Absent": return "#e30613";
      default: return "#b0b8c8";
    }
  };

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 95) return "#14b8a6";
    if (attendance >= 85) return "#f59e0b";
    return "#e30613";
  };

  const activeStaff = staffData.filter(s => s.status === "Present").length;
  const onLeaveStaff = staffData.filter(s => s.status === "On Leave").length;
  const avgAttendance = staffData.length > 0 ? Math.round(staffData.reduce((sum, s) => sum + s.attendance, 0) / staffData.length) : 0;
  const filteredData = selectedStatus === "All" ? staffData : staffData.filter(s => s.status === selectedStatus);

  return (
    <NewAppLayout currentPage="staff">
      <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#0f172a" }}>
        <FilterBar showDateRange showStatus={false} showChannel={false} showPaymentMethod={false} />

        <div style={{ padding: "2rem", flex: 1, overflow: "auto" }}>
          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "0.4375rem", fontWeight: "700", color: "#ffffff", margin: "0 0 0.5rem 0" }}>Staff Management</h1>
            <p style={{ fontSize: "0.4375rem", color: "#b0b8c8", margin: 0 }}>Track attendance, clock-in/out times, and staff performance</p>
          </div>

          {/* Status Filter */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
            {["All", "Present", "On Leave", "Absent"].map((status) => (
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

          {/* Staff Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {filteredData.map((staff) => (
              <div key={staff.id} style={{
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
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
                    <div style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: "#2a3447",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#7a8294",
                    }}>
                      <User size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.5rem", fontWeight: "700", color: "#ffffff" }}>
                        {staff.name}
                      </div>
                      <div style={{ fontSize: "0.5rem", color: "#7a8294" }}>
                        {staff.role}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    padding: "0.5rem 0.75rem",
                    backgroundColor: `${getStatusColor(staff.status)}33`,
                    color: getStatusColor(staff.status),
                    borderRadius: "6px",
                    fontSize: "0.5rem",
                    fontWeight: "600",
                  }}>
                    {staff.status}
                  </div>
                </div>

                {/* Clock In/Out */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid #2a3447" }}>
                  <div>
                    <div style={{ fontSize: "0.5rem", color: "#7a8294", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Clock size={14} /> Clock In
                    </div>
                    <div style={{ fontSize: "0.65rem", fontWeight: "600", color: "#ffffff" }}>
                      {staff.clockIn}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.5rem", color: "#7a8294", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Clock size={14} /> Clock Out
                    </div>
                    <div style={{ fontSize: "0.65rem", fontWeight: "600", color: "#ffffff" }}>
                      {staff.clockOut}
                    </div>
                  </div>
                </div>

                {/* Hours and Attendance */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <div style={{ fontSize: "0.5rem", color: "#7a8294", marginBottom: "0.5rem" }}>Hours Worked</div>
                    <div style={{ fontSize: "0.4375rem", fontWeight: "700", color: "#14b8a6" }}>
                      {staff.hoursWorked}h
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.5rem", color: "#7a8294", marginBottom: "0.5rem" }}>Attendance Rate</div>
                    <div style={{ fontSize: "0.4375rem", fontWeight: "700", color: getAttendanceColor(staff.attendance) }}>
                      {staff.attendance}%
                    </div>
                  </div>
                </div>

                {/* Attendance Bar */}
                <div>
                  <div style={{
                    width: "100%",
                    height: "6px",
                    backgroundColor: "#2a3447",
                    borderRadius: "3px",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${staff.attendance}%`,
                      height: "100%",
                      backgroundColor: getAttendanceColor(staff.attendance),
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
              <div style={{ fontSize: "0.5rem", color: "#7a8294", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Total Staff
              </div>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: "#ffffff" }}>{staffData.length}</div>
            </div>
            <div style={{
              backgroundColor: "#1a1f2e",
              border: "1px solid #2a3447",
              borderRadius: "12px",
              padding: "1.5rem",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "0.5rem", color: "#7a8294", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Active Today
              </div>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: "#14b8a6" }}>{activeStaff}</div>
            </div>
            <div style={{
              backgroundColor: "#1a1f2e",
              border: "1px solid #2a3447",
              borderRadius: "12px",
              padding: "1.5rem",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "0.5rem", color: "#7a8294", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Avg Attendance
              </div>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: "#14b8a6" }}>{avgAttendance}%</div>
            </div>
          </div>
        </div>
      </div>
    </NewAppLayout>
  );
}
