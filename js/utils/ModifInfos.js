import { getAuth, onAuthStateChanged, updateEmail, updatePassword }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  EmailAuthProvider,
  reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "/js/auth/firebase-config.js";

const auth = getAuth();
let currentUser = null;

function showToast(message, type = "success") {
  const toast = document.createElement("div");

  toast.className = `
    fixed top-6 right-6 z-[9999]
    px-6 py-4 rounded-2xl shadow-xl
    text-sm font-bold
    ${type === "error"
      ? "bg-rose-500 text-white"
      : "bg-emerald-500 text-white"}
    animate-fade-in
  `;

  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("opacity-0");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

onAuthStateChanged(auth, (user) => {
  if (!user) return;

  currentUser = user;

  document.getElementById("emailDisplay").value = user.email;
  document.getElementById("email").value = user.email;
});

window.toggleEmailEdit = () => {
  document.getElementById("emailEdit").classList.toggle("hidden");
};

window.togglePasswordEdit = () => {
  document.getElementById("passwordEdit").classList.toggle("hidden");
};

async function reauthentifierUtilisateur(password) {
  const credential = EmailAuthProvider.credential(
    currentUser.email,
    password
  );
  await reauthenticateWithCredential(currentUser, credential);
}

//Modifier email
window.modifierEmail = async () => {
  const newEmail = document.getElementById("email").value.trim();
  const password = document.getElementById("oldPasswordEmail").value;

  if (!newEmail || !password) {
    showToast("Veuillez saisir votre mot de passe actuel", "error");
    return;
  }

  try {
    await reauthentifierUtilisateur(password);
    await updateEmail(currentUser, newEmail);

    await updateDoc(doc(db, "teachers", currentUser.uid), {
      email: newEmail
    });

    document.getElementById("emailDisplay").value = newEmail;
    document.getElementById("emailEdit").classList.add("hidden");

    showToast("Email modifié avec succès");
  } catch (err) {
    console.error(err);
    showToast("Mot de passe incorrect ou session expirée", "error");
  }
};

//Modifier mot de passe
window.modifierMotDePasse = async () => {
  const newPassword = document.getElementById("newPassword").value;

  if (newPassword.length < 6) {
    showToast("Mot de passe trop court (min 6 caractères)", "error");
    return;
  }

  try {
    await updatePassword(currentUser, newPassword);
    document.getElementById("passwordEdit").classList.add("hidden");
    document.getElementById("newPassword").value = "";

    showToast("Mot de passe modifié avec succès");
  } catch (err) {
    console.error(err);
    showToast("Veuillez vous reconnecter pour changer le mot de passe", "error");
  }
};
