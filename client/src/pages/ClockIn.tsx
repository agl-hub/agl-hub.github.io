import { useState } from "react";

interface AttendanceRecord {
  id: string;
  name: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  hoursWorked: number;
  status: "present" | "late" | "absent" | "on-leave";
  notes: string;
}

const attendanceRecords: AttendanceRecord[] = [
  {
    id: "1",
    name: "John Mensah",
    date: "2026-04-06",
    clockIn: "07:45",
    clockOut: "16:30",
    hoursWorked: 8.75,
    status: "present",
    notes: "",
  },
  {
    id: "2",
    name: "Peter Kwame",
    date: "2026-04-06",
    clockIn: "08:15",
    clockOut: "17:00",
    hoursWorked: 8.75,
    status: "late",
    notes: "Traffic",
  },
  {
    id: "3",
    name: "Samuel Osei",
    date: "2026-04-06",
    clockIn: "07:50",
    clockOut: null,
    hoursWorked: 8.5,
    status: "present",
    notes: "Still working",
  },
  {
    id: "4",
    name: "Ama Boateng",
    date: "2026-04-06",
    clockIn: null,
    clockOut: null,
    hoursWorked: 0,
    status: "absent",
    notes: "Sick leave",
  },
];

export default function ClockIn() {
  const [records, setRecords] = useState(attendanceRecords);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const todayRecords = records.filter((r) => r.date === selectedDate);
  const presentCount = todayRecords.filter((r) => r.status === "present" || r.status === "late").length;
  const lateCount = todayRecords.filter((r) => r.status === "late").length;
  const absentCount = todayRecords.filter((r) => r.status === "absent").length;

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Staff Clock-In</h2>
        <button className="btn btn-primary">+ Manual Entry</button>
      </div>

      {/* Quick Clock In/Out */}
      <div className="card">
        <h3 className="text-lg font-bold mb-lg">Quick Clock In/Out</h3>
        <div className="grid grid-2 gap-lg">
          <div>
            <label className="form-label">Select Staff Member</label>
            <select className="form-control">
              <option>Select staff...</option>
              <option>John Mensah</option>
              <option>Peter Kwame</option>
              <option>Samuel Osei</option>
              <option>Ama Boateng</option>
            </select>
          </div>
          <div className="flex items-end gap-md">
            <button className="btn btn-success flex-1">🟢 Clock In</button>
            <button className="btn btn-warning flex-1">🔴 Clock Out</button>
          </div>
        </div>
      </div>

      {/* Date Selector */}
      <div className="card">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="form-control max-w-xs"
        />
      </div>

      {/* Attendance Summary */}
      <div className="grid grid-4 gap-md">
        <div className="card">
          <div className="kpi-label">Present</div>
          <div className="kpi-value text-success-light">{presentCount}</div>
          <div className="kpi-sub">On time</div>
        </div>
        <div className="card">
          <div className="kpi-label">Late</div>
          <div className="kpi-value text-warning">{lateCount}</div>
          <div className="kpi-sub">Arrived late</div>
        </div>
        <div className="card">
          <div className="kpi-label">Absent</div>
          <div className="kpi-value text-danger">{absentCount}</div>
          <div className="kpi-sub">Not present</div>
        </div>
        <div className="card">
          <div className="kpi-label">Total Staff</div>
          <div className="kpi-value">{todayRecords.length}</div>
          <div className="kpi-sub">Expected today</div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card">
        <h3 className="text-lg font-bold mb-lg">Attendance Records - {selectedDate}</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Clock In</th>
              <th>Clock Out</th>
              <th>Hours Worked</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {todayRecords.map((record) => (
              <tr key={record.id}>
                <td className="font-bold">{record.name}</td>
                <td className="font-mono">{record.clockIn || "-"}</td>
                <td className="font-mono">{record.clockOut || "-"}</td>
                <td className="font-bold">{record.hoursWorked.toFixed(2)}h</td>
                <td>
                  <span
                    className={`badge ${
                      record.status === "present"
                        ? "badge-success"
                        : record.status === "late"
                        ? "badge-warning"
                        : record.status === "absent"
                        ? "badge-danger"
                        : "badge-info"
                    }`}
                  >
                    {record.status.toUpperCase()}
                  </span>
                </td>
                <td className="text-sm text-text-tertiary">{record.notes}</td>
                <td>
                  <button className="btn btn-secondary btn-sm">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Monthly Attendance Summary */}
      <div className="card">
        <h3 className="text-lg font-bold mb-lg">Monthly Attendance Summary</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Staff Name</th>
              <th>Days Present</th>
              <th>Days Late</th>
              <th>Days Absent</th>
              <th>Total Hours</th>
              <th>Attendance %</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-bold">John Mensah</td>
              <td>20</td>
              <td>1</td>
              <td>0</td>
              <td>160.5h</td>
              <td><span className="badge badge-success">95%</span></td>
            </tr>
            <tr>
              <td className="font-bold">Peter Kwame</td>
              <td>19</td>
              <td>2</td>
              <td>0</td>
              <td>158.0h</td>
              <td><span className="badge badge-success">90%</span></td>
            </tr>
            <tr>
              <td className="font-bold">Samuel Osei</td>
              <td>18</td>
              <td>0</td>
              <td>3</td>
              <td>144.0h</td>
              <td><span className="badge badge-warning">85%</span></td>
            </tr>
            <tr>
              <td className="font-bold">Ama Boateng</td>
              <td>17</td>
              <td>1</td>
              <td>3</td>
              <td>136.0h</td>
              <td><span className="badge badge-warning">80%</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
