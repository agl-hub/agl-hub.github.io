import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import DashboardNav from "@/components/DashboardNav";
import KPICards from "@/components/KPICards";
import SalesTable from "@/components/SalesTable";
import WorkshopTable from "@/components/WorkshopTable";
import StaffTable from "@/components/StaffTable";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "sales" | "workshop" | "staff">("overview");

  // Fetch KPIs
  const { data: kpiData, isLoading: kpiLoading } = trpc.dashboard.getKPIs.useQuery({});

  // Fetch sales transactions
  const { data: salesData, isLoading: salesLoading } = trpc.sales.list.useQuery({});

  // Fetch workshop jobs
  const { data: workshopData, isLoading: workshopLoading } = trpc.workshop.list.useQuery({});

  // Fetch staff attendance
  const { data: staffData, isLoading: staffLoading } = trpc.staff.listAttendance.useQuery({});

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <Loader2 className="animate-spin text-red-600" size={48} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">AGL Command Center</h1>
          <p className="text-xl text-gray-300 mb-8">Automotive Operations Dashboard</p>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
          >
            Login with Manus
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardNav />

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Operations Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, <span className="font-semibold">{user?.name || user?.email}</span>
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8 border-b border-gray-200">
            {[
              { id: "overview" as const, label: "Overview" },
              { id: "sales" as const, label: "Sales" },
              { id: "workshop" as const, label: "Workshop" },
              { id: "staff" as const, label: "Staff" },
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

          {/* Content */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <KPICards
                data={
                  kpiData || {
                    totalRevenue: 0,
                    totalTransactions: 0,
                    avgTransactionValue: 0,
                    totalVehiclesServiced: 0,
                    totalExpenses: 0,
                    netPosition: 0,
                  }
                }
                isLoading={kpiLoading}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SalesTable data={salesData || []} isLoading={salesLoading} />
                <WorkshopTable data={workshopData || []} isLoading={workshopLoading} />
              </div>
            </div>
          )}

          {activeTab === "sales" && <SalesTable data={salesData || []} isLoading={salesLoading} />}

          {activeTab === "workshop" && (
            <WorkshopTable data={workshopData || []} isLoading={workshopLoading} />
          )}

          {activeTab === "staff" && <StaffTable data={staffData || []} isLoading={staffLoading} />}
        </div>
      </main>
    </div>
  );
}
