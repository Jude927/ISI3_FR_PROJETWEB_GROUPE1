import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { auth } from "/js/auth/firebase-config.js";

document.addEventListener("DOMContentLoaded", () => {

  let currentUser = null;
  let STORAGE_KEY = null;
  let store = null;
  let currentConversation = null;

  const chatContainer = document.getElementById("chat-messages");
  const input = document.querySelector("input[placeholder*='Écrivez']");
  const sendBtn = document.querySelector("button span[text='send']")?.parentElement;
  const categorySelect = document.getElementById("category");

  const encoded =
    "c2stb3ItdjEtN2QxNjgxYWE3ZTgzMmMxN2U1MjFjNWE5MzYwYTVjODk3ZjVmMjNmZWE5OTVkMjZlZTIzMDcyODZjOTc5ZWUzZA==";
  const cle = atob(encoded);

  function setUserStorage(uid) {
    STORAGE_KEY = `djangou_chat_${uid}`;
  }

  function loadStorage() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
      conversations: {},
      ia: {}
    };
  }

  function saveStorage(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function nowTime() {
    return new Date().toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function bubble(from, text, time) {
    const div = document.createElement("div");
    div.className = from === "me"
      ? "chat-bubble-sent"
      : "chat-bubble-received";

    div.innerHTML = `
      <p class="text-xs leading-relaxed">${text}</p>
      <span class="text-[9px] text-slate-500 mt-2 block opacity-70">${time}</span>
    `;
    return div;
  }

  function updateSingleConversation(conversationId, lastMessage) {
    const item = document.querySelector(
      `.conversation-item[data-conversation-id="${conversationId}"]`
    );
    if (!item) return;

    const preview = item.querySelector(".conversation-preview");
    const time = item.querySelector(".conversation-time");

    if (preview) preview.textContent = lastMessage.text;
    if (time) time.textContent = lastMessage.time;
  }

  function updateConversationList() {
    document.querySelectorAll(".conversation-item").forEach(item => {
      const id = item.dataset.conversationId;
      let messages = [];

      if (id === "ia") {
        const category = categorySelect?.value || "general";
        messages = store.ia?.[category] || [];
      } else {
        messages = store.conversations?.[id] || [];
      }

      if (!messages.length) return;
      updateSingleConversation(id, messages[messages.length - 1]);
    });
  }

  function render(messages) {
    chatContainer.innerHTML = "";
    messages.forEach(m =>
      chatContainer.appendChild(bubble(m.from, m.text, m.time))
    );
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function openHuman(id) {
    currentConversation = id;
    store.conversations[id] ||= [];
    render(store.conversations[id]);
  }

  function openIA() {
    currentConversation = "ia";
    const category = categorySelect?.value || "general";
    store.ia[category] ||= [];

    if (store.ia[category].length === 0) {
      store.ia[category].push({
        from: "them",
        text: `Assistant IA en ${category}. Pose ta question.`,
        time: nowTime()
      });
    }

    render(store.ia[category]);
  }

  async function askIA(question) {
    const category = categorySelect?.value || "general";

    const userMsg = {
      from: "me",
      text: question,
      time: nowTime()
    };

    store.ia[category].push(userMsg);
    saveStorage(store);
    updateSingleConversation("ia", userMsg);
    openIA();

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + cle,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1-0528:free",
          messages: [
            { role: "system", content: `Tu es un assistant pédagogique en ${category}.` },
            ...store.ia[category].map(m => ({
              role: m.from === "me" ? "user" : "assistant",
              content: m.text
            }))
          ]
        })
      });

      const data = await res.json();
      const answer = data.choices[0].message.content;

      const iaMsg = {
        from: "them",
        text: answer,
        time: nowTime()
      };

      store.ia[category].push(iaMsg);
      saveStorage(store);
      updateSingleConversation("ia", iaMsg);
      openIA();

    } catch {
      const errMsg = {
        from: "them",
        text: "Erreur IA",
        time: nowTime()
      };

      store.ia[category].push(errMsg);
      saveStorage(store);
      updateSingleConversation("ia", errMsg);
      openIA();
    }
  }

  function sendMessage() {
    const text = input.value.trim();
    if (!text || !currentConversation) return;
    input.value = "";

    if (currentConversation === "ia") {
      askIA(text);
    } else {
      const msg = { from: "me", text, time: nowTime() };
      store.conversations[currentConversation].push(msg);
      saveStorage(store);
      updateSingleConversation(currentConversation, msg);
      openHuman(currentConversation);
    }
  }

  sendBtn?.addEventListener("click", sendMessage);
  input?.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });

  document.querySelectorAll(".conversation-item").forEach(item => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".conversation-item")
        .forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      const id = item.dataset.conversationId;
      id === "ia" ? openIA() : openHuman(id);
    });
  });

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    currentUser = user;
    setUserStorage(user.uid);
    store = loadStorage();

    updateConversationList();

    const iaFab = document.getElementById("ai-fab");
    iaFab?.addEventListener("click", () => {
      document
        .querySelector('.conversation-item[data-conversation-id="ia"]')
        ?.click();
    });
  });

});

document.addEventListener("DOMContentLoaded", () => {
  const shouldOpenIA = localStorage.getItem("openIA");

  if (shouldOpenIA === "true") {
    localStorage.removeItem("openIA");

    const iaItem = document.querySelector(
      '.conversation-item[data-conversation-id="ia"]'
    );

    if (iaItem) {
      iaItem.click(); 
    }
  }
});
