import { useState } from "react";
import DashboardNav from "@/components/DashboardNav";
import SalesTable from "@/components/SalesTable";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function Sales() {
  const [filters, setFilters] = useState({});
  const { data: salesData, isLoading } = trpc.sales.list.useQuery(filters);

  // Calculate sales by channel
  const salesByChannel = salesData?.reduce((acc: any, tx: any) => {
    const existing = acc.find((item: any) => item.name === tx.channel);
    if (existing) {
      existing.value += parseFloat(tx.totalAmount || 0);
    } else {
      acc.push({ name: tx.channel, value: parseFloat(tx.totalAmount || 0) });
    }
    return acc;
  }, []) || [];

  // Calculate sales by payment method
  const salesByPayment = salesData?.reduce((acc: any, tx: any) => {
    const existing = acc.find((item: any) => item.name === tx.paymentMethod);
    if (existing) {
      existing.value += parseFloat(tx.totalAmount || 0);
    } else {
      acc.push({ name: tx.paymentMethod, value: parseFloat(tx.totalAmount || 0) });
    }
    return acc;
  }, []) || [];

  const COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardNav />

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 mb-8">Sales Management</h1>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Sales by Channel</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesByChannel}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₵${value.toLocaleString()}`} />
                  <Bar dataKey="value" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Sales by Payment Method</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={salesByPayment}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ₵${value.toLocaleString()}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {salesByPayment.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₵${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Sales Table */}
          <SalesTable data={salesData || []} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}
