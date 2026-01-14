/****************************************************
 * index.js
 * Point d'entrée unifié du module Peer
 * 
 * ⭐ NOUVEAU FICHIER
 * Exporte toutes les fonctions publiques
 * API claire et cohérente
 ****************************************************/

// ========================================
// EXPORTS : INITIALISATION
// ========================================
export { 
  initPeer, 
  getPeer, 
  getPeerId, 
  destroyPeer 
} from "./peer-init.js";

// ========================================
// EXPORTS : CONNEXIONS DATA
// ========================================
export {
  setupConnectionListeners,
  connectToPeer,
  sendMessage,
  sendTypingIndicator,
  closeConnection,
  getConnectionState,
  getRemotePeerId,
  getActiveConnection,
  isConnected,
  registerCallback,
  getDebugInfo as getConnectionDebugInfo
} from "./connection-manager.js";

// ========================================
// EXPORTS : APPELS AUDIO/VIDEO
// ========================================
export {
  startCall,
  answerCall,
  rejectCall,
  endCall,
  toggleMute,
  toggleVideo,
  isInCall,
  getLocalStream,
  onRemoteStream,
  onIncomingCall,
  onCallEnded,
  setupCallListeners,
  getCallDebugInfo
} from "./call.js";

// ========================================
// EXPORTS : CHAT
// ========================================
export {
  sendChatMessage,
  onMessageReceived,
  isChatActive,
  getConnection,
  getChatDebugInfo
} from "./chat.js";

// ========================================
// EXPORTS : FIRESTORE SYNC
// ========================================
export {
  savePeerIdToFirestore,
  removePeerIdFromFirestore,
  getPeerIdFromFirestore,
  watchUserStatus,
  updateAvailability,
  updateHeartbeat,
  startHeartbeat,
  stopHeartbeat,
  handleDisconnect
} from "./firestore-sync.js";

// ========================================
// EXPORTS : ERROR HANDLING
// ========================================
export { 
  normalizeError, 
  ERROR_TYPES 
} from "./error.js";

// ========================================
// FONCTION D'INITIALISATION COMPLÈTE
// ========================================

import { initPeer } from "./peer-init.js";
import { setupConnectionListeners } from "./connection-manager.js";
import { setupCallListeners } from "./call.js";
import { savePeerIdToFirestore, startHeartbeat } from "./firestore-sync.js";

/**
 * Initialiser complètement le module Peer
 * Setup automatique de tous les listeners
 * 
 * @param {Object} options - Configuration
 * @param {Function} options.onReady - Callback quand tout est prêt
 * @param {Function} options.onError - Callback en cas d'erreur
 * @returns {Promise<string>} Peer ID
 */
export async function initPeerModule(options = {}) {
  const { onReady, onError } = options;
  
  return new Promise((resolve, reject) => {
    console.log("[PeerModule] 🚀 Initialisation complète...");
    
    initPeer({
      onOpen: async (peerId) => {
        try {
          console.log("[PeerModule] ✅ Peer ouvert:", peerId);
          
          // Sauvegarder dans Firestore
          await savePeerIdToFirestore();
          console.log("[PeerModule] ✅ Peer ID sauvegardé dans Firestore");
          
          // Setup listeners
          setupConnectionListeners();
          setupCallListeners();
          console.log("[PeerModule] ✅ Listeners configurés");
          
          // Démarrer heartbeat
          startHeartbeat();
          console.log("[PeerModule] ✅ Heartbeat démarré");
          
          console.log("[PeerModule] 🎉 Module Peer prêt !");
          
          if (onReady) onReady(peerId);
          resolve(peerId);
          
        } catch (error) {
          console.error("[PeerModule] ❌ Erreur init:", error);
          if (onError) onError(error);
          reject(error);
        }
      },
      
      onError: (error) => {
        console.error("[PeerModule] ❌ Erreur Peer:", error);
        if (onError) onError(error);
        reject(error);
      }
    });
  });
}

// ========================================
// EXPORT PAR DÉFAUT
// ========================================
export default {
  initPeerModule
};

// ========================================
// LOG DE VERSION
// ========================================
console.log("[PeerModule] 📦 Module Peer v2.0 chargé");
