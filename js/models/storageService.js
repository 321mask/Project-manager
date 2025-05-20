/**
 * Service de stockage pour persister les données dans le localStorage
 */
const StorageService = (function () {
  // Clés de stockage
  const STORAGE_KEYS = {
    PROJECTS: "project_manager_projects",
    TASKS: "project_manager_tasks",
  };

  /**
   * Récupère les données depuis le localStorage
   * @param {string} key - Clé de stockage
   * @returns {Array|Object} Données récupérées ou valeur par défaut
   */
  function get(key, defaultValue = []) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des données (${key}):`,
        error
      );
      return defaultValue;
    }
  }

  /**
   * Enregistre des données dans le localStorage
   * @param {string} key - Clé de stockage
   * @param {Array|Object} data - Données à enregistrer
   */
  function save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(
        `Erreur lors de l'enregistrement des données (${key}):`,
        error
      );

      // Notification d'erreur
      EventEmitter.emit("notification", {
        type: "error",
        message:
          "Impossible d'enregistrer les données. Espace de stockage insuffisant ou erreur de navigateur.",
      });
    }
  }

  /**
   * Exporte toutes les données au format JSON
   * @returns {string} Données exportées en JSON
   */
  function exportData() {
    const projects = get(STORAGE_KEYS.PROJECTS);
    const tasks = get(STORAGE_KEYS.TASKS);

    const exportObject = {
      projects,
      tasks,
      metadata: {
        exportDate: new Date().toISOString(),
        version: "1.0",
      },
    };

    return JSON.stringify(exportObject, null, 2);
  }

  /**
   * Importe des données au format JSON
   * @param {string} jsonData - Données JSON à importer
   * @returns {boolean} Succès de l'importation
   */
  function importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);

      // Vérification de la structure des données
      if (
        !data.projects ||
        !Array.isArray(data.projects) ||
        !data.tasks ||
        !Array.isArray(data.tasks)
      ) {
        throw new Error("Format de données invalide");
      }

      // Sauvegarde des données
      save(STORAGE_KEYS.PROJECTS, data.projects);
      save(STORAGE_KEYS.TASKS, data.tasks);

      // Notification de succès
      EventEmitter.emit("data-imported");

      return true;
    } catch (error) {
      console.error("Erreur lors de l'importation des données:", error);

      // Notification d'erreur
      EventEmitter.emit("notification", {
        type: "error",
        message: "Format de données invalide. L'importation a échoué.",
      });

      return false;
    }
  }

  /**
   * Efface toutes les données stockées
   */
  function clearAllData() {
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
  }

  // API publique
  return {
    KEYS: STORAGE_KEYS,
    get,
    save,
    exportData,
    importData,
    clearAllData,
  };
})();
export default StorageService;
