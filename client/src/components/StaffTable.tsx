import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";

interface StaffAttendance {
  id: number;
  staffName: string;
  role: string;
  clockInDate: string | Date;
  clockInTime?: string | null;
  clockOutTime?: string | null;
  hoursWorked?: number | string | null;
  isLate: boolean | null;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface StaffTableProps {
  data: StaffAttendance[];
  isLoading?: boolean;
}

export default function StaffTable({ data, isLoading }: StaffTableProps) {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Staff Attendance</h2>
        <Button className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
          <Download size={16} />
          Export
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading staff attendance...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Staff Name</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Role</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Clock In</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Clock Out</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Hours</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                data.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900">{record.staffName}</td>
                    <td className="px-4 py-3 text-gray-700">{record.role}</td>
                    <td className="px-4 py-3 text-gray-900">
                      {new Date(record.clockInDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{record.clockInTime || "-"}</td>
                    <td className="px-4 py-3 text-gray-700">{record.clockOutTime || "-"}</td>
                    <td className="px-4 py-3 text-gray-900 font-semibold">
                      {typeof record.hoursWorked === 'number' ? record.hoursWorked.toFixed(2) : record.hoursWorked || "-"} hrs
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={record.isLate ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                        {record.isLate ? "Late" : "On Time"}
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
  );
}
