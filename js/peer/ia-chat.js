import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth } from "/js/auth/firebase-config.js";

import { loadHistoryFirestore, saveToFirestore } from "/js/ai/history.js";
import { serverTimestamp } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const chatContainer = document.getElementById("chat-messages");
  const input = document.getElementById("messageInput");
  const sendBtn = document.getElementById("sendBtn");
  const iaItem = document.querySelector('[data-conversation-id="ia"]');

  if (!chatContainer || !input || !sendBtn || !iaItem) {
    console.error("[IA] DOM manquant");
    return;
  }

  let currentUser = null;
  let STORAGE_KEY = null;
  let store = null;
  let active = false;

  const encoded =
    "c2stb3ItdjEtN2QxNjgxYWE3ZTgzMmMxN2U1MjFjNWE5MzYwYTVjODk3ZjVmMjNmZWE5OTVkMjZlZTIzMDcyODZjOTc5ZWUzZA==";
  const cle = atob(encoded);

  function formatTime(date = new Date()) {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function render(messages) {
    chatContainer.innerHTML = "";

    messages.forEach(m => {
      const div = document.createElement("div");
      div.className = m.from === "me"
        ? "chat-bubble-sent"
        : "chat-bubble-received";

      div.innerHTML = `
        <div class="text-sm leading-relaxed">${m.text}</div>
        <div class="text-[11px] text-slate-400 mt-1 text-right">
          ${m.time}
        </div>
      `;

      chatContainer.appendChild(div);
    });

    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function updatePreview(msg) {
    const preview = iaItem.querySelector(".conversation-preview");
    const time = iaItem.querySelector(".conversation-time");

    if (preview) preview.textContent = msg.text;
    if (time) time.textContent = msg.time;
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    currentUser = user;
    STORAGE_KEY = `djangou_chat_${user.uid}`;

    store = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
      ia: { general: [] }
    };

    const history = await loadHistoryFirestore(user.uid);

    history.forEach(h => {
      const exists = store.ia.general.some(
        m => m.text === h.question || m.text === h.answer
      );

      if (!exists) {
        store.ia.general.push(
          { from: "me", text: h.question, time: h.time || "" },
          { from: "them", text: h.answer, time: h.time || "" }
        );
      }
    });

    save();

    if (store.ia.general.length > 0) {
      updatePreview(store.ia.general.at(-1));
    }
  });

  iaItem.addEventListener("click", () => {
    if (!store) return;
    active = true;

    if (store.ia.general.length === 0) {
      const welcome = {
        from: "them",
        text: "Assistant IA. Pose ta question.",
        time: formatTime()
      };
      store.ia.general.push(welcome);
      save();
      updatePreview(welcome);
    }

    render(store.ia.general);
  });

  async function sendIA() {
    if (!active || !store || !currentUser) return;

    const text = input.value.trim();
    if (!text) return;
    input.value = "";

    const userMsg = {
      from: "me",
      text,
      time: formatTime()
    };

    store.ia.general.push(userMsg);
    render(store.ia.general);
    updatePreview(userMsg);
    save();

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + cle,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1-0528:free",
          messages: store.ia.general.map(m => ({
            role: m.from === "me" ? "user" : "assistant",
            content: m.text
          }))
        })
      });

      const data = await res.json();
      const answer = data?.choices?.[0]?.message?.content || "Erreur IA";

      const iaMsg = {
        from: "them",
        text: answer,
        time: formatTime()
      };

      store.ia.general.push(iaMsg);
      render(store.ia.general);
      updatePreview(iaMsg);
      save();

      await saveToFirestore({
        uid: currentUser.uid,
        question: text,
        answer,
        createdAt: serverTimestamp()
      });

    } catch {
      const err = {
        from: "them",
        text: "Erreur IA",
        time: formatTime()
      };
      store.ia.general.push(err);
      render(store.ia.general);
      updatePreview(err);
      save();
    }
  }

  sendBtn.addEventListener("click", sendIA);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") sendIA();
  });

});
