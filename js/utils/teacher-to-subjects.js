import { db } from "../auth/firebase-config.js";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { currentLanguage } from "../lang.js";

/* ===============================
   🔹 TRADUCTIONS
   =============================== */
const translations = {
  fr: {
    // Interface principale
    subjectTitle: "Tuteurs en",
    selectSubject: "Sélectionnez une matière pour voir les tuteurs",
    loadingTutors: "Chargement des tuteurs...",
    noTutorsAvailable: "Aucun tuteur disponible",
    noTutorsMessage: "Aucun tuteur n'est disponible pour cette matière pour le moment.",
    loadingError: "Erreur de chargement",
    loadingErrorMessage: "Impossible de charger la liste des tuteurs.",
    
    // Carte enseignant
    tutor: "Tuteur",
    available: "Disponible",
    unavailable: "Indisponible",
    emailNotAvailable: "Email non disponible",
    yearsExperience: "ans d'expérience",
    contact: "Contacter",
    
    // Recherche
    searchPlaceholder: "Rechercher un tuteur...",
    noResults: "Aucun résultat",
    noResultsMessage: "Aucun tuteur ne correspond à",
    resetSearch: "Réinitialiser la recherche",
    
    // Matières
    otherSubjects: "Autres matières",
    otherSubjectsFunctionality: "Fonctionnalité à venir : proposer une nouvelle matière",
    
    // Matières spécifiques (si nécessaire)
    mathematics: "Mathématiques",
    physics: "Physique",
    chemistry: "Chimie",
    biology: "Biologie",
    languages: "Langues",
    computerScience: "Informatique",
    history: "Histoire",
    geography: "Géographie"
  },
  en: {
    // Main interface
    subjectTitle: "Tutors in",
    selectSubject: "Select a subject to see tutors",
    loadingTutors: "Loading tutors...",
    noTutorsAvailable: "No tutors available",
    noTutorsMessage: "No tutors are available for this subject at the moment.",
    loadingError: "Loading error",
    loadingErrorMessage: "Unable to load the list of tutors.",
    
    // Teacher card
    tutor: "Tutor",
    available: "Available",
    unavailable: "Unavailable",
    emailNotAvailable: "Email not available",
    yearsExperience: "years of experience",
    contact: "Contact",
    
    // Search
    searchPlaceholder: "Search for a tutor...",
    noResults: "No results",
    noResultsMessage: "No tutor matches",
    resetSearch: "Reset search",
    
    // Subjects
    otherSubjects: "Other subjects",
    otherSubjectsFunctionality: "Coming soon: propose a new subject",
    
    // Specific subjects
    mathematics: "Mathematics",
    physics: "Physics",
    chemistry: "Chemistry",
    biology: "Biology",
    languages: "Languages",
    computerScience: "Computer Science",
    history: "History",
    geography: "Geography"
  }
};

/* ===============================
   🔹 ÉLÉMENTS DOM
   =============================== */

const subjectCards = document.querySelectorAll("[data-subject]");
const teachersSection = document.getElementById("teachersSection");
const subjectsSection = document.getElementById("subjectsSection");
const backBtn = document.getElementById("backToSubjects");
const teachersList = document.getElementById("teachersList");
const subjectTitle = document.getElementById("subjectTitle");
const searchInput = document.getElementById("searchInput");

/* ===============================
   🔹 ÉTAT DE L'APPLICATION
   =============================== */

let currentSubject = "";

/* ===============================
   🔹 INITIALISATION
   =============================== */

document.addEventListener('DOMContentLoaded', () => {
  // Mettre à jour les textes selon la langue
  updateUITexts();
  
  // Ajouter l'écouteur de recherche si l'input existe
  if (searchInput) {
    setupSearch();
  }
});

/* ===============================
   🔹 METTRE À JOUR LES TEXTE DE L'INTERFACE
   =============================== */

function updateUITexts() {
  const t = translations[currentLanguage];
  
  // Mettre à jour le placeholder de recherche
  if (searchInput) {
    searchInput.placeholder = t.searchPlaceholder;
  }
  
  // Mettre à jour le texte des cartes de matière
  subjectCards.forEach(card => {
    const subject = card.dataset.subject;
    if (subject === "Autres") {
      const titleElement = card.querySelector('h3');
      if (titleElement) {
        titleElement.textContent = t.otherSubjects;
      }
    }
  });
  
  // Mettre à jour le texte du bouton retour
  if (backBtn) {
    const backText = backBtn.querySelector('span:not(.material-icons-round)');
    if (backText) {
      backText.textContent = currentLanguage === 'fr' ? 'Retour aux matières' : 'Back to subjects';
    }
  }
}

/* ===============================
   🔹 CLIC SUR UNE MATIÈRE
   =============================== */

subjectCards.forEach(card => {
  card.addEventListener("click", async () => {
    const subject = card.dataset.subject;
    const t = translations[currentLanguage];
    
    if (subject === "Autres") {
      // Gérer le cas "Autres matières"
      alert(t.otherSubjectsFunctionality);
      return;
    }
    
    // Traduire le nom de la matière si nécessaire
    const translatedSubject = translateSubject(subject);
    
    // Cacher les matières et afficher les enseignants
    subjectsSection.classList.add("hidden");
    teachersSection.classList.remove("hidden");
    
    // Mettre à jour le titre
    subjectTitle.textContent = `${t.subjectTitle} ${translatedSubject}`;
    currentSubject = translatedSubject;
    
    // Réinitialiser la recherche si active
    if (searchInput) {
      searchInput.value = "";
    }
    
    // Charger les enseignants
    await loadTeachersBySubject(translatedSubject);
  });
});

