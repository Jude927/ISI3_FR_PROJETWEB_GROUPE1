import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return;

  const role = snap.data().role;

  // Empêche l'accès à login/register si déjà connecté
  if (window.location.pathname.includes("login") ||
      window.location.pathname.includes("register")) {

    if (role === "student") {
      window.location.href = "student-dashboard.html";
    } else {
      window.location.href = "teacher-dashboard.html";
    }
  }
});
