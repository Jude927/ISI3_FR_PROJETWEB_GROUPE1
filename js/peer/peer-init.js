/****************************************************
 * peer-init.js
 * ✅ VERSION CORRIGÉE - Exports ES6
 * 
 * Rôle :
 *  - Initialiser PeerJS
 *  - Créer / récupérer l'ID du pair
 *  - Gérer les événements de base (open, error)
 *  - Exposer une API minimale et propre
 ****************************************************/

// Configuration globale PeerJS
const PEER_CONFIG = {
  host: 'peerjs-server.herokuapp.com',
  secure: true,
  port: 443,
  debug: 2
};

// État interne du peer
let peer = null;        // instance PeerJS
let peerId = null;     // ID unique du peer

// Callbacks externes
let onPeerOpenCallback = null;
let onPeerErrorCallback = null;

/**
 * Initialisation du peer
 */
function initPeer(customCallbacks = {}) {
  if (peer) {
    console.warn('[PeerInit] Peer déjà initialisé');
    return peer;
  }

  // Enregistrement des callbacks
  onPeerOpenCallback = customCallbacks.onOpen || null;
  onPeerErrorCallback = customCallbacks.onError || null;

  // Création du peer
  peer = new Peer(undefined, PEER_CONFIG);

  // Événements PeerJS
  peer.on('open', (id) => {
    peerId = id;
    console.log('[PeerInit] Peer ouvert avec ID :', id);

    if (onPeerOpenCallback) {
      onPeerOpenCallback(id);
    }
  });

  peer.on('error', (error) => {
    console.error('[PeerInit] Erreur PeerJS :', error);

    if (onPeerErrorCallback) {
      onPeerErrorCallback(error);
    }
  });

  return peer;
}

/**
 * Getter pour l'instance Peer
 */
function getPeer() {
  if (!peer) {
    console.warn('[PeerInit] Peer non initialisé');
  }
  return peer;
}

/**
 * Getter pour le Peer ID
 */
function getPeerId() {
  if (!peerId) {
    console.warn('[PeerInit] Peer ID non disponible');
  }
  return peerId;
}

/**
 * Nettoyage
 */
function destroyPeer() {
  if (peer) {
    peer.destroy();
    peer = null;
    peerId = null;
    console.log('[PeerInit] Peer détruit');
  }
}

// ✅ EXPORTS ES6 (pour import/export moderne)
export { 
  initPeer, 
  getPeer, 
  getPeerId, 
  destroyPeer,
  peer,      // ⭐ Ajouté pour compatibilité
  peerId     // ⭐ Ajouté pour compatibilité
};

// ✅ EXPORT GLOBAL (pour compatibilité avec ancien code)
if (typeof window !== 'undefined') {
  window.PeerInit = {
    initPeer,
    getPeer,
    getPeerId,
    destroyPeer
  };
}

console.log('[PeerInit] Module chargé avec exports ES6');