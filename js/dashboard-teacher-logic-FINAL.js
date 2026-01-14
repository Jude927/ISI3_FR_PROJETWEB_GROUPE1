/****************************************************
 * dashboard-teacher-logic-FINAL.js
 * ✅ VERSION CORRIGÉE - Liste étudiants + cohérence
 ****************************************************/

import { auth, db } from "./auth/firebase-config.js";
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    onSnapshot,
    getDoc,
    doc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { initPeerModule } from "./peer/index.js";

let currentUser = null;
let unwatchStudents = null;
let isAvailable = true;

document.addEventListener("DOMContentLoaded", async () => {
    console.log("👨‍🏫 [DASHBOARD TUTEUR] Initialisation...");

    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            console.log("❌ Pas d'utilisateur connecté, redirection...");
            window.location.href = "login.html";
            return;
        }

        currentUser = user;
        console.log("✅ Tuteur connecté:", user.uid);

        displayUserInfo();
        await initializePeer();
        loadTeacherStatsRealtime();
        setupAvailabilityButton();
    });
});

function displayUserInfo() {
    const userName = document.getElementById("user-name");
    if (userName) {
        userName.textContent = currentUser.displayName || currentUser.email || "Tuteur";
    }

    const userPhoto = document.getElementById("user-photo");
    if (userPhoto) {
        userPhoto.src = currentUser.photoURL || "/assets/avatars/avatardef.png";
        userPhoto.onerror = () => {
            userPhoto.src = "/assets/avatars/avatardef.png";
        };
    }

    const greeting = document.getElementById("greeting");
    if (greeting) {
        const firstName = (currentUser.displayName || "").split(" ")[0] || "Tuteur";
        greeting.textContent = `Bonjour, ${firstName}! 👋`;
    }
}

async function initializePeer() {
    try {
        console.log("🔗 Initialisation Peer tuteur...");
        
        await initPeerModule({
            onReady: (peerId) => {
                console.log("✅ [TUTEUR] Peer initialisé:", peerId);
            },
            onError: (err) => {
                console.error("❌ [TUTEUR] Erreur Peer:", err);
            }
        });
    } catch (error) {
        console.error("❌ Erreur init Peer:", error);
    }
}

function loadTeacherStatsRealtime() {
    try {
        console.log("📊 Chargement stats en temps réel...");

        // ⭐ ÉTUDIANTS EN LIGNE (temps réel)
        const studentsQuery = query(
            collection(db, "students"),
            where("isOnline", "==", true)
        );

        unwatchStudents = onSnapshot(studentsQuery, async (snapshot) => {
            const onlineCount = snapshot.size;
            console.log(`✅ ${onlineCount} étudiant(s) en ligne`);

            // Mettre à jour les compteurs
            const onlineCountEl = document.getElementById("online-students-count");
            if (onlineCountEl) onlineCountEl.textContent = onlineCount;

            const onlineCountEl2 = document.getElementById("online-students-count-2");
            if (onlineCountEl2) onlineCountEl2.textContent = onlineCount;

            // ⭐ AFFICHER LA LISTE DES ÉTUDIANTS
            await displayOnlineStudentsList(snapshot);
        });

        // TOTAL ÉTUDIANTS
        getDocs(collection(db, "students")).then((snapshot) => {
            const totalCountEl = document.getElementById("total-students-count");
            if (totalCountEl) totalCountEl.textContent = snapshot.size;
        });

        // SESSIONS
        const teacherRef = doc(db, "teachers", currentUser.uid);
        onSnapshot(teacherRef, (docSnap) => {
            if (docSnap.exists()) {
                const sessions = docSnap.data().totalSessions || 0;
                const sessionsEl = document.getElementById("total-sessions-count");
                if (sessionsEl) sessionsEl.textContent = sessions;
            }
        });

    } catch (error) {
        console.error("❌ Erreur stats:", error);
    }
}

/**
 * ⭐ AFFICHER LA LISTE DES ÉTUDIANTS EN LIGNE
 */
