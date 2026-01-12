// js/utils/dashboard-student.js

/*************************************
 * IMPORTS FIREBASE
 *************************************/
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { db } from "../auth/firebase-config.js";
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/*************************************
 * RÉFÉRENCES HTML
 *************************************/
const userName = document.getElementById("userName");
const userRole = document.getElementById("userRole");
const userAvatar = document.getElementById("userAvatar");
const welcomeText = document.getElementById("welcomeText");
const subjectsContainer = document.getElementById("subjectsContainer");
const favoritesContainer = document.getElementById("favoritesContainer");
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
    
    // Charger les matières, favoris et instructeurs
    await chargerMatieres(userId);
    await chargerFavoris(userId);
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

        // 🔹 Nom complet
        userName.textContent = data.firstName || data.username || "Étudiant";
        userName.classList.remove("loading-pulse");

        // 🔹 Rôle + classe
        userRole.textContent = "Étudiant" + (data.classe ? ` • ${data.classe}` : "");
        userRole.classList.remove("loading-pulse");

        // 🔹 Message de bienvenue (on prend le premier prénom)
        const prenom = (data.firstName || data.username || "Étudiant").split(" ")[0];
        welcomeText.textContent = `Bonjour, ${prenom} 👋`;

        // 🔹 Avatar dynamique
        if (data.avatar) {
            userAvatar.src = data.avatar;
        } else {
            userAvatar.src = "https://ui-avatars.com/api/?name=" +
                encodeURIComponent(data.firstName || data.username || "Étudiant") +
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
        // Ici, vous feriez un appel Firestore pour récupérer les vraies données
        // Pour l'exemple, on utilise des données d'exemple
        const matieresExemple = [
            {
                id: "1",
                name: "Sciences",
                icon: "science",
                color: "pastel-green",
                description: "Physique, chimie, biologie",
                progress: 75
            },
            {
                id: "2",
                name: "Mathématiques",
                icon: "functions",
                color: "pastel-orange",
                description: "Algèbre, géométrie, calcul",
                progress: 60
            },
            {
                id: "3",
                name: "Informatique",
                icon: "computer",
                color: "pastel-blue",
                description: "Programmation, algorithmes",
                progress: 85
            },
            {
                id: "4",
                name: "Dessin",
                icon: "brush",
                color: "pastel-purple",
                description: "Art, design, créativité",
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
        subjectsContainer.innerHTML = `
            <div class="col-span-2 text-center py-8">
                <div class="inline-block p-4 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                    <span class="material-icons-round text-3xl text-red-500">error</span>
                </div>
                <p class="text-red-500 dark:text-red-400">Erreur lors du chargement des matières</p>
            </div>
        `;
    }
}

/*************************************
 * CHARGER LES FAVORIS
 *************************************/
async function chargerFavoris(userId) {
    if (!favoritesContainer) return;

    try {
        // Ici, vous feriez un appel Firestore pour récupérer les vraies données
        const favorisExemple = [
            {
                id: "1",
                name: "Mathématiques",
                tutor: "Onana Onana",
                rating: 4.8,
                status: "Online",
                subject: "Mathématiques"
            },
            {
                id: "2",
                name: "Physiques",
                tutor: "Ondoua",
                rating: 4.2,
                status: "Offline",
                subject: "Sciences"
            }
        ];

        // Vider le container de loading
        favoritesContainer.innerHTML = '';
        
        if (favorisExemple.length === 0) {
            favoritesContainer.innerHTML = `
                <div class="text-center py-8">
                    <div class="inline-block p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                        <span class="material-icons-round text-3xl text-gray-400">star_outline</span>
                    </div>
                    <p class="text-gray-500 dark:text-gray-400">Aucun favori pour le moment</p>
                </div>
            `;
            return;
        }
        
        // Créer les cartes de favoris
        favorisExemple.forEach((favori, index) => {
            const favoriteCard = createFavoriteCard(favori);
            if (index > 0) {
                favoriteCard.classList.add('mt-3');
            }
            favoritesContainer.appendChild(favoriteCard);
        });
        
    } catch (erreur) {
        console.log("Erreur chargement favoris :", erreur);
        favoritesContainer.innerHTML = `
            <div class="text-center py-8">
                <div class="inline-block p-4 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                    <span class="material-icons-round text-3xl text-red-500">error</span>
                </div>
                <p class="text-red-500 dark:text-red-400">Erreur lors du chargement des favoris</p>
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
        // Ici, vous feriez un appel Firestore pour récupérer les vraies données
        const instructeursExemple = [
            {
                id: "1",
                name: "Sarah Ebang",
                subject: "Sciences",
                status: "online",
                avatar: ""
            },
            {
                id: "2",
                name: "John Ndongo",
                subject: "Mathématiques",
                status: "online",
                avatar: ""
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
        instructorsContainer.innerHTML = `
            <div class="text-center py-6">
                <div class="inline-block p-3 rounded-full bg-red-100 dark:bg-red-900/20 mb-3">
                    <span class="material-icons-round text-2xl text-red-500">error</span>
                </div>
                <p class="text-red-500 dark:text-red-400">Erreur lors du chargement des instructeurs</p>
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
        window.location.href = `matiere-details.html?subject=${matiere.id}&name=${encodeURIComponent(matiere.name)}`;
    });
    
    return card;
}

