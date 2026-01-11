/****************************************************
 
 * Rôle :
 *  - Initialiser PeerJS
 *  - Créer / récupérer l'ID du pair
 *  - Gérer les événements de base (open, error)
 *  - Exposer une API minimale et propre pour le reste de l'app
 *
 * Ce fichier NE gère PAS :
 *  - les appels (audio / vidéo)
 *  - les connexions de données avancées
 *  - l'UI
 *
 * Objectif projet :
 *  - Avoir un point d'entrée UNIQUE et FIABLE pour PeerJS
 *  - Garantir la cohérence avec le travail du reste de l'équipe
 ****************************************************/


// Configuration globale PeerJS


const PEER_CONFIG = {
  host: 'peerjs-server.herokuapp.com', // à adapter si serveur custom plus tard
  secure: true,
  port: 443,
  debug: 2
};


// État interne du peer


let peer = null;        // instance PeerJS
let peerId = null;     // ID unique du peer

// Callbacks externes (injectés par le reste de l'app)
let onPeerOpenCallback = null;
let onPeerErrorCallback = null;


// Initialisation du peer

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


// Getters sécurisés


function getPeer() {
  if (!peer) {
    console.warn('[PeerInit] Peer non initialisé');
  }
  return peer;
}

function getPeerId() {
  if (!peerId) {
    console.warn('[PeerInit] Peer ID non disponible');
  }
  return peerId;
}


// Nettoyage (optionnel mais propre)


function destroyPeer() {
  if (peer) {
    peer.destroy();
    peer = null;
    peerId = null;
    console.log('[PeerInit] Peer détruit');
  }
}


// Export global (compatible navigateur)


window.PeerInit = {
  initPeer,
  getPeer,
  getPeerId,
  destroyPeer
};
