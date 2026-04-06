import NewAppLayout from "@/components/NewAppLayout";
import { Search, Download, Filter, TrendingUp } from "lucide-react";
import { useState } from "react";
import FilterBar from "@/components/FilterBar";

export default function SalesModule() {
  const [searchTerm, setSearchTerm] = useState("");

  const salesData = [
    { id: 1, date: "2026-04-06", customer: "John Mensah", channel: "Walk-In", amount: "₵2,500", method: "Cash", status: "Completed", vehicle: "Toyota Corolla" },
    { id: 2, date: "2026-04-06", customer: "Ama Boateng", channel: "WhatsApp", amount: "₵1,800", method: "MoMo", status: "Pending", vehicle: "Honda Civic" },
    { id: 3, date: "2026-04-05", customer: "Kwame Asare", channel: "Phone", amount: "₵3,200", method: "Bank Transfer", status: "Completed", vehicle: "Nissan Altima" },
    { id: 4, date: "2026-04-05", customer: "Nana Owusu", channel: "Instagram", amount: "₵1,500", method: "POS", status: "Completed", vehicle: "Mazda 3" },
    { id: 5, date: "2026-04-04", customer: "Yaw Mensah", channel: "TikTok", amount: "₵2,100", method: "Credit", status: "Pending Payment", vehicle: "Ford Focus" },
    { id: 6, date: "2026-04-04", customer: "Abena Kuma", channel: "Boss", amount: "₵4,500", method: "Bank Transfer", status: "Completed", vehicle: "BMW 3 Series" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "#14b8a6";
      case "Pending": return "#f59e0b";
      case "Pending Payment": return "#e30613";
      default: return "#b0b8c8";
    }
  };

  const getChannelColor = (channel: string) => {
    const colors: Record<string, string> = {
      "Walk-In": "#e30613",
      "WhatsApp": "#14b8a6",
      "Phone": "#f59e0b",
      "Instagram": "#6366f1",
      "TikTok": "#ec4899",
      "Boss": "#8b5cf6",
    };
    return colors[channel] || "#b0b8c8";
  };

  const filteredData = salesData.filter(item =>
    item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.vehicle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <NewAppLayout currentPage="sales">
      <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#0f172a" }}>
        <FilterBar showDateRange showStatus showChannel showPaymentMethod />

        <div style={{ padding: "2rem", flex: 1, overflow: "auto" }}>
          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <h1 style={{ fontSize: "1.875rem", fontWeight: "700", color: "#ffffff", margin: 0 }}>Sales Transactions</h1>
                <p style={{ fontSize: "0.875rem", color: "#b0b8c8", margin: "0.5rem 0 0 0" }}>Track all sales and customer transactions</p>
              </div>
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
                }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#b80410"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#e30613"}>
                  <Download size={18} /> Export
                </button>
              </div>
            </div>

            {/* Search and Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}>
                <Search size={18} style={{ position: "absolute", left: "1rem", color: "#7a8294" }} />
                <input
                  type="text"
                  placeholder="Search customer or vehicle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem 0.75rem 2.75rem",
                    backgroundColor: "#1a1f2e",
                    border: "1px solid #2a3447",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "0.875rem",
                  }}
                />
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1rem",
              }}>
                <div style={{
                  backgroundColor: "linear-gradient(135deg, rgba(227, 6, 19, 0.1) 0%, rgba(227, 6, 19, 0.05) 100%)",
                  border: "1px solid #2a3447",
                  borderRadius: "8px",
                  padding: "1rem",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: "0.75rem", color: "#b0b8c8", marginBottom: "0.5rem" }}>Total Sales</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#e30613" }}>₵15.6K</div>
                </div>
                <div style={{
                  backgroundColor: "linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(20, 184, 166, 0.05) 100%)",
                  border: "1px solid #2a3447",
                  borderRadius: "8px",
                  padding: "1rem",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: "0.75rem", color: "#b0b8c8", marginBottom: "0.5rem" }}>Transactions</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#14b8a6" }}>156</div>
                </div>
                <div style={{
                  backgroundColor: "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)",
                  border: "1px solid #2a3447",
                  borderRadius: "8px",
                  padding: "1rem",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: "0.75rem", color: "#b0b8c8", marginBottom: "0.5rem" }}>Pending</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#f59e0b" }}>2</div>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
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
                    <th style={{ padding: "1rem", textAlign: "left", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Date</th>
                    <th style={{ padding: "1rem", textAlign: "left", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Customer</th>
                    <th style={{ padding: "1rem", textAlign: "left", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Vehicle</th>
                    <th style={{ padding: "1rem", textAlign: "left", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Channel</th>
                    <th style={{ padding: "1rem", textAlign: "left", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Amount</th>
                    <th style={{ padding: "1rem", textAlign: "left", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Method</th>
                    <th style={{ padding: "1rem", textAlign: "left", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, idx) => (
                    <tr key={idx} style={{
                      borderBottom: "1px solid #2a3447",
                      transition: "background-color 0.2s ease",
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1a1f2e"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <td style={{ padding: "1rem", color: "#b0b8c8" }}>{row.date}</td>
                      <td style={{ padding: "1rem", color: "#ffffff", fontWeight: "500" }}>{row.customer}</td>
                      <td style={{ padding: "1rem", color: "#b0b8c8" }}>{row.vehicle}</td>
                      <td style={{ padding: "1rem" }}>
                        <span style={{
                          display: "inline-block",
                          padding: "0.25rem 0.75rem",
                          backgroundColor: `${getChannelColor(row.channel)}33`,
                          color: getChannelColor(row.channel),
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                        }}>
                          {row.channel}
                        </span>
                      </td>
                      <td style={{ padding: "1rem", color: "#ffffff", fontWeight: "600" }}>{row.amount}</td>
                      <td style={{ padding: "1rem", color: "#b0b8c8" }}>{row.method}</td>
                      <td style={{ padding: "1rem" }}>
                        <span style={{
                          display: "inline-block",
                          padding: "0.25rem 0.75rem",
                          backgroundColor: `${getStatusColor(row.status)}33`,
                          color: getStatusColor(row.status),
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                        }}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </NewAppLayout>
  );
}
