import { Card } from "@/components/ui/card";
import { TrendingUp, ShoppingCart, Wrench, DollarSign } from "lucide-react";

interface KPIData {
  totalRevenue: number;
  totalTransactions: number;
  avgTransactionValue: number;
  totalVehiclesServiced: number;
  totalExpenses: number;
  netPosition: number;
}

interface KPICardsProps {
  data: KPIData;
  isLoading?: boolean;
}

export default function KPICards({ data, isLoading }: KPICardsProps) {
  const kpiItems = [
    {
      label: "Total Revenue",
      value: `₵${data.totalRevenue.toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
      icon: <DollarSign className="text-green-500" size={24} />,
      color: "border-green-500",
    },
    {
      label: "Total Transactions",
      value: data.totalTransactions.toString(),
      icon: <ShoppingCart className="text-blue-500" size={24} />,
      color: "border-blue-500",
    },
    {
      label: "Vehicles Serviced",
      value: data.totalVehiclesServiced.toString(),
      icon: <Wrench className="text-orange-500" size={24} />,
      color: "border-orange-500",
    },
    {
      label: "Net Position",
      value: `₵${data.netPosition.toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
      icon: <TrendingUp className={data.netPosition >= 0 ? "text-green-500" : "text-red-500"} size={24} />,
      color: data.netPosition >= 0 ? "border-green-500" : "border-red-500",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-12 bg-gray-300 rounded mb-2"></div>
            <div className="h-8 bg-gray-300 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiItems.map((item, index) => (
        <Card
          key={index}
          className={`p-6 border-l-4 ${item.color} bg-slate-50 hover:shadow-lg transition-shadow`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 font-medium mb-2">{item.label}</p>
              <p className="text-2xl font-bold text-slate-900">{item.value}</p>
            </div>
            <div className="ml-4">{item.icon}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}
