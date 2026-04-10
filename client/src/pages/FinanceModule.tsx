import NewAppLayout from "@/components/NewAppLayout";
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from "lucide-react";
import { useState } from "react";
import FilterBar from "@/components/FilterBar";

export default function FinanceModule() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const expenseData = [
    { id: 1, date: "2026-04-06", category: "Parts", description: "Engine oil and filters", amount: "₵850", vendor: "AutoParts Ghana", status: "Paid" },
    { id: 2, date: "2026-04-06", category: "Labor", description: "Mechanic overtime", amount: "₵500", vendor: "Internal", status: "Pending" },
    { id: 3, date: "2026-04-05", category: "Utilities", description: "Electricity bill", amount: "₵1,200", vendor: "ECG", status: "Paid" },
    { id: 4, date: "2026-04-05", category: "Supplies", description: "Cleaning supplies", amount: "₵300", vendor: "Local Supplier", status: "Paid" },
    { id: 5, date: "2026-04-04", category: "Maintenance", description: "Equipment servicing", amount: "₵2,000", vendor: "Tech Services", status: "Pending" },
    { id: 6, date: "2026-04-04", category: "Parts", description: "Brake pads and rotors", amount: "₵1,500", vendor: "AutoParts Ghana", status: "Paid" },
  ];

  const revenueData = [
    { id: 1, date: "2026-04-06", source: "Service", description: "Vehicle maintenance", amount: "₵5,200", customer: "John Mensah", status: "Completed" },
    { id: 2, date: "2026-04-06", source: "Sales", description: "Parts sold", amount: "₵2,100", customer: "Walk-In", status: "Completed" },
    { id: 3, date: "2026-04-05", source: "Service", description: "Engine overhaul", amount: "₵8,500", customer: "Ama Boateng", status: "Completed" },
    { id: 4, date: "2026-04-05", source: "Rental", description: "Equipment rental", amount: "₵1,500", customer: "Local Business", status: "Completed" },
    { id: 5, date: "2026-04-04", source: "Service", description: "Tire replacement", amount: "₵3,200", customer: "Kwame Asare", status: "Completed" },
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Parts": "#e30613",
      "Labor": "#14b8a6",
      "Utilities": "#f59e0b",
      "Supplies": "#6366f1",
      "Maintenance": "#8b5cf6",
    };
    return colors[category] || "#b0b8c8";
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      "Service": "#14b8a6",
      "Sales": "#e30613",
      "Rental": "#f59e0b",
    };
    return colors[source] || "#6366f1";
  };

  const totalExpense = expenseData.reduce((sum, item) => {
    const amount = parseInt(item.amount.replace(/[₵,]/g, ""));
    return sum + amount;
  }, 0);

  const totalRevenue = revenueData.reduce((sum, item) => {
    const amount = parseInt(item.amount.replace(/[₵,]/g, ""));
    return sum + amount;
  }, 0);

  const netProfit = totalRevenue - totalExpense;

  return (
    <NewAppLayout currentPage="finance">
      <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#0f172a" }}>
        <FilterBar showDateRange showStatus={false} showChannel={false} showPaymentMethod={false} />

        <div style={{ padding: "2rem", flex: 1, overflow: "auto" }}>
          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "0.4375rem", fontWeight: "700", color: "#ffffff", margin: "0 0 0.5rem 0" }}>Financial Summary</h1>
            <p style={{ fontSize: "0.4375rem", color: "#b0b8c8", margin: 0 }}>Track revenue, expenses, and financial performance</p>
          </div>

          {/* KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
            <div style={{
              backgroundColor: "#1a1f2e",
              border: "1px solid #2a3447",
              borderRadius: "12px",
              padding: "1.5rem",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                <div>
                  <div style={{ fontSize: "0.5rem", color: "#7a8294", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.5rem" }}>
                    Total Revenue
                  </div>
                  <div style={{ fontSize: "2rem", fontWeight: "700", color: "#14b8a6" }}>
                    ₵{(totalRevenue / 1000).toFixed(1)}K
                  </div>
                </div>
                <DollarSign size={24} style={{ color: "#14b8a6" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.4375rem", color: "#14b8a6" }}>
                <TrendingUp size={16} />
                +12.5% from last week
              </div>
            </div>

            <div style={{
              backgroundColor: "#1a1f2e",
              border: "1px solid #2a3447",
              borderRadius: "12px",
              padding: "1.5rem",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                <div>
                  <div style={{ fontSize: "0.5rem", color: "#7a8294", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.5rem" }}>
                    Total Expenses
                  </div>
                  <div style={{ fontSize: "2rem", fontWeight: "700", color: "#f59e0b" }}>
                    ₵{(totalExpense / 1000).toFixed(1)}K
                  </div>
                </div>
                <AlertCircle size={24} style={{ color: "#f59e0b" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.4375rem", color: "#f59e0b" }}>
                <TrendingUp size={16} />
                +8.2% from last week
              </div>
            </div>

            <div style={{
              backgroundColor: "#1a1f2e",
              border: "1px solid #2a3447",
              borderRadius: "12px",
              padding: "1.5rem",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                <div>
                  <div style={{ fontSize: "0.5rem", color: "#7a8294", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.5rem" }}>
                    Net Profit
                  </div>
                  <div style={{ fontSize: "2rem", fontWeight: "700", color: "#e30613" }}>
                    ₵{(netProfit / 1000).toFixed(1)}K
                  </div>
                </div>
                <DollarSign size={24} style={{ color: "#e30613" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.4375rem", color: netProfit > 0 ? "#14b8a6" : "#e30613" }}>
                {netProfit > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {netProfit > 0 ? "+" : ""}{totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0.0"}% margin
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
            {/* Revenue Section */}
            <div>
              <div style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "0.4375rem", fontWeight: "600", color: "#ffffff", margin: 0 }}>Revenue</h2>
              </div>

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
                    fontSize: "0.4375rem",
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: "#0f172a", borderBottom: "1px solid #2a3447" }}>
                        <th style={{ padding: "1rem", textAlign: "left", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Date</th>
                        <th style={{ padding: "1rem", textAlign: "left", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Source</th>
                        <th style={{ padding: "1rem", textAlign: "right", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueData.map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid #2a3447" }}>
                          <td style={{ padding: "1rem", color: "#b0b8c8" }}>{row.date}</td>
                          <td style={{ padding: "1rem" }}>
                            <span style={{
                              display: "inline-block",
                              padding: "0.25rem 0.75rem",
                              backgroundColor: `${getSourceColor(row.source)}33`,
                              color: getSourceColor(row.source),
                              borderRadius: "6px",
                              fontSize: "0.5rem",
                              fontWeight: "600",
                            }}>
                              {row.source}
                            </span>
                          </td>
                          <td style={{ padding: "1rem", textAlign: "right", color: "#14b8a6", fontWeight: "600" }}>{row.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Expense Section */}
            <div>
              <div style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "0.4375rem", fontWeight: "600", color: "#ffffff", margin: 0 }}>Expenses</h2>
              </div>

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
                    fontSize: "0.4375rem",
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: "#0f172a", borderBottom: "1px solid #2a3447" }}>
                        <th style={{ padding: "1rem", textAlign: "left", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Date</th>
                        <th style={{ padding: "1rem", textAlign: "left", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Category</th>
                        <th style={{ padding: "1rem", textAlign: "right", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenseData.map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid #2a3447" }}>
                          <td style={{ padding: "1rem", color: "#b0b8c8" }}>{row.date}</td>
                          <td style={{ padding: "1rem" }}>
                            <span style={{
                              display: "inline-block",
                              padding: "0.25rem 0.75rem",
                              backgroundColor: `${getCategoryColor(row.category)}33`,
                              color: getCategoryColor(row.category),
                              borderRadius: "6px",
                              fontSize: "0.5rem",
                              fontWeight: "600",
                            }}>
                              {row.category}
                            </span>
                          </td>
                          <td style={{ padding: "1rem", textAlign: "right", color: "#f59e0b", fontWeight: "600" }}>{row.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </NewAppLayout>
  );
}
