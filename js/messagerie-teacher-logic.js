/****************************************************
 * messagerie-teacher-logic.js
 * ✅ BRANCHÉ AU BACKEND FIRESTORE
 * ✅ Conversations temps réel
 * ✅ Recherche fonctionnelle
 ****************************************************/
import { auth, db } from "./auth/firebase-config.js";
import { collection, query, where, onSnapshot, orderBy, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentUser = null;
let allConversations = [];
let unwatchConversations = null;

console.log("💬 Script messagerie tuteur chargé");

document.addEventListener("DOMContentLoaded", async () => {
    console.log("📱 DOM ready");
    
    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            console.log("❌ Non authentifié");
            window.location.href = "login.html";
            return;
        }

        currentUser = user;
        console.log("✅ Tuteur connecté:", user.uid);

        // Charger conversations
        loadConversationsRealtime();

        // Setup recherche
        setupSearch();

        // Setup déconnexion
        setupLogout();
    });
});

/**
 * Charger conversations en temps réel
 */
function loadConversationsRealtime() {
    console.log("📚 Chargement conversations temps réel...");

    const listContainer = document.getElementById("conversations-list");
    if (!listContainer) {
        console.error("❌ Container conversations-list introuvable");
        return;
    }

    // ✅ Query sans orderBy (pas besoin d'index)
    const q = query(
        collection(db, "conversations"),
        where("teacherId", "==", currentUser.uid)
    );

    // Listener temps réel
    unwatchConversations = onSnapshot(q, async (snapshot) => {
        console.log("📩 Conversations trouvées:", snapshot.size);

        // Reset
        allConversations = [];
        listContainer.innerHTML = "";

        if (snapshot.empty) {
            listContainer.innerHTML = `
                <div class="text-center py-16">
                    <span class="material-icons-round text-gray-300 dark:text-gray-600 text-6xl mb-4">chat_bubble_outline</span>
                    <p class="text-gray-500 dark:text-gray-400 font-medium text-lg">Aucune conversation</p>
                    <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">Les étudiants qui vous contactent apparaîtront ici</p>
                </div>
            `;
            return;
        }

        // ✅ Récupérer toutes les conversations
        const conversationsData = [];
        
        for (const docSnap of snapshot.docs) {
            const conversationId = docSnap.id;
            const conversationData = docSnap.data();

            try {
                const studentDoc = await getDoc(doc(db, "users", conversationData.studentId));
                const studentData = studentDoc.exists() ? studentDoc.data() : {};

                conversationsData.push({
                    id: conversationId,
                    data: conversationData,
                    student: studentData,
                    // Pour le tri
                    _sortTime: conversationData.lastMessageTime?.toMillis() || 0
                });
            } catch (error) {
                console.error("❌ Erreur chargement étudiant:", error);
            }
        }

        // ✅ TRIER MANUELLEMENT (du plus récent au plus ancien)
        conversationsData.sort((a, b) => b._sortTime - a._sortTime);

        // Afficher
        conversationsData.forEach(conv => {
            allConversations.push(conv);
            const card = createConversationCard(conv);
            listContainer.appendChild(card);
        });

        console.log("✅ Conversations affichées:", allConversations.length);
        
    }, (error) => {
        console.error("❌ Erreur chargement conversations:", error);
        
        // Afficher le lien pour créer l'index
        listContainer.innerHTML = `
            <div class="text-center py-12">
                <p class="text-red-600 dark:text-red-400 font-medium">⚠️ Index Firestore manquant</p>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Cliquez ci-dessous pour créer l'index:</p>
                <a href="https://console.firebase.google.com/v1/r/project/tuto-archiweb/firestore/indexes?create_composite=ClNwcm9qZWN0cy90dXRvLWFyY2hpd2ViL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9jb252ZXJzYXRpb25zL2luZGV4ZXMvXxABGg0KCXRlYWNoZXJJZBABGhMKD2xhc3RNZXNzYWdlVGltZRACGgwKCF9fbmFtZV9fEAI" 
                   target="_blank" 
                   class="inline-block mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                    Créer l'index maintenant
                </a>
                <p class="text-xs text-gray-500 mt-4">Attendre 2-5 minutes après création</p>
            </div>
        `;
    });
}
/**
 * Créer une carte de conversation
 */
