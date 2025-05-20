import ProjectModel from "../models/projectModel.js";
import TaskModel from "../models/taskModel.js";
import EventBus from "../utils/events.js";

const Forms = (() => {
  // State variables for tracking current task edit
  let isTaskEditMode = false;
  let currentTaskId = null;
  let currentProjectId = null;

  function closeModals() {
    document
      .querySelectorAll(".modal")
      .forEach((modal) => (modal.style.display = "none"));
  }

  document.addEventListener("DOMContentLoaded", () => {
    // DOM elements
    const newProjectBtn = document.getElementById("new-project-btn");
    const projectModal = document.getElementById("project-modal");
    const taskModal = document.getElementById("task-modal");
    const closeModalElements = document.querySelectorAll(
      ".close-modal, .cancel-modal"
    );
    const projectForm = document.getElementById("project-form");
    const taskForm = document.getElementById("task-form");
    const taskModalTitle = document.getElementById("task-modal-title");
    const projectModalTitle = document.getElementById("project-modal-title");

    // Open project modal for new project
    newProjectBtn?.addEventListener("click", () => {
      // Reset form
      if (projectForm) {
        projectForm.reset();
        projectForm.dataset.editMode = "false";
        projectForm.dataset.projectId = "";
      }

      // Update modal title
      if (projectModalTitle) {
        projectModalTitle.textContent = "Nouveau Projet";
      }

      // Show modal
      projectModal.style.display = "flex";
    });

    // Close modals
    closeModalElements.forEach((el) =>
      el.addEventListener("click", () => {
        closeModals();
      })
    );

    // Optional: click outside to close
    window.addEventListener("click", (e) => {
      if (e.target === projectModal || e.target === taskModal) {
        closeModals();
      }
    });

    // Project form submission
    projectForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = {
        title: document.getElementById("project-form-title").value,
        client: document.getElementById("project-form-client").value,
        deadline: document.getElementById("project-form-deadline").value,
        description: document.getElementById("project-form-description").value,
      };

      const isEditMode = projectForm.dataset.editMode === "true";
      const projectId = projectForm.dataset.projectId;

      if (isEditMode && projectId) {
        // Update existing project
        ProjectModel.updateProject(projectId, data);
      } else {
        // Create new project
        ProjectModel.createProject(data);
      }

      EventBus.emit("projectsUpdated");
      closeModals();
    });

    // Task form submission
    taskForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = {
        title: document.getElementById("task-form-title").value,
        description: document.getElementById("task-form-description").value,
        priority: document.getElementById("task-form-priority").value,
        status: document.getElementById("task-form-status").value,
        assignee: document.getElementById("task-form-assignee").value,
        projectId:
          currentProjectId ||
          ProjectModel.getAllProjects().find(
            (p) =>
              p.title === document.getElementById("project-title").textContent
          )?.id,
      };

      if (isTaskEditMode && currentTaskId) {
        // Update existing task
        TaskModel.updateTask(currentTaskId, data);
      } else {
        // Create new task
        TaskModel.createTask(data);
      }

      EventBus.emit("tasksUpdated");
      closeModals();

      // Reset form state
      isTaskEditMode = false;
      currentTaskId = null;
    });

    // Listen for "new task" event
    EventBus.on("newTask", (projectId) => {
      // Reset form
      taskForm.reset();

      // Set state for new task
      isTaskEditMode = false;
      currentTaskId = null;
      currentProjectId = projectId;

      // Update modal title
      taskModalTitle.textContent = "Nouvelle Tâche";

      // Show modal
      taskModal.style.display = "block";
    });

    // Listen for "edit task" event
    EventBus.on("editTask", (taskId) => {
      // Get task data
      const task = TaskModel.getTaskById(taskId);
      if (!task) return;

      // Set form values
      document.getElementById("task-form-title").value = task.title;
      document.getElementById("task-form-description").value =
        task.description || "";
      document.getElementById("task-form-priority").value = task.priority;
      document.getElementById("task-form-status").value = task.status;
      document.getElementById("task-form-assignee").value = task.assignee || "";

      // Set state for edit mode
      isTaskEditMode = true;
      currentTaskId = taskId;
      currentProjectId = task.projectId;

      // Update modal title
      taskModalTitle.textContent = "Modifier la Tâche";

      // Show modal
      taskModal.style.display = "block";
    });
  });

  return {
    closeModals,
  };
})();

export default Forms;
