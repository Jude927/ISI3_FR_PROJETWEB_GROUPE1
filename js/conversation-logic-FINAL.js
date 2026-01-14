/****************************************************
 * COMPATIBLE AVEC LA STRUCTURE FIRESTORE DU COLLÈGUE
 ****************************************************/
import { auth, db } from "./auth/firebase-config.js";
import { doc, getDoc, collection, addDoc, query, where, onSnapshot, orderBy, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentUser = null;
let otherUserId = null;
let conversationId = null;

console.log("🚀 Script chargé");

document.addEventListener("DOMContentLoaded", async () => {
    console.log("💬 DOM ready");
    auth.onAuthStateChanged(async (user) => {
        if (!user) { 
            window.location.href = "login.html"; 
            return; 
        }
        
        currentUser = user;
        otherUserId = sessionStorage.getItem("conversationWith");
        conversationId = sessionStorage.getItem("conversationId");
        
        console.log("✅ User ID:", currentUser.uid);
        console.log("✅ Other User ID:", otherUserId);
        console.log("✅ Conversation ID:", conversationId);
        
        if (!otherUserId) { 
            alert("Pas de destinataire"); 
            history.back(); 
            return; 
        }
        
        try {
            await loadUserInfo();
            await setupConversation();
            loadMessagesRealtime();
            setupButtons();
            console.log("✅✅✅ TOUT EST PRÊT !");
        } catch (error) {
            console.error("❌ ERREUR:", error);
            alert("Erreur: " + error.message);
        }
    });
});

async function loadUserInfo() {
    console.log("👤 Chargement infos...");
    const userDoc = await getDoc(doc(db, "users", otherUserId));
    
    if (!userDoc.exists()) {
        throw new Error("User introuvable");
    }
    
    const userData = userDoc.data();
    console.log("✅ User data:", userData);
    
    const nameEl = document.getElementById("tutor-name");
    if (nameEl) {
        nameEl.textContent = userData.displayName || userData.email || "Utilisateur";
        console.log("✅ Nom affiché:", nameEl.textContent);
    }
    
    const avatarEl = document.getElementById("tutor-avatar");
    if (avatarEl) { 
        avatarEl.src = userData.photoURL || "/assets/avatars/avatardef.png"; 
        avatarEl.onerror = () => avatarEl.src = "/assets/avatars/avatardef.png"; 
    }
    
    const isOnline = userData.isOnline === true;
    const statusTextEl = document.getElementById("status-text");
    const statusDotEl = document.getElementById("status-dot");
    
    if (statusTextEl) { 
        statusTextEl.textContent = isOnline ? "En ligne" : "Hors ligne"; 
        statusTextEl.className = isOnline ? "text-xs text-green-600 font-medium" : "text-xs text-gray-500"; 
    }
    
    if (statusDotEl) {
        statusDotEl.className = `absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`;
    }
    
    console.log("✅ Infos affichées");
}

async function setupConversation() {
    console.log("📂 Setup conversation...");
    
    // ⭐ VÉRIFIER SI LA CONVERSATION EXISTE
    if (conversationId) {
        console.log("🔍 Vérification conversation:", conversationId);
        const convDoc = await getDoc(doc(db, "conversations", conversationId));
        
        if (convDoc.exists()) {
            console.log("✅ Conversation existe:", conversationId);
            return;
        } else {
            console.log("⚠️ Conversation n'existe plus, création d'une nouvelle...");
            conversationId = null;
            sessionStorage.removeItem("conversationId");
        }
    }
    
    // ⭐ CRÉER NOUVELLE CONVERSATION (structure du collègue)
    console.log("🆕 Création nouvelle conversation...");
    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
    const userRole = userDoc.data().role;
    
    const data = { 
        createdAt: serverTimestamp(), 
        lastMessage: "" 
    };
    
    if (userRole === "student") { 
        data.studentId = currentUser.uid; 
        data.teacherId = otherUserId; 
    } else { 
        data.teacherId = currentUser.uid; 
        data.studentId = otherUserId; 
    }
    
    const convRef = await addDoc(collection(db, "conversations"), data);
    conversationId = convRef.id;
    sessionStorage.setItem("conversationId", conversationId);
    
    console.log("✅ Conversation créée:", conversationId);
}

function loadMessagesRealtime() {
    console.log("📨 Chargement messages en temps réel...");
    const container = document.getElementById("messages-container");
    
    if (!container) {
        console.error("❌ Container introuvable");
        return;
    }
    
    // ⭐ QUERY SUR LA COLLECTION "messages" (PAS sous-collection)
    const q = query(
        collection(db, "messages"),
        where("conversationId", "==", conversationId),
        orderBy("createdAt", "asc")
    );
    
    onSnapshot(q, (snapshot) => {
        console.log("📩 Messages reçus:", snapshot.size);
        container.innerHTML = "";
        
        if (snapshot.empty) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <p class="text-gray-700 text-lg font-bold">Aucun message</p>
                    <p class="text-sm text-gray-500 mt-2">Envoyez le premier message pour commencer la conversation</p>
                </div>
            `;
            return;
        }
        
        snapshot.forEach((docSnap) => displayMessage(docSnap.data()));
        container.scrollTop = container.scrollHeight;
    }, (error) => {
        console.error("❌ Erreur chargement messages:", error);
        
        // Si c'est une erreur d'index, afficher un message clair
        if (error.message.includes("index")) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <p class="text-orange-600 font-bold text-lg mb-3">⚠️ Index Firestore manquant</p>
                    <p class="text-sm text-gray-600 mb-4">Cliquez sur le lien ci-dessous pour créer l'index:</p>
                    <a href="${error.message.match(/https:\/\/[^\s]+/)?.[0]}" 
                       target="_blank" 
                       class="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold">
                        Créer l'index Firestore
                    </a>
                    <p class="text-xs text-gray-500 mt-4">Attendre 2-5 minutes après création puis actualiser</p>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="text-center py-12">
                    <p class="text-red-600 font-bold">Erreur de chargement</p>
                    <p class="text-sm text-gray-500 mt-2">${error.message}</p>
                </div>
            `;
        }
    });
}

