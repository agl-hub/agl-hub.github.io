import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import LiveInsightsBanner from "@/components/LiveInsightsBanner";
import { trpc } from "@/lib/trpc";

interface Mechanic {
  id: string;
  name: string;
  jobsCompleted: number;
  jobsInProgress: number;
  efficiency: number;
  avgTimePerJob: number;
  rating: number;
  hoursWorked: number;
  specialization: string;
  joinDate: string;
}

const mechanics: Mechanic[] = [
  {
    id: "1",
    name: "John Mensah",
    jobsCompleted: 45,
    jobsInProgress: 2,
    efficiency: 92,
    avgTimePerJob: 4.2,
    rating: 4.8,
    hoursWorked: 160,
    specialization: "Engine & Transmission",
    joinDate: "2023-01-15",
  },
  {
    id: "2",
    name: "Peter Kwame",
    jobsCompleted: 38,
    jobsInProgress: 3,
    efficiency: 88,
    avgTimePerJob: 4.5,
    rating: 4.6,
    hoursWorked: 158,
    specialization: "Brake & Suspension",
    joinDate: "2023-03-20",
  },
  {
    id: "3",
    name: "Samuel Osei",
    jobsCompleted: 35,
    jobsInProgress: 1,
    efficiency: 85,
    avgTimePerJob: 4.8,
    rating: 4.5,
    hoursWorked: 144,
    specialization: "Electrical & Diagnostics",
    joinDate: "2023-06-10",
  },
  {
    id: "4",
    name: "Ama Boateng",
    jobsCompleted: 32,
    jobsInProgress: 2,
    efficiency: 82,
    avgTimePerJob: 5.0,
    rating: 4.4,
    hoursWorked: 136,
    specialization: "General Maintenance",
    joinDate: "2023-09-05",
  },
];

const performanceData = [
  { week: "Week 1", John: 12, Peter: 10, Samuel: 9, Ama: 8 },
  { week: "Week 2", John: 11, Peter: 9, Samuel: 8, Ama: 7 },
  { week: "Week 3", John: 13, Peter: 11, Samuel: 10, Ama: 9 },
  { week: "Week 4", John: 9, Peter: 8, Samuel: 8, Ama: 8 },
];

