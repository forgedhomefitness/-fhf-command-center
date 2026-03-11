"use client";

import { useState, useEffect } from "react";
import { DEFAULT_TASKS } from "@/lib/constants";

const PRIORITY_COLORS = {
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const PRIORITY_LABELS = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newCategory, setNewCategory] = useState("General");
  const [filter, setFilter] = useState("all");

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("fhf-tasks");
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch {
        setTasks(DEFAULT_TASKS);
      }
    } else {
      setTasks(DEFAULT_TASKS);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("fhf-tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  function addTask(e) {
    e.preventDefault();
    if (!newTask.trim()) return;
    const task = {
      id: Date.now(),
      text: newTask.trim(),
      priority: newPriority,
      category: newCategory,
      done: false,
    };
    setTasks([task, ...tasks]);
    setNewTask("");
  }

  function toggleTask(id) {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function deleteTask(id) {
    setTasks(tasks.filter((t) => t.id !== id));
  }

  const filtered =
    filter === "all"
      ? tasks
      : filter === "active"
      ? tasks.filter((t) => !t.done)
      : tasks.filter((t) => t.done);

  const stats = {
    total: tasks.length,
    done: tasks.filter((t) => t.done).length,
    critical: tasks.filter((t) => t.priority === "critical" && !t.done).length,
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Task Manager</h1>
      <p className="text-sm text-dark-400 mb-6">
        {stats.done}/{stats.total} complete
        {stats.critical > 0 && (
          <span className="text-red-400 ml-2">
            ({stats.critical} critical pending)
          </span>
        )}
      </p>

      {/* Add Task Form */}
      <form onSubmit={addTask} className="card mb-6">
        <div className="flex gap-3 flex-col sm:flex-row">
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="flex-1 bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none"
          />
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
            className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
          >
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <input
            type="text"
            placeholder="Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-28 bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white placeholder-dark-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-brand-500 text-dark-950 font-semibold text-sm hover:bg-brand-400 transition-colors"
          >
            Add
          </button>
        </div>
      </form>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {["all", "active", "done"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              filter === f
                ? "bg-brand-500/10 text-brand-400 border border-brand-500/20"
                : "text-dark-400 hover:text-white border border-transparent"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-sm text-dark-500 italic">
              {filter === "done" ? "No completed tasks" : "No tasks — nice!"}
            </p>
          </div>
        ) : (
          filtered.map((task) => (
            <div
              key={task.id}
              className={`card flex items-center gap-3 py-3 transition-opacity ${
                task.done ? "opacity-50" : ""
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleTask(task.id)}
                className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  task.done
                    ? "bg-brand-500 border-brand-500"
                    : "border-dark-500 hover:border-brand-400"
                }`}
              >
                {task.done && (
                  <svg
                    className="w-3 h-3 text-dark-950"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>

              {/* Task content */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm ${
                    task.done
                      ? "line-through text-dark-500"
                      : "text-white"
                  }`}
                >
                  {task.text}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-[10px] font-medium uppercase px-1.5 py-0.5 rounded border ${
                      PRIORITY_COLORS[task.priority]
                    }`}
                  >
                    {PRIORITY_LABELS[task.priority]}
                  </span>
                  <span className="text-[10px] text-dark-500">
                    {task.category}
                  </span>
                </div>
              </div>

              {/* Delete */}
              <button
                onClick={() => deleteTask(task.id)}
                className="flex-shrink-0 text-dark-500 hover:text-red-400 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
