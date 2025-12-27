import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
// Connexion
const form = document.getElementById("loginForm");
const errorBox = document.getElementById("errorBox");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    // Cacher les erreurs précédentes
    errorBox.style.display = 'none';

    try {
      // Tentative de connexion
      await signInWithEmailAndPassword(auth, email, password);
      
      // Le redirection sera gérée par onAuthStateChanged
    } catch (err) {
      // Afficher l'erreur dans la boîte d'erreur
      errorBox.style.display = 'block';
      
      switch (err.code) {
        case "auth/invalid-email":
          errorBox.innerText = "Adresse email invalide.";
          break;
        case "auth/user-disabled":
          errorBox.innerText = "Ce compte a été désactivé.";
          break;
        case "auth/user-not-found":
          errorBox.innerText = "Aucun compte trouvé avec cet email.";
          break;
        case "auth/wrong-password":
          errorBox.innerText = "Mot de passe incorrect.";
          break;
        case "auth/too-many-requests":
          errorBox.innerText = "Trop de tentatives. Veuillez réessayer plus tard.";
          break;
        default:
          errorBox.innerText = "Erreur de connexion. Veuillez vérifier vos informations.";
      }
      
      console.error("Erreur de connexion :", err);
    }
  });
}



// Redirection automatique après login
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  try {
    const snap = await getDoc(doc(db, "users", user.uid));

    if (!snap.exists()) {
      errorBox.style.display = 'block';
      errorBox.innerText = "Profil utilisateur introuvable";
      return;
    }

    const userData = snap.data();
    const role = userData.role;

    // Vérifier si le rôle correspond au rôle sélectionné (optionnel)
    const selectedRole = document.getElementById('role')?.value;
    if (selectedRole && selectedRole !== role) {
      errorBox.style.display = 'block';
      if (role === 'student') {
        errorBox.innerText = "Veuillez vous connecter en tant qu'étudiant.";
      } else {
        errorBox.innerText = "Veuillez vous connecter en tant que tuteur.";
      }
      
      // Déconnexion car le rôle ne correspond pas
      await auth.signOut();
      return;
    }

    // Redirection en fonction du rôle
    if (role === "student") {
      window.location.href = "../public/dashboard-student.html";
    } else {
      window.location.href = "../public/dashboard-tutor.html";
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du profil :", error);
    errorBox.style.display = 'block';
    errorBox.innerText = "Erreur lors de la connexion. Veuillez réessayer.";
  }
});