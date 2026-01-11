document.addEventListener("DOMContentLoaded", () => {
  const iaFab = document.getElementById("ai-fab");

  if (!iaFab) return;

  iaFab.addEventListener("click", () => {
 
    localStorage.setItem("openIA", "true");

    window.location.href = "messagerie-teacher.html";
  });
});