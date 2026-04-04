import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";

interface WorkshopJob {
  id: number;
  jobDate: string | Date;
  vehicle: string;
  registrationNo?: string | null;
  mechanics: string;
  jobDescription: string;
  status: string;
  notes?: string | null;
}

interface WorkshopTableProps {
  data: WorkshopJob[];
  isLoading?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800";
    case "In Progress":
      return "bg-blue-100 text-blue-800";
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "On Hold":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function WorkshopTable({ data, isLoading }: WorkshopTableProps) {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Workshop Daily Log</h2>
        <Button className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
          <Download size={16} />
          Export
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading workshop jobs...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Vehicle</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Reg. No.</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Mechanics</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Job Description</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No workshop jobs found
                  </td>
                </tr>
              ) : (
                data.map((job) => (
                  <tr key={job.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-900">
                      {new Date(job.jobDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{job.vehicle}</td>
                    <td className="px-4 py-3 text-gray-700">{job.registrationNo || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {job.mechanics.split(",").map((mechanic, idx) => (
                          <Badge key={idx} variant="secondary">
                            {mechanic.trim()}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-xs truncate">
                      {job.jobDescription}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
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
