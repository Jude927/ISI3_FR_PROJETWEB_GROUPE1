/*************************************************
 * call.js
 * Gestion des appels audio / vidéo Peer-to-Peer
 *************************************************/

import { peer } from "./peer-init.js";

/* ============================
   ÉTAT INTERNE
   ============================ */

// Flux média local (micro / caméra)
let localStream = null;

// Appel actif (MediaConnection)
let currentCall = null;

// Callback pour flux distant
let remoteStreamCallback = null;

// Callback pour appel entrant
let incomingCallCallback = null;

/* ============================
   FONCTIONS PUBLIQUES
   ============================ */

/**
 * Démarrer un appel audio / vidéo
 */
export async function startCall(targetPeerId, options = { audio: true, video: true }) {
  try {
    // Demande d'accès micro / caméra
    localStream = await navigator.mediaDevices.getUserMedia(options);

    // Lancement de l'appel
    currentCall = peer.call(targetPeerId, localStream);

    // Réception du flux distant
    currentCall.on("stream", (remoteStream) => {
      if (remoteStreamCallback) {
        remoteStreamCallback(remoteStream);
      }
    });

    currentCall.on("close", () => {
      cleanupCall();
    });

    currentCall.on("error", (err) => {
      console.error("Erreur appel :", err);
      cleanupCall();
    });

  } catch (err) {
    console.error("Erreur accès média :", err);
  }
}

/**
 * Écouter les appels entrants
 */
export function onIncomingCall(callback) {
  incomingCallCallback = callback;
}

/**
 * Terminer l'appel
 */
export function endCall() {
  if (currentCall) {
    currentCall.close();
    cleanupCall();
  }
}

/**
 * Écouter le flux distant
 */
export function onRemoteStream(callback) {
  remoteStreamCallback = callback;
}

/* ============================
   GESTION DES APPELS ENTRANTS
   ============================ */

peer.on("call", async (call) => {
  incomingCallCallback?.(call);

  try {
    // Accès micro / caméra
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    });

    // Accepter l'appel
    call.answer(localStream);
    currentCall = call;

    call.on("stream", (remoteStream) => {
      remoteStreamCallback?.(remoteStream);
    });

    call.on("close", () => {
      cleanupCall();
    });

    call.on("error", (err) => {
      console.error("Erreur appel entrant :", err);
      cleanupCall();
    });

  } catch (err) {
    console.error("Erreur média entrant :", err);
  }
});

/* ============================
   NETTOYAGE
   ============================ */

function cleanupCall() {
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
  }

  localStream = null;
  currentCall = null;
}