/*************************************
 * CRÉER UNE CARTE DE FAVORI
 *************************************/
function createFavoriteCard(favori) {
    const card = document.createElement('div');
    card.className = 'flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-100 dark:border-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group';
    
    card.innerHTML = `
        <div class="w-10 h-10 sm:w-14 sm:h-14 bg-pastel-green rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
            <span class="material-icons-round text-teal-600 text-xl sm:text-2xl">design_services</span>
        </div>
        <div class="flex-1 min-w-0">
            <h4 class="font-bold text-secondary dark:text-white group-hover:text-primary transition-colors text-sm sm:text-base truncate">
                ${favori.name}
            </h4>
            <div class="flex flex-wrap gap-1 sm:gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span class="flex items-center gap-1">
                    <span class="material-icons-round text-xs sm:text-sm">person</span>
                    ${favori.tutor}
                </span>
                <span class="flex items-center gap-1">
                    <span class="material-icons-round text-xs sm:text-sm">star</span> ${favori.rating}
                </span>
                <span class="bg-${favori.status === 'Online' ? 'green' : 'red'}-100 dark:bg-${favori.status === 'Online' ? 'green' : 'red'}-700 px-2 py-0.5 rounded text-xs">${favori.status}</span>
            </div>
        </div>
        <button class="text-primary hover:text-dark-brown p-1 sm:p-2 favorite-btn" data-favorite-id="${favori.id}">
            <span class="material-icons-round text-lg sm:text-xl">bookmark</span>
        </button>
    `;
    
    // Ajouter l'événement de clic
    card.addEventListener('click', function(e) {
        if (!e.target.closest('.favorite-btn')) {
            window.location.href = `tutor-details.html?id=${favori.id}`;
        }
    });
    
    // Gérer le bouton favori
    const favoriteBtn = card.querySelector('.favorite-btn');
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleFavorite(favori.id);
        });
    }
    
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
 * BASCOULER UN FAVORI
 *************************************/
async function toggleFavorite(favoriteId) {
    try {
        // Ici, vous feriez un appel Firestore pour ajouter/supprimer un favori
        console.log(`Toggle favorite ${favoriteId}`);
        // Mettre à jour l'interface
        // await chargerFavoris(localStorage.getItem("userId"));
    } catch (erreur) {
        console.log("Erreur lors de la modification du favori:", erreur);
    }
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
 * EXPORTS POUR D'AUTRES FICHIERS
 *************************************/
export { 
    chargerMatieres, 
    chargerFavoris, 
    chargerInstructeurs,
    updateNotifications
};