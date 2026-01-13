document.addEventListener("DOMContentLoaded", () => {
  const burger = document.getElementById("burger-btn");
  const nav = document.getElementById("mobile-nav");

  if (!burger || !nav) return;

  // toggle burger
  burger.addEventListener("click", () => {
    nav.classList.toggle("hidden");
  });

  // quand on clique sur un lien
  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.add("hidden");
    });
  });

 
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024) {
      nav.classList.add("hidden");
    }
  });
});
