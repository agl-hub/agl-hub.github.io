import { useState } from "react";

export default function DailyEntry() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    entryType: "sales",
    description: "",
    amount: "",
    channel: "",
    paymentMethod: "",
    mechanic: "",
    vehicle: "",
    jobDescription: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // TODO: Submit to backend
  };

  return (
    <div className="flex flex-col gap-lg">
      <div className="card">
        <h2 className="text-2xl font-bold mb-lg">Daily Entry Form</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
          {/* Entry Type Selection */}
          <div className="grid grid-2 gap-lg">
            <div className="form-group">
              <label className="form-label">Entry Type</label>
              <select
                name="entryType"
                value={formData.entryType}
                onChange={handleChange}
                className="form-control"
              >
                <option value="sales">Sales Transaction</option>
                <option value="workshop">Workshop Job</option>
                <option value="expense">Expense</option>
                <option value="purchase">Purchase Order</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          {/* Sales Entry */}
          {formData.entryType === "sales" && (
            <>
              <div className="grid grid-2 gap-lg">
                <div className="form-group">
                  <label className="form-label">Channel</label>
                  <select
                    name="channel"
                    value={formData.channel}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="">Select Channel</option>
                    <option value="Walk-In">Walk-In</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Phone">Phone</option>
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Boss">Boss</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="">Select Method</option>
                    <option value="Cash">Cash</option>
                    <option value="MoMo">MoMo</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit">Credit</option>
                    <option value="POS">POS</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Amount (GHS)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description / Item</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter sales details..."
                  className="form-control"
                ></textarea>
              </div>
            </>
          )}

          {/* Workshop Entry */}
          {formData.entryType === "workshop" && (
            <>
              <div className="grid grid-2 gap-lg">
                <div className="form-group">
                  <label className="form-label">Vehicle Reg Number</label>
                  <input
                    type="text"
                    name="vehicle"
                    value={formData.vehicle}
                    onChange={handleChange}
                    placeholder="e.g., GN 123-45"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Mechanic</label>
                  <select
                    name="mechanic"
                    value={formData.mechanic}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="">Select Mechanic</option>
                    <option value="John">John</option>
                    <option value="Peter">Peter</option>
                    <option value="Samuel">Samuel</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Job Description</label>
                <textarea
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleChange}
                  placeholder="Describe the work to be done..."
                  className="form-control"
                ></textarea>
              </div>
            </>
          )}

          {/* Expense Entry */}
          {formData.entryType === "expense" && (
            <>
              <div className="grid grid-2 gap-lg">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    name="channel"
                    value={formData.channel}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="">Select Category</option>
                    <option value="Supplies">Supplies</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Salaries">Salaries</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Amount (GHS)</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter expense details..."
                  className="form-control"
                ></textarea>
              </div>
            </>
          )}

          {/* Submit Button */}
          <div className="flex gap-md justify-end">
            <button type="button" className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Entry
            </button>
          </div>
        </form>
      </div>

      {/* Recent Entries */}
      <div className="card">
        <h3 className="text-lg font-bold mb-lg">Recent Entries</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2026-04-05</td>
              <td><span className="badge badge-primary">Sales</span></td>
              <td>Oil Change - Walk-In</td>
              <td>GHS 150.00</td>
              <td><span className="badge badge-success">Completed</span></td>
            </tr>
            <tr>
              <td>2026-04-05</td>
              <td><span className="badge badge-info">Workshop</span></td>
              <td>Engine Repair - GN 123-45</td>
              <td>GHS 500.00</td>
              <td><span className="badge badge-warning">In Progress</span></td>
            </tr>
            <tr>
              <td>2026-04-05</td>
              <td><span className="badge badge-danger">Expense</span></td>
              <td>Supplies - Oil & Filters</td>
              <td>GHS 200.00</td>
              <td><span className="badge badge-success">Recorded</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
