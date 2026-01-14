/****************************************************
 * dashboard-student-logic-FINAL.js
 * ✅ VERSION CORRIGÉE - Badge en ligne + Stats dynamiques
 * 
 * ✅ Nom utilisateur depuis Firebase
 * ✅ Photo utilisateur depuis Firebase
 * ✅ Peer auto-init avec onDisconnect
 * ✅ Matières depuis Firestore
 * ✅ Tuteurs dynamiques
 * ✅ Badge en ligne TEMPS RÉEL
 * ✅ Stats dynamiques RÉELLES
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
let unwatchTutors = null;
let unwatchStats = null;

// ========================================
// INITIALISATION
// ========================================

document.addEventListener("DOMContentLoaded", async () => {
    console.log("🎓 [DASHBOARD ÉTUDIANT] Initialisation...");

    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            console.log("❌ Pas d'utilisateur connecté, redirection...");
            window.location.href = "login.html";
            return;
        }

        currentUser = user;
        console.log("✅ Étudiant connecté:", user.uid);
        console.log("📧 Email:", user.email);
        console.log("👤 Nom:", user.displayName);

        // 1. Afficher les infos utilisateur
        displayUserInfo();

        // 2. Init Peer avec onDisconnect
        await initializePeerWithDisconnect();

        // 3. Charger les matières
        await loadSubjects();

        // 4. Charger les stats EN TEMPS RÉEL
        loadStudentStatsRealtime();
    });
});

/**
 * ✅ AFFICHER LES INFOS UTILISATEUR
 */
function displayUserInfo() {
    console.log("👤 Affichage infos utilisateur...");

    // Nom
    const userName = document.getElementById("user-name");
    if (userName) {
        userName.textContent = currentUser.displayName || currentUser.email || "Étudiant";
        console.log("✅ Nom affiché:", userName.textContent);
    }

    // Photo
    const userPhoto = document.getElementById("user-photo");
    if (userPhoto) {
        userPhoto.src = currentUser.photoURL || "/assets/avatars/avatardef.png";
        userPhoto.onerror = () => {
            userPhoto.src = "/assets/avatars/avatardef.png";
        };
        console.log("✅ Photo affichée:", userPhoto.src);
    }

    // Salutation
    const greeting = document.getElementById("greeting");
    if (greeting) {
        const firstName = (currentUser.displayName || "").split(" ")[0] || "Étudiant";
        greeting.textContent = `Bonjour, ${firstName}! 👋`;
        console.log("✅ Salutation affichée");
    }
}

/**
 * ✅ INITIALISER PEER AVEC onDisconnect
 */
async function initializePeerWithDisconnect() {
    try {
        console.log("🔗 Initialisation Peer étudiant avec onDisconnect...");
        
        await initPeerModule({
            onReady: async (peerId) => {
                console.log("✅ [ÉTUDIANT] Peer initialisé:", peerId);
                console.log("✅ [ÉTUDIANT] Marqué EN LIGNE dans Firestore");
                
                // ⭐ SETUP onDisconnect pour marquer hors ligne automatiquement
                await setupAutoDisconnect();
            },
            onError: (err) => {
                console.error("❌ [ÉTUDIANT] Erreur Peer:", err);
            }
        });

    } catch (error) {
        console.error("❌ Erreur init Peer:", error);
    }
}

/**
 * ⭐ SETUP AUTO-DISCONNECT
 * Marque automatiquement isOnline = false quand l'utilisateur ferme le navigateur
 */
async function setupAutoDisconnect() {
    try {
        const { onDisconnect, ref: dbRef } = await import(
            "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js"
        );
        const { getDatabase } = await import(
            "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js"
        );
        
        const realtimeDb = getDatabase();
        const userStatusRef = dbRef(realtimeDb, `status/${currentUser.uid}`);
        
        // Quand l'utilisateur se déconnecte
        await onDisconnect(userStatusRef).set({
            state: 'offline',
            last_changed: Date.now()
        });
        
        console.log("✅ [AUTO-DISCONNECT] onDisconnect configuré");
        
        // Aussi mettre à jour Firestore
        const userRef = doc(db, "users", currentUser.uid);
        const studentRef = doc(db, "students", currentUser.uid);
        
        // Marquer hors ligne dans Firestore aussi (via Cloud Function ou listener)
        // Pour l'instant on utilise un listener sur la page
        window.addEventListener('beforeunload', async () => {
            try {
                await updateDoc(userRef, { isOnline: false, lastSeen: serverTimestamp() });
                await updateDoc(studentRef, { isOnline: false, lastSeen: serverTimestamp() });
            } catch (error) {
                console.error("Erreur marquage hors ligne:", error);
            }
        });
        
    } catch (error) {
        console.error("❌ Erreur setup onDisconnect:", error);
    }
}

