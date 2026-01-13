/*************************************************
 * peer.js
 * Gestion des connexions Peer-to-Peer
 * Élève ↔ Tuteur
 *************************************************/

/*
  On récupère le Peer déjà initialisé
  depuis peer-init.js
*/
import { peer } from "./peer-init.js";

/* 
   ÉTAT INTERNE DU MODULE
 */

// Connexion active (DataConnection ou MediaConnection)
let currentConnection = null;

// État de la connexion
let connectionState = "disconnected"; 
// valeurs possibles : "disconnected", "connecting", "connected"

// Callback pour connexions entrantes
let incomingConnectionCallback = null;

// Callback pour erreurs
let errorCallback = null;

/*
   FONCTIONS PUBLIQUES
    */

/**
 * Connecter l'utilisateur courant à un autre Peer
 * (élève → tuteur)
 */
export function connectToPeer(targetPeerId) {
  if (!peer) {
    console.error("Peer non initialisé");
    return;
  }

  if (connectionState !== "disconnected") {
    console.warn("Une session est déjà active");
    return;
  }

  console.log("Tentative de connexion vers :", targetPeerId);

  connectionState = "connecting";

  // Connexion PeerJS (texte pour l'instant)
  const connection = peer.connect(targetPeerId);

  connection.on("open", () => {
    console.log("Connexion établie avec", targetPeerId);
    currentConnection = connection;
    connectionState = "connected";
  });

  connection.on("data", (data) => {
    console.log("Message reçu :", data);
  });

  connection.on("close", () => {
    console.log("Connexion fermée");
    cleanupConnection();
  });

  connection.on("error", (err) => {
    console.error("Erreur de connexion :", err);
    handleError(err);
  });
}

/**
 * Écouter les connexions entrantes
 * (côté tuteur)
 */
export function onIncomingConnection(callback) {
  incomingConnectionCallback = callback;
}

/**
 * Déconnexion propre de la session
 */
export function disconnectSession() {
  if (currentConnection) {
    currentConnection.close();
    cleanupConnection();
  }
}

/**
 * Retourne l'état de la connexion
 */
export function getConnectionState() {
  return connectionState;
}

/**
 * Gestion globale des erreurs
 */
export function onPeerError(callback) {
  errorCallback = callback;
}

/* ============================
   GESTION INTERNE
   ============================ */

// Lorsqu'un autre utilisateur se connecte à moi
peer.on("connection", (connection) => {
  console.log("Connexion entrante reçue");

  if (connectionState !== "disconnected") {
    console.warn("Connexion refusée : déjà en session");
    connection.close();
    return;
  }

  currentConnection = connection;
  connectionState = "connected";

  if (incomingConnectionCallback) {
    incomingConnectionCallback(connection);
  }

  connection.on("data", (data) => {
    console.log("Message reçu :", data);
  });

  connection.on("close", () => {
    console.log("Connexion fermée par l'autre pair");
    cleanupConnection();
  });

  connection.on("error", (err) => {
    handleError(err);
  });
});

// Nettoyage interne
function cleanupConnection() {
  currentConnection = null;
  connectionState = "disconnected";
}

// Gestion des erreurs centralisée
function handleError(err) {
  console.error("Peer error :", err);
  cleanupConnection();

  if (errorCallback) {
    errorCallback(err);
  }
}