function displayMessage(message) {
    const container = document.getElementById("messages-container");
    if (!container) return;
    
    const isMine = message.senderId === currentUser.uid;
    const div = document.createElement("div");
    div.className = `mb-3 ${isMine ? 'flex justify-end' : 'flex justify-start'}`;
    
    const bubble = document.createElement("div");
    bubble.className = isMine 
        ? 'bg-orange-500 text-white rounded-2xl rounded-tr-md px-5 py-3 max-w-[75%] shadow-lg' 
        : 'bg-white text-gray-800 rounded-2xl rounded-tl-md px-5 py-3 max-w-[75%] shadow-lg border border-gray-200';
    
    const text = document.createElement("p");
    text.className = "text-sm font-medium";
    text.textContent = message.text || "";
    
    const time = document.createElement("p");
    time.className = "text-xs opacity-70 mt-1";
    
    if (message.createdAt) {
        const date = new Date(message.createdAt.toMillis());
        time.textContent = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    }
    
    bubble.appendChild(text);
    bubble.appendChild(time);
    div.appendChild(bubble);
    container.appendChild(div);
}

function setupButtons() {
    console.log("🔘 Setup boutons...");
    
    const sendBtn = document.getElementById("send-btn");
    if (sendBtn) { 
        sendBtn.addEventListener("click", () => {
            console.log("🔘 Bouton ENVOYER cliqué");
            sendMessage();
        }); 
        console.log("✅ Bouton ENVOYER OK"); 
    } else {
        console.error("❌ Bouton send-btn introuvable");
    }
    
    const input = document.getElementById("message-input");
    if (input) {
        input.addEventListener("keypress", (e) => { 
            if (e.key === "Enter" && !e.shiftKey) { 
                e.preventDefault(); 
                console.log("⌨️ Enter pressé");
                sendMessage(); 
            } 
        });
    }
    
    const fileBtn = document.getElementById("file-btn");
    if (fileBtn) fileBtn.addEventListener("click", () => alert("Fonction fichier bientôt disponible"));
    
    const voiceBtn = document.getElementById("voice-btn");
    if (voiceBtn) voiceBtn.addEventListener("click", () => alert("Fonction vocal bientôt disponible"));
    
    const audioBtn = document.getElementById("audio-call-btn");
    if (audioBtn) audioBtn.addEventListener("click", () => alert("Appel audio bientôt disponible"));
    
    const videoBtn = document.getElementById("video-call-btn");
    if (videoBtn) videoBtn.addEventListener("click", () => alert("Appel vidéo bientôt disponible"));
    
    console.log("✅✅ TOUS BOUTONS OK");
}

async function sendMessage() {
    console.log("📤 ENVOI MESSAGE");
    const input = document.getElementById("message-input");
    
    if (!input) {
        console.error("❌ Input introuvable");
        return;
    }
    
    const text = input.value.trim();
    console.log("📝 Texte:", text);
    
    if (!text) {
        console.log("⚠️ Texte vide");
        return;
    }
    
    try {
        console.log("💾 Sauvegarde Firestore...");
        console.log("   Conversation ID:", conversationId);
        console.log("   User ID:", currentUser.uid);
        
        // ⭐ STRUCTURE DU COLLÈGUE: messages à la racine
        const messageData = {
            conversationId: conversationId,
            senderId: currentUser.uid,
            text: text,
            createdAt: serverTimestamp()
        };
        
        console.log("📦 Message à envoyer:", messageData);
        
        // Ajouter le message dans la collection "messages" (racine)
        await addDoc(collection(db, "messages"), messageData);
        
        // Mettre à jour lastMessage dans la conversation
        await updateDoc(doc(db, "conversations", conversationId), {
            lastMessage: text
        });
        
        input.value = "";
        console.log("✅✅✅ MESSAGE ENVOYÉ !");
        
    } catch (error) {
        console.error("❌ ERREUR ENVOI:", error);
        alert("Erreur envoi: " + error.message);
    }
}

console.log("✅ Script chargé complètement");