/**
 * ✅ CHARGER LES MATIÈRES DYNAMIQUEMENT
 */
async function loadSubjects() {
    try {
        console.log("📚 Chargement des matières depuis Firestore...");

        const subjectsContainer = document.getElementById("subjects-container");
        
        if (!subjectsContainer) {
            console.error("❌ Container 'subjects-container' introuvable");
            return;
        }

        // Récupérer TOUS les tuteurs
        const teachersQuery = query(collection(db, "teachers"));
        const teachersSnapshot = await getDocs(teachersQuery);

        console.log(`📊 ${teachersSnapshot.size} tuteur(s) trouvé(s) dans Firestore`);

        // Extraire toutes les matières uniques
        const subjectsMap = new Map();

        teachersSnapshot.forEach((docSnap) => {
            const teacherData = docSnap.data();
            const subjects = teacherData.subjects || [];

            subjects.forEach(subject => {
                if (!subjectsMap.has(subject)) {
                    subjectsMap.set(subject, []);
                }
                subjectsMap.get(subject).push(docSnap.id);
            });
        });

        console.log(`✅ ${subjectsMap.size} matière(s) unique(s) trouvée(s)`);

        // Vider le container
        subjectsContainer.innerHTML = "";

        if (subjectsMap.size === 0) {
            subjectsContainer.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <span class="material-icons-round text-6xl text-gray-300 mb-4 block">school</span>
                    <p class="text-gray-600 dark:text-gray-400 font-medium">Aucune matière disponible</p>
                    <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">Les tuteurs apparaîtront ici dès qu'ils ajouteront des matières</p>
                </div>
            `;
            return;
        }

        // Créer une carte pour chaque matière
        for (const [subject, teacherIds] of subjectsMap.entries()) {
            const card = createSubjectCard(subject, teacherIds.length);
            subjectsContainer.appendChild(card);
        }

        console.log("✅ Matières affichées avec succès");

    } catch (error) {
        console.error("❌ Erreur chargement matières:", error);
        
        const subjectsContainer = document.getElementById("subjects-container");
        if (subjectsContainer) {
            subjectsContainer.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <p class="text-red-600 font-semibold">Erreur lors du chargement</p>
                    <p class="text-sm text-gray-500 mt-2">${error.message}</p>
                    <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-dark-brown transition">
                        Réessayer
                    </button>
                </div>
            `;
        }
    }
}

/**
 * ✅ CRÉER UNE CARTE DE MATIÈRE
 */
function createSubjectCard(subjectName, tutorsCount) {
    const colors = {
        "Mathématiques": "bg-pastel-orange",
        "Physique": "bg-pastel-blue",
        "Chimie": "bg-pastel-purple",
        "Informatique": "bg-pastel-blue",
        "Sciences": "bg-pastel-green",
        "Français": "bg-pastel-yellow",
        "Anglais": "bg-pastel-yellow",
        "Histoire": "bg-pastel-orange",
        "Géographie": "bg-pastel-green",
        "Philosophie": "bg-pastel-purple",
        "Dessin": "bg-pastel-purple",
        "Musique": "bg-pastel-yellow",
        "Langues": "bg-pastel-green",
        "Physique / Chimie": "bg-pastel-blue"
    };

    const icons = {
        "Mathématiques": "calculate",
        "Physique": "science",
        "Chimie": "biotech",
        "Informatique": "computer",
        "Sciences": "science",
        "Français": "menu_book",
        "Anglais": "translate",
        "Histoire": "history_edu",
        "Géographie": "public",
        "Philosophie": "psychology",
        "Dessin": "brush",
        "Musique": "music_note",
        "Langues": "translate",
        "Physique / Chimie": "science"
    };

    const color = colors[subjectName] || "bg-pastel-green";
    const icon = icons[subjectName] || "school";

    const div = document.createElement("div");
    div.className = `${color} dark:bg-gray-800 p-5 rounded-2xl relative overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105`;
    div.dataset.subject = subjectName;

    div.innerHTML = `
        <div class="absolute right-0 bottom-0 opacity-20 transform translate-x-2 translate-y-2 group-hover:scale-110 transition-transform duration-500">
            <span class="material-icons-round text-8xl">${icon}</span>
        </div>
        <div class="relative z-10">
            <div class="w-10 h-10 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center mb-3 shadow-sm">
                <span class="material-icons-round text-2xl">${icon}</span>
            </div>
            <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-1">${subjectName}</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">${tutorsCount} tuteur(s)</p>
        </div>
    `;

    // Clic sur la matière → Afficher les tuteurs
    div.addEventListener("click", () => {
        console.log(`🔍 Clic sur: ${subjectName}`);
        showTutorsForSubject(subjectName);
    });

    return div;
}

