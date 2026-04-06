import { useState } from "react";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  assignee: string;
  dueDate: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const initialColumns: Column[] = [
  {
    id: "todo",
    title: "To Do",
    tasks: [
      {
        id: "1",
        title: "Engine Diagnostics",
        description: "Complete engine scan for GN 123-45",
        priority: "high",
        assignee: "John",
        dueDate: "2026-04-06",
      },
      {
        id: "2",
        title: "Parts Inventory Check",
        description: "Verify stock levels",
        priority: "medium",
        assignee: "Peter",
        dueDate: "2026-04-07",
      },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    tasks: [
      {
        id: "3",
        title: "Brake Pad Replacement",
        description: "Replace front brake pads - GN 456-78",
        priority: "high",
        assignee: "Samuel",
        dueDate: "2026-04-05",
      },
    ],
  },
  {
    id: "review",
    title: "Review",
    tasks: [
      {
        id: "4",
        title: "Quality Check - Oil Change",
        description: "Verify oil change completion",
        priority: "medium",
        assignee: "John",
        dueDate: "2026-04-05",
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    tasks: [
      {
        id: "5",
        title: "Tire Rotation",
        description: "Completed tire rotation - GN 789-01",
        priority: "low",
        assignee: "Peter",
        dueDate: "2026-04-04",
      },
    ],
  },
];

const priorityColors = {
  high: "border-l-4 border-danger",
  medium: "border-l-4 border-warning",
  low: "border-l-4 border-success",
};

export default function Kanban() {
  const [columns, setColumns] = useState(initialColumns);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("todo");

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: "",
      priority: "medium",
      assignee: "Unassigned",
      dueDate: new Date().toISOString().split("T")[0],
    };

    setColumns((prev) =>
      prev.map((col) =>
        col.id === selectedColumn
          ? { ...col, tasks: [...col.tasks, newTask] }
          : col
      )
    );

    setNewTaskTitle("");
  };

  return (
    <div className="flex flex-col gap-lg">
      {/* Add Task Form */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-lg">Project Board</h2>

        <form onSubmit={handleAddTask} className="flex gap-md">
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            className="form-control max-w-xs"
          >
            {columns.map((col) => (
              <option key={col.id} value={col.id}>
                {col.title}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add new task..."
            className="form-control flex-1"
          />

          <button type="submit" className="btn btn-primary">
            Add Task
          </button>
        </form>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-4 gap-md">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col gap-md">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">{column.title}</h3>
              <span className="badge badge-primary">{column.tasks.length}</span>
            </div>

            <div className="flex flex-col gap-md">
              {column.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`card card-compact cursor-move hover:shadow-md transition-all ${
                    priorityColors[task.priority]
                  }`}
                >
                  <h4 className="font-bold text-sm mb-sm">{task.title}</h4>
                  <p className="text-xs text-text-tertiary mb-md">
                    {task.description}
                  </p>

                  <div className="flex justify-between items-center text-xs">
                    <div className="flex gap-sm">
                      <span
                        className={`badge ${
                          task.priority === "high"
                            ? "badge-danger"
                            : task.priority === "medium"
                            ? "badge-warning"
                            : "badge-success"
                        }`}
                      >
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-text-muted">{task.dueDate}</span>
                  </div>

                  <div className="mt-md pt-md border-t border-border-light flex items-center gap-sm">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-primary-light">
                      {task.assignee.charAt(0)}
                    </div>
                    <span className="text-xs text-text-tertiary">
                      {task.assignee}
                    </span>
                  </div>
                </div>
              ))}

              {column.tasks.length === 0 && (
                <div className="card card-compact text-center py-lg">
                  <p className="text-text-muted text-sm">No tasks</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
