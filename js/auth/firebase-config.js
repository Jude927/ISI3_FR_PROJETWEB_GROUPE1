// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Configuration Firebase

 const firebaseConfig = {
  apiKey: "AIzaSyCcXL02RyS42MKELtMZ6ZrEYgFVFaAbBXo",
  authDomain: "tuto-archiweb.firebaseapp.com",
  projectId: "tuto-archiweb",
  storageBucket: "tuto-archiweb.firebasestorage.app",
  messagingSenderId: "527674016230",
  appId: "1:527674016230:web:fff8f34d3c70fccdbc1627"
};


// Initialisation
const app = initializeApp(firebaseConfig);

// Services
export const auth = getAuth(app);
export const db = getFirestore(app);
