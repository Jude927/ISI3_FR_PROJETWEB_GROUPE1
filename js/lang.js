// Dictionnaire de traductions
const translations = {
    fr: {
        // Navigation
        nav_home: "Accueil",
        nav_subjects: "Matières",
        nav_messages: "Messages",
        nav_planning: "Planning",
        nav_profile: "Profil",
        nav_settings: "Paramètres",
        
        // Dashboard
        dashboard_welcome: "Bonjour, {name}! 👋",
        dashboard_subtitle: "Prête à apprendre quelque chose de nouveau aujourd'hui?",
        dashboard_search: "Rechercher un cours, un tuteur...",
        dashboard_my_subjects: "Mes Matières en cours",
        dashboard_view_all: "Voir tout",
        dashboard_progression: "Progression",
        dashboard_trending: "Tendances",
        dashboard_today_schedule: "Planning du jour",
        dashboard_instructors: "Instructeurs",
        
        // Whiteboard
        whiteboard_title: "Mathématiques : Fonctions Affines",
        whiteboard_export: "Exporter",
        whiteboard_clear_all: "Effacer tout",
        whiteboard_end_session: "Terminer la session",
        whiteboard_tutor: "Tuteur",
        whiteboard_me: "Moi",
        whiteboard_text_placeholder: "Tapez votre texte...",
        whiteboard_add: "Ajouter",
        whiteboard_cancel: "Annuler",
        whiteboard_help: "Besoin d'aide sur cette fonction ?",
        whiteboard_ask_ai: "Demander à Djangou AI",
        whiteboard_confirm_clear: "Êtes-vous sûr de vouloir effacer tout le tableau ?",
        
        // Login
        login_title: "Bienvenue !",
        login_subtitle: "Entrez vos coordonnées pour accéder à votre espace.",
        login_student: "Étudiant",
        login_tutor: "Tuteur",
        login_email: "Email",
        login_password: "Mot de passe",
        login_forgot: "Oublié ?",
        login_button: "Se connecter",
        login_no_account: "Pas encore de compte ?",
        login_signup: "S'inscrire",
        login_or: "Ou continuer avec",
        
        // Subjects
        subjects_sciences: "Sciences",
        subjects_math: "Mathématiques",
        subjects_computer: "Informatique",
        subjects_drawing: "Dessin",
        
        // Common
        common_online: "En ligne",
        common_completed: "Complété",
        common_in_progress: "En cours",
        common_upcoming: "À venir",
        common_new: "Nouveau",
        common_yes: "Oui",
        common_no: "Non",
        common_save: "Enregistrer",
        common_delete: "Supprimer",
        common_edit: "Modifier",
        common_close: "Fermer",
    },
    
    en: {
        // Navigation
        nav_home: "Home",
        nav_subjects: "Subjects",
        nav_messages: "Messages",
        nav_planning: "Schedule",
        nav_profile: "Profile",
        nav_settings: "Settings",
        
        // Dashboard
        dashboard_welcome: "Hello, {name}! 👋",
        dashboard_subtitle: "Ready to learn something new today?",
        dashboard_search: "Search for a course, a tutor...",
        dashboard_my_subjects: "My Ongoing Subjects",
        dashboard_view_all: "View all",
        dashboard_progression: "Progress",
        dashboard_trending: "Trending",
        dashboard_today_schedule: "Today's Schedule",
        dashboard_instructors: "Instructors",
        
        // Whiteboard
        whiteboard_title: "Mathematics: Linear Functions",
        whiteboard_export: "Export",
        whiteboard_clear_all: "Clear All",
        whiteboard_end_session: "End Session",
        whiteboard_tutor: "Tutor",
        whiteboard_me: "Me",
        whiteboard_text_placeholder: "Type your text...",
        whiteboard_add: "Add",
        whiteboard_cancel: "Cancel",
        whiteboard_help: "Need help with this function?",
        whiteboard_ask_ai: "Ask Djangou AI",
        whiteboard_confirm_clear: "Are you sure you want to clear the entire board?",
        
        // Login
        login_title: "Welcome!",
        login_subtitle: "Enter your credentials to access your space.",
        login_student: "Student",
        login_tutor: "Tutor",
        login_email: "Email",
        login_password: "Password",
        login_forgot: "Forgot?",
        login_button: "Sign in",
        login_no_account: "Don't have an account yet?",
        login_signup: "Sign up",
        login_or: "Or continue with",
        
        // Subjects
        subjects_sciences: "Sciences",
        subjects_math: "Mathematics",
        subjects_computer: "Computer Science",
        subjects_drawing: "Drawing",
        
        // Common
        common_online: "Online",
        common_completed: "Completed",
        common_in_progress: "In Progress",
        common_upcoming: "Upcoming",
        common_new: "New",
        common_yes: "Yes",
        common_no: "No",
        common_save: "Save",
        common_delete: "Delete",
        common_edit: "Edit",
        common_close: "Close",
    }
};






