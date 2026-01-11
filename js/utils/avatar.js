document.addEventListener("DOMContentLoaded", () => {
  const avatarMain = document.getElementById("profileAvatar");       
  const avatarImgs = document.querySelectorAll(".profile-avatar");  
  const modal = document.getElementById("avatarModal");
  const closeBtn = document.getElementById("closeAvatarModal");

  if (!avatarMain || !modal || !closeBtn) return;


  avatarMain.addEventListener("click", () => {
    modal.classList.remove("hidden");
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });


  document.querySelectorAll(".avatar-option").forEach(option => {
    option.classList.add(
      "w-24","h-24","rounded-2xl","object-cover",
      "cursor-pointer","hover:scale-110","transition"
    );

    option.addEventListener("click", () => {
      const newSrc = option.getAttribute("src");

avatarMain.setAttribute("src", newSrc);


avatarImgs.forEach(img => {
  if (img !== avatarMain) {
    img.setAttribute("src", newSrc);
  }
});
      localStorage.setItem("profileAvatar", newSrc);

      modal.classList.add("hidden");
    });
  });

  const saved = localStorage.getItem("profileAvatar");
  if (saved) {
  avatarMain.setAttribute("src", saved);
  avatarImgs.forEach(img => {
    if (img !== avatarMain) {
      img.setAttribute("src", saved);
    }
  });
  }

});