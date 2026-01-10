import { auth, db } from "../auth/firebase-config.js";
import { CATEGORIES } from "./categories.js";
import {
  saveToCache,
  saveToFirestore,
  loadFromCache,
  loadHistoryFirestore,
  renderChat
} from "./history.js";

import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  getDoc,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentUser = null;
let currentUserRole = null;

const chatBox = document.getElementById("chatBox");
const sendBtn = document.getElementById("sendBtn");
const promptInput = document.getElementById("prompt");
const categorySelect = document.getElementById("category");
const languageSelect = document.getElementById("language");
   chatBox.innerHTML = "Chargement de l'historique...";
const encoded = "c2stb3ItdjEtN2QxNjgxYWE3ZTgzMmMxN2U1MjFjNWE5MzYwYTVjODk3ZjVmMjNmZWE5OTVkMjZlZTIzMDcyODZjOTc5ZWUzZA==";

// Fonction simple de décodage
function decode(str) {
  return atob(str);
}
// Utilisation
const cle = decode(encoded);

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  currentUser = user;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (snap.exists()) {
    currentUserRole = snap.data().role;
  }
 
   
  const history = navigator.onLine
    ? await loadHistoryFirestore(user.uid)
    : loadFromCache();

  renderChat(history, chatBox);
});

sendBtn.addEventListener("click", async () => {
  const question = promptInput.value.trim();
  if (!question) return;
    const div = document.createElement("div");
    div.innerHTML += `
      <p><strong>Moi :</strong> ${question}</p>
    `;
    chatBox.appendChild(div);

    promptInput.value =  "chargement...";
  const categoryKey = categorySelect.value;
  const language = languageSelect.value;

  const systemPrompt =
    language === "fr"
      ? `Tu es un assistant pédagogique en ${CATEGORIES[categoryKey].fr}. Réponds en français.`
      : `You are an educational assistant in ${CATEGORIES[categoryKey].en}. Answer in English.`;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + cle,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-0528:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ]
      })
    });
    const data = await res.json();
    const answer = data.choices[0].message.content;

    const entry = {
      uid: currentUser.uid,
      role: currentUserRole,
      category: categoryKey,
      language,
      question,
      answer,
      createdAt: serverTimestamp()
    };

    saveToCache(entry);
    if (navigator.onLine) await saveToFirestore(entry);

    const history = navigator.onLine
      ? await loadHistoryFirestore(currentUser.uid)
      : loadFromCache();
    div.innerHTML += `
      <p><strong>Ai :</strong> ${answer}</p>
      <hr>
    `;
    chatBox.appendChild(div);
    promptInput.value = "";

  } catch (err) {
    console.error(err);
    alert("Erreur IA");
  }
});
