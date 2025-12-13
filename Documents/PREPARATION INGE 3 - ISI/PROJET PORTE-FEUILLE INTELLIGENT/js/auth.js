import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// FORMULAIRE INSCRIPTION
const form = document.getElementById("registerForm");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value;
    const username = document.getElementById("username").value;
    const role = document.getElementById("role").value;
    const classField = document.getElementById("classField").value;
    const subjectsField = document.getElementById("subjectsField").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      // 1. Création compte Auth
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      // 2. Données profil
      const userData = {
        firstName,
        username,
        role,
        createdAt: new Date()
      };

      if (role === "student") {
        userData.class = classField;
      }

      if (role === "teacher") {
        userData.subjects = subjectsField.split(",").map(s => s.trim());
      }

      // 3. Enregistrement Firestore
      await setDoc(doc(db, "users", uid), userData);

      // 4. Redirection
      if (role === "student") {
        window.location.href = "student-dashboard.html";
      } else {
        window.location.href = "teacher-dashboard.html";
      }

    } catch (error) {
     function showError(msg) {
  const box = document.getElementById("errorBox");
  box.innerText = msg;
  box.style.display = "block";
}

switch (error.code) {
  case "auth/email-already-in-use":
    showError("Cet email est déjà utilisé");
    break;
  case "auth/weak-password":
    showError("Mot de passe trop faible");
    break;
  default:
    showError("Erreur lors de l'inscription");
}

    }
  });
}
