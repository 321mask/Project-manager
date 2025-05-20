// Import all required modules
import TaskModel from "../models/taskModel.js";
import EventBus from "../utils/events.js";

const TaskList = (() => {
  const listEl = document.getElementById("tasks-list");
  let currentProjectId = null;

  const filterTasks = (tasks, status, priority, assignee) => {
    return tasks.filter((task) => {
      return (
        (status === "all" || task.status === status) &&
        (priority === "all" || task.priority === priority) &&
        (assignee === "all" || task.assignee === assignee)
      );
    });
  };

  const render = (projectId) => {
    currentProjectId = projectId;
    const tasks = TaskModel.getTasksByProject(projectId);

    // Get filter values
    const statusFilter = document.getElementById("status-filter");
    const priorityFilter = document.getElementById("priority-filter");
    const assigneeFilter = document.getElementById("assignee-filter");

    // Check if filters exist in DOM
    const status = statusFilter ? statusFilter.value : "all";
    const priority = priorityFilter ? priorityFilter.value : "all";
    const assignee = assigneeFilter ? assigneeFilter.value : "all";

    const filtered = filterTasks(tasks, status, priority, assignee);

    if (!listEl) {
      console.error("Tasks list element not found in DOM");
      return;
    }

    listEl.innerHTML = "";

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <p>Aucune tâche ne correspond à vos critères</p>
          <button id="add-task-btn" class="btn btn-primary">
            <i class="fas fa-plus"></i> Nouvelle tâche
          </button>
        </div>
      `;

      // Add event listener to the "add task" button
      document.getElementById("add-task-btn")?.addEventListener("click", () => {
        EventBus.emit("newTask", currentProjectId);
      });
      return;
    }

    // Add task button at the top
    const addTaskBtn = document.createElement("div");
    addTaskBtn.className = "add-task-container";
    addTaskBtn.innerHTML = `
      <button id="add-task-btn" class="btn btn-primary">
        <i class="fas fa-plus"></i> Nouvelle tâche
      </button>
    `;
    listEl.appendChild(addTaskBtn);

    // Add event listener to the "add task" button
    document.getElementById("add-task-btn")?.addEventListener("click", () => {
      EventBus.emit("newTask", currentProjectId);
    });

    // Render filtered tasks
    filtered.forEach((task) => {
      const statusClass = `status-${task.status}`;
      const priorityClass = `priority-${task.priority}`;

      const div = document.createElement("div");
      div.className = `task-item ${statusClass} ${priorityClass}`;
      div.setAttribute("data-task-id", task.id);

      div.innerHTML = `
        <div class="task-item-header">
          <span class="task-title">${task.title}</span>
          <span class="task-status">${getStatusEmoji(task.status)}</span>
        </div>
        <div class="task-item-meta">
          ${
            task.assignee
              ? `<span class="task-assignee">${task.assignee}</span>`
              : ""
          }
          <span class="task-priority">${getPriorityDot(task.priority)}</span>
        </div>
      `;

      // Add click event to show task details
      div.addEventListener("click", () => {
        // Remove selected class from all tasks
        document.querySelectorAll(".task-item").forEach((item) => {
          item.classList.remove("selected");
        });

        // Add selected class to clicked task
        div.classList.add("selected");

        // Emit event to show task details
        EventBus.emit("taskSelected", task.id);
      });

      listEl.appendChild(div);
    });
  };

  // Helper functions for status and priority indicators
  const getStatusEmoji = (status) => {
    const emojis = {
      todo: "📝",
      "in-progress": "⏳",
      completed: "✅",
      blocked: "🚫",
    };
    return emojis[status] || "❓";
  };

  const getPriorityDot = (priority) => {
    const colors = {
      high: "🔴",
      medium: "🟠",
      low: "🟢",
    };
    return colors[priority] || "⚪";
  };

  // Event listeners for filters
  document.addEventListener("DOMContentLoaded", () => {
    ["status-filter", "priority-filter", "assignee-filter"].forEach((id) => {
      const filterEl = document.getElementById(id);
      if (filterEl) {
        filterEl.addEventListener("change", () => {
          if (currentProjectId) {
            render(currentProjectId);
          }
        });
      }
    });
  });

  // Event listeners for project and task events
  EventBus.on("projectSelected", render);
  EventBus.on("refreshTasks", render);
  EventBus.on("tasksUpdated", () => {
    if (currentProjectId) {
      render(currentProjectId);
    }
  });

  return { render };
})();

export default TaskList;
