/**
 * deepseek.js
 * --------------------------------
 * Chat IA DeepSeek avec :
 * - catégories pédagogiques
 * - support bilingue
 * - historique Firestore + offline
 */

import { auth, db } from "../auth/firebase-config.js";
import { CATEGORIES } from "./categories.js";
import {
  saveToCache,
  saveToFirestore
} from "./history.js";

// Firebase Auth
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firestore
import {
  doc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ===============================
   1️⃣ UTILISATEUR CONNECTÉ
   =============================== */

let currentUser = null;
let currentUserRole = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  currentUser = user;

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
const languageSelect = document.getElementById("language");
const responseBox = document.getElementById("responseBox");

/* ===============================
   3️⃣ ENVOI MESSAGE À L’IA
   =============================== */

if (sendBtn) {
  sendBtn.addEventListener("click", async () => {

    const question = promptInput.value.trim();
    const categoryKey = categorySelect.value;
    const language = languageSelect.value; // fr | en

    if (!question || !categoryKey || !language) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    responseBox.innerText = "⏳ Réflexion en cours...";

    // Prompt système bilingue
    const systemPrompt =
      language === "fr"
        ? `Tu es un assistant pédagogique spécialisé en ${CATEGORIES[categoryKey].fr}. Réponds en français.`
        : `You are an educational assistant specialized in ${CATEGORIES[categoryKey].en}. Answer in English.`;

    try {

      /* ===============================
         4️⃣ APPEL API DEEPSEEK
         =============================== */

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
    // "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
    // "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
         "Content-Type": "application/json"
      },
      body: JSON.stringify({
       "model": "deepseek/deepseek-r1-0528:free",
        "messages": [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
    ]
  })
});
      
     

      const data = await res.json();
      const answer = data.choices?.[0]?.message?.content || "Aucune réponse.";

      responseBox.innerText = answer;

      /* ===============================
         5️⃣ HISTORIQUE IA
         =============================== */

      const historyEntry = {
        uid: currentUser.uid,
        role: currentUserRole,
        category: categoryKey,
        language,
        question,
        answer,
        createdAt: serverTimestamp()
      };

      // Cache offline
      saveToCache(historyEntry);

      // Firestore si connexion
      if (navigator.onLine) {
        await saveToFirestore(historyEntry);
      }

      promptInput.value = "";

    } catch (err) {
      console.error(err);
      responseBox.innerText = "❌ Erreur lors de la réponse IA.";
    }
  });
}