function createConversationCard(conversation) {
    const { id, data, student } = conversation;

    const div = document.createElement("div");
    div.className = "conversation-card p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl cursor-pointer transition-all border border-gray-200 dark:border-gray-700 hover:shadow-md";

    const photoURL = student.photoURL || "/assets/avatars/avatardef.png";
    const displayName = student.displayName || student.email || "Étudiant";
    const lastMessage = data.lastMessage || "Nouvelle conversation";
    const isOnline = student.isOnline === true;

    // Temps relatif
    const timeStr = formatTime(data.lastMessageTime);

    div.innerHTML = `
        <div class="flex items-center gap-4">
            <div class="relative flex-shrink-0">
                <img 
                    src="${photoURL}" 
                    alt="${displayName}" 
                    class="w-14 h-14 rounded-full object-cover border-2 border-primary/30"
                    onerror="this.src='/assets/avatars/avatardef.png'" 
                />
                ${isOnline ? '<div class="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>' : ''}
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                    <h4 class="font-bold text-gray-900 dark:text-white truncate">${displayName}</h4>
                    <span class="text-xs text-gray-400 dark:text-gray-500">${timeStr}</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 truncate">${lastMessage}</p>
            </div>
        </div>
    `;

    // Clic → Ouvrir conversation
    div.addEventListener("click", () => {
        openConversation(id, data.studentId);
    });

    return div;
}

/**
 * Ouvrir une conversation
 */
function openConversation(conversationId, studentId) {
    console.log("📖 Ouverture conversation:", conversationId);
    console.log("👤 Avec étudiant:", studentId);
    
    // Stocker dans sessionStorage
    sessionStorage.setItem("conversationId", conversationId);
    sessionStorage.setItem("conversationWith", studentId);
    
    console.log("✅ SessionStorage mis à jour");
    console.log("   conversationId:", conversationId);
    console.log("   conversationWith:", studentId);
    
    // Rediriger
    window.location.href = "conversation.html";
}

/**
 * Formater le temps relatif
 */
function formatTime(timestamp) {
    if (!timestamp) return "";
    
    const time = timestamp.toMillis ? timestamp.toMillis() : timestamp;
    const diff = Date.now() - time;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    return `${days}j`;
}

/**
 * Setup recherche
 */
function setupSearch() {
    const searchInput = document.getElementById("search-input");
    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        console.log("🔍 Recherche:", searchTerm);

        const listContainer = document.getElementById("conversations-list");
        listContainer.innerHTML = "";

        if (searchTerm === "") {
            // Afficher toutes les conversations
            allConversations.forEach(conv => {
                const card = createConversationCard(conv);
                listContainer.appendChild(card);
            });
            return;
        }

        // Filtrer
        const filtered = allConversations.filter(conv => {
            const name = (conv.student.displayName || conv.student.email || "").toLowerCase();
            const message = (conv.data.lastMessage || "").toLowerCase();
            return name.includes(searchTerm) || message.includes(searchTerm);
        });

        console.log("✅ Résultats filtrés:", filtered.length);

        if (filtered.length === 0) {
            listContainer.innerHTML = `
                <div class="text-center py-12">
                    <span class="material-icons-round text-gray-300 dark:text-gray-600 text-5xl mb-3">search_off</span>
                    <p class="text-gray-500 dark:text-gray-400 font-medium">Aucun résultat</p>
                    <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">Essayez un autre terme de recherche</p>
                </div>
            `;
            return;
        }

        // Afficher résultats
        filtered.forEach(conv => {
            const card = createConversationCard(conv);
            listContainer.appendChild(card);
        });
    });
}

/**
 * Setup déconnexion
 */
function setupLogout() {
    const logoutBtn = document.getElementById("logout-btn");
    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", async () => {
        try {
            console.log("🚪 Déconnexion...");
            await auth.signOut();
            console.log("✅ Déconnecté");
            window.location.href = "login.html";
        } catch (error) {
            console.error("❌ Erreur déconnexion:", error);
        }
    });
}

// Cleanup
window.addEventListener("beforeunload", () => {
    if (unwatchConversations) {
        unwatchConversations();
    }
});

console.log("✅ Script messagerie tuteur prêt");