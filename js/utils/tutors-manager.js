/****************************************************
 * tutors-manager.js
 * Gestion de la liste des tuteurs
 * 
 * ⭐ NOUVEAU FICHIER
 * Récupère les tuteurs par matière
 * Filtre par statut en ligne
 * Écoute en temps réel
 ****************************************************/

import { db } from "../auth/firebase-config.js";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * Obtenir les tuteurs EN LIGNE par matière
 * @param {string} subject - Nom de la matière
 * @returns {Promise<Array>} Liste des tuteurs
 */
export async function getOnlineTutorsBySubject(subject) {
  try {
    console.log("[TutorsManager] 🔍 Recherche tuteurs en ligne pour:", subject);
    
    const q = query(
      collection(db, "teachers"),
      where("subjects", "array-contains", subject),
      where("isOnline", "==", true),
      where("isAvailable", "==", true)
    );

    const snapshot = await getDocs(q);
    
    const tutors = [];
    
    for (const docSnap of snapshot.docs) {
      const tutorData = docSnap.data();
      
      // Récupérer aussi les infos de users/ pour avoir displayName et photoURL
      const userDoc = await getDoc(doc(db, "users", docSnap.id));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      tutors.push({
        id: docSnap.id,
        ...tutorData,
        displayName: userData.displayName || "Tuteur",
        photoURL: userData.photoURL || null
      });
    }

    console.log("[TutorsManager] ✅ Trouvé", tutors.length, "tuteur(s) en ligne");
    return tutors;
    
  } catch (error) {
    console.error("[TutorsManager] ❌ Erreur chargement tuteurs:", error);
    throw error;
  }
}

/**
 * Obtenir TOUS les tuteurs (en ligne + hors ligne) par matière
 * @param {string} subject - Nom de la matière
 * @returns {Promise<Array>} Liste des tuteurs (triés : en ligne d'abord)
 */
export async function getAllTutorsBySubject(subject) {
  try {
    console.log("[TutorsManager] 🔍 Recherche tous tuteurs pour:", subject);
    
    const q = query(
      collection(db, "teachers"),
      where("subjects", "array-contains", subject)
    );

    const snapshot = await getDocs(q);
    
    const tutors = [];
    
    for (const docSnap of snapshot.docs) {
      const tutorData = docSnap.data();
      
      // Récupérer les infos utilisateur
      const userDoc = await getDoc(doc(db, "users", docSnap.id));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      tutors.push({
        id: docSnap.id,
        ...tutorData,
        displayName: userData.displayName || "Tuteur",
        photoURL: userData.photoURL || null,
        email: userData.email || ""
      });
    }

    // Trier : en ligne d'abord, puis par note
    tutors.sort((a, b) => {
      // 1. Priorité : en ligne
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      
      // 2. Puis par note (rating)
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      return ratingB - ratingA;
    });

    console.log("[TutorsManager] ✅ Trouvé", tutors.length, "tuteur(s)");
    return tutors;
    
  } catch (error) {
    console.error("[TutorsManager] ❌ Erreur chargement tuteurs:", error);
    throw error;
  }
}

/**
 * Écouter les tuteurs d'une matière en temps réel
 * @param {string} subject - Nom de la matière
 * @param {Function} callback - Fonction appelée à chaque changement
 * @returns {Function} Fonction pour arrêter l'écoute
 */
export function watchTutorsBySubject(subject, callback) {
  console.log("[TutorsManager] 👀 Écoute temps réel pour:", subject);
  
  const q = query(
    collection(db, "teachers"),
    where("subjects", "array-contains", subject)
  );

  const unsubscribe = onSnapshot(
    q,
    async (snapshot) => {
      const tutors = [];
      
      // Parcourir tous les tuteurs
      for (const docSnap of snapshot.docs) {
        const tutorData = docSnap.data();
        
        // Récupérer les infos utilisateur
        const userDoc = await getDoc(doc(db, "users", docSnap.id));
        const userData = userDoc.exists() ? userDoc.data() : {};
        
        tutors.push({
          id: docSnap.id,
          ...tutorData,
          displayName: userData.displayName || "Tuteur",
          photoURL: userData.photoURL || null
        });
      }

      // Trier
      tutors.sort((a, b) => {
        if (a.isOnline && !b.isOnline) return -1;
        if (!a.isOnline && b.isOnline) return 1;
        return (b.rating || 0) - (a.rating || 0);
      });

      callback(tutors);
    },
    (error) => {
      console.error("[TutorsManager] ❌ Erreur écoute tuteurs:", error);
    }
  );

  return unsubscribe;
}

/**
 * Obtenir toutes les matières disponibles
 * @returns {Promise<Array>} Liste des matières (triées alphabétiquement)
 */
