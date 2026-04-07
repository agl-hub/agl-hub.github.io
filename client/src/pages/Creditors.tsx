import { useState } from "react";

interface Creditor {
  id: string;
  name: string;
  type: "supplier" | "customer";
  totalOwed: number;
  amountPaid: number;
  dueDate: string;
  status: "current" | "overdue" | "paid";
  lastTransaction: string;
  contactPerson: string;
  phone: string;
}

const creditors: Creditor[] = [
  {
    id: "1",
    name: "ABC Auto Parts Ltd",
    type: "supplier",
    totalOwed: 5000,
    amountPaid: 3000,
    dueDate: "2026-04-15",
    status: "current",
    lastTransaction: "2026-04-03",
    contactPerson: "Mr. Agyeman",
    phone: "0244-123456",
  },
  {
    id: "2",
    name: "Mr. Kwame Asante",
    type: "customer",
    totalOwed: 2500,
    amountPaid: 0,
    dueDate: "2026-04-10",
    status: "overdue",
    lastTransaction: "2026-03-28",
    contactPerson: "Kwame Asante",
    phone: "0555-789012",
  },
  {
    id: "3",
    name: "XYZ Supplies Co.",
    type: "supplier",
    totalOwed: 0,
    amountPaid: 8000,
    dueDate: "2026-03-31",
    status: "paid",
    lastTransaction: "2026-04-01",
    contactPerson: "Ms. Abena",
    phone: "0244-654321",
  },
  {
    id: "4",
    name: "Ms. Ama Osei",
    type: "customer",
    totalOwed: 1200,
    amountPaid: 300,
    dueDate: "2026-04-12",
    status: "current",
    lastTransaction: "2026-04-02",
    contactPerson: "Ama Osei",
    phone: "0555-345678",
  },
];

export default function Creditors() {
  const [creditorList, setCreditorList] = useState(creditors);
  const [filterType, setFilterType] = useState<"all" | "supplier" | "customer">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "current" | "overdue" | "paid">("all");

  const filteredCreditors = creditorList.filter((c) => {
    const typeMatch = filterType === "all" || c.type === filterType;
    const statusMatch = filterStatus === "all" || c.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const totalOwed = creditorList.reduce((sum, c) => sum + c.totalOwed, 0);
  const overdueAmount = creditorList
    .filter((c) => c.status === "overdue")
    .reduce((sum, c) => sum + c.totalOwed, 0);
  const overdueCount = creditorList.filter((c) => c.status === "overdue").length;

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Creditors & Loans</h2>
        <button className="btn btn-primary">+ New Creditor</button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-4 gap-md">
        <div className="card">
          <div className="kpi-label">Total Owed</div>
          <div className="kpi-value">GHS {totalOwed.toLocaleString()}</div>
          <div className="kpi-sub">To all creditors</div>
        </div>
        <div className="card">
          <div className="kpi-label">Overdue Amount</div>
          <div className="kpi-value text-warning">GHS {overdueAmount.toLocaleString()}</div>
          <div className="kpi-sub">{overdueCount} accounts</div>
        </div>
        <div className="card">
          <div className="kpi-label">Total Creditors</div>
          <div className="kpi-value">{creditorList.length}</div>
          <div className="kpi-sub">Active accounts</div>
        </div>
        <div className="card">
          <div className="kpi-label">Paid This Month</div>
          <div className="kpi-value text-success-light">GHS 11,300</div>
          <div className="kpi-sub">Total payments</div>
        </div>
      </div>

      {/* Overdue Alert */}
      {overdueCount > 0 && (
        <div className="card border-l-4 border-danger bg-danger/5">
          <h3 className="font-bold text-danger mb-md">🚨 Overdue Payments Alert</h3>
          <div className="flex flex-col gap-sm">
            {creditorList
              .filter((c) => c.status === "overdue")
              .map((c) => (
                <div key={c.id} className="flex justify-between items-center text-sm">
                  <span>{c.name} - Due: {c.dueDate}</span>
                  <span className="font-bold text-danger">GHS {c.totalOwed.toLocaleString()}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="grid grid-2 gap-md">
          <div>
            <label className="form-label">Creditor Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="form-control"
            >
              <option value="all">All Types</option>
              <option value="supplier">Suppliers</option>
              <option value="customer">Customers (Credit)</option>
            </select>
          </div>
          <div>
            <label className="form-label">Payment Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="form-control"
            >
              <option value="all">All Status</option>
              <option value="current">Current</option>
              <option value="overdue">Overdue</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Creditors Table */}
      <div className="card">
        <h3 className="text-lg font-bold mb-lg">Creditor Accounts</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Contact</th>
              <th>Total Owed</th>
              <th>Amount Paid</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCreditors.map((creditor) => (
              <tr key={creditor.id}>
                <td className="font-bold">{creditor.name}</td>
                <td>
                  <span className="badge badge-info">
                    {creditor.type === "supplier" ? "Supplier" : "Customer"}
                  </span>
                </td>
                <td>
                  <div className="text-sm">
                    <div>{creditor.contactPerson}</div>
                    <div className="text-text-tertiary">{creditor.phone}</div>
                  </div>
                </td>
                <td className="font-bold">GHS {creditor.totalOwed.toLocaleString()}</td>
                <td className="font-bold text-success-light">
                  GHS {creditor.amountPaid.toLocaleString()}
                </td>
                <td>{creditor.dueDate}</td>
                <td>
                  <span
                    className={`badge ${
                      creditor.status === "paid"
                        ? "badge-success"
                        : creditor.status === "overdue"
                        ? "badge-danger"
                        : "badge-info"
                    }`}
                  >
                    {creditor.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  <div className="flex gap-sm">
                    <button className="btn btn-secondary btn-sm">View</button>
                    {creditor.totalOwed > 0 && (
                      <button className="btn btn-primary btn-sm">Record Payment</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Form */}
      <div className="card">
        <h3 className="text-lg font-bold mb-lg">Record Payment</h3>
        <div className="grid grid-3 gap-lg">
          <div className="form-group">
            <label className="form-label">Creditor</label>
            <select className="form-control">
              <option>Select creditor...</option>
              {creditorList
                .filter((c) => c.totalOwed > 0)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - Owes: GHS {c.totalOwed}
                  </option>
                ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Amount (GHS)</label>
            <input type="number" placeholder="0.00" className="form-control" />
          </div>
          <div className="form-group">
            <label className="form-label">Payment Date</label>
            <input type="date" className="form-control" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Payment Method</label>
          <select className="form-control">
            <option>Cash</option>
            <option>Bank Transfer</option>
            <option>MoMo</option>
            <option>Cheque</option>
          </select>
        </div>
        <div className="flex gap-md justify-end">
          <button className="btn btn-secondary">Cancel</button>
          <button className="btn btn-primary">Record Payment</button>
        </div>
      </div>
    </div>
  );
}