export default function MechanicTracker() {
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null);
  const insights = trpc.sheets.insights.useQuery(undefined, { refetchInterval: 60_000 });
  const liveMechanics =
    insights.data?.success && insights.data.metrics ? insights.data.metrics.mechanicEfficiency : [];

  return (
    <div className="flex flex-col gap-lg">
      <h2 className="text-2xl font-bold">Mechanic Tracker</h2>
      <LiveInsightsBanner categories={["workshop", "staff"]} />

      {/* Live mechanic ratings */}
      {liveMechanics.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold mb-md">Live Mechanic Ratings (5-star)</h3>
          <div className="grid grid-3 gap-md">
            {liveMechanics.map((m) => (
              <div key={m.mechanicName} className="p-md bg-bg-tertiary rounded-md">
                <div className="font-bold">{m.mechanicName}</div>
                <div className="text-sm" style={{ opacity: 0.8 }}>
                  {m.jobsCompleted} jobs · {m.efficiency}% efficiency
                </div>
                <div style={{ marginTop: 4, fontSize: 16, color: "#fbbf24" }}>
                  {"★".repeat(Math.round(m.score5Star))}
                  <span style={{ color: "#4b5563" }}>{"★".repeat(5 - Math.round(m.score5Star))}</span>
                  <span style={{ marginLeft: 6, fontSize: 11, color: "#9ca3af" }}>
                    {m.score5Star.toFixed(1)}/5
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-4 gap-md">
        <div className="card">
          <div className="kpi-label">Total Mechanics</div>
          <div className="kpi-value">{mechanics.length}</div>
          <div className="kpi-sub">Active staff</div>
        </div>
        <div className="card">
          <div className="kpi-label">Jobs Completed</div>
          <div className="kpi-value">{mechanics.reduce((sum, m) => sum + m.jobsCompleted, 0)}</div>
          <div className="kpi-sub">This month</div>
        </div>
        <div className="card">
          <div className="kpi-label">Avg Efficiency</div>
          <div className="kpi-value">{(mechanics.reduce((sum, m) => sum + m.efficiency, 0) / mechanics.length).toFixed(0)}%</div>
          <div className="kpi-sub">Team average</div>
        </div>
        <div className="card">
          <div className="kpi-label">Avg Rating</div>
          <div className="kpi-value">{(mechanics.reduce((sum, m) => sum + m.rating, 0) / mechanics.length).toFixed(1)}</div>
          <div className="kpi-sub">Customer satisfaction</div>
        </div>
      </div>

      {/* Performance Trend */}
      <div className="card">
        <h3 className="text-lg font-bold mb-lg">Weekly Performance Trend</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="week" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip contentStyle={{ background: "rgba(20,25,35,0.95)", border: "1px solid rgba(255,255,255,0.1)" }} />
            <Legend />
            <Line type="monotone" dataKey="John" stroke="#E30613" strokeWidth={2} />
            <Line type="monotone" dataKey="Peter" stroke="#16A085" strokeWidth={2} />
            <Line type="monotone" dataKey="Samuel" stroke="#F39C12" strokeWidth={2} />
            <Line type="monotone" dataKey="Ama" stroke="#3498DB" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Mechanics Grid */}
      <div className="grid grid-2 gap-md">
        {mechanics.map((mechanic) => (
          <div
            key={mechanic.id}
            onClick={() => setSelectedMechanic(mechanic)}
            className="card cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-md">
              <div>
                <h3 className="text-lg font-bold">{mechanic.name}</h3>
                <p className="text-text-tertiary text-sm">{mechanic.specialization}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-light">⭐ {mechanic.rating}</div>
                <div className="text-xs text-text-tertiary">Rating</div>
              </div>
            </div>

            <div className="grid grid-3 gap-md mb-md">
              <div>
                <div className="text-text-tertiary text-xs">Jobs Completed</div>
                <div className="text-xl font-bold">{mechanic.jobsCompleted}</div>
              </div>
              <div>
                <div className="text-text-tertiary text-xs">In Progress</div>
                <div className="text-xl font-bold text-warning">{mechanic.jobsInProgress}</div>
              </div>
              <div>
                <div className="text-text-tertiary text-xs">Efficiency</div>
                <div className="text-xl font-bold">{mechanic.efficiency}%</div>
              </div>
            </div>

            <div className="mb-md">
              <div className="flex justify-between text-xs mb-sm">
                <span className="text-text-tertiary">Efficiency Progress</span>
                <span className="font-bold">{mechanic.efficiency}%</span>
              </div>
              <div className="w-full bg-bg-tertiary rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-primary h-full"
                  style={{ width: `${mechanic.efficiency}%` }}
                ></div>
              </div>
            </div>

            <button className="w-full btn btn-secondary btn-sm">View Details</button>
          </div>
        ))}
      </div>

      {/* Mechanic Details */}
      {selectedMechanic && (
        <div className="card">
          <div className="flex justify-between items-start mb-lg">
            <div>
              <h3 className="text-2xl font-bold">{selectedMechanic.name}</h3>
              <p className="text-text-tertiary mt-sm">{selectedMechanic.specialization}</p>
            </div>
            <button
              onClick={() => setSelectedMechanic(null)}
              className="btn btn-secondary btn-sm"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-4 gap-lg mb-lg">
            <div>
              <div className="text-text-tertiary text-sm mb-sm">Jobs Completed</div>
              <div className="text-3xl font-bold">{selectedMechanic.jobsCompleted}</div>
            </div>
            <div>
              <div className="text-text-tertiary text-sm mb-sm">Efficiency</div>
              <div className="text-3xl font-bold">{selectedMechanic.efficiency}%</div>
            </div>
            <div>
              <div className="text-text-tertiary text-sm mb-sm">Avg Time/Job</div>
              <div className="text-3xl font-bold">{selectedMechanic.avgTimePerJob}h</div>
            </div>
            <div>
              <div className="text-text-tertiary text-sm mb-sm">Customer Rating</div>
              <div className="text-3xl font-bold">⭐ {selectedMechanic.rating}</div>
            </div>
          </div>

          <div className="grid grid-2 gap-lg">
            <div>
              <div className="text-text-tertiary text-sm mb-sm">Hours Worked</div>
              <div className="font-bold">{selectedMechanic.hoursWorked}h this month</div>
            </div>
            <div>
              <div className="text-text-tertiary text-sm mb-sm">Join Date</div>
              <div className="font-bold">{selectedMechanic.joinDate}</div>
            </div>
          </div>

          <div className="mt-lg flex gap-md">
            <button className="btn btn-secondary flex-1">View Job History</button>
            <button className="btn btn-secondary flex-1">Performance Report</button>
            <button className="btn btn-primary flex-1">Assign Job</button>
          </div>
        </div>
      )}

      {/* Efficiency Comparison */}
      <div className="card">
        <h3 className="text-lg font-bold mb-lg">Efficiency Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mechanics}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip contentStyle={{ background: "rgba(20,25,35,0.95)", border: "1px solid rgba(255,255,255,0.1)" }} />
            <Bar dataKey="efficiency" fill="#E30613" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
