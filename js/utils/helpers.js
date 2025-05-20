/**
 * Fonctions utilitaires pour l'application
 */

const Helpers = (function () {
  /**
   * Génère un identifiant unique
   * @returns {string} UUID v4
   */
  function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  /**
   * Formatte une date au format local
   * @param {string} dateString - Date au format ISO
   * @returns {string} Date formattée localement
   */
  function formatDate(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  /**
   * Calcule le nombre de jours restants jusqu'à une date
   * @param {string} dateString - Date au format ISO
   * @returns {number} Nombre de jours restants
   */
  function daysUntil(dateString) {
    if (!dateString) return 0;

    const targetDate = new Date(dateString);
    const currentDate = new Date();

    // Réinitialiser les heures pour comparer uniquement les jours
    targetDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    const differenceTime = targetDate.getTime() - currentDate.getTime();
    return Math.ceil(differenceTime / (1000 * 3600 * 24));
  }

  /**
   * Calcule le pourcentage d'avancement
   * @param {number} completed - Quantité complétée
   * @param {number} total - Quantité totale
   * @returns {number} Pourcentage arrondi
   */
  function calculatePercentage(completed, total) {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }

  /**
   * Tronque un texte à une longueur maximale
   * @param {string} text - Texte à tronquer
   * @param {number} maxLength - Longueur maximale
   * @returns {string} Texte tronqué
   */
  function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  }

  /**
   * Filtre un tableau d'objets en fonction d'un terme de recherche
   * @param {Array} array - Tableau d'objets
   * @param {string} searchTerm - Terme de recherche
   * @param {Array} fields - Champs à rechercher
   * @returns {Array} Tableau filtré
   */
  function filterBySearchTerm(array, searchTerm, fields) {
    if (!searchTerm || !searchTerm.trim()) return array;

    const term = searchTerm.toLowerCase().trim();

    return array.filter((item) => {
      return fields.some((field) => {
        const value = item[field];
        return value && String(value).toLowerCase().includes(term);
      });
    });
  }

  /**
   * Trie un tableau d'objets par un champ spécifique
   * @param {Array} array - Tableau d'objets
   * @param {string} field - Champ pour le tri
   * @param {boolean} ascending - Ordre ascendant ou descendant
   * @returns {Array} Tableau trié
   */
  function sortByField(array, field, ascending = true) {
    const sortedArray = [...array];

    sortedArray.sort((a, b) => {
      let valueA = a[field];
      let valueB = b[field];

      // Gestion des chaînes
      if (typeof valueA === "string") {
        valueA = valueA.toLowerCase();
      }
      if (typeof valueB === "string") {
        valueB = valueB.toLowerCase();
      }

      // Gestion des dates
      if (field.includes("date")) {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      }

      if (valueA < valueB) return ascending ? -1 : 1;
      if (valueA > valueB) return ascending ? 1 : -1;
      return 0;
    });

    return sortedArray;
  }

  /**
   * Groupe un tableau d'objets par un champ spécifique
   * @param {Array} array - Tableau d'objets
   * @param {string} field - Champ pour le groupement
   * @returns {Object} Objets groupés
   */
  function groupByField(array, field) {
    return array.reduce((groups, item) => {
      const value = item[field] || "Non défini";
      if (!groups[value]) {
        groups[value] = [];
      }
      groups[value].push(item);
      return groups;
    }, {});
  }

  /**
   * Convertit un objet en chaîne de paramètres d'URL
   * @param {Object} params - Objet de paramètres
   * @returns {string} Chaîne de paramètres
   */
  function paramsToQueryString(params) {
    return Object.keys(params)
      .filter(
        (key) =>
          params[key] !== undefined &&
          params[key] !== null &&
          params[key] !== ""
      )
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
      )
      .join("&");
  }

  /**
   * Création d'un élément DOM avec des attributs et contenu
   * @param {string} tag - Nom de la balise HTML
   * @param {Object} attributes - Attributs à ajouter
   * @param {string|Node|Array} content - Contenu de l'élément
   * @returns {HTMLElement} Élément créé
   */
  function createElement(tag, attributes = {}, content = null) {
    const element = document.createElement(tag);

    // Ajouter les attributs
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === "className") {
        element.className = value;
      } else if (key === "dataset") {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else {
        element.setAttribute(key, value);
      }
    });

    // Ajouter le contenu
    if (content !== null) {
      if (Array.isArray(content)) {
        content.forEach((item) => {
          if (typeof item === "string") {
            element.appendChild(document.createTextNode(item));
          } else {
            element.appendChild(item);
          }
        });
      } else if (typeof content === "string") {
        element.textContent = content;
      } else {
        element.appendChild(content);
      }
    }

    return element;
  }

  /**
   * Crée un badge pour afficher des statuts ou priorités
   * @param {string} type - Type de badge (status ou priority)
   * @param {string} value - Valeur du badge
   * @returns {HTMLElement} Élément badge
   */
  function createBadge(type, value) {
    const badgeLabels = {
      status: {
        todo: "À faire",
        "in-progress": "En cours",
        completed: "Terminée",
        blocked: "Bloquée",
      },
      priority: {
        low: "Basse",
        medium: "Moyenne",
        high: "Haute",
      },
    };

    const className = `badge badge-${type}-${value}`;
    const label = badgeLabels[type][value] || value;

    return createElement("span", { className }, label);
  }

  // API publique
  return {
    generateUUID,
    formatDate,
    daysUntil,
    calculatePercentage,
    truncateText,
    filterBySearchTerm,
    sortByField,
    groupByField,
    paramsToQueryString,
    createElement,
    createBadge,
  };
})();
export default Helpers;
