import { auth } from "./firebase-config.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "../index.html";
});

document.getElementById("logoutBtnMobile").addEventListener("click", async () => {
  await signOut(auth);
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "../index.html";
});
