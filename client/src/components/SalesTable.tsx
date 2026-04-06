import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";

interface SalesTransaction {
  id: number;
  transactionDate: string | Date;
  customerName?: string | null;
  channel: string;
  vehicle?: string | null;
  partService: string;
  totalAmount: number | string;
  paymentMethod: string;
  status: string;
  salesRep?: string | null;
  customerContact?: string | null;
  receiptNo?: string | null;
  mechanic?: string | null;
  workmanshipFee?: number | string | null;
  notes?: string | null;
  quantity?: number | string | null;
  unitPrice?: number | string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SalesTableProps {
  data: SalesTransaction[];
  isLoading?: boolean;
  onFilterChange?: (filters: any) => void;
}

const CHANNELS = ["Walk-In", "WhatsApp", "Phone", "Instagram", "TikTok", "Boss"];
const PAYMENT_METHODS = ["Cash", "MoMo", "Bank Transfer", "Credit", "POS"];
const STATUSES = ["Completed", "Pending Payment", "Pending", "Cancelled"];

export default function SalesTable({ data, isLoading, onFilterChange }: SalesTableProps) {
  const [filters, setFilters] = useState({
    channel: "",
    paymentMethod: "",
    status: "",
    searchTerm: "",
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Pending Payment":
        return "bg-yellow-100 text-yellow-800";
      case "Pending":
        return "bg-blue-100 text-blue-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Sales Transactions</h2>
        <Button className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
          <Download size={16} />
          Export
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Input
          placeholder="Search customer..."
          value={filters.searchTerm}
          onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
          className="border-gray-300"
        />
        <Select value={filters.channel || "all"} onValueChange={(v) => handleFilterChange("channel", v === "all" ? "" : v)}>
          <SelectTrigger>
            <SelectValue placeholder="Channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            {CHANNELS.map((ch) => (
              <SelectItem key={ch} value={ch}>
                {ch}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.paymentMethod || "all"} onValueChange={(v) => handleFilterChange("paymentMethod", v === "all" ? "" : v)}>
          <SelectTrigger>
            <SelectValue placeholder="Payment Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            {PAYMENT_METHODS.map((pm) => (
              <SelectItem key={pm} value={pm}>
                {pm}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.status || "all"} onValueChange={(v) => handleFilterChange("status", v === "all" ? "" : v)}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map((st) => (
              <SelectItem key={st} value={st}>
                {st}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading transactions...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Customer</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Channel</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Part/Service</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Amount</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Payment</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                data.map((tx) => (
                  <tr key={tx.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-900">
                      {new Date(tx.transactionDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{tx.customerName || "-"}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{tx.channel}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{tx.partService}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      ₵{tx.totalAmount.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{tx.paymentMethod}</td>
                    <td className="px-4 py-3">
                      <Badge className={getStatusColor(tx.status)}>{tx.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
