// Dictionnaire de traductions
const translations = {
    fr: {
        // Navigation
        nav_home: "Accueil",
        nav_subjects: "Matières",
        nav_messages: "Messages",
        nav_profile: "Profil",
        nav_settings: "Paramètres",
        nav_logout: "Se déconnecter",

        id_nav_subjects_active: "Matières",
        id_page_title: "Matières - Djangou",
        id_search_placeholder: "Rechercher un tuteur...",
        id_section_title: "Nos Matières",
        id_section_subtitle: "Choisissez une matière pour voir les tuteurs disponibles",
        id_subjects_main: "Matières Principales",
        id_math_description: "Algèbre, géométrie, calcul, statistiques",
        id_card_cta: "Cliquez pour voir les tuteurs",
        id_physics_chemistry_description: "Mécanique, optique, thermodynamique, réactions chimiques",
        id_computer_science_description: "Programmation, algorithmes, bases de données, web",
        id_languages_description: "Français, anglais, espagnol, allemand, etc.",
        id_history_geo_description: "Histoire mondiale, géographie, civilisations",
        id_back_button: "Retour aux matières",
        id_teachers_title: "Tuteurs disponibles pour cette matière",
        id_no_selection_text: "Sélectionnez une matière pour voir les tuteurs",
        id_load_more: "Charger plus de tuteurs",


        //span
        span_french: "Français",
        span_english: "Anglais",
        span_student: "Étudiant",
        span_tutor: "Tuteur",
        span_clear: "Clair",
        span_dark: "Sombre",

        pwd: "Changer le mot de passe",
        protect: "Protégez votre compte",
        security: "Sécurité",
        cancel: "Annuler",
        save: "Enregistrer les modifications",
        about: "À propos",
        creator: "Les créateurs",
        login: "Connexion",
        signup: "S'inscrire",
        titre: "L'application où apprendre est simple et fun",
        desc: "Découvrez une nouvelle façon de maîtriser vos sujets préférés avec des tuteurs passionnés et une IA intelligente.",
        start: "Commencer à apprendre",
        why: "Pourquoi Djangou ?",
        cours: "Cours personnalisés",
        parcours: "Des parcours adaptés à votre niveau et à votre rythme pour une progression optimale.",
        expert: "Tuteurs experts",
        access: "Accédez à un réseau de mentors qualifiés prêts à vous aider à surmonter chaque obstacle.",
        instant: "Posez vos questions instantanément et collaborez avec d'autres étudiants.",
        temp_reel: "Chat en temps réel",
        ia: "Notre IA vous suggère des exercices et vous aide à réviser 24h/24 et 7j/7.",

        //p
        p_langue: "Changement de langue",
        p_langue_sub: "Langue préférée pour l'interface ",
        p_mode: "Mode d'affichage",
        p_mode_sub: "Choisissez entre le mode clair ou sombre",



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

        // Common
        id_common_online: "En ligne",
        id_common_completed: "Complété",
        id_common_in_progress: "En cours",
        id_common_upcoming: "À venir",
        id_common_new: "Nouveau",
        id_common_yes: "Oui",
        id_common_no: "Non",
        id_common_save: "Enregistrer",
        id_common_delete: "Supprimer",
        id_common_edit: "Modifier",
        id_common_close: "Fermer",

        // Navigation
        id_nav_home: "Accueil",
        id_nav_subjects: "Matières",
        id_nav_messages: "Messages",
        id_nav_planning: "Planning",
        id_nav_profile: "Profil",
        id_nav_settings: "Paramètres",
        id_nav_logout: "Se déconnecter",

        // Spans
        id_span_french: "Français",
        id_span_english: "Anglais",
        id_span_student: "Étudiant",
        id_span_tutor: "Tuteur",
        id_span_clear: "Clair",

        // Dashboard
        id_dash_greeting: "Bonjour, Lisha! 👋",
        id_dash_subtitle: "Prête à apprendre quelque chose de nouveau aujourd'hui?",
        id_dash_new_feature: "Nouveau",
        id_dash_ai_title: "DeepSeek AI",
        id_dash_ai_heading: "Besoin d'aide sur un devoir ?",
        id_dash_ai_description: "Notre assistant IA est disponible 24/7 pour répondre à tes questions et t'aider à progresser.",
        id_dash_ai_button: "Discuter maintenant",

        // Sections
        id_section_recent_subjects: "Mes Matières récentes",
        id_section_see_all: "Voir tout",
        id_section_favorites: "Favoris",
        id_section_instructors: "Instructeurs",
        // Subjects
        id_subject_science: "Sciences",
        id_subject_math: "Mathématiques",
        id_subject_computer: "Informatique",
        id_subject_drawing: "Dessin",
        id_subject_physics: "Physiques",

        // Other
        id_user_status: "Étudiante",
    },





    en: {
        // Navigation
        nav_home: "Home",
        nav_subjects: "Subjects",
        nav_messages: "Messages",
        nav_planning: "Schedule",
        nav_profile: "Profile",
        nav_settings: "Settings",
        nav_logout: "Log out",

        //span
        span_french: "French",
        span_english: "English",
        span_student: "Student",
        span_tutor: "Tutor",
        span_clear: "Light",
        span_dark: "Dark",

        id_nav_subjects_active: "Subjects",
        id_page_title: "Subjects - Djangou",
        id_search_placeholder: "Search for a tutor...",
        id_section_title: "Our Subjects",
        id_section_subtitle: "Choose a subject to see available tutors",
        id_subjects_main: "Main Subjects",
        id_math_description: "Algebra, geometry, calculus, statistics",
        id_card_cta: "Click to see tutors",
        id_physics_chemistry_description: "Mechanics, optics, thermodynamics, chemical reactions",
        id_computer_science_description: "Programming, algorithms, databases, web",
        id_languages_description: "French, English, Spanish, German, etc.",
        id_history_geo_description: "World history, geography, civilizations",
        id_back_button: "Back to subjects",
        id_teachers_title: "Available tutors for this subject",
        id_no_selection_text: "Select a subject to see tutors",
        id_load_more: "Load more tutors",

        security: "Security",
        pwd: "Change Password",
        protect: "Protect your account",
        cancel: "Cancel",
        save: "Save Changes",
        about: "About",
        creator: "The Creators",
        login: "Login",
        signup: "Sign Up",
        desc: "Discover a new way to master your favorite subjects with passionate tutors and smart AI.",
        titre: "The app where learning is simple and fun",
        start: "Start Learning Now",
        why: "Why Djangou?",
        cours: "Personalized Courses",
        parcours: "Paths tailored to your level and pace for optimal progress.",
        expert: "Expert Tutors",
        access: "Access a network of qualified mentors ready to help you overcome any obstacle.",
        temp_reel: "Real-Time Chat",
        instant: "Ask your questions instantly and collaborate with other students.",
        ia: "Our AI suggests exercises and helps you review 24/7.",


        //p
        p_langue: "Language switch",
        p_langue_sub: "Select your preferred language ",
        p_mode: "Display mode",
        p_mode_sub: "Choose between light or dark mode",

        // Dashboard
        id_dash_greeting: "Bonjour 👋",
        id_user_status: "Étudiant",
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

        id_common_online: "Online",
        id_common_completed: "Completed",
        id_common_in_progress: "In progress",
        id_common_upcoming: "Upcoming",
        id_common_new: "New",
        id_common_yes: "Yes",
        id_common_no: "No",
        id_common_save: "Save",
        id_common_delete: "Delete",
        id_common_edit: "Edit",
        id_common_close: "Close",

        // Navigation
        id_nav_home: "Home",
        id_nav_subjects: "Subjects",
        id_nav_messages: "Messages",
        id_nav_planning: "Schedule",
        id_nav_profile: "Profile",
        id_nav_settings: "Settings",
        id_nav_logout: "Log out",

        // Spans
        id_span_french: "French",
        id_span_english: "English",
        id_span_student: "Student",
        id_span_tutor: "Tutor",
        id_span_clear: "Light",

        // Dashboard
        id_dash_greeting: "Hello, Lisha! 👋",
        id_dash_subtitle: "Ready to learn something new today?",
        id_dash_new_feature: "New",
        id_dash_ai_title: "DeepSeek AI",
        id_dash_ai_heading: "Need help with homework?",
        id_dash_ai_description: "Our AI assistant is available 24/7 to answer your questions and help you progress.",
        id_dash_ai_button: "Chat now",

        // Sections
        id_section_recent_subjects: "My Recent Subjects",
        id_section_see_all: "See all",
        id_section_favorites: "Favorites",
        id_section_instructors: "Instructors",

        // Subjects
        id_subject_science: "Science",
        id_subject_math: "Mathematics",
        id_subject_computer: "Computer Science",
        id_subject_drawing: "Drawing",
        id_subject_physics: "Physics",

        // Other
        id_user_status: "Student",
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
        button.addEventListener('click', function (e) {
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