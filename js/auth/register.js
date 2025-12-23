// import { auth, db } from "./firebase-config.js";
// import {
//   createUserWithEmailAndPassword
// } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// import {
//   doc,
//   setDoc,
//   serverTimestamp
// } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// const form = document.getElementById("registerForm");

// if (form) {
//   form.addEventListener("submit", async (e) => {
//     e.preventDefault();

//     const firstName = document.getElementById("firstName").value;
//     const username = document.getElementById("username").value;
//     const role = document.getElementById("role").value;
//     const classField = document.getElementById("classField").value;
//     const subjectsField = document.getElementById("subjectsField").value;
//     const email = document.getElementById("email").value;
//     const password = document.getElementById("password").value;

//     try {
//       // 1️⃣ Auth
//       const cred = await createUserWithEmailAndPassword(auth, email, password);
//       const uid = cred.user.uid;

//       // 2️⃣ users
//       await setDoc(doc(db, "users", uid), {
//         firstName,
//         username,
//         role,
//         class: role === "student" ? classField : null,
//         createdAt: serverTimestamp()
//       });

//       // 3️⃣ teachers (UNIQUEMENT TUTEUR)
//       if (role === "teacher") {
//         const subjects = subjectsField
//           .split(",")
//           .map(s => s.trim())
//           .filter(s => s);

//         await setDoc(doc(db, "teachers", uid), {
//           subjects,
//           available: true,
//           createdAt: serverTimestamp()
//         });
//       }

//       // 4️⃣ Redirection
//       window.location.href =
//         role === "student"
//           ? "../index.html"
//           : "../index.html";

//     } catch (error) {
//       const box = document.getElementById("errorBox");
//       box.style.display = "block";

//       switch (error.code) {
//         case "auth/email-already-in-use":
//           box.innerText = "Cet email est déjà utilisé";
//           break;
//         case "auth/weak-password":
//           box.innerText = "Mot de passe trop faible";
//           break;
//         default:
//           box.innerText = "Erreur lors de l'inscription";
//       }
//     }
//   });
// }
/**
 * register.js
 * -----------------------------
 * Gère l’inscription des utilisateurs (élèves et tuteurs)
 * - Création du compte Firebase Authentication
 * - Enregistrement du profil dans la collection "users"
 * - Enregistrement des données pédagogiques dans "teachers" (tuteurs uniquement)
 */

import { auth, db } from "./firebase-config.js";

// Firebase Auth : création de compte
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firestore : écriture de documents
import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Récupération du formulaire d’inscription
  const  form = document.getElementById("registerForm");

// On vérifie que le script est bien chargé sur la page register
if (form) {

  // Écoute de la soumission du formulaire
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page

    /* ===============================
       1️⃣ RÉCUPÉRATION DES DONNÉES
       =============================== */

    const firstName = document.getElementById("firstName").value;
    const username = document.getElementById("username").value;
    const role = document.getElementById("role").value; // student | teacher
    const classField = document.getElementById("classField").value;
    const subjectsField = document.getElementById("subjectsField").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

      /* ===============================
         2️⃣ CRÉATION DU COMPTE AUTH
         =============================== */

      // Création du compte Firebase Authentication
      const cred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Identifiant unique de l’utilisateur
      const uid = cred.user.uid;

      /* ===============================
         3️⃣ ENREGISTREMENT DANS "users"
         =============================== */

      // Données communes à tous les utilisateurs
      const userData = {
        firstName,
        username,
        role,
        createdAt: serverTimestamp()
      };

      // Donnée spécifique à l’élève
      if (role === "student") {
        userData.class = classField;
      }

      // Écriture du profil utilisateur
      await setDoc(doc(db, "users", uid), userData);

      /* ===============================
         4️⃣ ENREGISTREMENT DANS "teachers"
         ===============================
         ⚠️ Cette partie concerne UNIQUEMENT les tuteurs
      */

      if (role === "teacher") {

        // Transformation de la chaîne en tableau de matières
        const subjects = subjectsField
          .split(",")
          .map(subject => subject.trim())
          .filter(subject => subject !== "");

        // Création du document tuteur
        await setDoc(doc(db, "teachers", uid), {
          subjects,              // Matières enseignées
          available: true,       // Disponibilité par défaut
          createdAt: serverTimestamp()
        });
      }

      /* ===============================
         5️⃣ REDIRECTION APRÈS INSCRIPTION
         =============================== */

      if (role === "student") {
        window.location.href = "../index.html";
      } else {
        window.location.href = "../index.html";
      }

    } catch (error) {

      /* ===============================
         6️⃣ GESTION DES ERREURS
         =============================== */

      const errorBox = document.getElementById("errorBox");
      errorBox.style.display = "block";

      switch (error.code) {
        case "auth/email-already-in-use":
          errorBox.innerText = "Cet email est déjà utilisé.";
          break;
        case "auth/weak-password":
          errorBox.innerText = "Mot de passe trop faible (6 caractères minimum).";
          break;
        default:
          errorBox.innerText = "Erreur lors de l'inscription.";
      }

      console.error("Erreur inscription :", error);
    }
  });
}
