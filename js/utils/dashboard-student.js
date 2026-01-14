// js/utils/dashboard-student.js

/*************************************
 * IMPORTS FIREBASE
 *************************************/
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { db } from "../auth/firebase-config.js";
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { currentLanguage } from "../lang.js";

/*************************************
 * TRADUCTIONS
 *************************************/
const translations = {
    fr: {
        student: "Étudiant",
        studentRole: "Étudiant",
        welcome: "Bonjour",
        loadingError: "Erreur lors du chargement",
        subjects: "Matières",
        instructors: "Instructeurs",
        languages: "Langues",
        languagesDesc: "Apprentissage des langues",
        mathematics: "Mathématiques",
        mathematicsDesc: "Algèbre, géométrie, calcul",
        computerScience: "Informatique",
        computerScienceDesc: "Programmation, algorithmes",
        physicsChemistry: "Physique/Chimie",
        physicsChemistryDesc: "Physique, chimie, biologie",
        sciences: "Sciences",
        errorLoadingSubjects: "Erreur lors du chargement des matières",
        errorLoadingInstructors: "Erreur lors du chargement des instructeurs",
        online: "En ligne",
        offline: "Hors ligne"
    },
    en: {
        student: "Student",
        studentRole: "Student",
        welcome: "Hello",
        loadingError: "Error loading",
        subjects: "Subjects",
        instructors: "Instructors",
        languages: "Languages",
        languagesDesc: "Language learning",
        mathematics: "Mathematics",
        mathematicsDesc: "Algebra, geometry, calculus",
        computerScience: "Computer Science",
        computerScienceDesc: "Programming, algorithms",
        physicsChemistry: "Physics/Chemistry",
        physicsChemistryDesc: "Physics, chemistry, biology",
        sciences: "Sciences",
        errorLoadingSubjects: "Error loading subjects",
        errorLoadingInstructors: "Error loading instructors",
        online: "Online",
        offline: "Offline"
    }
};

/*************************************
 * RÉFÉRENCES HTML
 *************************************/
const userName = document.getElementById("userName");
const userRole = document.getElementById("userRole");
const userAvatar = document.getElementById("userAvatar");
const welcomeText = document.getElementById("welcomeText");
const subjectsContainer = document.getElementById("subjectsContainer");
const instructorsContainer = document.getElementById("instructorsContainer");

/*************************************
 * AUTHENTIFICATION
 *************************************/
const auth = getAuth();

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        // Pas connecté
        window.location.href = "login.html";
        return;
    }

    const userId = user.uid;

    // On garde l'id pour les autres pages
    localStorage.setItem("userId", userId);

    // Charger les informations de l'étudiant
    await chargerInfosEtudiant(userId);
    
    // Charger les matières et instructeurs
    await chargerMatieres(userId);
    await chargerInstructeurs(userId);
    
    // Mettre à jour les notifications
    await updateNotifications(userId);
});

/*************************************
 * CHARGER INFOS ÉTUDIANT
 *************************************/
async function chargerInfosEtudiant(userId) {
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            console.log("Étudiant introuvable");
            return;
        }

        const data = userSnap.data();
        const t = translations[currentLanguage];

        // 🔹 Nom complet
        userName.textContent = data.firstName || data.username || t.student;
        userName.classList.remove("loading-pulse");

        // 🔹 Rôle + classe
        const roleText = t.studentRole + (data.classe ? ` • ${data.classe}` : "");
        userRole.textContent = roleText;
        userRole.classList.remove("loading-pulse");

        // 🔹 Message de bienvenue (on prend le premier prénom)
        const prenom = (data.firstName || data.username || t.student).split(" ")[0];
        welcomeText.textContent = `${t.welcome}, ${prenom} 👋`;

        // 🔹 Avatar dynamique
        if (data.avatar) {
            userAvatar.src = data.avatar;
        } else {
            userAvatar.src = "https://ui-avatars.com/api/?name=" +
                encodeURIComponent(data.firstName || data.username || t.student) +
                "&background=D59D80&color=fff&size=128";
        }
        userAvatar.classList.remove("loading-pulse");

    } catch (erreur) {
        console.log("Erreur chargement étudiant :", erreur);
    }
}

