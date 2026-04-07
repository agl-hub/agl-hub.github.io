import { useState } from "react";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  minStock: number;
  unitPrice: number;
  category: string;
  lastRestocked: string;
}

const inventoryItems: InventoryItem[] = [
  {
    id: "1",
    name: "Engine Oil 10W-40",
    sku: "OIL-001",
    quantity: 45,
    minStock: 20,
    unitPrice: 85,
    category: "Oils & Fluids",
    lastRestocked: "2026-04-01",
  },
  {
    id: "2",
    name: "Brake Pads (Front)",
    sku: "BRK-001",
    quantity: 12,
    minStock: 15,
    unitPrice: 250,
    category: "Brakes",
    lastRestocked: "2026-03-28",
  },
  {
    id: "3",
    name: "Air Filter",
    sku: "FLT-001",
    quantity: 28,
    minStock: 10,
    unitPrice: 45,
    category: "Filters",
    lastRestocked: "2026-04-02",
  },
  {
    id: "4",
    name: "Spark Plugs (Set of 4)",
    sku: "SPK-001",
    quantity: 8,
    minStock: 10,
    unitPrice: 120,
    category: "Ignition",
    lastRestocked: "2026-03-25",
  },
  {
    id: "5",
    name: "Battery (12V 60Ah)",
    sku: "BAT-001",
    quantity: 5,
    minStock: 5,
    unitPrice: 800,
    category: "Electrical",
    lastRestocked: "2026-04-03",
  },
];

export default function Inventory() {
  const [items, setItems] = useState(inventoryItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = items.filter((item) => item.quantity <= item.minStock);
  const totalValue = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const categories = ["all", ...Array.from(new Set(items.map((item) => item.category)))];

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Inventory / POS</h2>
        <button className="btn btn-primary">+ Add Item</button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-4 gap-md">
        <div className="card">
          <div className="kpi-label">Total Items</div>
          <div className="kpi-value">{items.length}</div>
          <div className="kpi-sub">In stock</div>
        </div>
        <div className="card">
          <div className="kpi-label">Total Value</div>
          <div className="kpi-value">GHS {totalValue.toLocaleString()}</div>
          <div className="kpi-sub">Inventory worth</div>
        </div>
        <div className="card">
          <div className="kpi-label">Low Stock</div>
          <div className="kpi-value text-warning">{lowStockItems.length}</div>
          <div className="kpi-sub">Need restocking</div>
        </div>
        <div className="card">
          <div className="kpi-label">Categories</div>
          <div className="kpi-value">{categories.length - 1}</div>
          <div className="kpi-sub">Product types</div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="card border-l-4 border-warning bg-warning/5">
          <h3 className="font-bold text-warning mb-md">⚠️ Low Stock Alert</h3>
          <div className="flex flex-col gap-sm">
            {lowStockItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span>{item.name} (SKU: {item.sku})</span>
                <span className="font-bold">{item.quantity} / {item.minStock}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="card">
        <div className="grid grid-2 gap-md mb-lg">
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-control"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card">
        <h3 className="text-lg font-bold mb-lg">Inventory Items</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Min Stock</th>
              <th>Unit Price</th>
              <th>Total Value</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td className="font-bold">{item.name}</td>
                <td className="font-mono text-sm">{item.sku}</td>
                <td>{item.category}</td>
                <td className="font-bold">{item.quantity}</td>
                <td>{item.minStock}</td>
                <td className="font-mono">GHS {item.unitPrice}</td>
                <td className="font-bold">GHS {(item.quantity * item.unitPrice).toLocaleString()}</td>
                <td>
                  {item.quantity <= item.minStock ? (
                    <span className="badge badge-warning">Low Stock</span>
                  ) : item.quantity > item.minStock * 2 ? (
                    <span className="badge badge-success">Adequate</span>
                  ) : (
                    <span className="badge badge-info">Normal</span>
                  )}
                </td>
                <td>
                  <div className="flex gap-sm">
                    <button className="btn btn-secondary btn-sm">Edit</button>
                    <button className="btn btn-secondary btn-sm">Restock</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick POS */}
      <div className="card">
        <h3 className="text-lg font-bold mb-lg">Quick Sale</h3>
        <div className="grid grid-2 gap-lg">
          <div>
            <label className="form-label">Select Item</label>
            <select className="form-control">
              <option>Select an item...</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} - GHS {item.unitPrice}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Quantity</label>
            <input type="number" min="1" defaultValue="1" className="form-control" />
          </div>
        </div>
        <div className="mt-lg">
          <div className="flex justify-between items-center text-lg font-bold mb-lg">
            <span>Total:</span>
            <span>GHS 0.00</span>
          </div>
          <div className="flex gap-md">
            <button className="btn btn-secondary flex-1">Clear</button>
            <button className="btn btn-primary flex-1">Complete Sale</button>
          </div>
        </div>
      </div>
    </div>
  );
}
