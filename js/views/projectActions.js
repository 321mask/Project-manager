import ProjectModel from "../models/projectModel.js";
import EventBus from "../utils/events.js";

const ProjectActions = (() => {
  // Keep track of the current project being viewed
  let currentProjectId = null;

  // Initialize the component
  const init = () => {
    setupEventDelegation();
    listenForEvents();
  };

  // Set up event delegation for project actions
  const setupEventDelegation = () => {
    // Use event delegation since buttons might be added dynamically
    document.addEventListener("click", (e) => {
      // Edit project button - using data attributes instead of IDs
      if (e.target.closest('[data-action="edit-project"]')) {
        const projectId = e.target.closest('[data-action="edit-project"]')
          .dataset.projectId;
        if (projectId) {
          EventBus.emit("editProject", projectId);
        }
      }

      // Delete project button - using data attributes instead of IDs
      if (e.target.closest('[data-action="delete-project"]')) {
        const projectId = e.target.closest('[data-action="delete-project"]')
          .dataset.projectId;
        const projectTitle = e.target.closest('[data-action="delete-project"]')
          .dataset.projectTitle;

        if (projectId) {
          handleDeleteProject(projectId, projectTitle);
        }
      }
    });
  };

  // Listen for project selection events
  const listenForEvents = () => {
    EventBus.on("projectSelected", (projectId) => {
      currentProjectId = projectId;
      renderProjectActions(projectId);
    });
  };

  // Render the project actions
  const renderProjectActions = (projectId) => {
    const actionsContainer = document.querySelector(".project-actions");
    if (!actionsContainer) return;

    const project = ProjectModel.getProjectById(projectId);
    if (!project) return;

    actionsContainer.innerHTML = `
      <button data-action="edit-project" data-project-id="${project.id}" class="btn btn-secondary">
        <i class="fas fa-edit"></i> Modifier
      </button>
      <button data-action="delete-project" data-project-id="${project.id}" data-project-title="${project.title}" class="btn btn-danger">
        <i class="fas fa-trash"></i> Supprimer
      </button>
    `;
  };

  // Handle deleting a project
  const handleDeleteProject = (projectId, projectTitle) => {
    if (
      confirm(`Voulez-vous vraiment supprimer le projet "${projectTitle}" ?`)
    ) {
      ProjectModel.deleteProject(projectId);
      EventBus.emit("projectsUpdated");

      // Select another project if available
      const projects = ProjectModel.getAllProjects();
      if (projects.length > 0) {
        EventBus.emit("projectSelected", projects[0].id);
      } else {
        // No projects left, show empty state
        document.getElementById("project-title").textContent = "";
        document.getElementById("tasks-list").innerHTML = `
          <div class="empty-state">
            <p>Aucun projet disponible</p>
            <button id="create-first-project" class="btn btn-primary">
              <i class="fas fa-plus"></i> Créer un projet
            </button>
          </div>
        `;

        document
          .getElementById("create-first-project")
          ?.addEventListener("click", () => {
            EventBus.emit("newProject");
          });
      }
    }
  };

  // Handle editing a project
  EventBus.on("editProject", (projectId) => {
    const project = ProjectModel.getProjectById(projectId);
    if (!project) return;

    // Get form elements
    const projectModal = document.getElementById("project-modal");
    const projectFormTitle = document.getElementById("project-form-title");
    const projectFormClient = document.getElementById("project-form-client");
    const projectFormDeadline = document.getElementById(
      "project-form-deadline"
    );
    const projectFormDescription = document.getElementById(
      "project-form-description"
    );
    const projectTitleEl = document.getElementById("project-modal-title");

    // Set form values
    if (projectFormTitle) projectFormTitle.value = project.title || "";
    if (projectFormClient) projectFormClient.value = project.client || "";
    if (projectFormDeadline) projectFormDeadline.value = project.deadline || "";
    if (projectFormDescription)
      projectFormDescription.value = project.description || "";

    // Change modal title
    if (projectTitleEl) projectTitleEl.textContent = "Modifier le Projet";

    // Store the project ID in a data attribute on the form
    const projectForm = document.getElementById("project-form");
    if (projectForm) projectForm.dataset.editMode = "true";
    if (projectForm) projectForm.dataset.projectId = projectId;

    // Show the modal
    if (projectModal) projectModal.style.display = "flex";
  });

  return {
    init,
    renderProjectActions,
  };
})();

export default ProjectActions;
