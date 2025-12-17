/**
 * deepseek.js
 * ----------------------------------
 * Gère l’assistant pédagogique IA :
 * - Envoi de la question à DeepSeek
 * - Affichage de la réponse
 * - Sauvegarde de l’historique dans Firestore (ai_history)
 */

import { auth, db } from "../auth/firebase-config.js";

// Firebase Auth
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firestore
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ===============================
   1️⃣ ÉTAT UTILISATEUR CONNECTÉ
   =============================== */

let currentUser = null;
let currentUserRole = null;

// Récupération de l’utilisateur connecté + son rôle
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  currentUser = user;

  // Récupération du rôle depuis Firestore
  const snap = await getDoc(doc(db, "users", user.uid));
  if (snap.exists()) {
    currentUserRole = snap.data().role;
  }
});

/* ===============================
   2️⃣ ÉLÉMENTS DU DOM
   =============================== */

const sendBtn = document.getElementById("sendBtn");
const promptInput = document.getElementById("prompt");
const categorySelect = document.getElementById("category");
const responseBox = document.getElementById("responseBox");

/* ===============================
   3️⃣ ENVOI DE LA QUESTION À L’IA
   =============================== */

if (sendBtn) {
  sendBtn.addEventListener("click", async () => {

    const userPrompt = promptInput.value.trim();
    const category = categorySelect.value;

    if (!userPrompt || !category) {
      alert("Veuillez entrer une question et choisir une catégorie.");
      return;
    }

    if (!currentUser) {
      alert("Vous devez être connecté.");
      return;
    }

    responseBox.innerText = "⏳ Réflexion en cours...";

    try {

      /* ===============================
         4️⃣ APPEL API DEEPSEEK
         =============================== */

      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer sk-a213ed60cf6046fbab6f1266ac4f18e7"
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: `Tu es un assistant pédagogique spécialisé en ${category}.`
            },
            {
              role: "user",
              content: userPrompt
            }
          ]
        })
      });

      const data = await response.json();

      const aiAnswer =
        data.choices?.[0]?.message?.content ||
        "Aucune réponse générée.";

      /* ===============================
         5️⃣ AFFICHAGE DE LA RÉPONSE
         =============================== */

      responseBox.innerText = aiAnswer;

      /* ===============================
         6️⃣ SAUVEGARDE DANS ai_history
         =============================== */

      await addDoc(collection(db, "ai_history"), {
        uid: currentUser.uid,
        role: currentUserRole,
        category: category,
        question: userPrompt,
        answer: aiAnswer,
        createdAt: serverTimestamp()
      });

      // Nettoyage du champ
      promptInput.value = "";

    } catch (error) {
      console.error("Erreur IA :", error);
      responseBox.innerText =
        "❌ Erreur lors de la communication avec l’assistant IA.";
    }
  });
}
