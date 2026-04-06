import NewAppLayout from "@/components/NewAppLayout";
import { CreditCard, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { useState } from "react";
import FilterBar from "@/components/FilterBar";

export default function CreditorsModule() {
  const [selectedStatus, setSelectedStatus] = useState("All");

  const creditData = [
    { id: 1, creditor: "AutoParts Ghana", amount: "₵15,000", dueDate: "2026-04-15", status: "Active", interestRate: "8%", monthlyPayment: "₵1,250", remaining: "₵12,500", daysOverdue: 0 },
    { id: 2, creditor: "Tech Services Ltd", amount: "₵8,500", dueDate: "2026-04-10", status: "Overdue", interestRate: "10%", monthlyPayment: "₵850", remaining: "₵4,250", daysOverdue: 5 },
    { id: 3, creditor: "Equipment Supplier", amount: "₵22,000", dueDate: "2026-05-01", status: "Active", interestRate: "7%", monthlyPayment: "₵2,200", remaining: "₵20,000", daysOverdue: 0 },
    { id: 4, creditor: "Local Supplier", amount: "₵5,200", dueDate: "2026-03-30", status: "Overdue", interestRate: "12%", monthlyPayment: "₵520", remaining: "₵2,600", daysOverdue: 7 },
    { id: 5, creditor: "Bank Loan", amount: "₵50,000", dueDate: "2026-06-01", status: "Active", interestRate: "6%", monthlyPayment: "₵4,167", remaining: "₵45,000", daysOverdue: 0 },
    { id: 6, creditor: "Fuel Supplier", amount: "₵3,500", dueDate: "2026-04-05", status: "Paid", interestRate: "5%", monthlyPayment: "₵350", remaining: "₵0", daysOverdue: 0 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "#14b8a6";
      case "Overdue": return "#e30613";
      case "Paid": return "#f59e0b";
      default: return "#b0b8c8";
    }
  };

  const filteredData = selectedStatus === "All" ? creditData : creditData.filter(c => c.status === selectedStatus);

  const totalDebt = creditData.reduce((sum, item) => {
    const amount = parseInt(item.remaining.replace(/[₵,]/g, ""));
    return sum + amount;
  }, 0);

  const totalMonthlyPayment = creditData.reduce((sum, item) => {
    const payment = parseInt(item.monthlyPayment.replace(/[₵,]/g, ""));
    return sum + payment;
  }, 0);

  const overdueCount = creditData.filter(c => c.status === "Overdue").length;

  return (
    <NewAppLayout currentPage="creditors">
      <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#0f172a" }}>
        <FilterBar showDateRange showStatus={false} showChannel={false} showPaymentMethod={false} />

        <div style={{ padding: "2rem", flex: 1, overflow: "auto" }}>
          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.875rem", fontWeight: "700", color: "#ffffff", margin: "0 0 0.5rem 0" }}>Creditors & Loans</h1>
            <p style={{ fontSize: "0.875rem", color: "#b0b8c8", margin: 0 }}>Track credit obligations, payments, and loan status</p>
          </div>

          {/* KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
            <div style={{
              backgroundColor: "#1a1f2e",
              border: "1px solid #2a3447",
              borderRadius: "12px",
              padding: "1.5rem",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#7a8294", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.5rem" }}>
                    Total Outstanding Debt
                  </div>
                  <div style={{ fontSize: "2rem", fontWeight: "700", color: "#e30613" }}>
                    ₵{(totalDebt / 1000).toFixed(1)}K
                  </div>
                </div>
                <CreditCard size={24} style={{ color: "#e30613" }} />
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
                  <div style={{ fontSize: "0.75rem", color: "#7a8294", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.5rem" }}>
                    Monthly Obligations
                  </div>
                  <div style={{ fontSize: "2rem", fontWeight: "700", color: "#14b8a6" }}>
                    ₵{(totalMonthlyPayment / 1000).toFixed(1)}K
                  </div>
                </div>
                <TrendingUp size={24} style={{ color: "#14b8a6" }} />
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
                  <div style={{ fontSize: "0.75rem", color: "#7a8294", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.5rem" }}>
                    Overdue Accounts
                  </div>
                  <div style={{ fontSize: "2rem", fontWeight: "700", color: overdueCount > 0 ? "#e30613" : "#14b8a6" }}>
                    {overdueCount}
                  </div>
                </div>
                <AlertCircle size={24} style={{ color: overdueCount > 0 ? "#e30613" : "#14b8a6" }} />
              </div>
            </div>
          </div>

          {/* Status Filter */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
            {["All", "Active", "Overdue", "Paid"].map((status) => (
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

          {/* Creditors Table */}
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
                    <th style={{ padding: "1rem", textAlign: "left", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Creditor</th>
                    <th style={{ padding: "1rem", textAlign: "center", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Original Amount</th>
                    <th style={{ padding: "1rem", textAlign: "center", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Remaining</th>
                    <th style={{ padding: "1rem", textAlign: "center", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Monthly Payment</th>
                    <th style={{ padding: "1rem", textAlign: "center", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Interest Rate</th>
                    <th style={{ padding: "1rem", textAlign: "center", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Due Date</th>
                    <th style={{ padding: "1rem", textAlign: "center", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((credit, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #2a3447" }}>
                      <td style={{ padding: "1rem", color: "#ffffff", fontWeight: "500" }}>{credit.creditor}</td>
                      <td style={{ padding: "1rem", textAlign: "center", color: "#b0b8c8" }}>{credit.amount}</td>
                      <td style={{ padding: "1rem", textAlign: "center", color: "#14b8a6", fontWeight: "600" }}>{credit.remaining}</td>
                      <td style={{ padding: "1rem", textAlign: "center", color: "#b0b8c8" }}>{credit.monthlyPayment}</td>
                      <td style={{ padding: "1rem", textAlign: "center", color: "#f59e0b", fontWeight: "600" }}>{credit.interestRate}</td>
                      <td style={{ padding: "1rem", textAlign: "center", color: "#b0b8c8", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                        <Calendar size={14} style={{ color: "#7a8294" }} />
                        {credit.dueDate}
                      </td>
                      <td style={{ padding: "1rem", textAlign: "center" }}>
                        <span style={{
                          display: "inline-block",
                          padding: "0.25rem 0.75rem",
                          backgroundColor: `${getStatusColor(credit.status)}33`,
                          color: getStatusColor(credit.status),
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                        }}>
                          {credit.status}
                          {credit.daysOverdue > 0 && ` (${credit.daysOverdue}d)`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Overdue Alert */}
          {overdueCount > 0 && (
            <div style={{
              marginTop: "2rem",
              backgroundColor: "#e30613",
              border: "1px solid #b80410",
              borderRadius: "12px",
              padding: "1.5rem",
              display: "flex",
              gap: "1rem",
              alignItems: "start",
            }}>
              <AlertCircle size={24} style={{ color: "#ffffff", flexShrink: 0 }} />
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "#ffffff", margin: "0 0 0.5rem 0" }}>
                  Overdue Payments Alert
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#fde0e0", margin: 0 }}>
                  {overdueCount} account(s) have overdue payments. Please prioritize settling these obligations to avoid additional penalties.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </NewAppLayout>
  );
}
