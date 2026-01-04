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

function showLoader(buttonId, show) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    const text = document.getElementById(buttonId.replace('SubmitBtn', 'Text'));
    const loader = document.getElementById(buttonId.replace('SubmitBtn', 'Loader'));
    
    if (show) {
        button.disabled = true;
        if (text) text.classList.add('hidden');
        if (loader) loader.classList.remove('hidden');
    } else {
        button.disabled = false;
        if (text) text.classList.remove('hidden');
        if (loader) loader.classList.add('hidden');
    }
}
const form = document.getElementById("loginForm");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

      showLoader('loginSubmitBtn', true);

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
<<<<<<< Updated upstream
=======
    const role = document.getElementById("role").value;

    errorBox.style.display = 'none';
>>>>>>> Stashed changes

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
  alert(err.message);
    }
  });
}

// Redirection automatique après login
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const snap = await getDoc(doc(db, "users", user.uid));

  if (!snap.exists()) {
  alert("Profil utilisateur introuvable");
  return;
}

  const role = snap.data().role;

<<<<<<< Updated upstream
  if (role === "student") {
    window.location.href = "../public/chat-ia.html";
  } else {
    window.location.href = "../index.html";
=======
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
      window.location.href = "../public/dashboard-teacher.html";
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du profil :", error);
    errorBox.style.display = 'block';
    errorBox.innerText = "Erreur lors de la connexion. Veuillez réessayer.";
>>>>>>> Stashed changes
  }
});