/*************************************
 * CHARGER LES MATIÈRES
 *************************************/
async function chargerMatieres(userId) {
    if (!subjectsContainer) return;

    try {
        const t = translations[currentLanguage];
        
        // Données de matières avec traductions
        const matieresExemple = [
            {
                id: "1",
                name: t.languages,
                icon: "translate",
                color: "pastel-green",
                description: t.languagesDesc,
                progress: 75
            },
            {
                id: "2",
                name: t.mathematics,
                icon: "functions",
                color: "pastel-orange",
                description: t.mathematicsDesc,
                progress: 60
            },
            {
                id: "3",
                name: t.computerScience,
                icon: "computer",
                color: "pastel-blue",
                description: t.computerScienceDesc,
                progress: 85
            },
            {
                id: "4",
                name: t.physicsChemistry,
                icon: "science",
                color: "pastel-purple",
                description: t.physicsChemistryDesc,
                progress: 45
            }
        ];

        // Vider le container de loading
        subjectsContainer.innerHTML = '';
        
        // Créer les cartes de matières
        matieresExemple.forEach(matiere => {
            const subjectCard = createSubjectCard(matiere);
            subjectsContainer.appendChild(subjectCard);
        });
        
    } catch (erreur) {
        console.log("Erreur chargement matières :", erreur);
        const t = translations[currentLanguage];
        subjectsContainer.innerHTML = `
            <div class="col-span-2 text-center py-8">
                <div class="inline-block p-4 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                    <span class="material-icons-round text-3xl text-red-500">error</span>
                </div>
                <p class="text-red-500 dark:text-red-400">${t.errorLoadingSubjects}</p>
            </div>
        `;
    }
}

/*************************************
 * CHARGER LES INSTRUCTEURS
 *************************************/
async function chargerInstructeurs(userId) {
    if (!instructorsContainer) return;

    try {
        const t = translations[currentLanguage];
        
        // Données d'instructeurs avec traductions
        const instructeursExemple = [
            {
                id: "1",
                name: "Sarah Ebang",
                subject: t.sciences,
                status: "online",
                avatar: "",
                statusText: t.online
            },
            {
                id: "2",
                name: "John Ndongo",
                subject: t.mathematics,
                status: "online",
                avatar: "",
                statusText: t.online
            }
        ];

        // Vider le container de loading
        instructorsContainer.innerHTML = '';
        
        // Créer les cartes d'instructeurs
        instructeursExemple.forEach(instructeur => {
            const instructorCard = createInstructorCard(instructeur);
            instructorsContainer.appendChild(instructorCard);
        });
        
    } catch (erreur) {
        console.log("Erreur chargement instructeurs :", erreur);
        const t = translations[currentLanguage];
        instructorsContainer.innerHTML = `
            <div class="text-center py-6">
                <div class="inline-block p-3 rounded-full bg-red-100 dark:bg-red-900/20 mb-3">
                    <span class="material-icons-round text-2xl text-red-500">error</span>
                </div>
                <p class="text-red-500 dark:text-red-400">${t.errorLoadingInstructors}</p>
            </div>
        `;
    }
}

/*************************************
 * CRÉER UNE CARTE DE MATIÈRE
 *************************************/
function createSubjectCard(matiere) {
    const card = document.createElement('div');
    card.className = `bg-${matiere.color} dark:bg-gray-800 p-4 sm:p-5 rounded-xl md:rounded-2xl relative overflow-hidden group hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1`;
    card.dataset.subjectId = matiere.id;
    
    const colorClass = getColorClass(matiere.color);
    
    card.innerHTML = `
        <div class="absolute right-0 bottom-0 opacity-20 transform translate-x-2 translate-y-2 group-hover:scale-110 transition-transform duration-500">
            <span class="material-icons-round text-6xl sm:text-8xl text-${colorClass}-800 dark:text-${colorClass}-200">${matiere.icon}</span>
        </div>
        <div class="relative z-10">
            <div class="w-8 h-8 sm:w-10 sm:h-10 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center mb-2 sm:mb-3 shadow-sm text-${colorClass}-600 dark:text-${colorClass}-300">
                <span class="material-icons-round text-lg sm:text-xl">${matiere.icon}</span>
            </div>
            <h4 class="text-base sm:text-lg font-bold text-${colorClass}-900 dark:text-${colorClass}-100">${matiere.name}</h4>
            <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">${matiere.description}</p>
        </div>
    `;
    
    // Ajouter l'événement de clic
    card.addEventListener('click', function() {
        window.location.href = `matiere-student.html?subject=${matiere.id}&name=${encodeURIComponent(matiere.name)}`;
    });
    
    return card;
}

