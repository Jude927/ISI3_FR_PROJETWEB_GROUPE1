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

  if (!chatContainer || !input || !sendBtn || !iaItem) return;

  let currentUser = null;
  let STORAGE_KEY = null;
  let store = null;
  let active = false;

  const IA_AVATAR =
    "https://m.thewire.in/sortd-service/imaginary/v22-01/jpg/large/high?url=dGhld2lyZS1pbi1wcm9kLXNvcnRkL21lZGlhZjBmODY5MDAtNGM3ZC0xMWYwLWJmMjMtZjFjNDdiZWUxMTRjLmpwZw==";

  const cle = atob(
    "c2stb3ItdjEtN2QxNjgxYWE3ZTgzMmMxN2U1MjFjNWE5MzYwYTVjODk3ZjVmMjNmZWE5OTVkMjZlZTIzMDcyODZjOTc5ZWUzZA=="
  );

  const formatTime = () =>
    new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const formatAI = (text) =>
    text
      .replace(/### (.*)/g, "<h3 class='font-bold mt-3 mb-2'>✨ $1</h3>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n- (.*)/g, "<li class='ml-4 list-disc'>$1</li>")
      .replace(/\n/g, "<br>");

  function updatePreview() {
    const preview = iaItem.querySelector(".conversation-preview");
    if (!preview || !store) return;

    const last = store.ia.general.at(-1);
    if (!last) return;

    preview.textContent = last.text
      .replace(/<[^>]*>/g, "")
      .trim()
      .slice(0, 70);
  }


  function render(messages) {
    chatContainer.innerHTML = "";

    messages.forEach(m => {
      const div = document.createElement("div");
      div.className = m.from === "me"
        ? "chat-bubble-sent"
        : "chat-bubble-received";

      if (m.from === "them") {
        div.innerHTML = `
          <div class="flex gap-3 items-start">
            <img src="${IA_AVATAR}" class="w-9 h-9 rounded-full object-cover" />
            <div class="flex-1">
              <div class="text-xs text-emerald-500 font-semibold mb-1">
                Assistant IA
              </div>
              <div class="text-sm leading-relaxed space-y-2">${m.text}</div>
              <div class="text-[11px] text-slate-400 mt-2 text-right">${m.time}</div>
            </div>
          </div>`;
      } else {
        div.innerHTML = `
          <div class="text-sm">${m.text}</div>
          <div class="text-[11px] text-slate-400 text-right">${m.time}</div>`;
      }

      chatContainer.appendChild(div);
    });

    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) return location.href = "login.html";

    currentUser = user;
    STORAGE_KEY = `djangou_chat_${user.uid}`;
    store = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { ia: { general: [] } };

    const history = await loadHistoryFirestore(user.uid);

    history.forEach(h => {
      if (!store.ia.general.some(m => m.text === h.answer)) {
        store.ia.general.push(
          { from: "me", text: h.question, time: h.time || "" },
          { from: "them", text: formatAI(h.answer), time: h.time || "" }
        );
      }
    });

    save();
    updatePreview();

  });

  iaItem.addEventListener("click", () => {
    active = true;
    if (store.ia.general.length === 0) {
      store.ia.general.push({
        from: "them",
        text: "<em>Je suis ton assistant IA. Pose ta question.</em>",
        time: formatTime()
      });
      save();
    }
    render(store.ia.general);
    updatePreview();

  });

  async function sendIA() {
    if (!active || !store) return;

    const text = input.value.trim();
    if (!text) return;
    input.value = "";

    store.ia.general.push({ from: "me", text, time: formatTime() });
    updatePreview();

    render(store.ia.general);
    save();

    // Typing DOM ONLY
    const typing = document.createElement("div");
    typing.className = "chat-bubble-received opacity-70 italic";
    typing.innerHTML = `
      <div class="flex gap-3 items-start animate-pulse">
        <img src="${IA_AVATAR}" class="w-9 h-9 rounded-full" />
        <div>L’IA réfléchit…</div>
      </div>`;
    chatContainer.appendChild(typing);
    chatContainer.scrollTop = chatContainer.scrollHeight;

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
      typing.remove();

      const answer = data?.choices?.[0]?.message?.content || "Erreur IA";

      store.ia.general.push({
        from: "them",
        text: formatAI(answer),
        time: formatTime()
      });

      render(store.ia.general);
      save();

      await saveToFirestore({
        uid: currentUser.uid,
        question: text,
        answer,
        createdAt: serverTimestamp()
      });

    } catch {
      typing.remove();
    }
  }

  sendBtn.addEventListener("click", sendIA);
  input.addEventListener("keydown", e => e.key === "Enter" && sendIA());
});
