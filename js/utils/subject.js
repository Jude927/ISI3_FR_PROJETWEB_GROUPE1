 import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  getDoc
} from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { auth, db } from "/js/auth/firebase-config.js";

document.addEventListener("DOMContentLoaded", () => {

  const subjectTitle = document.getElementById("subject-text");

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "dashboard-teacher.html";
      return;
    }

    try {
      const ref = doc(db, "teachers", user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        console.warn("Document teacher introuvable");
        return;
      }

      const data = snap.data();

      const subjects = data.subjects;

      if (subjects && subjects.length > 0) {
        subjectTitle.textContent = subjects[0];
      } else {
        subjectTitle.textContent = "Matière non définie";
      }

    } catch (err) {
      console.error("Erreur chargement matière :", err);
    }
  });

});