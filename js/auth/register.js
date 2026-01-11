import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
   
function showLoader(buttonId, show) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    const text = document.getElementById(buttonId.replace('SubmitBtn', 'Text'));
    const loader = document.getElementById(buttonId.replace('SubmitBtn', 'Loader'));
    
    if (show) {
        button.disabled = true;
        if (text) text.classList.add('hidden');
        if (loader) loader.classList.remove('hidden');
    } else {
        button.disabled = false;
        if (text) text.classList.remove('hidden');
        if (loader) loader.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const studentForm = document.getElementById('form-student');
    const tutorForm = document.getElementById('form-tutor');
    const errorBox = document.getElementById('errorBox');

    const handleRegistration = async (formType, e) => {
        e.preventDefault();

        const buttonId = formType === 'student' ? 'studentSubmitBtn' : 'tutorSubmitBtn';
        
        // Afficher le loader
        showLoader(buttonId, true);
        
        // Cacher les erreurs précédentes
        if (errorBox) errorBox.style.display = 'none';

        // Déclarer toutes les variables
        let firstName, username, role, classField, subjectsField, email, password, experience;

        if (formType === 'student') {
            // Récupérer les valeurs du formulaire étudiant
            firstName = document.getElementById('firstName-student').value;
            username = document.getElementById('username-student').value;
            role = document.getElementById('role-student').value;
            classField = document.getElementById('class-student').value;
            email = document.getElementById('email-student').value;
            password = document.getElementById('password-student').value;
            
            // Pour les étudiants, ces champs sont null
            subjectsField = null;
            experience = null;
        } else {
            // Récupérer les valeurs du formulaire tuteur
            firstName = document.getElementById('firstName-tutor').value;
            username = document.getElementById('username-tutor').value;
            role = document.getElementById('role-tutor').value;
            subjectsField = document.getElementById('subjects-tutor').value;
            experience = document.getElementById('experience-tutor').value;
            email = document.getElementById('email-tutor').value;
            password = document.getElementById('password-tutor').value;
            
            // Pour les tuteurs, ce champ est null
            classField = null;
        }

        try {
            // 1. Création du compte Firebase Authentication
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            const uid = cred.user.uid;

            // 2. Préparation des données utilisateur
            const userData = {
                firstName,
                username,
                role,
                email, // IMPORTANT: Ajouter l'email ici
                createdAt: serverTimestamp()
            };

            // 3. Ajouter les données spécifiques au rôle
            if (role === "student") {
                userData.class = classField;
            } else {
                userData.experience = experience ? parseInt(experience) : 0;
            }

            // 4. Enregistrer dans la collection "users"
            await setDoc(doc(db, "users", uid), userData);

            // 5. Enregistrer dans "teachers" pour les tuteurs seulement
            if (role === "teacher") {
                const subjects = subjectsField ? [subjectsField] : [];
                await setDoc(doc(db, "teachers", uid), {
                    subjects,
                    available: true,
                    experience: experience ? parseInt(experience) : 0,
                    email: email,
                    fullName: `${firstName} ${username}`,
                    createdAt: serverTimestamp()
                });
            }else{
                // Pour les étudiants, on peut aussi enregistrer dans une collection "students" si nécessaire
                await setDoc(doc(db, "students", uid), {
                    class: classField,
                    email: email,
                    fullName: `${firstName} ${username}`,
                    createdAt: serverTimestamp()
                });
            }

            // 6. Redirection après succès
            setTimeout(() => {
                if (role === "student") {
                    window.location.href = "../public/dashboard-student.html";
                } else {
                    window.location.href = "../public/dashboard-teacher.html";
                }
            }, 500);

        } catch (error) {
            // En cas d'erreur
            showLoader(buttonId, false);
            
            // Afficher l'erreur
            if (errorBox) {
                errorBox.style.display = "block";
                
                let errorMessage = "Erreur lors de l'inscription";
                
                switch (error.code) {
                    case "auth/email-already-in-use":
                        errorMessage = "Cet email est déjà utilisé.";
                        break;
                    case "auth/weak-password":
                        errorMessage = "Mot de passe trop faible (6 caractères minimum).";
                        break;
                    case "auth/invalid-email":
                        errorMessage = "Adresse email invalide.";
                        break;
                    case "auth/operation-not-allowed":
                        errorMessage = "L'inscription par email/mot de passe n'est pas activée.";
                        break;
                    default:
                        errorMessage = "Erreur lors de l'inscription: " + error.message;
                }
                
                errorBox.innerText = errorMessage;
                
                // Ajouter un log pour le débogage
                console.error("Détails de l'erreur:", {
                    code: error.code,
                    message: error.message,
                    formType: formType
                });
            }
        }
    };

    // Ajouter les écouteurs d'événements
    if (studentForm) {
        studentForm.addEventListener('submit', (e) => handleRegistration('student', e));
    }

    if (tutorForm) {
        tutorForm.addEventListener('submit', (e) => handleRegistration('tutor', e));
    }
});