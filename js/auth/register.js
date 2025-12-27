/**
 * register.js
 * -----------------------------
 * Gère l'inscription des utilisateurs (élèves et tuteurs)
 * Adaptation pour la nouvelle interface avec deux formulaires
 */

import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Écouteurs d'événements pour les deux formulaires
document.addEventListener('DOMContentLoaded', () => {
    const studentForm = document.getElementById('form-student');
    const tutorForm = document.getElementById('form-tutor');
    const errorBox = document.getElementById('errorBox');

    // Fonction pour gérer l'inscription
    const handleRegistration = async (formType, e) => {
        e.preventDefault();

        /* ===============================
           1️⃣ RÉCUPÉRATION DES DONNÉES
           =============================== */

        let firstName, username, role, classField, subjectsField, email, password;

        if (formType === 'student') {
            firstName = document.getElementById('firstName-student').value;
            username = document.getElementById('username-student').value;
            role = document.getElementById('role-student').value;
            classField = document.getElementById('class-student').value;
            email = document.getElementById('email-student').value;
            password = document.getElementById('password-student').value;
        } else {
            firstName = document.getElementById('firstName-tutor').value;
            username = document.getElementById('username-tutor').value;
            role = document.getElementById('role-tutor').value;
            subjectsField = document.getElementById('subjects-tutor').value;
            const experience = document.getElementById('experience-tutor').value;
            email = document.getElementById('email-tutor').value;
            password = document.getElementById('password-tutor').value;
        }

        try {
            /* ===============================
                2️⃣ CRÉATION DU COMPTE AUTH
                =============================== */

            const cred = await createUserWithEmailAndPassword(auth, email, password);
            const uid = cred.user.uid;

            /* ===============================
                3️⃣ ENREGISTREMENT DANS "users"
                =============================== */

            const userData = {
                firstName,
                username,
                role,
                createdAt: serverTimestamp()
            };

            // Ajouter les données spécifiques
            if (role === "student") {
                userData.class = classField;
            } else {
                userData.experience = parseInt(experience) || 0;
            }

            await setDoc(doc(db, "users", uid), userData);

            /* ===============================
                4️⃣ ENREGISTREMENT DANS "teachers" (tuteurs uniquement)
                =============================== */

            if (role === "teacher") {
                const subjects = [subjectsField];
                await setDoc(doc(db, "teachers", uid), {
                    subjects,
                    available: true,
                    experience: parseInt(experience) || 0,
                    createdAt: serverTimestamp()
                });
            }

            /* ===============================
                5️⃣ REDIRECTION
                =============================== */
          if (role === "student") {
        window.location.href = "../public/dashboard-student.html";
        } else {
        window.location.href = "../public/dashboard-tutor.html";
       }

        } catch (error) {
            /* ===============================
                6️⃣ GESTION DES ERREURS
                =============================== */

            errorBox.style.display = "block";

            switch (error.code) {
                case "auth/email-already-in-use":
                    errorBox.innerText = "Cet email est déjà utilisé.";
                    break;
                case "auth/weak-password":
                    errorBox.innerText = "Mot de passe trop faible (6 caractères minimum).";
                    break;
                case "auth/invalid-email":
                    errorBox.innerText = "Adresse email invalide.";
                    break;
                default:
                    errorBox.innerText = "Erreur lors de l'inscription: " + error.message;
            }

            console.error("Erreur inscription :", error);
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