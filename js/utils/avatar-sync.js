document.addEventListener("DOMContentLoaded", () => {
  const avatar = localStorage.getItem("profileAvatar");

  document.querySelectorAll(".profile-avatar").forEach(img => {
    if (avatar) {
      img.src = avatar;
    }
    img.classList.remove("opacity-0");
  });
});
