document.addEventListener("DOMContentLoaded", () => {

  const items = document.querySelectorAll(".conversation-item");
  const chatContainer = document.getElementById("chat-messages");

  if (!items.length || !chatContainer) return;

  items.forEach(item => {
    item.addEventListener("click", () => {

      const id = item.dataset.conversationId;

      items.forEach(i => {
        i.classList.remove("active");
        i.setAttribute("aria-selected", "false");
      });

      item.classList.add("active");
      item.setAttribute("aria-selected", "true");

      if (id !== "ia") {

        chatContainer.innerHTML = `
          <div class="h-full flex items-center justify-center
                      text-slate-400 text-sm">
            Sélectionne une conversation
          </div>
        `;
      }

    });
  });

});
