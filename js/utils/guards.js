import { auth, db } from "../auth/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * Protège une page selon les rôles autorisés
 * @param {Array} allowedRoles - ex: ["student"], ["teacher"], ["student","teacher"]
 */
export function protectPage(allowedRoles) {
  onAuthStateChanged(auth, async (user) => {

    // ❌ Non connecté → login
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    try {
      // 🔍 Récupération du rôle
      const snap = await getDoc(doc(db, "users", user.uid));

      if (!snap.exists()) {
        window.location.href = "login.html";
        return;
      }

      const role = snap.data().role;

      // ❌ Rôle non autorisé → accueil
      if (!allowedRoles.includes(role)) {
        window.location.href = "index.html";
      }

    } catch (error) {
      console.error("Erreur guard:", error);
      window.location.href = "login.html";
    }
  });
}
