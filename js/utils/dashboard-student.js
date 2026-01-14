// js/utils/dashboard-student.js

/*************************************
 * IMPORTS FIREBASE
 *************************************/
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { db } from "../auth/firebase-config.js";
import { doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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
        offline: "Hors ligne",
        // Ajout pour la page matières
        subjectTitle: "Tuteurs en",
        selectSubject: "Sélectionnez une matière pour voir les tuteurs",
        loadingTutors: "Chargement des tuteurs...",
        noTutorsAvailable: "Aucun tuteur disponible",
        noTutorsMessage: "Aucun tuteur n'est disponible pour cette matière pour le moment.",
        tutor: "Tuteur",
        available: "Disponible",
        unavailable: "Indisponible",
        emailNotAvailable: "Email non disponible",
        yearsExperience: "ans d'expérience",
        contact: "Contacter"
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
        offline: "Offline",
        // Ajout pour la page matières
        subjectTitle: "Tutors in",
        selectSubject: "Select a subject to see tutors",
        loadingTutors: "Loading tutors...",
        noTutorsAvailable: "No tutors available",
        noTutorsMessage: "No tutors are available for this subject at the moment.",
        tutor: "Tutor",
        available: "Available",
        unavailable: "Unavailable",
        emailNotAvailable: "Email not available",
        yearsExperience: "years of experience",
        contact: "Contact"
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

// Références pour la page matières (si on est sur matiere-student.html)
const subjectCards = document.querySelectorAll("[data-subject]");
const teachersSection = document.getElementById("teachersSection");
const subjectsSection = document.getElementById("subjectsSection");
const backBtn = document.getElementById("backToSubjects");
const teachersList = document.getElementById("teachersList");
const subjectTitle = document.getElementById("subjectTitle");
const searchInput = document.getElementById("searchInput");

let currentSubject = "";

/*************************************
 * AUTHENTIFICATION
 *************************************/
const auth = getAuth();

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const userId = user.uid;
    localStorage.setItem("userId", userId);

    // Charger les informations de l'étudiant
    await chargerInfosEtudiant(userId);
    
    // Charger les matières et instructeurs (uniquement sur le dashboard)
    if (subjectsContainer) {
        await chargerMatieres(userId);
    }
    
    if (instructorsContainer) {
        await chargerInstructeurs(userId);
    }
    
    // Initialiser la page matières si on est sur matiere-student.html
    if (subjectCards.length > 0) {
        initMatieresPage();
    }
    
    await updateNotifications(userId);
});

/*************************************
 * INITIALISATION PAGE MATIÈRES
 *************************************/
function initMatieresPage() {
    // Mettre à jour les textes selon la langue
    updateUITexts();
    
    // Ajouter l'écouteur de recherche si l'input existe
    if (searchInput) {
        setupSearch();
    }
    
    // Ajouter les écouteurs d'événements aux cartes de matière
    subjectCards.forEach(card => {
        card.addEventListener("click", async () => {
            const subject = card.dataset.subject;
            const t = translations[currentLanguage];
            
            if (subject === "Autres") {
                alert("Fonctionnalité à venir : proposer une nouvelle matière");
                return;
            }
            
            // Traduire le nom de la matière
            const translatedSubject = translateSubject(subject);
            
            // Cacher les matières et afficher les enseignants
            subjectsSection.classList.add("hidden");
            teachersSection.classList.remove("hidden");
            
            // Mettre à jour le titre
            subjectTitle.textContent = `${t.subjectTitle} ${translatedSubject}`;
            currentSubject = translatedSubject;
            
            // Réinitialiser la recherche
            if (searchInput) {
                searchInput.value = "";
            }
            
            // Charger les enseignants
            await loadTeachersBySubject(translatedSubject);
            
            // Charger les instructeurs pour le dashboard
            await loadInstructorsBySubject(translatedSubject);
        });
    });
    
    // Bouton retour
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            const t = translations[currentLanguage];
            
            teachersSection.classList.add("hidden");
            subjectsSection.classList.remove("hidden");
            
            teachersList.innerHTML = `
                <div class="text-center py-8">
                    <div class="inline-block p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                        <span class="material-icons-round text-4xl text-gray-400">search</span>
                    </div>
                    <p class="text-gray-500 dark:text-gray-400">${t.selectSubject}</p>
                </div>
            `;
            
            currentSubject = "";
            
            if (searchInput) {
                searchInput.value = "";
            }
        });
    }
}