/*************************************
 * CRÉER UNE CARTE D'INSTRUCTEUR
 *************************************/
function createInstructorCard(instructeur) {
    const card = document.createElement('div');
    card.className = 'flex items-center gap-3';
    
    const avatarContent = instructeur.avatar 
        ? `<img src="${instructeur.avatar}" alt="${instructeur.name}" class="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover">`
        : `<div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span class="material-icons-round text-primary text-lg">person</span>
            </div>`;
    
    card.innerHTML = `
        ${avatarContent}
        <div class="flex-1 min-w-0">
            <h5 class="text-sm font-bold text-secondary dark:text-white truncate">${instructeur.name}</h5>
            <p class="text-xs text-gray-500 truncate">${instructeur.subject}</p>
        </div>
        <button class="p-1 sm:p-2 text-primary hover:bg-primary/10 rounded-full transition-colors chat-btn" data-instructor-id="${instructeur.id}">
            <span class="material-icons-round text-lg sm:text-xl">chat_bubble_outline</span>
        </button>
    `;
    
    // Gérer le bouton de chat
    const chatBtn = card.querySelector('.chat-btn');
    if (chatBtn) {
        chatBtn.addEventListener('click', function() {
            startChatWithInstructor(instructeur.id, instructeur.name);
        });
    }
    
    return card;
}

/*************************************
 * FONCTION UTILITAIRE POUR LES COULEURS
 *************************************/
function getColorClass(color) {
    const colorMap = {
        'pastel-green': 'teal',
        'pastel-orange': 'orange',
        'pastel-blue': 'blue',
        'pastel-purple': 'purple',
        'pastel-yellow': 'yellow',
        'pastel-red': 'red'
    };
    return colorMap[color] || 'gray';
}

/*************************************
 * DÉMARRER UN CHAT AVEC UN INSTRUCTEUR
 *************************************/
async function startChatWithInstructor(instructorId, instructorName) {
    try {
        // Ici, vous créeriez ou récupéreriez une conversation
        console.log(`Démarrer chat avec ${instructorName} (${instructorId})`);
        
        // Rediriger vers la page de chat
        window.location.href = `chat-student.html?instructor=${instructorId}`;
    } catch (erreur) {
        console.log("Erreur lors du démarrage du chat:", erreur);
    }
}

/*************************************
 * METTRE À JOUR LES NOTIFICATIONS
 *************************************/
async function updateNotifications(userId) {
    try {
        // Ici, vous feriez un appel API pour récupérer les notifications
        const hasNotifications = false; // Remplacer par une vérification réelle
        const notificationBadge = document.getElementById('notificationBadge');
        
        if (notificationBadge) {
            if (hasNotifications) {
                notificationBadge.classList.remove('hidden');
            } else {
                notificationBadge.classList.add('hidden');
            }
        }
    } catch (erreur) {
        console.log("Erreur lors de la mise à jour des notifications:", erreur);
    }
}

/*************************************
 * FONCTION POUR RAFRAÎCHIR LES TRADUCTIONS
 *************************************/
export function refreshTranslations() {
    // Cette fonction peut être appelée quand la langue change
    const userId = localStorage.getItem("userId");
    if (userId) {
        chargerInfosEtudiant(userId);
        chargerMatieres(userId);
        chargerInstructeurs(userId);
    }
}

/*************************************
 * EXPORTS POUR D'AUTRES FICHIERS
 *************************************/
export { 
    chargerMatieres, 
    chargerInstructeurs,
    updateNotifications,
 //   refreshTranslations
};