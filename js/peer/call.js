/*************************************************
 * call.js
 * ✅ VERSION FINALE COMPLÈTE
 * Gestion des appels audio / vidéo Peer-to-Peer
 *************************************************/

import { getPeer } from "./peer-init.js";

/* ============================
   ÉTAT INTERNE
   ============================ */

// Flux média local (micro / caméra)
let localStream = null;

// Appel actif (MediaConnection)
let currentCall = null;

// État de l'appel
let callState = "idle"; // idle | calling | ringing | active

// Callbacks
let remoteStreamCallback = null;
let incomingCallCallback = null;
let callEndedCallback = null;

// Options média actuelles
let mediaOptions = { audio: true, video: false };

/* ============================
   FONCTIONS PUBLIQUES - APPELS
   ============================ */

/**
 * Démarrer un appel audio / vidéo
 */
export async function startCall(targetPeerId, options = { audio: true, video: true }) {
  try {
    const peer = getPeer();
    if (!peer) {
      console.error('[Call] Peer non initialisé');
      throw new Error('Peer non initialisé');
    }

    if (callState !== "idle") {
      console.warn('[Call] Appel déjà en cours');
      throw new Error('Appel déjà en cours');
    }

    console.log('[Call] Démarrage appel vers:', targetPeerId);
    callState = "calling";
    mediaOptions = options;

    // Demande d'accès micro / caméra
    localStream = await navigator.mediaDevices.getUserMedia(options);
    console.log('[Call] ✅ Flux média local obtenu');

    // Lancement de l'appel
    currentCall = peer.call(targetPeerId, localStream);
    console.log('[Call] ✅ Appel lancé');

    setupCallHandlers(currentCall);

  } catch (err) {
    console.error('[Call] ❌ Erreur démarrage appel:', err);
    cleanupCall();
    throw err;
  }
}

/**
 * Répondre à un appel entrant
 */
export async function answerCall(call, options = { audio: true, video: true }) {
  try {
    console.log('[Call] Réponse à l\'appel entrant');
    callState = "active";
    mediaOptions = options;

    // Accès micro / caméra
    localStream = await navigator.mediaDevices.getUserMedia(options);
    console.log('[Call] ✅ Flux média local obtenu');

    // Accepter l'appel
    call.answer(localStream);
    currentCall = call;

    setupCallHandlers(call);
    console.log('[Call] ✅ Appel accepté');

  } catch (err) {
    console.error('[Call] ❌ Erreur réponse appel:', err);
    cleanupCall();
    throw err;
  }
}

/**
 * Rejeter un appel entrant
 */
export function rejectCall(call) {
  console.log('[Call] Appel rejeté');
  if (call) {
    call.close();
  }
  callState = "idle";
}

/**
 * Terminer l'appel en cours
 */
export function endCall() {
  console.log('[Call] Fin de l\'appel');
  if (currentCall) {
    currentCall.close();
  }
  cleanupCall();
}

/**
 * Couper/activer le micro
 */
export function toggleMute() {
  if (!localStream) return false;
  
  const audioTrack = localStream.getAudioTracks()[0];
  if (audioTrack) {
    audioTrack.enabled = !audioTrack.enabled;
    console.log('[Call] Micro:', audioTrack.enabled ? 'activé' : 'coupé');
    return !audioTrack.enabled; // retourne true si muted
  }
  return false;
}

/**
 * Activer/désactiver la caméra
 */
export function toggleVideo() {
  if (!localStream) return false;
  
  const videoTrack = localStream.getVideoTracks()[0];
  if (videoTrack) {
    videoTrack.enabled = !videoTrack.enabled;
    console.log('[Call] Caméra:', videoTrack.enabled ? 'activée' : 'désactivée');
    return !videoTrack.enabled; // retourne true si caméra off
  }
  return false;
}

/* ============================
   FONCTIONS PUBLIQUES - ÉTAT
   ============================ */

/**
 * Vérifier si un appel est en cours
 */
export function isInCall() {
  return callState === "active" || callState === "calling" || callState === "ringing";
}

/**
 * Obtenir le flux local
 */
export function getLocalStream() {
  return localStream;
}

/**
 * Obtenir les infos de debug
 */
export function getCallDebugInfo() {
  return {
    callState,
    hasLocalStream: !!localStream,
    hasCurrentCall: !!currentCall,
    mediaOptions
  };
}

/* ============================
   CALLBACKS
   ============================ */

/**
 * Callback pour le flux distant
 */
export function onRemoteStream(callback) {
  remoteStreamCallback = callback;
}

/**
 * Callback pour appel entrant
 */
export function onIncomingCall(callback) {
  incomingCallCallback = callback;
}

/**
 * Callback quand l'appel se termine
 */
export function onCallEnded(callback) {
  callEndedCallback = callback;
}

/* ============================
   SETUP LISTENERS
   ============================ */

/**
 * Initialiser les listeners d'appels entrants
 */
export function setupCallListeners() {
  const peer = getPeer();
  if (!peer) {
    console.error('[Call] Peer non initialisé, impossible de setup listeners');
    return;
  }

  console.log('[Call] Setup listeners d\'appels entrants');

  peer.on("call", (call) => {
    console.log('[Call] 📞 Appel entrant de:', call.peer);
    callState = "ringing";

    if (incomingCallCallback) {
      incomingCallCallback(call);
    } else {
      console.warn('[Call] Pas de callback pour appel entrant, auto-reject');
      rejectCall(call);
    }
  });
}

/* ============================
   GESTION INTERNE
   ============================ */

/**
 * Configurer les handlers pour un appel
 */
function setupCallHandlers(call) {
  // Réception du flux distant
  call.on("stream", (remoteStream) => {
    console.log('[Call] ✅ Flux distant reçu');
    callState = "active";
    if (remoteStreamCallback) {
      remoteStreamCallback(remoteStream);
    }
  });

  // Fermeture de l'appel
  call.on("close", () => {
    console.log('[Call] Appel fermé');
    cleanupCall();
    if (callEndedCallback) {
      callEndedCallback();
    }
  });

  // Erreur
  call.on("error", (err) => {
    console.error('[Call] ❌ Erreur appel:', err);
    cleanupCall();
    if (callEndedCallback) {
      callEndedCallback(err);
    }
  });
}

/**
 * Nettoyage après appel
 */
function cleanupCall() {
  console.log('[Call] Nettoyage...');
  
  // Arrêter tous les tracks du flux local
  if (localStream) {
    localStream.getTracks().forEach(track => {
      track.stop();
      console.log('[Call] Track arrêté:', track.kind);
    });
  }

  localStream = null;
  currentCall = null;
  callState = "idle";
  
  console.log('[Call] ✅ Nettoyage terminé');
}