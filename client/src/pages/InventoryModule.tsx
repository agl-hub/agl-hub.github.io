import NewAppLayout from "@/components/NewAppLayout";
import { Package, AlertTriangle, TrendingDown, ShoppingCart } from "lucide-react";
import { useState } from "react";
import FilterBar from "@/components/FilterBar";

export default function InventoryModule() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const inventoryItems = [
    { id: 1, name: "Engine Oil (5L)", category: "Fluids", quantity: 45, reorderLevel: 20, unitPrice: "₵85", totalValue: "₵3,825", status: "In Stock", lastRestocked: "2026-04-01" },
    { id: 2, name: "Air Filter", category: "Filters", quantity: 8, reorderLevel: 15, unitPrice: "₵45", totalValue: "₵360", status: "Low Stock", lastRestocked: "2026-03-20" },
    { id: 3, name: "Brake Pads Set", category: "Brakes", quantity: 12, reorderLevel: 10, unitPrice: "₵250", totalValue: "₵3,000", status: "In Stock", lastRestocked: "2026-03-25" },
    { id: 4, name: "Spark Plugs (Box)", category: "Electrical", quantity: 3, reorderLevel: 5, unitPrice: "₵120", totalValue: "₵360", status: "Low Stock", lastRestocked: "2026-02-15" },
    { id: 5, name: "Transmission Fluid (10L)", category: "Fluids", quantity: 0, reorderLevel: 5, unitPrice: "₵450", totalValue: "₵0", status: "Out of Stock", lastRestocked: "2026-03-10" },
    { id: 6, name: "Radiator Hose", category: "Cooling", quantity: 6, reorderLevel: 8, unitPrice: "₵180", totalValue: "₵1,080", status: "Low Stock", lastRestocked: "2026-03-18" },
    { id: 7, name: "Battery (12V)", category: "Electrical", quantity: 4, reorderLevel: 3, unitPrice: "₵850", totalValue: "₵3,400", status: "In Stock", lastRestocked: "2026-04-02" },
    { id: 8, name: "Tire (195/65R15)", category: "Tires", quantity: 15, reorderLevel: 10, unitPrice: "₵320", totalValue: "₵4,800", status: "In Stock", lastRestocked: "2026-03-28" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock": return "#14b8a6";
      case "Low Stock": return "#f59e0b";
      case "Out of Stock": return "#e30613";
      default: return "#b0b8c8";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Fluids": "#e30613",
      "Filters": "#14b8a6",
      "Brakes": "#f59e0b",
      "Electrical": "#6366f1",
      "Cooling": "#8b5cf6",
      "Tires": "#ec4899",
    };
    return colors[category] || "#b0b8c8";
  };

  const filteredItems = selectedCategory === "All" ? inventoryItems : inventoryItems.filter(i => i.category === selectedCategory);

  const totalInventoryValue = inventoryItems.reduce((sum, item) => {
    const value = parseInt(item.totalValue.replace(/[₵,]/g, ""));
    return sum + value;
  }, 0);

  const lowStockCount = inventoryItems.filter(i => i.status !== "In Stock").length;

  return (
    <NewAppLayout currentPage="inventory">
      <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#0f172a" }}>
        <FilterBar showDateRange showStatus={false} showChannel={false} showPaymentMethod={false} />

        <div style={{ padding: "2rem", flex: 1, overflow: "auto" }}>
          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "0.4375rem", fontWeight: "700", color: "#ffffff", margin: "0 0 0.5rem 0" }}>Inventory & POS</h1>
            <p style={{ fontSize: "0.4375rem", color: "#b0b8c8", margin: 0 }}>Manage stock levels, pricing, and inventory alerts</p>
          </div>

          {/* KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
            <div style={{
              backgroundColor: "#1a1f2e",
              border: "1px solid #2a3447",
              borderRadius: "12px",
              padding: "1.5rem",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "0.5rem", color: "#7a8294", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Total Inventory Value
              </div>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: "#14b8a6" }}>
                ₵{(totalInventoryValue / 1000).toFixed(1)}K
              </div>
            </div>
            <div style={{
              backgroundColor: "#1a1f2e",
              border: "1px solid #2a3447",
              borderRadius: "12px",
              padding: "1.5rem",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "0.5rem", color: "#7a8294", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Total Items
              </div>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: "#ffffff" }}>
                {inventoryItems.length}
              </div>
            </div>
            <div style={{
              backgroundColor: "#1a1f2e",
              border: "1px solid #2a3447",
              borderRadius: "12px",
              padding: "1.5rem",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "0.5rem", color: "#7a8294", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Low Stock Alerts
              </div>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: "#f59e0b" }}>
                {lowStockCount}
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
            {["All", "Fluids", "Filters", "Brakes", "Electrical", "Cooling", "Tires"].map((category) => (
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

          {/* Inventory Table */}
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
                    <th style={{ padding: "1rem", textAlign: "left", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Item Name</th>
                    <th style={{ padding: "1rem", textAlign: "left", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Category</th>
                    <th style={{ padding: "1rem", textAlign: "center", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Qty</th>
                    <th style={{ padding: "1rem", textAlign: "center", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Reorder Level</th>
                    <th style={{ padding: "1rem", textAlign: "center", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Unit Price</th>
                    <th style={{ padding: "1rem", textAlign: "center", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Value</th>
                    <th style={{ padding: "1rem", textAlign: "center", color: "#7a8294", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #2a3447" }}>
                      <td style={{ padding: "1rem", color: "#ffffff", fontWeight: "500" }}>{item.name}</td>
                      <td style={{ padding: "1rem" }}>
                        <span style={{
                          display: "inline-block",
                          padding: "0.25rem 0.75rem",
                          backgroundColor: `${getCategoryColor(item.category)}33`,
                          color: getCategoryColor(item.category),
                          borderRadius: "6px",
                          fontSize: "0.5rem",
                          fontWeight: "600",
                        }}>
                          {item.category}
                        </span>
                      </td>
                      <td style={{ padding: "1rem", textAlign: "center", color: "#b0b8c8" }}>
                        {item.quantity}
                      </td>
                      <td style={{ padding: "1rem", textAlign: "center", color: "#b0b8c8" }}>
                        {item.reorderLevel}
                      </td>
                      <td style={{ padding: "1rem", textAlign: "center", color: "#b0b8c8" }}>
                        {item.unitPrice}
                      </td>
                      <td style={{ padding: "1rem", textAlign: "center", color: "#14b8a6", fontWeight: "600" }}>
                        {item.totalValue}
                      </td>
                      <td style={{ padding: "1rem", textAlign: "center" }}>
                        <span style={{
                          display: "flex",
                          padding: "0.25rem 0.75rem",
                          backgroundColor: `${getStatusColor(item.status)}33`,
                          color: getStatusColor(item.status),
                          borderRadius: "6px",
                          fontSize: "0.5rem",
                          fontWeight: "600",
                          alignItems: "center",
                          gap: "0.25rem",
                          justifyContent: "center",
                        }}>
                          {item.status === "Low Stock" && <AlertTriangle size={12} />}
                          {item.status === "Out of Stock" && <TrendingDown size={12} />}
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Alert */}
          {lowStockCount > 0 && (
            <div style={{
              marginTop: "2rem",
              backgroundColor: "#f59e0b33",
              border: "1px solid #f59e0b",
              borderRadius: "12px",
              padding: "1.5rem",
              display: "flex",
              gap: "1rem",
              alignItems: "start",
            }}>
              <AlertTriangle size={24} style={{ color: "#f59e0b", flexShrink: 0 }} />
              <div>
                <h3 style={{ fontSize: "0.5rem", fontWeight: "600", color: "#f59e0b", margin: "0 0 0.5rem 0" }}>
                  Low Stock Alert
                </h3>
                <p style={{ fontSize: "0.4375rem", color: "#b0b8c8", margin: 0 }}>
                  {lowStockCount} item(s) are below reorder level. Please reorder soon to avoid stockouts.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </NewAppLayout>
  );
}
