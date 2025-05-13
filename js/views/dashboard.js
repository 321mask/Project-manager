import ProjectModel from "../models/projectModel.js";
import TaskModel from "../models/taskModel.js";
import EventBus from "../utils/events.js";

const Dashboard = (() => {
  const activeProjectsCount = document.getElementById("active-projects-count");
  const ongoingTasksCount = document.getElementById("ongoing-tasks-count");
  const completedTasksCount = document.getElementById("completed-tasks-count");
  const blockedTasksCount = document.getElementById("blocked-tasks-count");

  const render = () => {
    const projects = ProjectModel.getAllProjects();
    const tasks = TaskModel.getAllTasks();

    activeProjectsCount.textContent = projects.length;
    ongoingTasksCount.textContent = tasks.filter(
      (t) => t.status === "in-progress"
    ).length;
    completedTasksCount.textContent = tasks.filter(
      (t) => t.status === "completed"
    ).length;
    blockedTasksCount.textContent = tasks.filter(
      (t) => t.status === "blocked"
    ).length;

    // Plus de graphes à ajouter ici
  };

  EventBus.on("projectsUpdated", render);
  EventBus.on("tasksUpdated", render);

  return { render };
})();

export default Dashboard;
