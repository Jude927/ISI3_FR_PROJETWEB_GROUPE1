import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function protectPage(allowedRoles) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const snap = await getDoc(doc(db, "users", user.uid));
    const role = snap.data().role;

    if (!allowedRoles.includes(role)) {
      window.location.href = "unauthorized.html";
    }
  });
}
