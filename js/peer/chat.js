/*************************************************
 * chat.js
 * ✅ VERSION FINALE COMPLÈTE
 * Gestion du chat texte Peer-to-Peer
 *************************************************/

import { getPeer } from "./peer-init.js";

/* ============================
   ÉTAT INTERNE
   ============================ */

// Connexion active utilisée pour le chat
let activeConnection = null;

// Callback déclenchée quand un message arrive
let messageReceivedCallback = null;

// État du chat
let chatActive = false;

/* ============================
   FONCTIONS PUBLIQUES
   ============================ */

/**
 * Envoyer un message texte à l'autre utilisateur
 * (Alias pour compatibilité avec index.js)
 */
export function sendChatMessage(message) {
  return sendMessage(message);
}

/**
 * Envoyer un message texte à l'autre utilisateur
 */
export function sendMessage(message) {
  if (!activeConnection) {
    console.warn("[Chat] Aucune connexion active pour envoyer le message");
    return false;
  }

  try {
    activeConnection.send({
      type: "chat",
      payload: message,
      timestamp: Date.now(),
    });
    console.log("[Chat] ✅ Message envoyé:", message);
    return true;
  } catch (error) {
    console.error("[Chat] ❌ Erreur envoi message:", error);
    return false;
  }
}

/**
 * Écouter les messages entrants
 */
export function onMessageReceived(callback) {
  messageReceivedCallback = callback;
  console.log("[Chat] Callback message enregistré");
}

/**
 * Vérifier si le chat est actif
 */
export function isChatActive() {
  return chatActive;
}

/**
 * Obtenir la connexion active
 */
export function getConnection() {
  return activeConnection;
}

/**
 * Obtenir les infos de debug
 */
export function getChatDebugInfo() {
  return {
    chatActive,
    hasConnection: !!activeConnection,
    connectionOpen: activeConnection?.open || false,
    remotePeer: activeConnection?.peer || null
  };
}

/**
 * Fermer la connexion chat
 */
export function closeChat() {
  if (activeConnection) {
    activeConnection.close();
    activeConnection = null;
    chatActive = false;
    console.log("[Chat] Connexion fermée");
  }
}

/* ============================
   SETUP LISTENERS
   ============================ */

/**
 * Initialiser les listeners de chat
 */
export function setupChatListeners() {
  const peer = getPeer();
  if (!peer) {
    console.error('[Chat] Peer non initialisé');
    return;
  }

  console.log("[Chat] Setup listeners de connexion");

  // Connexion entrante ou sortante
  peer.on("connection", (connection) => {
    console.log("[Chat] 💬 Connexion chat reçue de:", connection.peer);
    setupChatConnection(connection);
  });
}

/* ============================
   GESTION INTERNE
   ============================ */

/**
 * Préparer une connexion pour le chat
 */
function setupChatConnection(connection) {
  activeConnection = connection;
  chatActive = false; // Pas encore ouvert

  connection.on("open", () => {
    console.log("[Chat] ✅ Connexion chat ouverte avec:", connection.peer);
    chatActive = true;
  });

  connection.on("data", (data) => {
    console.log("[Chat] 📩 Données reçues:", data);
    
    if (data.type === "chat" && messageReceivedCallback) {
      messageReceivedCallback({
        message: data.payload,
        timestamp: data.timestamp,
        sender: connection.peer,
      });
    }
  });

  connection.on("close", () => {
    console.log("[Chat] Connexion fermée");
    activeConnection = null;
    chatActive = false;
  });

  connection.on("error", (err) => {
    console.error("[Chat] ❌ Erreur chat:", err);
    activeConnection = null;
    chatActive = false;
  });
}