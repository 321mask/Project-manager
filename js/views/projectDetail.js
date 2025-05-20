import ProjectModel from "../models/projectModel.js";
import TaskModel from "../models/taskModel.js";
import EventBus from "../utils/events.js";
import Helpers from "../utils/helpers.js";

const ProjectDetail = (() => {
  const titleEl = document.getElementById("project-title");
  const clientEl = document.getElementById("project-client");
  const deadlineEl = document.getElementById("project-deadline");
  const descriptionEl = document.getElementById("project-description");
  const progressBar = document.getElementById("project-progress");
  const progressPercent = document.getElementById("progress-percentage");
  const view = document.getElementById("project-view");

  const render = (projectId) => {
    const project = ProjectModel.getProjectById(projectId);
    if (!project) return;

    titleEl.textContent = project.title;
    clientEl.textContent = project.client;
    deadlineEl.textContent = Helpers.formatDate(project.deadline);
    descriptionEl.textContent = project.description;

    const tasks = TaskModel.getTasksByProject(projectId);
    const completed = tasks.filter((t) => t.status === "completed").length;
    const progress = tasks.length
      ? Math.round((completed / tasks.length) * 100)
      : 0;

    progressBar.style.width = progress + "%";
    progressPercent.textContent = progress + "%";

    document
      .querySelectorAll(".view")
      .forEach((v) => v.classList.add("hidden"));
    view.classList.remove("hidden");
  };

  EventBus.on("projectSelected", render);
  return { render };
})();

export default ProjectDetail;
