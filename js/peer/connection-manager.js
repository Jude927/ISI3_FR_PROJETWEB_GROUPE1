/****************************************************
 * connection-manager.js
 * Gestionnaire centralisé des connexions Peer-to-Peer
 * 
 * ⭐ NOUVEAU FICHIER
 * Centralise TOUTE la logique de connexion (data + media)
 * Évite les duplications d'event listeners
 ****************************************************/

import { getPeer } from "./peer-init.js";

// ========================================
// ÉTAT GLOBAL
// ========================================

let activeConnection = null;       // Connexion de données active
let connectionState = "disconnected"; // État : disconnected | connecting | connected
let remotePeerId = null;            // ID du peer distant

// ========================================
// CALLBACKS
// ========================================

const callbacks = {
  onDataConnection: null,          // Quand une connexion data s'établit
  onMediaCall: null,               // Quand un appel média arrive
  onMessage: null,                 // Quand un message texte arrive
  onRemoteStream: null,            // Quand un flux vidéo/audio arrive
  onError: null,                   // Quand une erreur survient
  onConnectionStateChange: null    // Quand l'état de connexion change
};

/**
 * Enregistrer un callback
 * @param {string} type - Type de callback
 * @param {Function} callback - Fonction à appeler
 */
export function registerCallback(type, callback) {
  if (callbacks.hasOwnProperty(type)) {
    callbacks[type] = callback;
    console.log(`[ConnectionManager] ✅ Callback ${type} enregistré`);
  } else {
    console.warn(`[ConnectionManager] ⚠️ Type de callback inconnu: ${type}`);
  }
}

/**
 * Initialiser l'écoute des connexions
 * ⚠️ À appeler UNE SEULE FOIS au démarrage
 */
export function setupConnectionListeners() {
  const peer = getPeer();
  
  if (!peer) {
    console.error("[ConnectionManager] ❌ Peer non initialisé");
    return;
  }

  console.log("[ConnectionManager] 🎧 Écoute des connexions activée");

  // ========================================
  // CONNEXIONS DE DONNÉES ENTRANTES
  // ========================================
  peer.on("connection", (connection) => {
    console.log("[ConnectionManager] 📞 Connexion entrante de:", connection.peer);
    
    // Refuser si déjà connecté
    if (connectionState !== "disconnected") {
      console.warn("[ConnectionManager] ⚠️ Connexion refusée : déjà connecté à", remotePeerId);
      connection.close();
      return;
    }

    handleIncomingConnection(connection);
  });

  // ========================================
  // APPELS MÉDIA ENTRANTS
  // ========================================
  peer.on("call", (call) => {
    console.log("[ConnectionManager] 📹 Appel entrant de:", call.peer);
    
    if (callbacks.onMediaCall) {
      callbacks.onMediaCall(call);
    } else {
      console.warn("[ConnectionManager] ⚠️ Aucun callback pour les appels média");
    }
  });
}

/**
 * Se connecter à un peer distant
 * @param {string} targetPeerId - ID du peer à contacter
 * @returns {DataConnection} Connexion établie
 */
export function connectToPeer(targetPeerId) {
  const peer = getPeer();
  
  if (!peer) {
    throw new Error("Peer non initialisé");
  }

  if (!targetPeerId || typeof targetPeerId !== "string") {
    throw new Error("Peer ID invalide");
  }

  if (connectionState !== "disconnected") {
    throw new Error(`Déjà ${connectionState === "connecting" ? "en cours de connexion" : "connecté"}`);
  }

  console.log("[ConnectionManager] 🔗 Connexion à:", targetPeerId);
  
  // Mise à jour de l'état
  connectionState = "connecting";
  remotePeerId = targetPeerId;
  updateState("connecting");
  
  // Création de la connexion
  const connection = peer.connect(targetPeerId);
  
  // Événement : connexion établie
  connection.on("open", () => {
    console.log("[ConnectionManager] ✅ Connexion établie avec", targetPeerId);
    activeConnection = connection;
    connectionState = "connected";
    updateState("connected");
    
    if (callbacks.onDataConnection) {
      callbacks.onDataConnection(connection);
    }
  });

  // Configuration des handlers
  setupConnectionHandlers(connection);
  
  return connection;
}

