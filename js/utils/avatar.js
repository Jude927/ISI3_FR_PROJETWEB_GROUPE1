import { doc, setDoc, getDoc } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { auth } from "/js/auth/firebase-config.js";
import { db } from "/js/auth/firebase-config.js";

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

    option.addEventListener("click", async () => {
      const user = auth.currentUser;
      if (!user) return;

      const newSrc = option.getAttribute("src");

      // Mise à jour UI
      avatarMain.src = newSrc;
      avatarImgs.forEach(img => img.src = newSrc);

      // Sauvegarde Firestore
      await setDoc(
        doc(db, "users", user.uid),
        {
          avatar: newSrc,
          updatedAt: new Date()
        },
        { merge: true }
      );

      modal.classList.add("hidden");
    });
  });

  auth.onAuthStateChanged(async (user) => {
    if (!user) return;

    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) return;

    const data = snap.data();
    if (!data.avatar) return;

    avatarMain.src = data.avatar;
    avatarImgs.forEach(img => img.src = data.avatar);
  });

});