let currentLanguage = localStorage.getItem('djangou_language') || 'fr';

// Fonction pour obtenir une traduction
function t(key, replacements = {}) {
    let text = translations[currentLanguage][key] || key;
    
    Object.keys(replacements).forEach(placeholder => {
        text = text.replace(`{${placeholder}}`, replacements[placeholder]);
    });
    
    return text;
}

// FONCTION PRINCIPALE POUR CHANGER LA LANGUE
function setLanguage(lang) {
    console.log('Changement de langue vers:', lang);
    
    if (!translations[lang]) {
        console.error(`Language ${lang} not found`);
        return;
    }
    
    currentLanguage = lang;
    localStorage.setItem('djangou_language', lang);
    
    // Mettre à jour l'attribut lang du HTML
    document.documentElement.lang = lang;
    
    // Traduire tous les éléments
    translatePage();
    
    // Mettre à jour l'apparence des boutons
    updateLanguageButtons();
    
    // Déclencher un événement personnalisé
    document.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: lang } 
    }));
}

// Fonction pour mettre à jour les boutons de langue
function updateLanguageButtons() {
    console.log('Mise à jour des boutons, langue actuelle:', currentLanguage);
    
    const buttons = document.querySelectorAll('[data-lang-btn]');
    
    buttons.forEach(button => {
        const btnLang = button.getAttribute('data-lang-btn');
        
        // Retirer toutes les classes actives/inactives
        button.classList.remove(
            'border-2', 'border-primary', 'bg-primary/10', 'text-text-main',
            'border', 'text-text-muted', 'hover:border-primary/50',
            'active-language'
        );
        
        if (btnLang === currentLanguage) {
            // Style pour le bouton ACTIF
            button.classList.add('border-2', 'border-primary', 'bg-primary/10', 'text-text-main');
            console.log(`Bouton ${btnLang} mis en style actif`);
        } else {
            // Style pour le bouton INACTIF
            button.classList.add('border', 'text-text-muted', 'hover:border-primary/50');
        }
    });
}

// Fonction pour traduire toute la page
function translatePage() {
    console.log('Traduction de la page en', currentLanguage);
    
    // Traduire tous les éléments avec data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = t(key);
        if (translation && translation !== key) {
            element.textContent = translation;
        }
    });
    
    // Traduire les placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = t(key);
        if (translation && translation !== key) {
            element.placeholder = translation;
        }
    });
    
    // Traduire les attributs alt
    document.querySelectorAll('[data-i18n-alt]').forEach(element => {
        const key = element.getAttribute('data-i18n-alt');
        const translation = t(key);
        if (translation && translation !== key) {
            element.alt = translation;
        }
    });
    
    // Traduire les attributs title
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        const translation = t(key);
        if (translation && translation !== key) {
            element.title = translation;
        }
    });
}

// Fonction d'initialisation
function initLanguage() {
    console.log('Initialisation de la langue:', currentLanguage);
    
    // Traduire la page
    translatePage();
    
    // Mettre à jour les boutons
    updateLanguageButtons();
    
    // Ajouter les écouteurs d'événements pour les boutons
    document.querySelectorAll('[data-lang-btn]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang-btn');
            setLanguage(lang);
        });
    });
}

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', initLanguage);

// Exposer les fonctions globalement
window.setLanguage = setLanguage;
window.t = t;