/**
 * Gérer une connexion entrante
 * @param {DataConnection} connection
 */
function handleIncomingConnection(connection) {
  activeConnection = connection;
  remotePeerId = connection.peer;
  connectionState = "connected";
  updateState("connected");
  
  console.log("[ConnectionManager] ✅ Connexion acceptée de", remotePeerId);
  
  if (callbacks.onDataConnection) {
    callbacks.onDataConnection(connection);
  }
  
  setupConnectionHandlers(connection);
}

/**
 * Configurer les handlers d'une connexion
 * @param {DataConnection} connection
 */
function setupConnectionHandlers(connection) {
  // Réception de données
  connection.on("data", (data) => {
    console.log("[ConnectionManager] 📨 Message reçu:", data);
    
    // Si c'est un message de chat
    if (data.type === "chat" && callbacks.onMessage) {
      callbacks.onMessage({
        message: data.payload,
        timestamp: data.timestamp,
        sender: connection.peer
      });
    }
    // Autres types de messages possibles
    else if (data.type === "typing" && callbacks.onTyping) {
      callbacks.onTyping(data.isTyping);
    }
  });

  // Connexion fermée
  connection.on("close", () => {
    console.log("[ConnectionManager] 🔌 Connexion fermée par", connection.peer);
    cleanup();
  });

  // Erreur sur la connexion
  connection.on("error", (err) => {
    console.error("[ConnectionManager] ❌ Erreur sur connexion:", err);
    handleError(err);
  });
}

/**
 * Envoyer un message texte
 * @param {string} message - Contenu du message
 */
export function sendMessage(message) {
  if (!activeConnection) {
    throw new Error("Pas de connexion active");
  }

  if (connectionState !== "connected") {
    throw new Error("Connexion non établie");
  }

  const data = {
    type: "chat",
    payload: message,
    timestamp: Date.now()
  };

  activeConnection.send(data);
  console.log("[ConnectionManager] 📤 Message envoyé:", message);
}

/**
 * Envoyer un indicateur de frappe
 * @param {boolean} isTyping
 */
export function sendTypingIndicator(isTyping) {
  if (!activeConnection || connectionState !== "connected") {
    return;
  }

  activeConnection.send({
    type: "typing",
    isTyping: isTyping,
    timestamp: Date.now()
  });
}

/**
 * Fermer la connexion
 */
export function closeConnection() {
  if (activeConnection) {
    console.log("[ConnectionManager] 🔌 Fermeture de la connexion");
    activeConnection.close();
    cleanup();
  }
}

/**
 * Obtenir l'état de connexion actuel
 * @returns {string} État : disconnected | connecting | connected
 */
export function getConnectionState() {
  return connectionState;
}

/**
 * Obtenir le Peer ID distant
 * @returns {string|null}
 */
export function getRemotePeerId() {
  return remotePeerId;
}

/**
 * Obtenir la connexion active
 * @returns {DataConnection|null}
 */
export function getActiveConnection() {
  return activeConnection;
}

/**
 * Vérifier si connecté
 * @returns {boolean}
 */
export function isConnected() {
  return connectionState === "connected";
}

// ========================================
// FONCTIONS INTERNES
// ========================================

/**
 * Nettoyage de la connexion
 */
function cleanup() {
  activeConnection = null;
  remotePeerId = null;
  connectionState = "disconnected";
  updateState("disconnected");
  
  console.log("[ConnectionManager] 🧹 Nettoyage effectué");
}

/**
 * Mettre à jour l'état et notifier
 * @param {string} newState
 */
function updateState(newState) {
  if (callbacks.onConnectionStateChange) {
    callbacks.onConnectionStateChange(newState);
  }
}

/**
 * Gérer une erreur
 * @param {Error} err
 */
function handleError(err) {
  console.error("[ConnectionManager] ❌ Erreur:", err);
  cleanup();
  
  if (callbacks.onError) {
    callbacks.onError(err);
  }
}

// Export pour debug
export function getDebugInfo() {
  return {
    state: connectionState,
    remotePeerId: remotePeerId,
    hasConnection: !!activeConnection
  };
}
