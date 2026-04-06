import { useState } from "react";
import DashboardNav from "@/components/DashboardNav";
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
import { FileText, Download, Printer } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface ReportConfig {
  type: "daily" | "weekly" | "monthly";
  startDate: string;
  endDate: string;
  includeMetrics: {
    sales: boolean;
    expenses: boolean;
    staff: boolean;
    workshop: boolean;
  };
}

export default function Reports() {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    type: "daily",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    includeMetrics: {
      sales: true,
      expenses: true,
      staff: true,
      workshop: true,
    },
  });

  const { data: kpis } = trpc.dashboard.getKPIs.useQuery({
    startDate: new Date(reportConfig.startDate),
    endDate: new Date(reportConfig.endDate),
  });

  const handleGenerateReport = () => {
    // Generate report content
    const reportContent = `
AGL COMMAND CENTER - ${reportConfig.type.toUpperCase()} REPORT
Generated: ${new Date().toLocaleString()}
Period: ${reportConfig.startDate} to ${reportConfig.endDate}

=== KEY PERFORMANCE INDICATORS ===
Total Revenue: ₵${kpis?.totalRevenue?.toLocaleString() || "0"}
Total Transactions: ${kpis?.totalTransactions || 0}
Vehicles Serviced: ${kpis?.totalVehiclesServiced || 0}
Net Position: ₵${kpis?.netPosition?.toLocaleString() || "0"}

${reportConfig.includeMetrics.sales ? "\n=== SALES SUMMARY ===\nSales data will be included in the full report." : ""}
${reportConfig.includeMetrics.expenses ? "\n=== EXPENSES SUMMARY ===\nExpense data will be included in the full report." : ""}
${reportConfig.includeMetrics.staff ? "\n=== STAFF PERFORMANCE ===\nStaff metrics will be included in the full report." : ""}
${reportConfig.includeMetrics.workshop ? "\n=== WORKSHOP OPERATIONS ===\nWorkshop data will be included in the full report." : ""}

Report prepared for management review.
    `;

    // Create blob and download
    const blob = new Blob([reportContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `agl-report-${reportConfig.type}-${reportConfig.startDate}.txt`;
    link.click();
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardNav />

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 mb-8">Business Reports</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Report Configuration */}
            <Card className="lg:col-span-1 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Report Settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Report Type
                  </label>
                  <Select
                    value={reportConfig.type}
                    onValueChange={(value: any) =>
                      setReportConfig({ ...reportConfig, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily Report</SelectItem>
                      <SelectItem value="weekly">Weekly Report</SelectItem>
                      <SelectItem value="monthly">Monthly Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={reportConfig.startDate}
                    onChange={(e) =>
                      setReportConfig({ ...reportConfig, startDate: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={reportConfig.endDate}
                    onChange={(e) =>
                      setReportConfig({ ...reportConfig, endDate: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Include Metrics
                  </label>
                  {Object.entries(reportConfig.includeMetrics).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          setReportConfig({
                            ...reportConfig,
                            includeMetrics: {
                              ...reportConfig.includeMetrics,
                              [key]: e.target.checked,
                            },
                          })
                        }
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{key}</span>
                    </label>
                  ))}
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handleGenerateReport}
                    className="w-full bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    Download Report
                  </Button>
                  <Button
                    onClick={handlePrintReport}
                    className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Printer size={16} />
                    Print Report
                  </Button>
                </div>
              </div>
            </Card>

            {/* Report Preview */}
            <Card className="lg:col-span-2 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText size={24} />
                Report Preview
              </h2>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4 print:bg-white">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-bold">
                    {reportConfig.type.toUpperCase()} REPORT
                  </h3>
                  <p className="text-sm text-gray-600">
                    Generated: {new Date().toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Period: {reportConfig.startDate} to {reportConfig.endDate}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">
                    Key Performance Indicators
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded border">
                      <p className="text-xs text-gray-600">Total Revenue</p>
                      <p className="text-lg font-bold text-green-600">
                        ₵{kpis?.totalRevenue?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <p className="text-xs text-gray-600">Total Transactions</p>
                      <p className="text-lg font-bold text-blue-600">
                        {kpis?.totalTransactions || 0}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <p className="text-xs text-gray-600">Vehicles Serviced</p>
                      <p className="text-lg font-bold text-orange-600">
                        {kpis?.totalVehiclesServiced || 0}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <p className="text-xs text-gray-600">Net Position</p>
                      <p className="text-lg font-bold text-green-600">
                        ₵{kpis?.netPosition?.toLocaleString() || "0"}
                      </p>
                    </div>
                  </div>
                </div>

                {reportConfig.includeMetrics.sales && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Sales Summary</h4>
                    <p className="text-sm text-gray-600">
                      Detailed sales breakdown by channel and payment method will appear here.
                    </p>
                  </div>
                )}

                {reportConfig.includeMetrics.expenses && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Expenses Summary</h4>
                    <p className="text-sm text-gray-600">
                      Expense breakdown and trends will appear here.
                    </p>
                  </div>
                )}

                {reportConfig.includeMetrics.staff && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Staff Performance</h4>
                    <p className="text-sm text-gray-600">
                      Mechanic performance metrics and attendance will appear here.
                    </p>
                  </div>
                )}

                {reportConfig.includeMetrics.workshop && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Workshop Operations</h4>
                    <p className="text-sm text-gray-600">
                      Workshop job completion rates and status will appear here.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
