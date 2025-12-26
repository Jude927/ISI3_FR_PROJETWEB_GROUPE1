/**
 * history.js
 * --------------------------------
 * Gère l’historique IA :
 * - Sauvegarde Firestore
 * - Cache navigateur (localStorage)
 * - Chargement hors connexion
 */

import { db } from "../auth/firebase-config.js";

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ===============================
   🔹 CACHE LOCAL (OFFLINE)
   =============================== */

const CACHE_KEY = "ai_history_cache";

/**
 * Sauvegarde une entrée dans le cache navigateur
 */
export function saveToCache(entry) {
  const cache = JSON.parse(localStorage.getItem(CACHE_KEY)) || [];
  cache.unshift(entry);
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

/**
 * Charge l’historique depuis le cache navigateur
 */
export function loadFromCache() {
  return JSON.parse(localStorage.getItem(CACHE_KEY)) || [];
}

/* ===============================
   🔹 FIRESTORE
   =============================== */

/**
 * Sauvegarde une entrée dans Firestore
 */
export async function saveToFirestore(entry) {
  await addDoc(collection(db, "ai_history"), entry);
}

/**
 * Charge l’historique Firestore d’un utilisateur
 */
export async function loadHistoryFirestore(uid) {
  const q = query(
    collection(db, "ai_history"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data());
}
