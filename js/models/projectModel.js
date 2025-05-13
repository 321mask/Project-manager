/**
 * Module de gestion des projets
 */
const ProjectModel = (function () {
  // Stockage local des projets
  let projects = [];

  // Événements
  const EVENTS = {
    CREATED: "project-created",
    UPDATED: "project-updated",
    DELETED: "project-deleted",
    LOADED: "projects-loaded",
  };

  /**
   * Initialise le module
   */
  function init() {
    loadProjects();
  }

  /**
   * Charge les projets depuis le localStorage
   */
  function loadProjects() {
    projects = StorageService.get(StorageService.KEYS.PROJECTS, []);
    EventEmitter.emit(EVENTS.LOADED, projects);
  }

  /**
   * Sauvegarde les projets dans le localStorage
   */
  function saveProjects() {
    StorageService.save(StorageService.KEYS.PROJECTS, projects);
  }

  /**
   * Récupère tous les projets
   * @returns {Array} Liste des projets
   */
  function getAllProjects() {
    return [...projects];
  }

  /**
   * Récupère un projet par son ID
   * @param {string} id - ID du projet
   * @returns {Object|null} Projet trouvé ou null
   */
  function getProjectById(id) {
    return projects.find((project) => project.id === id) || null;
  }

  /**
   * Crée un nouveau projet
   * @param {Object} projectData - Données du projet
   * @returns {Object} Nouveau projet créé
   */
  function createProject(projectData) {
    const newProject = {
      id: Helpers.generateUUID(),
      title: projectData.title,
      description: projectData.description || "",
      client: projectData.client,
      deadline: projectData.deadline,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    projects.push(newProject);
    saveProjects();

    EventEmitter.emit(EVENTS.CREATED, newProject);

    return newProject;
  }

  /**
   * Met à jour un projet existant
   * @param {string} id - ID du projet
   * @param {Object} projectData - Nouvelles données du projet
   * @returns {Object|null} Projet mis à jour ou null
   */
  function updateProject(id, projectData) {
    const index = projects.findIndex((project) => project.id === id);

    if (index === -1) return null;

    // Mise à jour du projet
    const updatedProject = {
      ...projects[index],
      title: projectData.title,
      description: projectData.description || projects[index].description,
      client: projectData.client,
      deadline: projectData.deadline,
      updatedAt: new Date().toISOString(),
    };

    projects[index] = updatedProject;
    saveProjects();

    EventEmitter.emit(EVENTS.UPDATED, updatedProject);

    return updatedProject;
  }

  /**
   * Supprime un projet
   * @param {string} id - ID du projet à supprimer
   * @returns {boolean} Succès de la suppression
   */
  function deleteProject(id) {
    const initialLength = projects.length;
    projects = projects.filter((project) => project.id !== id);

    if (projects.length === initialLength) {
      return false;
    }

    saveProjects();
    EventEmitter.emit(EVENTS.DELETED, id);

    // Supprimer également les tâches associées au projet
    TaskModel.deleteTasksByProjectId(id);

    return true;
  }

  /**
   * Recherche des projets selon un terme
   * @param {string} searchTerm - Terme de recherche
   * @returns {Array} Projets correspondant à la recherche
   */
  function searchProjects(searchTerm) {
    if (!searchTerm || searchTerm.trim() === "") {
      return getAllProjects();
    }

    return Helpers.filterBySearchTerm(projects, searchTerm, [
      "title",
      "description",
      "client",
    ]);
  }

  /**
   * Calcule les statistiques des projets
   * @returns {Object} Statistiques des projets
   */
  function getProjectStats() {
    const allProjects = getAllProjects();
    const currentDate = new Date();

    // Projets actifs (deadline future)
    const activeProjects = allProjects.filter((project) => {
      const deadline = new Date(project.deadline);
      return deadline >= currentDate;
    });

    // Projets en retard
    const overdueProjects = allProjects.filter((project) => {
      const deadline = new Date(project.deadline);
      return deadline < currentDate;
    });

    // Projets par mois
    const projectsByMonth = allProjects.reduce((acc, project) => {
      const deadline = new Date(project.deadline);
      const monthKey = `${deadline.getFullYear()}-${(deadline.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;

      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }

      acc[monthKey].push(project);
      return acc;
    }, {});

    return {
      total: allProjects.length,
      active: activeProjects.length,
      overdue: overdueProjects.length,
      projectsByMonth,
    };
  }

  /**
   * Calcule la progression d'un projet
   * @param {string} projectId - ID du projet
   * @returns {number} Pourcentage de progression
   */
  function calculateProjectProgress(projectId) {
    const tasks = TaskModel.getTasksByProjectId(projectId);

    if (tasks.length === 0) {
      return 0;
    }

    const completedTasks = tasks.filter((task) => task.status === "completed");
    return Helpers.calculatePercentage(completedTasks.length, tasks.length);
  }

  // API publique
  return {
    init,
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    searchProjects,
    getProjectStats,
    calculateProjectProgress,
    EVENTS,
  };
})();
