import TaskModel from "../models/taskModel.js";
import EventBus from "../utils/events.js";

const TaskDetails = (() => {
  // DOM Elements
  let detailsContainer = null;

  document.addEventListener("DOMContentLoaded", () => {
    detailsContainer = document.getElementById("task-details");
  });

  const renderTaskDetails = (taskId) => {
    if (!detailsContainer) {
      detailsContainer = document.getElementById("task-details");
      if (!detailsContainer) {
        console.error("Task details container not found in DOM");
        return;
      }
    }

    const task = TaskModel.getTaskById(taskId);

    if (!task) {
      detailsContainer.innerHTML = "<p>Tâche non trouvée</p>";
      return;
    }

    // Construct the priority and status classes for styling
    const priorityClass = `priority-${task.priority}`;
    const statusClass = `status-${task.status}`;

    detailsContainer.innerHTML = `
      <div class="task-detail-header">
        <h2>${task.title}</h2>
        <div class="task-actions">
          <button class="btn btn-edit" data-task-id="${task.id}">
            <i class="fas fa-edit"></i> Modifier
          </button>
          <button class="btn btn-delete" data-task-id="${task.id}">
            <i class="fas fa-trash"></i> Supprimer
          </button>
        </div>
      </div>
      
      <div class="task-metadata">
        <div class="task-badge ${statusClass}">${getStatusLabel(
      task.status
    )}</div>
        <div class="task-badge ${priorityClass}">${getPriorityLabel(
      task.priority
    )}</div>
        ${
          task.assignee
            ? `<div class="task-assignee"><i class="fas fa-user"></i> ${task.assignee}</div>`
            : ""
        }
      </div>
      
      <div class="task-description">
        ${task.description ? task.description : "<em>Aucune description</em>"}
      </div>
    `;

    // Add event listeners for edit and delete buttons
    const editBtn = detailsContainer.querySelector(".btn-edit");
    if (editBtn) {
      editBtn.addEventListener("click", () => {
        EventBus.emit("editTask", task.id);
      });
    }

    const deleteBtn = detailsContainer.querySelector(".btn-delete");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        if (
          confirm(`Voulez-vous vraiment supprimer la tâche "${task.title}" ?`)
        ) {
          TaskModel.deleteTask(task.id);
          EventBus.emit("tasksUpdated");
          detailsContainer.innerHTML =
            "<p>Sélectionnez une tâche pour voir les détails</p>";
        }
      });
    }
  };

  // Helper functions for labels
  const getStatusLabel = (status) => {
    const labels = {
      todo: "À faire",
      "in-progress": "En cours",
      completed: "Terminée",
      blocked: "Bloquée",
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      high: "Priorité haute",
      medium: "Priorité moyenne",
      low: "Priorité basse",
    };
    return labels[priority] || priority;
  };

  // Listen for task selection events
  EventBus.on("taskSelected", renderTaskDetails);

  return {
    renderTaskDetails,
  };
})();

export default TaskDetails;
