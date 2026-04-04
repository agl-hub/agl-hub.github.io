import DashboardNav from "@/components/DashboardNav";
import WorkshopTable from "@/components/WorkshopTable";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Workshop() {
  const { data: workshopData, isLoading } = trpc.workshop.list.useQuery({});

  // Calculate jobs by mechanic
  const jobsByMechanic = workshopData?.reduce((acc: any, job: any) => {
    const mechanics = job.mechanics.split(",").map((m: string) => m.trim());
    mechanics.forEach((mechanic: string) => {
      const existing = acc.find((item: any) => item.name === mechanic);
      if (existing) {
        existing.jobs += 1;
      } else {
        acc.push({ name: mechanic, jobs: 1 });
      }
    });
    return acc;
  }, []) || [];

  // Calculate jobs by status
  const jobsByStatus = workshopData?.reduce((acc: any, job: any) => {
    const existing = acc.find((item: any) => item.status === job.status);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ status: job.status, count: 1 });
    }
    return acc;
  }, []) || [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardNav />

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 mb-8">Workshop Management</h1>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Jobs by Mechanic</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={jobsByMechanic}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="jobs" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Jobs by Status</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={jobsByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Workshop Table */}
          <WorkshopTable data={workshopData || []} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}
