import { useState } from "react";

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  status: "completed" | "in-progress" | "pending";
  participants: number;
  progress: number;
}

const trainingModules: TrainingModule[] = [
  {
    id: "1",
    title: "Advanced Engine Diagnostics",
    description: "Learn modern engine diagnostic techniques and tools",
    instructor: "Mr. Mensah",
    duration: "8 hours",
    status: "completed",
    participants: 4,
    progress: 100,
  },
  {
    id: "2",
    title: "Customer Service Excellence",
    description: "Improve customer interaction and satisfaction",
    instructor: "Ms. Ama",
    duration: "4 hours",
    status: "in-progress",
    participants: 6,
    progress: 65,
  },
  {
    id: "3",
    title: "Safety & Compliance",
    description: "Workplace safety standards and compliance procedures",
    instructor: "Mr. Kofi",
    duration: "6 hours",
    status: "pending",
    participants: 8,
    progress: 0,
  },
  {
    id: "4",
    title: "Electrical Systems Repair",
    description: "Comprehensive electrical system troubleshooting",
    instructor: "Mr. Mensah",
    duration: "10 hours",
    status: "pending",
    participants: 3,
    progress: 0,
  },
];

export default function Training() {
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Staff Training</h2>
        <button className="btn btn-primary">+ New Training Module</button>
      </div>

      {/* Training Modules Grid */}
      <div className="grid grid-3 gap-md">
        {trainingModules.map((module) => (
          <div
            key={module.id}
            onClick={() => setSelectedModule(module)}
            className="card cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-md">
              <h3 className="font-bold text-sm flex-1">{module.title}</h3>
              <span
                className={`badge ${
                  module.status === "completed"
                    ? "badge-success"
                    : module.status === "in-progress"
                    ? "badge-warning"
                    : "badge-info"
                }`}
              >
                {module.status.replace("-", " ").toUpperCase()}
              </span>
            </div>

            <p className="text-xs text-text-tertiary mb-md">{module.description}</p>

            <div className="text-xs text-text-muted mb-md">
              <div>Instructor: {module.instructor}</div>
              <div>Duration: {module.duration}</div>
              <div>Participants: {module.participants}</div>
            </div>

            <div className="mb-md">
              <div className="flex justify-between text-xs mb-sm">
                <span className="text-text-tertiary">Progress</span>
                <span className="font-bold">{module.progress}%</span>
              </div>
              <div className="w-full bg-bg-tertiary rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-primary h-full transition-all"
                  style={{ width: `${module.progress}%` }}
                ></div>
              </div>
            </div>

            <button className="w-full btn btn-secondary btn-sm">
              {module.status === "completed" ? "View Certificate" : "View Details"}
            </button>
          </div>
        ))}
      </div>

      {/* Module Details */}
      {selectedModule && (
        <div className="card">
          <div className="flex justify-between items-start mb-lg">
            <div>
              <h3 className="text-2xl font-bold">{selectedModule.title}</h3>
              <p className="text-text-tertiary mt-sm">{selectedModule.description}</p>
            </div>
            <button
              onClick={() => setSelectedModule(null)}
              className="btn btn-secondary btn-sm"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-3 gap-lg mb-lg">
            <div>
              <div className="text-text-tertiary text-sm">Instructor</div>
              <div className="font-bold">{selectedModule.instructor}</div>
            </div>
            <div>
              <div className="text-text-tertiary text-sm">Duration</div>
              <div className="font-bold">{selectedModule.duration}</div>
            </div>
            <div>
              <div className="text-text-tertiary text-sm">Participants</div>
              <div className="font-bold">{selectedModule.participants}</div>
            </div>
          </div>

          <div className="mb-lg">
            <div className="flex justify-between items-center mb-md">
              <h4 className="font-bold">Completion Progress</h4>
              <span className="text-lg font-bold">{selectedModule.progress}%</span>
            </div>
            <div className="w-full bg-bg-tertiary rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-primary h-full transition-all"
                style={{ width: `${selectedModule.progress}%` }}
              ></div>
            </div>
          </div>

          {selectedModule.status === "pending" && (
            <button className="btn btn-primary w-full">Start Training</button>
          )}
          {selectedModule.status === "in-progress" && (
            <button className="btn btn-primary w-full">Continue Training</button>
          )}
          {selectedModule.status === "completed" && (
            <div className="flex gap-md">
              <button className="btn btn-success flex-1">Download Certificate</button>
              <button className="btn btn-secondary flex-1">View Results</button>
            </div>
          )}
        </div>
      )}

      {/* Participants Table */}
      <div className="card">
        <h3 className="text-lg font-bold mb-lg">Training Participants</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Module</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Completion Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>John Mensah</td>
              <td>Advanced Engine Diagnostics</td>
              <td><span className="badge badge-success">Completed</span></td>
              <td>
                <div className="w-24 bg-bg-tertiary rounded-full h-2 overflow-hidden">
                  <div className="bg-success-light h-full" style={{ width: "100%" }}></div>
                </div>
              </td>
              <td>2026-04-03</td>
            </tr>
            <tr>
              <td>Peter Kwame</td>
              <td>Customer Service Excellence</td>
              <td><span className="badge badge-warning">In Progress</span></td>
              <td>
                <div className="w-24 bg-bg-tertiary rounded-full h-2 overflow-hidden">
                  <div className="bg-warning h-full" style={{ width: "65%" }}></div>
                </div>
              </td>
              <td>-</td>
            </tr>
            <tr>
              <td>Samuel Osei</td>
              <td>Safety & Compliance</td>
              <td><span className="badge badge-info">Pending</span></td>
              <td>
                <div className="w-24 bg-bg-tertiary rounded-full h-2 overflow-hidden">
                  <div className="bg-info h-full" style={{ width: "0%" }}></div>
                </div>
              </td>
              <td>-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
