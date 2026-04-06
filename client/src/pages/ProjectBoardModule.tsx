import NewAppLayout from "@/components/NewAppLayout";
import { Plus, Trash2, Clock } from "lucide-react";
import { useState } from "react";
import FilterBar from "@/components/FilterBar";

export default function ProjectBoardModule() {
  const [tasks, setTasks] = useState({
    todo: [
      { id: 1, title: "Engine Overhaul - Toyota", customer: "John Mensah", priority: "High", dueDate: "2026-04-08" },
      { id: 2, title: "Brake System Inspection", customer: "Ama Boateng", priority: "Medium", dueDate: "2026-04-07" },
    ],
    inProgress: [
      { id: 3, title: "Transmission Repair", customer: "Kwame Asare", priority: "High", dueDate: "2026-04-06" },
      { id: 4, title: "Oil Change & Filter", customer: "Nana Owusu", priority: "Low", dueDate: "2026-04-06" },
    ],
    review: [
      { id: 5, title: "Suspension Work - Ford", customer: "Yaw Mensah", priority: "Medium", dueDate: "2026-04-05" },
    ],
    completed: [
      { id: 6, title: "Tire Replacement", customer: "Abena Kuma", priority: "Low", dueDate: "2026-04-04" },
      { id: 7, title: "Electrical System Check", customer: "Walk-In", priority: "Medium", dueDate: "2026-04-03" },
    ],
  });

  const [draggedTask, setDraggedTask] = useState<{ id: number; from: string } | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "#e30613";
      case "Medium": return "#f59e0b";
      case "Low": return "#14b8a6";
      default: return "#b0b8c8";
    }
  };

  const handleDragStart = (taskId: number, from: string) => {
    setDraggedTask({ id: taskId, from });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (to: string) => {
    if (!draggedTask) return;

    const taskToMove = tasks[draggedTask.from as keyof typeof tasks].find(t => t.id === draggedTask.id);
    if (!taskToMove) return;

    setTasks(prev => ({
      ...prev,
      [draggedTask.from]: prev[draggedTask.from as keyof typeof prev].filter(t => t.id !== draggedTask.id),
      [to]: [...prev[to as keyof typeof prev], taskToMove],
    }));

    setDraggedTask(null);
  };

  const handleDeleteTask = (taskId: number, from: string) => {
    setTasks(prev => ({
      ...prev,
      [from]: prev[from as keyof typeof prev].filter(t => t.id !== taskId),
    }));
  };

  const columns = [
    { key: "todo", title: "To Do", color: "#b0b8c8" },
    { key: "inProgress", title: "In Progress", color: "#f59e0b" },
    { key: "review", title: "Review", color: "#6366f1" },
    { key: "completed", title: "Completed", color: "#14b8a6" },
  ];

  return (
    <NewAppLayout currentPage="tasks">
      <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#0f172a" }}>
        <FilterBar showDateRange showStatus={false} showChannel={false} showPaymentMethod={false} />

        <div style={{ padding: "2rem", flex: 1, overflow: "auto" }}>
          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.875rem", fontWeight: "700", color: "#ffffff", margin: "0 0 0.5rem 0" }}>Project Board</h1>
            <p style={{ fontSize: "0.875rem", color: "#b0b8c8", margin: 0 }}>Manage workshop tasks and vehicle service projects</p>
          </div>

          {/* Kanban Board */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", overflow: "auto" }}>
            {columns.map((column) => (
              <div key={column.key} style={{
                backgroundColor: "#1a1f2e",
                border: "1px solid #2a3447",
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                minHeight: "600px",
              }}>
                {/* Column Header */}
                <div style={{
                  padding: "1.5rem",
                  borderBottom: "2px solid #2a3447",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: column.color,
                    }} />
                    <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "#ffffff", margin: 0 }}>
                      {column.title}
                    </h3>
                    <span style={{
                      padding: "0.25rem 0.5rem",
                      backgroundColor: "#2a3447",
                      color: "#7a8294",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                    }}>
                      {tasks[column.key as keyof typeof tasks].length}
                    </span>
                  </div>
                  <button style={{
                    padding: "0.5rem",
                    backgroundColor: "transparent",
                    color: "#7a8294",
                    border: "1px solid #2a3447",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#e30613";
                      e.currentTarget.style.borderColor = "#e30613";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#7a8294";
                      e.currentTarget.style.borderColor = "#2a3447";
                    }}
                  >
                    <Plus size={18} />
                  </button>
                </div>

                {/* Tasks Container */}
                <div
                  style={{
                    flex: 1,
                    padding: "1rem",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(column.key)}
                >
                  {tasks[column.key as keyof typeof tasks].map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id, column.key)}
                      style={{
                        backgroundColor: "#0f172a",
                        border: "1px solid #2a3447",
                        borderRadius: "8px",
                        padding: "1rem",
                        cursor: "grab",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = column.color;
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#2a3447";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      {/* Task Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.75rem" }}>
                        <h4 style={{ fontSize: "0.95rem", fontWeight: "600", color: "#ffffff", margin: 0, flex: 1 }}>
                          {task.title}
                        </h4>
                        <button
                          onClick={() => handleDeleteTask(task.id, column.key)}
                          style={{
                            padding: "0.25rem",
                            backgroundColor: "transparent",
                            color: "#7a8294",
                            border: "none",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#e30613";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "#7a8294";
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Task Details */}
                      <div style={{ fontSize: "0.75rem", color: "#b0b8c8", marginBottom: "0.75rem" }}>
                        {task.customer}
                      </div>

                      {/* Priority and Due Date */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{
                          display: "inline-block",
                          padding: "0.25rem 0.5rem",
                          backgroundColor: `${getPriorityColor(task.priority)}33`,
                          color: getPriorityColor(task.priority),
                          borderRadius: "4px",
                          fontSize: "0.7rem",
                          fontWeight: "600",
                        }}>
                          {task.priority}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.7rem", color: "#7a8294" }}>
                          <Clock size={12} />
                          {task.dueDate}
                        </div>
                      </div>
                    </div>
                  ))}

                  {tasks[column.key as keyof typeof tasks].length === 0 && (
                    <div style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#7a8294",
                      fontSize: "0.875rem",
                      textAlign: "center",
                    }}>
                      No tasks yet
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </NewAppLayout>
  );
}