/*************************************
 * METTRE À JOUR LES TEXTES (page matières)
 *************************************/
function updateUITexts() {
    const t = translations[currentLanguage];
    
    if (searchInput) {
        searchInput.placeholder = "Rechercher un tuteur...";
    }
    
    if (backBtn) {
        const backText = backBtn.querySelector('span:not(.material-icons-round)');
        if (backText) {
            backText.textContent = currentLanguage === 'fr' ? 'Retour aux matières' : 'Back to subjects';
        }
    }
}

/*************************************
 * TRADUIRE LE NOM DE LA MATIÈRE
 *************************************/
function translateSubject(subject) {
    const t = translations[currentLanguage];
    
    const subjectKey = subject.toLowerCase().replace(/[^a-z]/g, '');
    for (const [key, value] of Object.entries(t)) {
        if (key.toLowerCase() === subjectKey) {
            return value;
        }
    }
    
    return subject;
}

/*************************************
 * CHARGER LES ENSEIGNANTS PAR MATIÈRE
 *************************************/
async function loadTeachersBySubject(subject) {
    const t = translations[currentLanguage];
    
    try {
        teachersList.innerHTML = `
            <div class="text-center py-8">
                <div class="inline-block p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4 animate-pulse">
                    <span class="material-icons-round text-4xl text-primary">school</span>
                </div>
                <p class="text-gray-500 dark:text-gray-400">${t.loadingTutors}</p>
            </div>
        `;

        const q = query(
            collection(db, "teachers"),
            where("subjects", "array-contains", subject)
        );

        const snap = await getDocs(q);
        
        teachersList.innerHTML = "";

        if (snap.empty) {
            teachersList.innerHTML = `
                <div class="text-center py-8">
                    <div class="inline-block p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                        <span class="material-icons-round text-4xl text-gray-400">person_off</span>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">${t.noTutorsAvailable}</h3>
                    <p class="text-gray-500 dark:text-gray-400">${t.noTutorsMessage}</p>
                </div>
            `;
            return;
        }

        snap.forEach(doc => {
            const teacher = doc.data();
            const teacherCard = createTeacherCard(teacher);
            teachersList.appendChild(teacherCard);
        });

    } catch (error) {
        console.error("Erreur lors du chargement des enseignants:", error);
        teachersList.innerHTML = `
            <div class="text-center py-8">
                <div class="inline-block p-4 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                    <span class="material-icons-round text-4xl text-red-500">error</span>
                </div>
                <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">${t.loadingError}</h3>
                <p class="text-gray-500 dark:text-gray-400">${t.loadingErrorMessage}</p>
            </div>
        `;
    }
}

/*************************************
 * CRÉER UNE CARTE ENSEIGNANT
 *************************************/
