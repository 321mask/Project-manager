/**
 * Système d'événements personnalisé pour la communication entre les modules
 */
const EventEmitter = (function () {
  // Stockage des abonnements aux événements
  const events = {};

  /**
   * S'abonner à un événement
   * @param {string} event - Nom de l'événement
   * @param {function} listener - Fonction callback à exécuter
   * @returns {function} Fonction pour se désabonner
   */
  function on(event, listener) {
    if (!events[event]) {
      events[event] = [];
    }
    events[event].push(listener);

    // Retourner une fonction pour se désabonner
    return function () {
      off(event, listener);
    };
  }

  /**
   * Se désabonner d'un événement
   * @param {string} event - Nom de l'événement
   * @param {function} listenerToRemove - Fonction callback à supprimer
   */
  function off(event, listenerToRemove) {
    if (!events[event]) return;

    events[event] = events[event].filter(
      (listener) => listener !== listenerToRemove
    );

    // Nettoyer le tableau si vide
    if (events[event].length === 0) {
      delete events[event];
    }
  }

  /**
   * Déclencher un événement
   * @param {string} event - Nom de l'événement
   * @param {*} data - Données à transmettre aux abonnés
   */
  function emit(event, data) {
    if (!events[event]) return;

    // Copier le tableau pour éviter des problèmes si un listener modifie la liste pendant l'exécution
    const listeners = [...events[event]];

    listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error(
          `Erreur dans un listener pour l'événement "${event}":`,
          error
        );
      }
    });
  }

  /**
   * S'abonner à un événement une seule fois
   * @param {string} event - Nom de l'événement
   * @param {function} listener - Fonction callback à exécuter
   */
  function once(event, listener) {
    const onceListener = (data) => {
      listener(data);
      off(event, onceListener);
    };

    on(event, onceListener);
  }

  /**
   * Déboguer les événements actifs
   * @returns {Object} Nombre d'abonnés par événement
   */
  function debug() {
    const debugInfo = {};

    for (const event in events) {
      debugInfo[event] = events[event].length;
    }

    return debugInfo;
  }

  // API publique
  return {
    on,
    off,
    emit,
    once,
    debug,
  };
})();
export default EventEmitter;
