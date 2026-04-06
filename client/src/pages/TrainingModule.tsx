import NewAppLayout from "@/components/NewAppLayout";
import { BookOpen, CheckCircle, Clock, User } from "lucide-react";
import { useState } from "react";
import FilterBar from "@/components/FilterBar";

export default function TrainingModule() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const trainingCourses = [
    { id: 1, title: "Advanced Engine Diagnostics", category: "Technical", instructor: "Kofi Mensah", duration: "16 hours", startDate: "2026-04-01", endDate: "2026-04-15", status: "In Progress", progress: 65, participants: 5 },
    { id: 2, title: "Electrical Systems Mastery", category: "Technical", instructor: "Yaw Asare", duration: "12 hours", startDate: "2026-03-15", endDate: "2026-04-05", status: "Completed", progress: 100, participants: 4 },
    { id: 3, title: "Customer Service Excellence", category: "Soft Skills", instructor: "Abena Kuma", duration: "8 hours", startDate: "2026-04-06", endDate: "2026-04-20", status: "In Progress", progress: 25, participants: 6 },
    { id: 4, title: "Safety & Compliance", category: "Compliance", instructor: "Nana Owusu", duration: "4 hours", startDate: "2026-04-10", endDate: "2026-04-12", status: "Scheduled", progress: 0, participants: 7 },
    { id: 5, title: "Transmission Repair Techniques", category: "Technical", instructor: "Ama Mensah", duration: "20 hours", startDate: "2026-04-08", endDate: "2026-05-08", status: "Scheduled", progress: 0, participants: 3 },
    { id: 6, title: "Leadership & Team Management", category: "Management", instructor: "Kwesi Boateng", duration: "10 hours", startDate: "2026-03-20", endDate: "2026-04-10", status: "Completed", progress: 100, participants: 4 },
  ];

  const staffProgress = [
    { name: "Kofi Mensah", completed: 8, inProgress: 2, totalHours: 48 },
    { name: "Yaw Asare", completed: 6, inProgress: 1, totalHours: 32 },
    { name: "Ama Mensah", completed: 7, inProgress: 2, totalHours: 40 },
    { name: "Abena Kuma", completed: 9, inProgress: 1, totalHours: 52 },
    { name: "Nana Owusu", completed: 5, inProgress: 2, totalHours: 28 },
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Technical": "#e30613",
      "Soft Skills": "#14b8a6",
      "Compliance": "#f59e0b",
      "Management": "#6366f1",
    };
    return colors[category] || "#b0b8c8";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "#14b8a6";
      case "In Progress": return "#f59e0b";
      case "Scheduled": return "#b0b8c8";
      default: return "#6366f1";
    }
  };

  const filteredCourses = selectedCategory === "All" ? trainingCourses : trainingCourses.filter(c => c.category === selectedCategory);

  return (
    <NewAppLayout currentPage="training">
      <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#0f172a" }}>
        <FilterBar showDateRange showStatus={false} showChannel={false} showPaymentMethod={false} />

        <div style={{ padding: "2rem", flex: 1, overflow: "auto" }}>
          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.875rem", fontWeight: "700", color: "#ffffff", margin: "0 0 0.5rem 0" }}>Staff Training</h1>
            <p style={{ fontSize: "0.875rem", color: "#b0b8c8", margin: 0 }}>Manage training courses and track staff development</p>
          </div>

          {/* Category Filter */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
            {["All", "Technical", "Soft Skills", "Compliance", "Management"].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: selectedCategory === category ? "#e30613" : "#1a1f2e",
                  color: selectedCategory === category ? "#ffffff" : "#b0b8c8",
                  border: selectedCategory === category ? "1px solid #e30613" : "1px solid #2a3447",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Courses Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
            {filteredCourses.map((course) => (
              <div key={course.id} style={{
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
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#ffffff", margin: "0 0 0.5rem 0" }}>
                      {course.title}
                    </h3>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
                      <span style={{
                        display: "inline-block",
                        padding: "0.25rem 0.75rem",
                        backgroundColor: `${getCategoryColor(course.category)}33`,
                        color: getCategoryColor(course.category),
                        borderRadius: "6px",
                        fontSize: "0.7rem",
                        fontWeight: "600",
                      }}>
                        {course.category}
                      </span>
                      <span style={{
                        display: "inline-block",
                        padding: "0.25rem 0.75rem",
                        backgroundColor: `${getStatusColor(course.status)}33`,
                        color: getStatusColor(course.status),
                        borderRadius: "6px",
                        fontSize: "0.7rem",
                        fontWeight: "600",
                      }}>
                        {course.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid #2a3447" }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#7a8294", marginBottom: "0.25rem" }}>Instructor</div>
                    <div style={{ fontSize: "0.875rem", color: "#ffffff", fontWeight: "500" }}>{course.instructor}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#7a8294", marginBottom: "0.25rem" }}>Duration</div>
                    <div style={{ fontSize: "0.875rem", color: "#ffffff", fontWeight: "500" }}>{course.duration}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#7a8294", marginBottom: "0.25rem" }}>Start Date</div>
                    <div style={{ fontSize: "0.875rem", color: "#b0b8c8" }}>{course.startDate}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#7a8294", marginBottom: "0.25rem" }}>Participants</div>
                    <div style={{ fontSize: "0.875rem", color: "#ffffff", fontWeight: "500" }}>{course.participants}</div>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <div style={{ fontSize: "0.75rem", color: "#7a8294" }}>Progress</div>
                    <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "#ffffff" }}>{course.progress}%</div>
                  </div>
                  <div style={{
                    width: "100%",
                    height: "6px",
                    backgroundColor: "#2a3447",
                    borderRadius: "3px",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${course.progress}%`,
                      height: "100%",
                      backgroundColor: getStatusColor(course.status),
                      transition: "width 0.3s ease",
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Staff Progress */}
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#ffffff", marginBottom: "1.5rem", margin: "2rem 0 1.5rem 0" }}>
              Staff Training Progress
            </h2>

            <div style={{
              backgroundColor: "#1a1f2e",
              border: "1px solid #2a3447",
              borderRadius: "12px",
              overflow: "hidden",
            }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.875rem",
                }}>
                  <thead>
                    <tr style={{ backgroundColor: "#0f172a", borderBottom: "1px solid #2a3447" }}>
                      <th style={{ padding: "1rem", textAlign: "left", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Staff Member</th>
                      <th style={{ padding: "1rem", textAlign: "center", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Completed</th>
                      <th style={{ padding: "1rem", textAlign: "center", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>In Progress</th>
                      <th style={{ padding: "1rem", textAlign: "center", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffProgress.map((staff, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #2a3447" }}>
                        <td style={{ padding: "1rem", color: "#ffffff", fontWeight: "500" }}>{staff.name}</td>
                        <td style={{ padding: "1rem", textAlign: "center" }}>
                          <span style={{
                            display: "inline-block",
                            padding: "0.25rem 0.75rem",
                            backgroundColor: "#14b8a633",
                            color: "#14b8a6",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                          }}>
                            {staff.completed}
                          </span>
                        </td>
                        <td style={{ padding: "1rem", textAlign: "center" }}>
                          <span style={{
                            display: "inline-block",
                            padding: "0.25rem 0.75rem",
                            backgroundColor: "#f59e0b33",
                            color: "#f59e0b",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                          }}>
                            {staff.inProgress}
                          </span>
                        </td>
                        <td style={{ padding: "1rem", textAlign: "center", color: "#b0b8c8", fontWeight: "500" }}>
                          {staff.totalHours}h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </NewAppLayout>
  );
}
