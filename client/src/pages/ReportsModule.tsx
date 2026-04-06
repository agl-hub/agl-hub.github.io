import NewAppLayout from "@/components/NewAppLayout";
import { Download, Eye, Calendar, TrendingUp } from "lucide-react";
import { useState } from "react";
import FilterBar from "@/components/FilterBar";

export default function ReportsModule() {
  const [selectedReport, setSelectedReport] = useState("daily");

  const reports = [
    { id: "daily", name: "Daily CEO Report", frequency: "Daily", lastGenerated: "2026-04-06 08:30 AM", recipients: "CEO, Management", status: "Ready" },
    { id: "weekly", name: "Weekly Management Report", frequency: "Weekly", lastGenerated: "2026-04-05 05:00 PM", recipients: "Management Team", status: "Ready" },
    { id: "monthly", name: "Monthly Financial Report", frequency: "Monthly", lastGenerated: "2026-03-31 10:00 AM", recipients: "Finance, CEO", status: "Ready" },
    { id: "operations", name: "Full Operations Report", frequency: "Weekly", lastGenerated: "2026-04-05 06:00 PM", recipients: "All Staff", status: "Ready" },
    { id: "creditors", name: "Creditors & Loans Report", frequency: "Monthly", lastGenerated: "2026-03-31 02:00 PM", recipients: "Finance, Creditors", status: "Ready" },
  ];

  const reportContent = {
    daily: {
      title: "Daily CEO Report",
      date: "April 6, 2026",
      sections: [
        { title: "Executive Summary", content: "Strong performance today with ₵45.2K in revenue and 156 transactions processed." },
        { title: "Key Metrics", content: "Total Revenue: ₵45.2K | Transactions: 156 | Vehicles Serviced: 42 | Net Position: ₵38.9K" },
        { title: "Top Performers", content: "Abena Kuma (95% efficiency), Kofi Mensah (92% efficiency), Yaw Asare (88% efficiency)" },
        { title: "Action Items", content: "Revenue target not met (Current: ₵45.2K vs Target: ₵50K) - Address with sales team" },
      ]
    },
    weekly: {
      title: "Weekly Management Report",
      date: "Week of March 31 - April 6, 2026",
      sections: [
        { title: "Performance Overview", content: "Weekly revenue: ₵285.5K | Transactions: 1,042 | Vehicles Serviced: 287" },
        { title: "Team Performance", content: "Average team efficiency: 88% | Average rating: 4.7★ | Total team revenue: ₵51.2K" },
        { title: "Challenges", content: "One mechanic on leave (Kwesi Boateng) - workload distributed among team" },
        { title: "Recommendations", content: "Increase marketing efforts for walk-in customers; schedule training for new staff" },
      ]
    },
    monthly: {
      title: "Monthly Financial Report",
      date: "March 2026",
      sections: [
        { title: "Financial Summary", content: "Total Revenue: ₵1,245.3K | Total Expenses: ₵856.2K | Net Profit: ₵389.1K | Profit Margin: 31.2%" },
        { title: "Revenue Breakdown", content: "Services: ₵845.2K (67.8%) | Parts Sales: ₵285.1K (22.9%) | Equipment Rental: ₵115K (9.2%)" },
        { title: "Expense Analysis", content: "Parts: ₵425.5K | Labor: ₵285.2K | Utilities: ₵95.3K | Maintenance: ₵50.2K" },
        { title: "Financial Health", content: "Positive cash flow, strong profitability, all creditors paid on time" },
      ]
    },
  };

  const currentReport = reportContent[selectedReport as keyof typeof reportContent] || reportContent.daily;

  return (
    <NewAppLayout currentPage="reports">
      <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#0f172a" }}>
        <FilterBar showDateRange showStatus={false} showChannel={false} showPaymentMethod={false} />

        <div style={{ padding: "2rem", flex: 1, overflow: "auto" }}>
          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "0.4375rem", fontWeight: "700", color: "#ffffff", margin: "0 0 0.5rem 0" }}>Reports & Analytics</h1>
            <p style={{ fontSize: "0.4375rem", color: "#b0b8c8", margin: 0 }}>Generate and view operational, financial, and performance reports</p>
          </div>

          {/* Report Selector */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                style={{
                  backgroundColor: selectedReport === report.id ? "#e30613" : "#1a1f2e",
                  border: selectedReport === report.id ? "2px solid #e30613" : "1px solid #2a3447",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (selectedReport !== report.id) {
                    e.currentTarget.style.borderColor = "#e30613";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedReport !== report.id) {
                    e.currentTarget.style.borderColor = "#2a3447";
                  }
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.75rem" }}>
                  <div style={{ fontSize: "0.5rem", fontWeight: "600", color: selectedReport === report.id ? "#ffffff" : "#ffffff" }}>
                    {report.name}
                  </div>
                  <div style={{
                    padding: "0.25rem 0.5rem",
                    backgroundColor: selectedReport === report.id ? "#ffffff33" : "#14b8a633",
                    color: selectedReport === report.id ? "#ffffff" : "#14b8a6",
                    borderRadius: "4px",
                    fontSize: "0.475rem",
                    fontWeight: "600",
                  }}>
                    {report.status}
                  </div>
                </div>
                <div style={{ fontSize: "0.5rem", color: selectedReport === report.id ? "#e0e0e0" : "#b0b8c8", marginBottom: "0.5rem" }}>
                  {report.frequency}
                </div>
                <div style={{ fontSize: "0.475rem", color: selectedReport === report.id ? "#d0d0d0" : "#7a8294" }}>
                  Generated: {report.lastGenerated}
                </div>
              </button>
            ))}
          </div>

          {/* Report Content */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "2rem" }}>
            {/* Main Report */}
            <div style={{
              backgroundColor: "#1a1f2e",
              border: "1px solid #2a3447",
              borderRadius: "12px",
              padding: "2rem",
            }}>
              <div style={{ marginBottom: "2rem", paddingBottom: "2rem", borderBottom: "1px solid #2a3447" }}>
                <h2 style={{ fontSize: "0.5rem", fontWeight: "700", color: "#ffffff", margin: "0 0 0.5rem 0" }}>
                  {currentReport.title}
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#7a8294", fontSize: "0.4375rem" }}>
                  <Calendar size={16} />
                  {currentReport.date}
                </div>
              </div>

              {/* Report Sections */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                {currentReport.sections.map((section, idx) => (
                  <div key={idx} style={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #2a3447",
                    borderRadius: "8px",
                    padding: "1.5rem",
                  }}>
                    <h3 style={{ fontSize: "0.5rem", fontWeight: "600", color: "#e30613", marginBottom: "0.75rem", margin: "0 0 0.75rem 0" }}>
                      {section.title}
                    </h3>
                    <p style={{ fontSize: "0.4375rem", color: "#b0b8c8", lineHeight: "1.6", margin: 0 }}>
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Print Section */}
              <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid #2a3447" }}>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor: "#e30613",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#b80410"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#e30613"}
                  >
                    <Download size={18} /> Export as PDF
                  </button>
                  <button style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor: "#1a1f2e",
                    color: "#14b8a6",
                    border: "1px solid #14b8a6",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#14b8a633";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#1a1f2e";
                    }}
                  >
                    <Eye size={18} /> Print
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar - Quick Actions */}
            <div>
              <div style={{
                backgroundColor: "#1a1f2e",
                border: "1px solid #2a3447",
                borderRadius: "12px",
                padding: "1.5rem",
              }}>
                <h3 style={{ fontSize: "0.5rem", fontWeight: "600", color: "#ffffff", marginBottom: "1rem", margin: "0 0 1rem 0" }}>
                  Quick Actions
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <button style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "#e30613",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                    fontSize: "0.4375rem",
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#b80410"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#e30613"}
                  >
                    Email Report
                  </button>
                  <button style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "#14b8a6",
                    color: "#0f172a",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                    fontSize: "0.4375rem",
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                  >
                    Schedule Report
                  </button>
                  <button style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "#f59e0b",
                    color: "#0f172a",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                    fontSize: "0.4375rem",
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                  >
                    Share Report
                  </button>
                </div>

                {/* Report Stats */}
                <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid #2a3447" }}>
                  <div style={{ fontSize: "0.5rem", color: "#7a8294", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.75rem", fontWeight: "600" }}>
                    Report Statistics
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.4375rem" }}>
                      <span style={{ color: "#b0b8c8" }}>Generated</span>
                      <span style={{ color: "#ffffff", fontWeight: "600" }}>24</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.4375rem" }}>
                      <span style={{ color: "#b0b8c8" }}>Downloaded</span>
                      <span style={{ color: "#ffffff", fontWeight: "600" }}>18</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.4375rem" }}>
                      <span style={{ color: "#b0b8c8" }}>Shared</span>
                      <span style={{ color: "#ffffff", fontWeight: "600" }}>12</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </NewAppLayout>
  );
}
