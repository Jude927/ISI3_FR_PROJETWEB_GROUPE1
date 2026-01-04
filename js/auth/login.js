import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

    try {
      
      await signInWithEmailAndPassword(auth, email, password);
    
      
    } catch (err) {
     
      showLoader('loginSubmitBtn', false);
    
      alert("Erreur de connexion : " + err.message);
      console.error("Erreur de connexion :", err);
    }
  });
}

// Redirection
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    
    if (!snap.exists()) {
      showLoader('loginSubmitBtn', false);
      alert("Profil utilisateur introuvable");
      return;
    }

    const role = snap.data().role;

    // Redirection simple
    if (role === "student") {
      window.location.href = "../public/dashboard-student.html";
    } else {
      window.location.href = "../public/dashboard-teacher.html";
    }
    
  } catch (error) {
    showLoader('loginSubmitBtn', false);
    alert("Erreur lors de la connexion");
    console.error("Erreur:", error);
  }
});