/**
 * ✅ AFFICHER LES TUTEURS D'UNE MATIÈRE EN TEMPS RÉEL
 */
async function showTutorsForSubject(subject) {
    try {
        console.log(`🔍 Chargement des tuteurs pour: ${subject}`);

        const tutorsSection = document.getElementById("tutors-section");
        const tutorsList = document.getElementById("tutors-list");
        const subjectNameEl = document.getElementById("selected-subject-name");

        if (!tutorsSection || !tutorsList) {
            console.error("❌ Containers tuteurs introuvables");
            return;
        }

        // Afficher la section
        tutorsSection.classList.remove("hidden");

        // Mettre à jour le titre
        if (subjectNameEl) {
            subjectNameEl.textContent = `Tuteurs en ${subject}`;
        }

        // Scroll vers la section
        tutorsSection.scrollIntoView({ behavior: "smooth", block: "start" });

        // Afficher un loader
        tutorsList.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p class="text-gray-600 dark:text-gray-400 font-medium">Chargement des tuteurs...</p>
            </div>
        `;

        // Arrêter l'ancien watcher
        if (unwatchTutors) {
            unwatchTutors();
        }

        // Query Firestore : Tuteurs qui enseignent cette matière
        const q = query(
            collection(db, "teachers"),
            where("subjects", "array-contains", subject)
        );

        // ⭐ ÉCOUTER EN TEMPS RÉEL (onSnapshot)
        unwatchTutors = onSnapshot(q, async (snapshot) => {
            console.log(`✅ ${snapshot.size} tuteur(s) trouvé(s) pour ${subject}`);

            tutorsList.innerHTML = "";

            if (snapshot.empty) {
                tutorsList.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <span class="material-icons-round text-6xl text-gray-300 mb-4 block">person_off</span>
                        <p class="text-gray-600 dark:text-gray-400 font-medium">Aucun tuteur disponible pour ${subject}</p>
                        <p class="text-sm text-gray-500 mt-2">Revenez plus tard !</p>
                    </div>
                `;
                return;
            }

            // Pour chaque tuteur, récupérer ses infos complètes
            const tutorsPromises = snapshot.docs.map(async (docSnap) => {
                const teacherId = docSnap.id;
                const teacherData = docSnap.data();

                // Récupérer aussi depuis users/
                const userDoc = await getDoc(doc(db, "users", teacherId));
                const userData = userDoc.exists() ? userDoc.data() : {};

                return {
                    id: teacherId,
                    ...userData,
                    ...teacherData
                };
            });

            const tutors = await Promise.all(tutorsPromises);

            // Afficher chaque tuteur
            tutors.forEach(tutor => {
                const card = createTutorCard(tutor);
                tutorsList.appendChild(card);
            });

            console.log("✅ Tuteurs affichés avec statut temps réel");
        }, (error) => {
            console.error("❌ Erreur onSnapshot tuteurs:", error);
        });

    } catch (error) {
        console.error("❌ Erreur chargement tuteurs:", error);
        
        const tutorsList = document.getElementById("tutors-list");
        if (tutorsList) {
            tutorsList.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <p class="text-red-600 font-semibold">Erreur lors du chargement</p>
                    <p class="text-sm text-gray-500 mt-2">${error.message}</p>
                </div>
            `;
        }
    }
}

/**
 * ✅ CRÉER UNE CARTE TUTEUR
 */
function createTutorCard(tutor) {
    const div = document.createElement("div");
    div.className = "bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700";

    // ⭐ BADGE EN LIGNE basé sur données RÉELLES
    const isOnline = tutor.isOnline === true;
    const statusBadge = isOnline 
        ? '<span class="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold"><span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> En ligne</span>'
        : '<span class="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs"><span class="w-2 h-2 bg-gray-400 rounded-full"></span> Hors ligne</span>';

    const photoURL = tutor.photoURL || "/assets/avatars/avatardef.png";
    const displayName = tutor.displayName || "Tuteur";
    const rating = tutor.rating ? `⭐ ${tutor.rating}` : "Nouveau";

    // Bouton actif seulement si en ligne
    const buttonClass = isOnline 
        ? "bg-primary hover:bg-dark-brown text-white cursor-pointer"
        : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed";
    
    const buttonDisabled = isOnline ? "" : "disabled";
    const buttonText = isOnline ? "Contacter maintenant" : "Hors ligne";

    div.innerHTML = `
        <div class="flex items-center gap-4 mb-4">
            <img src="${photoURL}" 
                 alt="${displayName}" 
                 class="w-16 h-16 rounded-xl object-cover border-2 border-gray-100 dark:border-gray-700 shadow-sm"
                 onerror="this.src='/assets/avatars/avatardef.png'" />
            <div class="flex-1">
                <h4 class="font-bold text-lg text-gray-800 dark:text-white">${displayName}</h4>
                <div class="flex items-center gap-2 mt-1">
                    <span class="text-sm text-gray-600 dark:text-gray-400">${rating}</span>
                    ${statusBadge}
                </div>
            </div>
        </div>
        <button 
            class="${buttonClass} w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            ${buttonDisabled}
            onclick="contactTutor('${tutor.id}')">
            <span class="material-icons-round">chat_bubble</span>
            <span>${buttonText}</span>
        </button>
    `;

    return div;
}

/**
 * ✅ CHARGER LES STATS EN TEMPS RÉEL
 */
function loadStudentStatsRealtime() {
    try {
        console.log("📊 Chargement stats en temps réel...");

        // Écouter les stats depuis Firestore
        const studentRef = doc(db, "students", currentUser.uid);
        
        unwatchStats = onSnapshot(studentRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                
                // Heures d'étude
                const studyHoursEl = document.getElementById("study-hours");
                if (studyHoursEl) {
                    const hours = data.totalStudyHours || 0;
                    studyHoursEl.textContent = `${hours}h`;
                }
                
                // Sessions
                const sessionsEl = document.getElementById("total-sessions");
                if (sessionsEl) {
                    const sessions = data.totalSessions || 0;
                    sessionsEl.textContent = sessions;
                }
                
                console.log("✅ Stats mises à jour:", {
                    hours: data.totalStudyHours || 0,
                    sessions: data.totalSessions || 0
                });
            } else {
                // Document n'existe pas encore, créer avec valeurs par défaut
                console.log("⚠️ Document student n'existe pas, création...");
                updateDoc(studentRef, {
                    totalStudyHours: 0,
                    totalSessions: 0
                }).catch(() => {
                    // Si le doc n'existe pas, on affiche juste 0
                    console.log("Document pas encore créé, affichage valeurs par défaut");
                });
            }
        }, (error) => {
            console.error("❌ Erreur onSnapshot stats:", error);
        });

    } catch (error) {
        console.error("❌ Erreur chargement stats:", error);
    }
}

/**
 * ✅ CONTACTER UN TUTEUR (fonction globale)
 */
window.contactTutor = function(tutorId) {
    console.log("📞 Contact tuteur:", tutorId);
    
    // Sauvegarder l'ID pour la page conversation
    sessionStorage.setItem("conversationWith", tutorId);
    
    // Rediriger
    window.location.href = "conversation.html";
};

console.log("✅ Dashboard étudiant - Script chargé avec temps réel");