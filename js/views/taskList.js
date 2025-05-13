import TaskModel from "../models/taskModel.js";
import EventBus from "../utils/events.js";

const TaskList = (() => {
  const listEl = document.getElementById("tasks-list");

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
    const tasks = TaskModel.getTasksByProject(projectId);
    const status = document.getElementById("status-filter").value;
    const priority = document.getElementById("priority-filter").value;
    const assignee = document.getElementById("assignee-filter").value;

    const filtered = filterTasks(tasks, status, priority, assignee);
    listEl.innerHTML = "";

    filtered.forEach((task) => {
      const div = document.createElement("div");
      div.className = "task-item";
      div.innerHTML = `<strong>${task.title}</strong> - ${task.status}`;
      listEl.appendChild(div);
    });
  };

  ["status-filter", "priority-filter", "assignee-filter"].forEach((id) => {
    document.getElementById(id).addEventListener("change", () => {
      const currentProject =
        document.getElementById("project-title").textContent;
      EventBus.emit("refreshTasks", currentProject);
    });
  });

  EventBus.on("projectSelected", render);
  EventBus.on("refreshTasks", render);
  EventBus.on("tasksUpdated", () => {
    const currentProject = document.getElementById("project-title").textContent;
    EventBus.emit("refreshTasks", currentProject);
  });

  return { render };
})();

export default TaskList;
