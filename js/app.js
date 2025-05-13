import ProjectList from "./views/projectList.js";
import ProjectDetail from "./views/projectDetail.js";
import TaskList from "./views/taskList.js";
import Forms from "./views/forms.js";
import Dashboard from "./views/dashboard.js";

document.addEventListener("DOMContentLoaded", () => {
  ProjectList.render();
  Dashboard.render();
});
