/*************************************************
 * error.js
 * Centralisation et normalisation des erreurs
 *************************************************/

/**
 * Types d'erreurs possibles dans l'application
 */
export const ERROR_TYPES = {
  PEER: "PEER_ERROR",
  MEDIA: "MEDIA_ERROR",
  NETWORK: "NETWORK_ERROR",
  UNKNOWN: "UNKNOWN_ERROR",
};

/**
 * Normalise une erreur brute (PeerJS, navigateur, JS)
 * en une erreur compréhensible par l'application
 */
export function normalizeError(err, source = "unknown") {
  if (!err) {
    return {
      type: ERROR_TYPES.UNKNOWN,
      source,
      message: "Erreur inconnue",
      raw: null,
    };
  }

  // Erreurs PeerJS
  if (err.type && err.type.includes("peer")) {
    return {
      type: ERROR_TYPES.PEER,
      source,
      message: getPeerErrorMessage(err),
      raw: err,
    };
  }

  // Erreurs média (micro / caméra)
  if (err.name && err.name.includes("Media")) {
    return {
      type: ERROR_TYPES.MEDIA,
      source,
      message: getMediaErrorMessage(err),
      raw: err,
    };
  }

  // Erreurs réseau
  if (err.message && err.message.includes("network")) {
    return {
      type: ERROR_TYPES.NETWORK,
      source,
      message: "Problème de connexion réseau",
      raw: err,
    };
  }

  // Fallback
  return {
    type: ERROR_TYPES.UNKNOWN,
    source,
    message: err.message || "Erreur inattendue",
    raw: err,
  };
}

/**
 * Messages lisibles pour erreurs PeerJS
 */
function getPeerErrorMessage(err) {
  switch (err.type) {
    case "peer-unavailable":
      return "Le correspondant est hors ligne";
    case "network":
      return "Connexion PeerJS impossible";
    case "disconnected":
      return "Connexion PeerJS interrompue";
    default:
      return "Erreur PeerJS";
  }
}

/**
 * Messages lisibles pour erreurs média
 */
function getMediaErrorMessage(err) {
  switch (err.name) {
    case "NotAllowedError":
      return "Accès au micro ou à la caméra refusé";
    case "NotFoundError":
      return "Aucun micro ou caméra détecté";
    default:
      return "Erreur d'accès aux périphériques multimédia";
  }
}
