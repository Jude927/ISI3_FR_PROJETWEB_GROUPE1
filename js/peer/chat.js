/*************************************************
 * chat.js
 * Gestion du chat texte Peer-to-Peer
 *************************************************/

import { getConnectionState } from "./peer.js";
import { peer } from "./peer-init.js";

/* ============================
   ÉTAT INTERNE
   ============================ */

// Connexion active utilisée pour le chat
let activeConnection = null;

// Callback déclenchée quand un message arrive
let messageReceivedCallback = null;

/* ============================
   FONCTIONS PUBLIQUES
   ============================ */

/**
 * Envoyer un message texte à l'autre utilisateur
 */
export function sendMessage(message) {
  if (!activeConnection) {
    console.warn("Aucune connexion active pour envoyer le message");
    return;
  }

  activeConnection.send({
    type: "chat",
    payload: message,
    timestamp: Date.now(),
  });
}

/**
 * Écouter les messages entrants
 */
export function onMessageReceived(callback) {
  messageReceivedCallback = callback;
}

/* ============================
   LIAISON AVEC PEER.JS
   ============================ */

// Connexion entrante ou sortante
peer.on("connection", (connection) => {
  setupChatConnection(connection);
});

/**
 * Préparer une connexion pour le chat
 */
function setupChatConnection(connection) {
  activeConnection = connection;

  connection.on("data", (data) => {
    if (data.type === "chat" && messageReceivedCallback) {
      messageReceivedCallback({
        message: data.payload,
        timestamp: data.timestamp,
        sender: connection.peer,
      });
    }
  });

  connection.on("close", () => {
    activeConnection = null;
  });

  connection.on("error", (err) => {
    console.error("Erreur chat :", err);
  });
}
