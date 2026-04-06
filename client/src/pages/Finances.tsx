import { useState } from "react";
import DashboardNav from "@/components/DashboardNav";
import LiveInsightsBanner from "@/components/LiveInsightsBanner";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Download } from "lucide-react";

export default function Finances() {
  const [activeTab, setActiveTab] = useState<"expenses" | "po">("expenses");
  const { data: expensesData, isLoading: expensesLoading } = trpc.expenses.list.useQuery({});
  const { data: poData, isLoading: poLoading } = trpc.purchaseOrders.list.useQuery({});

  // Calculate expenses by category
  const expensesByCategory = expensesData?.reduce((acc: any, expense: any) => {
    const existing = acc.find((item: any) => item.name === expense.category);
    if (existing) {
      existing.amount += parseFloat(expense.amount || 0);
    } else {
      acc.push({ name: expense.category, amount: parseFloat(expense.amount || 0) });
    }
    return acc;
  }, []) || [];

  // Calculate PO by status
  const poByStatus = poData?.reduce((acc: any, po: any) => {
    const existing = acc.find((item: any) => item.status === po.status);
    if (existing) {
      existing.count += 1;
      existing.amount += parseFloat(po.amount || 0);
    } else {
      acc.push({ status: po.status, count: 1, amount: parseFloat(po.amount || 0) });
    }
    return acc;
  }, []) || [];

  const totalExpenses = expensesData?.reduce((sum: number, e: any) => sum + parseFloat(e.amount || 0), 0) || 0;
  const totalPOAmount = poData?.reduce((sum: number, po: any) => sum + parseFloat(po.amount || 0), 0) || 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardNav />

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 mb-8">Financial Management</h1>
          <LiveInsightsBanner categories={["finance"]} />

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card className="p-6 border-l-4 border-red-500">
              <p className="text-sm text-gray-600 font-medium mb-2">Total Expenses</p>
              <p className="text-3xl font-bold text-slate-900">₵{totalExpenses.toLocaleString("en-US", { maximumFractionDigits: 2 })}</p>
            </Card>
            <Card className="p-6 border-l-4 border-orange-500">
              <p className="text-sm text-gray-600 font-medium mb-2">Total PO Amount</p>
              <p className="text-3xl font-bold text-slate-900">₵{totalPOAmount.toLocaleString("en-US", { maximumFractionDigits: 2 })}</p>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Expenses by Category</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expensesByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₵${value.toLocaleString()}`} />
                  <Bar dataKey="amount" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Purchase Orders by Status</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={poByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8 border-b border-gray-200">
            {[
              { id: "expenses" as const, label: "Expenses" },
              { id: "po" as const, label: "Purchase Orders" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Expenses Table */}
          {activeTab === "expenses" && (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Expenses</h2>
                <Button className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
                  <Download size={16} />
                  Export
                </Button>
              </div>
              {expensesLoading ? (
                <div className="text-center py-8 text-gray-500">Loading expenses...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Category</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Description</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Amount</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Vendor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expensesData?.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                            No expenses found
                          </td>
                        </tr>
                      ) : (
                        expensesData?.map((expense: any) => (
                          <tr key={expense.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-900">
                              {new Date(expense.expenseDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline">{expense.category}</Badge>
                            </td>
                            <td className="px-4 py-3 text-gray-700">{expense.description}</td>
                            <td className="px-4 py-3 font-semibold text-gray-900">
                              ₵{parseFloat(expense.amount || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-3 text-gray-700">{expense.vendor || "-"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* Purchase Orders Table */}
          {activeTab === "po" && (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Purchase Orders</h2>
                <Button className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
                  <Download size={16} />
                  Export
                </Button>
              </div>
              {poLoading ? (
                <div className="text-center py-8 text-gray-500">Loading purchase orders...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">PO Number</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Vendor</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Amount</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {poData?.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                            No purchase orders found
                          </td>
                        </tr>
                      ) : (
                        poData?.map((po: any) => (
                          <tr key={po.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 font-semibold text-gray-900">{po.poNumber}</td>
                            <td className="px-4 py-3 text-gray-900">
                              {new Date(po.poDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-gray-700">{po.vendor}</td>
                            <td className="px-4 py-3 font-semibold text-gray-900">
                              ₵{parseFloat(po.amount || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-3">
                              <Badge className={po.status === "Approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                                {po.status}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