/* ===============================
   🔹 TRADUIRE LE NOM DE LA MATIÈRE
   =============================== */

function translateSubject(subject) {
  const t = translations[currentLanguage];
  
  // Vérifier si la matière a une traduction spécifique
  const subjectKey = subject.toLowerCase().replace(/[^a-z]/g, '');
  for (const [key, value] of Object.entries(t)) {
    if (key.toLowerCase() === subjectKey) {
      return value;
    }
  }
  
  // Si aucune traduction spécifique, retourner le sujet original
  return subject;
}

/* ===============================
   🔹 BOUTON RETOUR
   =============================== */

backBtn.addEventListener("click", () => {
  const t = translations[currentLanguage];
  
  // Cacher les enseignants et réafficher les matières
  teachersSection.classList.add("hidden");
  subjectsSection.classList.remove("hidden");
  
  // Vider la liste des enseignants
  teachersList.innerHTML = `
    <div class="text-center py-8">
      <div class="inline-block p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
        <span class="material-icons-round text-4xl text-gray-400">search</span>
      </div>
      <p class="text-gray-500 dark:text-gray-400">${t.selectSubject}</p>
    </div>
  `;
  
  // Réinitialiser l'état
  currentSubject = "";
  
  // Réinitialiser la recherche
  if (searchInput) {
    searchInput.value = "";
  }
});

/* ===============================
   🔹 CHARGER LES ENSEIGNANTS PAR MATIÈRE
   =============================== */

async function loadTeachersBySubject(subject) {
  const t = translations[currentLanguage];
  
  try {
    // Afficher un indicateur de chargement
    teachersList.innerHTML = `
      <div class="text-center py-8">
        <div class="inline-block p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4 animate-pulse">
          <span class="material-icons-round text-4xl text-primary">school</span>
        </div>
        <p class="text-gray-500 dark:text-gray-400">${t.loadingTutors}</p>
      </div>
    `;

    // Chercher les enseignants qui enseignent cette matière
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

    // Afficher chaque enseignant
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

/* ===============================
   🔹 CRÉER UNE CARTE ENSEIGNANT
   =============================== */

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
  
  // Ajouter les écouteurs d'événements
  const contactBtn = card.querySelector('.contact-btn');
  
  contactBtn.addEventListener('click', () => contactTeacher(teacher));
  
  return card;
}

/* ===============================
   🔹 CONFIGURER LA RECHERCHE
   =============================== */

function setupSearch() {
  let searchTimeout;
  
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const searchTerm = e.target.value.trim();
      
      if (searchTerm.length >= 2) {
        // Si on est dans la vue enseignants, filtrer
        if (!teachersSection.classList.contains('hidden')) {
          filterTeachersInList(searchTerm);
        }
      } else if (searchTerm.length === 0) {
        // Si la recherche est vide, réafficher tous les enseignants
        if (!teachersSection.classList.contains('hidden') && currentSubject) {
          loadTeachersBySubject(currentSubject);
        }
      }
    }, 500); // 500ms de délai
  });
}

/* ===============================
   🔹 FILTRER LES ENSEIGNANTS AFFICHÉS
   =============================== */

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
  
  // Si aucun résultat, afficher un message
  if (visibleCount === 0 && teacherCards.length > 0) {
    const noResults = document.createElement('div');
    noResults.className = "text-center py-8 col-span-full";
    noResults.innerHTML = `
      <div class="inline-block p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
        <span class="material-icons-round text-4xl text-gray-400">search_off</span>
      </div>
      <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">${t.noResults}</h3>
      <p class="text-gray-500 dark:text-gray-400">${t.noResultsMessage} "${searchTerm}"</p>
      <button onclick="window.location.reload()" 
              class="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors">
        ${t.resetSearch}
      </button>
    `;
    
    // Vérifier si le message existe déjà
    const existingMessage = teachersList.querySelector('.text-center.py-8.col-span-full');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    teachersList.appendChild(noResults);
  } else if (visibleCount > 0) {
    // Supprimer le message "aucun résultat" s'il existe
    const noResultsMessage = teachersList.querySelector('.text-center.py-8.col-span-full');
    if (noResultsMessage) {
      noResultsMessage.remove();
    }
  }
}

/* ===============================
   🔹 CONTACTER UN ENSEIGNANT
   =============================== */

function contactTeacher(teacher) {
  // Rediriger vers la page de chat
  window.location.href = `chat-student.html?teacher=${encodeURIComponent(teacher.fullName || '')}&email=${encodeURIComponent(teacher.email || '')}`;
}

/* ===============================
   🔹 FONCTION POUR RAFRAÎCHIR LES TRADUCTIONS
   =============================== */

export function refreshTranslations() {
  updateUITexts();
  
  // Si on est dans la vue enseignants, recharger avec les nouvelles traductions
  if (!teachersSection.classList.contains('hidden') && currentSubject) {
    loadTeachersBySubject(currentSubject);
  }
}

/* ===============================
   🔹 EXPORT DES FONCTIONS
   =============================== */

window.loadTeachersBySubject = loadTeachersBySubject;
window.filterTeachersInList = filterTeachersInList;
window.refreshTranslations = refreshTranslations;