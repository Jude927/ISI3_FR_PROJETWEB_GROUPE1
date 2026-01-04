

import { db } from "../auth/firebase-config.js";

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const CACHE_KEY = "ai_history_cache";


export function saveToCache(entry) {
  const data = JSON.parse(localStorage.getItem(CACHE_KEY)) || [];
  data.push(entry);
  localStorage.setItem(CACHE_KEY, JSON.stringify(data));
}


export function loadFromCache() {
  return JSON.parse(localStorage.getItem(CACHE_KEY)) || [];
}


export async function saveToFirestore(entry) {
  await addDoc(collection(db, "ai_history"), entry);
}


export async function loadHistoryFirestore(uid) {
  const q = query(
    collection(db, "ai_history"),
    where("uid", "==", uid),
    orderBy("createdAt", "asc")
  );

  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}


export function renderChat(history, container) {
  container.innerHTML = "";

  history.forEach(msg => {
    const div = document.createElement("div");
    div.innerHTML = `
      <p><strong>Moi :</strong> ${msg.question}</p>
      <p><strong>IA :</strong> ${msg.answer}</p>
      <hr>
    `;
    container.appendChild(div);
  });
}