async function displayOnlineStudentsList(snapshot) {
    const listContainer = document.getElementById("online-students-list");
    if (!listContainer) return;

    // Vider le container
    listContainer.innerHTML = "";

    if (snapshot.empty) {
        // Aucun étudiant
        listContainer.innerHTML = `
            <div class="text-center py-16">
                <div class="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                    <span class="material-icons-round text-gray-400 text-4xl">people_outline</span>
                </div>
                <p class="text-gray-500 dark:text-gray-400 font-medium">Aucun étudiant en ligne</p>
                <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">Les étudiants connectés apparaîtront ici</p>
            </div>
        `;
        return;
    }

    // Récupérer les infos complètes de chaque étudiant
    const studentsPromises = snapshot.docs.map(async (docSnap) => {
        const studentId = docSnap.id;
        const studentData = docSnap.data();

        // Récupérer depuis users/
        const userDoc = await getDoc(doc(db, "users", studentId));
        const userData = userDoc.exists() ? userDoc.data() : {};

        return {
            id: studentId,
            ...userData,
            ...studentData
        };
    });

    const students = await Promise.all(studentsPromises);

    // Afficher chaque étudiant
    students.forEach(student => {
        const card = createStudentCard(student);
        listContainer.appendChild(card);
    });

    console.log(`✅ ${students.length} étudiant(s) affichés dans la liste`);
}

/**
 * Créer une carte étudiant
 */
function createStudentCard(student) {
    const div = document.createElement("div");
    div.className = "flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-100 dark:border-gray-700";

    const photoURL = student.photoURL || "/assets/avatars/avatardef.png";
    const displayName = student.displayName || student.email || "Étudiant";

    div.innerHTML = `
        <div class="relative">
            <img src="${photoURL}" 
                 alt="${displayName}" 
                 class="w-12 h-12 rounded-xl object-cover border-2 border-green-200 dark:border-green-700"
                 onerror="this.src='/assets/avatars/avatardef.png'" />
            <div class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
        </div>
        <div class="flex-1">
            <p class="font-semibold text-gray-900 dark:text-white">${displayName}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">En ligne maintenant</p>
        </div>
        <button onclick="contactStudent('${student.id}')" class="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-medium transition-all text-sm">
            <span class="material-icons-round text-sm align-middle">chat</span>
        </button>
    `;

    return div;
}

/**
 * Contacter un étudiant
 */
window.contactStudent = function(studentId) {
    console.log("📞 Contact étudiant:", studentId);
    sessionStorage.setItem("conversationWith", studentId);
    window.location.href = "conversation.html";
};

function setupAvailabilityButton() {
    const availabilityBtn = document.getElementById("availability-btn");
    if (!availabilityBtn) return;

    const teacherRef = doc(db, "teachers", currentUser.uid);
    
    getDoc(teacherRef).then((docSnap) => {
        if (docSnap.exists()) {
            isAvailable = docSnap.data().isAvailable !== false;
            updateAvailabilityUI(isAvailable);
        }
    });

    availabilityBtn.addEventListener("click", async () => {
        try {
            isAvailable = !isAvailable;
            await updateDoc(teacherRef, {
                isAvailable: isAvailable,
                lastSeen: serverTimestamp()
            });
            updateAvailabilityUI(isAvailable);
        } catch (error) {
            console.error("❌ Erreur disponibilité:", error);
            isAvailable = !isAvailable;
            updateAvailabilityUI(isAvailable);
        }
    });
}

function updateAvailabilityUI(available) {
    const availabilityBtn = document.getElementById("availability-btn");
    const availabilityIcon = document.getElementById("availability-icon");
    const availabilityText = document.getElementById("availability-text");

    if (!availabilityBtn) return;

    if (available) {
        availabilityBtn.className = "flex items-center gap-3 px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-semibold shadow-lg transition-all hover:scale-105";
        if (availabilityIcon) availabilityIcon.textContent = "check_circle";
        if (availabilityText) availabilityText.textContent = "Disponible";
    } else {
        availabilityBtn.className = "flex items-center gap-3 px-6 py-4 bg-gray-400 hover:bg-gray-500 text-white rounded-2xl font-semibold shadow-lg transition-all hover:scale-105";
        if (availabilityIcon) availabilityIcon.textContent = "cancel";
        if (availabilityText) availabilityText.textContent = "Non disponible";
    }
}

console.log("✅ Dashboard tuteur - Script chargé");
