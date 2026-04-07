import DashboardNav from "@/components/DashboardNav";
import StaffTable from "@/components/StaffTable";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Staff() {
  const { data: staffData, isLoading } = trpc.staff.listAttendance.useQuery({});

  // Calculate late days by staff
  const lateDaysByStaff = staffData?.reduce((acc: any, record: any) => {
    const existing = acc.find((item: any) => item.name === record.staffName);
    if (existing) {
      existing.lateDays += record.isLate ? 1 : 0;
      existing.totalDays += 1;
    } else {
      acc.push({
        name: record.staffName,
        lateDays: record.isLate ? 1 : 0,
        totalDays: 1,
      });
    }
    return acc;
  }, []) || [];

  // Calculate total hours by staff
  const hoursByStaff = staffData?.reduce((acc: any, record: any) => {
    const existing = acc.find((item: any) => item.name === record.staffName);
    const hours = typeof record.hoursWorked === 'number' ? record.hoursWorked : parseFloat(record.hoursWorked || 0);
    if (existing) {
      existing.hours += hours;
    } else {
      acc.push({
        name: record.staffName,
        hours: hours,
      });
    }
    return acc;
  }, []) || [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardNav />

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 mb-8">Staff Management</h1>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Late Days by Staff</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={lateDaysByStaff}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="lateDays" fill="#ef4444" name="Late Days" />
                  <Bar dataKey="totalDays" fill="#10b981" name="Total Days" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Total Hours Worked</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hoursByStaff}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Staff Table */}
          <StaffTable data={staffData || []} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}