export async function getAvailableSubjects() {
  try {
    console.log("[TutorsManager] 📚 Récupération des matières disponibles");
    
    const snapshot = await getDocs(collection(db, "teachers"));
    
    const subjectsSet = new Set();
    
    snapshot.forEach((doc) => {
      const subjects = doc.data().subjects || [];
      subjects.forEach(subject => subjectsSet.add(subject));
    });

    const subjects = Array.from(subjectsSet).sort();
    
    console.log("[TutorsManager] ✅ Trouvé", subjects.length, "matière(s)");
    return subjects;
    
  } catch (error) {
    console.error("[TutorsManager] ❌ Erreur chargement matières:", error);
    throw error;
  }
}

/**
 * Obtenir les détails complets d'un tuteur
 * @param {string} tutorId - UID du tuteur
 * @returns {Promise<Object>} Détails du tuteur
 */
export async function getTutorDetails(tutorId) {
  try {
    console.log("[TutorsManager] 🔍 Récupération détails tuteur:", tutorId);
    
    // Récupérer les données de teachers/
    const teacherDoc = await getDoc(doc(db, "teachers", tutorId));
    
    if (!teacherDoc.exists()) {
      throw new Error("Tuteur introuvable");
    }
    
    const teacherData = teacherDoc.data();
    
    // Récupérer les données de users/
    const userDoc = await getDoc(doc(db, "users", tutorId));
    const userData = userDoc.exists() ? userDoc.data() : {};
    
    const tutorDetails = {
      id: tutorId,
      ...teacherData,
      displayName: userData.displayName || "Tuteur",
      photoURL: userData.photoURL || null,
      email: userData.email || "",
      isOnline: userData.isOnline || false,
      peerId: userData.peerId || null
    };
    
    console.log("[TutorsManager] ✅ Détails récupérés");
    return tutorDetails;
    
  } catch (error) {
    console.error("[TutorsManager] ❌ Erreur récupération détails:", error);
    throw error;
  }
}

/**
 * Rechercher des tuteurs par nom
 * @param {string} searchTerm - Terme de recherche
 * @returns {Promise<Array>} Liste des tuteurs correspondants
 */
export async function searchTutors(searchTerm) {
  try {
    console.log("[TutorsManager] 🔎 Recherche:", searchTerm);
    
    // Note : Firestore ne supporte pas bien la recherche full-text
    // Ici on récupère tous les tuteurs et on filtre côté client
    // Pour une vraie app, utiliser Algolia ou ElasticSearch
    
    const snapshot = await getDocs(collection(db, "teachers"));
    
    const tutors = [];
    
    for (const docSnap of snapshot.docs) {
      const tutorData = docSnap.data();
      
      // Récupérer les infos utilisateur
      const userDoc = await getDoc(doc(db, "users", docSnap.id));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      const displayName = userData.displayName || "";
      const subjects = tutorData.subjects || [];
      
      // Filtrer par nom ou matière
      const term = searchTerm.toLowerCase();
      const matchName = displayName.toLowerCase().includes(term);
      const matchSubject = subjects.some(s => s.toLowerCase().includes(term));
      
      if (matchName || matchSubject) {
        tutors.push({
          id: docSnap.id,
          ...tutorData,
          displayName: displayName || "Tuteur",
          photoURL: userData.photoURL || null,
          isOnline: userData.isOnline || false
        });
      }
    }

    // Trier : en ligne d'abord
    tutors.sort((a, b) => {
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      return 0;
    });

    console.log("[TutorsManager] ✅ Trouvé", tutors.length, "résultat(s)");
    return tutors;
    
  } catch (error) {
    console.error("[TutorsManager] ❌ Erreur recherche:", error);
    throw error;
  }
}

/**
 * Obtenir les tuteurs les mieux notés
 * @param {number} limit - Nombre de tuteurs à retourner
 * @returns {Promise<Array>} Top tuteurs
 */
export async function getTopRatedTutors(limit = 5) {
  try {
    console.log("[TutorsManager] ⭐ Récupération top", limit, "tuteurs");
    
    const snapshot = await getDocs(collection(db, "teachers"));
    
    const tutors = [];
    
    for (const docSnap of snapshot.docs) {
      const tutorData = docSnap.data();
      
      // Récupérer les infos utilisateur
      const userDoc = await getDoc(doc(db, "users", docSnap.id));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      tutors.push({
        id: docSnap.id,
        ...tutorData,
        displayName: userData.displayName || "Tuteur",
        photoURL: userData.photoURL || null,
        isOnline: userData.isOnline || false
      });
    }

    // Trier par note décroissante
    tutors.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    
    // Limiter le nombre de résultats
    const topTutors = tutors.slice(0, limit);
    
    console.log("[TutorsManager] ✅ Top tuteurs récupérés");
    return topTutors;
    
  } catch (error) {
    console.error("[TutorsManager] ❌ Erreur récupération top tuteurs:", error);
    throw error;
  }
}