function createTeacherCard(teacher) {
    const t = translations[currentLanguage];
    
    const card = document.createElement("div");
    card.className = "bg-white dark:bg-card-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow";
    
    card.innerHTML = `
        <div class="flex items-start gap-4">
            <div class="flex-shrink-0">
                <div class="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                    <span class="material-icons-round text-2xl text-primary">person</span>
                </div>
            </div>
            <div class="flex-1">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-lg text-secondary dark:text-white">${teacher.fullName || t.tutor}</h3>
                    <span class="inline-flex items-center gap-1 text-sm ${teacher.available ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}">
                        <span class="material-icons-round text-sm">circle</span>
                        ${teacher.available ? t.available : t.unavailable}
                    </span>
                </div>
                
                <p class="text-gray-600 dark:text-gray-400 mb-3">
                    <span class="material-icons-round text-sm align-text-bottom mr-1">mail</span>
                    ${teacher.email || t.emailNotAvailable}
                </p>
                
                <div class="flex flex-wrap gap-2 mb-4">
                    <span class="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full text-sm">
                        <span class="material-icons-round text-sm">star</span>
                        ${teacher.rating ? teacher.rating.toFixed(1) : "N/A"}
                    </span>
                    
                    <span class="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm">
                        <span class="material-icons-round text-sm">school</span>
                        ${teacher.experience || 0} ${t.yearsExperience}
                    </span>
                </div>
                
                <div class="flex gap-2">
                    <button class="contact-btn flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2">
                        <span class="material-icons-round">message</span>
                        ${t.contact}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const contactBtn = card.querySelector('.contact-btn');
    contactBtn.addEventListener('click', () => contactTeacher(teacher));
    
    return card;
}

/*************************************
 * CHARGER LES INSTRUCTEURS PAR MATIÈRE (pour le dashboard)
 *************************************/
async function loadInstructorsBySubject(subject) {
    if (!instructorsContainer) return;
    
    const t = translations[currentLanguage];
    
    try {
        const q = query(
            collection(db, "teachers"),
            where("subjects", "array-contains", subject),
            where("available", "==", true)
        );

        const snap = await getDocs(q);
        
        instructorsContainer.innerHTML = '';

        if (snap.empty) {
            instructorsContainer.innerHTML = `
                <div class="text-center py-6">
                    <div class="inline-block p-3 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
                        <span class="material-icons-round text-2xl text-gray-400">person_off</span>
                    </div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">${t.noTutorsMessage}</p>
                </div>
            `;
            return;
        }

        const maxInstructors = 5;
        let count = 0;
        
        snap.forEach(doc => {
            if (count >= maxInstructors) return;
            
            const teacher = doc.data();
            const instructorCard = createDashboardInstructorCard(teacher);
            instructorsContainer.appendChild(instructorCard);
            count++;
        });

    } catch (error) {
        console.error("Erreur lors du chargement des instructeurs:", error);
        instructorsContainer.innerHTML = `
            <div class="text-center py-6">
                <div class="inline-block p-3 rounded-full bg-red-100 dark:bg-red-900/30 mb-3">
                    <span class="material-icons-round text-2xl text-red-500">error</span>
                </div>
                <p class="text-sm text-red-500 dark:text-red-400">Erreur de chargement</p>
            </div>
        `;
    }
}

/*************************************
 * CRÉER UNE CARTE INSTRUCTEUR POUR LE DASHBOARD
 *************************************/
function createDashboardInstructorCard(teacher) {
    const t = translations[currentLanguage];
    
    const card = document.createElement('div');
    card.className = 'flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer';
    
    card.innerHTML = `
        <div class="flex-shrink-0 relative">
            <div class="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                <span class="material-icons-round text-xl text-primary">person</span>
            </div>
            <span class="absolute bottom-0 right-0 w-3 h-3 ${teacher.available ? 'bg-green-500' : 'bg-gray-400'} rounded-full border-2 border-white dark:border-gray-800"></span>
        </div>
        <div class="flex-1 min-w-0">
            <h5 class="text-sm font-bold text-secondary dark:text-white truncate">${teacher.fullName || t.tutor}</h5>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                ${teacher.subjects ? teacher.subjects.slice(0, 2).join(', ') : currentSubject}
                ${teacher.subjects && teacher.subjects.length > 2 ? '...' : ''}
            </p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                ${teacher.experience || 0} ${t.yearsExperience} • ⭐ ${teacher.rating ? teacher.rating.toFixed(1) : 'N/A'}
            </p>
        </div>
        <button class="chat-btn p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
            <span class="material-icons-round">chat_bubble_outline</span>
        </button>
    `;
    
    const chatBtn = card.querySelector('.chat-btn');
    if (chatBtn) {
        chatBtn.addEventListener('click', function() {
            contactTeacher(teacher);
        });
    }
    
    card.addEventListener('click', function(e) {
        if (!e.target.closest('.chat-btn')) {
            contactTeacher(teacher);
        }
    });
    
    return card;
}

/*************************************
 * CONFIGURER LA RECHERCHE
 *************************************/
function setupSearch() {
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = e.target.value.trim();
            
            if (searchTerm.length >= 2) {
                if (!teachersSection.classList.contains('hidden')) {
                    filterTeachersInList(searchTerm);
                }
            } else if (searchTerm.length === 0) {
                if (!teachersSection.classList.contains('hidden') && currentSubject) {
                    loadTeachersBySubject(currentSubject);
                }
            }
        }, 500);
    });
}

/*************************************
 * FILTRER LES ENSEIGNANTS
 *************************************/
function filterTeachersInList(searchTerm) {
    const t = translations[currentLanguage];
    const teacherCards = teachersList.querySelectorAll('.bg-white, .bg-card-dark');
    let visibleCount = 0;
    
    teacherCards.forEach(card => {
        const teacherName = card.querySelector('h3').textContent.toLowerCase();
        const teacherEmail = card.querySelector('p.text-gray-600')?.textContent.toLowerCase() || '';
        
        if (teacherName.includes(searchTerm.toLowerCase()) || 
            teacherEmail.includes(searchTerm.toLowerCase())) {
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.classList.add('hidden');
        }
    });
    
    if (visibleCount === 0 && teacherCards.length > 0) {
        const noResults = document.createElement('div');
        noResults.className = "text-center py-8 col-span-full";
        noResults.innerHTML = `
            <div class="inline-block p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <span class="material-icons-round text-4xl text-gray-400">search_off</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Aucun résultat</h3>
            <p class="text-gray-500 dark:text-gray-400">Aucun tuteur ne correspond à "${searchTerm}"</p>
            <button onclick="window.location.reload()" 
                    class="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors">
                Réinitialiser la recherche
            </button>
        `;
        
        const existingMessage = teachersList.querySelector('.text-center.py-8.col-span-full');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        teachersList.appendChild(noResults);
    } else if (visibleCount > 0) {
        const noResultsMessage = teachersList.querySelector('.text-center.py-8.col-span-full');
        if (noResultsMessage) {
            noResultsMessage.remove();
        }
    }
}

/*************************************
 * CONTACTER UN ENSEIGNANT
 *************************************/
function contactTeacher(teacher) {
    window.location.href = `chat-student.html?teacher=${encodeURIComponent(teacher.fullName || '')}&email=${encodeURIComponent(teacher.email || '')}`;
}

/*************************************
 * FONCTIONS DASHBOARD (gardées de l'original)
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

        userName.textContent = data.firstName || data.username || t.student;
        userName.classList.remove("loading-pulse");

        const roleText = t.studentRole + (data.classe ? ` • ${data.classe}` : "");
        userRole.textContent = roleText;
        userRole.classList.remove("loading-pulse");

        const prenom = (data.firstName || data.username || t.student).split(" ")[0];
        welcomeText.textContent = `${t.welcome}, ${prenom} 👋`;

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

async function chargerMatieres(userId) {
    if (!subjectsContainer) return;

    try {
        const t = translations[currentLanguage];
        
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

        subjectsContainer.innerHTML = '';
        
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
    
    // Rediriger vers la page matières avec la matière sélectionnée
    card.addEventListener('click', function() {
        window.location.href = `matiere-student.html?subject=${matiere.id}&name=${encodeURIComponent(matiere.name)}`;
    });
    
    return card;
}

async function chargerInstructeurs(userId) {
    if (!instructorsContainer) return;

    try {
        const t = translations[currentLanguage];
        
        // Charger tous les enseignants disponibles
        const q = query(
            collection(db, "teachers"),
            where("available", "==", true)
        );

        const snap = await getDocs(q);
        
        instructorsContainer.innerHTML = '';

        if (snap.empty) {
            instructorsContainer.innerHTML = `
                <div class="text-center py-6">
                    <div class="inline-block p-3 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
                        <span class="material-icons-round text-2xl text-gray-400">person_off</span>
                    </div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Aucun instructeur disponible</p>
                </div>
            `;
            return;
        }

        const maxInstructors = 3;
        let count = 0;
        
        snap.forEach(doc => {
            if (count >= maxInstructors) return;
            
            const teacher = doc.data();
            const instructorCard = createDashboardInstructorCard(teacher);
            instructorsContainer.appendChild(instructorCard);
            count++;
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

async function updateNotifications(userId) {
    try {
        const hasNotifications = false;
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
 * EXPORTS
 *************************************/
export function refreshTranslations() {
    const userId = localStorage.getItem("userId");
    if (userId) {
        chargerInfosEtudiant(userId);
        chargerMatieres(userId);
        chargerInstructeurs(userId);
    }
}

export { 
    chargerMatieres, 
    chargerInstructeurs,
    updateNotifications
};