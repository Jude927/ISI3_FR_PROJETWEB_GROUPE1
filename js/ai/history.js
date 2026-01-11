

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

export async function getAllTeachers() {
  const snap = await getDocs(collection(db, "teachers"));

  return snap.docs.map(doc => ({
    uid: doc.id,
    ...doc.data()
  }));
}

export async function getAllStudents() {
  const snap = await getDocs(collection(db, "students"));

  return snap.docs.map(doc => ({
    uid: doc.id,
    ...doc.data()
  }));
}

export async function createConversation(studentId, teacherId) {
  const ref = await addDoc(collection(db, "conversations"), {
    studentId,
    teacherId,
    createdAt: serverTimestamp(),
    lastMessage: ""
  });

  return ref.id; // conversationId

}

export async function sendMessage(conversationId, senderId, senderRole, text) {
  // 1. Ajouter le message
  await addDoc(collection(db, "messages"), {
    conversationId,
    senderId,
    senderRole,
    text,
    createdAt: serverTimestamp()
  });

  // 2. Mettre à jour le dernier message
  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: text
  });
}


export async function loadMessages(conversationId) {
  const q = query(
    collection(db, "messages"),
    where("conversationId", "==", conversationId)
  );

  const snap = await getDocs(q);

  return snap.docs.map(doc => doc.data());
}

export async function loadStudentConversations(studentId) {
  const q = query(
    collection(db, "conversations"),
    where("studentId", "==", studentId)
  );

  const snap = await getDocs(q);
  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}


export async function loadTeacherConversations(teacherId) {
  const q = query(
    collection(db, "conversations"),
    where("teacherId", "==", teacherId)
  );

  const snap = await getDocs(q);
  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
