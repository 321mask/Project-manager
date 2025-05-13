import ProjectModel from "../models/projectModel.js";
import TaskModel from "../models/taskModel.js";
import EventBus from "../utils/events.js";

const Forms = (() => {
  const projectForm = document.getElementById("project-form");
  const taskForm = document.getElementById("task-form");

  console.log("Binding to project form:", projectForm);
  projectForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
      title: document.getElementById("project-form-title").value,
      client: document.getElementById("project-form-client").value,
      deadline: document.getElementById("project-form-deadline").value,
      description: document.getElementById("project-form-description").value,
    };
    ProjectModel.createProject(data);
    EventBus.emit("projectsUpdated");
    closeModals();
  });

  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
      title: document.getElementById("task-form-title").value,
      description: document.getElementById("task-form-description").value,
      priority: document.getElementById("task-form-priority").value,
      status: document.getElementById("task-form-status").value,
      assignee: document.getElementById("task-form-assignee").value,
      projectId: ProjectModel.getAllProjects().find(
        (p) => p.title === document.getElementById("project-title").textContent
      )?.id,
    };
    TaskModel.createTask(data);
    EventBus.emit("tasksUpdated");
    closeModals();
  });

  function closeModals() {
    document
      .querySelectorAll(".modal")
      .forEach((modal) => (modal.style.display = "none"));
  }

  return {};
})();

export default Forms;
