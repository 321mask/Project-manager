import ProjectModel from "../models/projectModel.js";
import EventBus from "../utils/events.js";

const ProjectList = (() => {
  const container = document.getElementById("projects-list");

  const render = () => {
    const projects = ProjectModel.getAllProjects();
    container.innerHTML = "";

    projects.forEach((project) => {
      const item = document.createElement("div");
      item.className = "project-item";
      item.textContent = project.title;
      item.addEventListener("click", () => {
        EventBus.emit("projectSelected", project.id);
      });
      container.appendChild(item);
    });
  };

  EventBus.on("projectsUpdated", render);
  return { render };
})();

export default ProjectList;
