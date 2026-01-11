import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { doc, getDoc } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { auth, db } from "/js/auth/firebase-config.js";

document.addEventListener("DOMContentLoaded", () => {

  const avatars = document.querySelectorAll(".profile-avatar");

  if (!avatars.length) return;

  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists()) return;

      const data = snap.data();
      if (!data.avatar) return;

      avatars.forEach(img => {
        img.src = data.avatar;
        img.classList.remove("opacity-0");
      });

    } catch (err) {
      console.error("Erreur chargement avatar :", err);
    }
  });

});
