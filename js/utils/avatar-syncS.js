import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { auth, db } from "/js/auth/firebase-config.js";

document.addEventListener("DOMContentLoaded", () => {
    // Cherche tous les avatars avec différentes classes/IDs
    const avatars = document.querySelectorAll("#userAvatar, .profile-avatar, [alt*='Avatar'], [alt*='profil']");
    
    if (!avatars.length) return;
    
    onAuthStateChanged(auth, async (user) => {
        if (!user) return;
        
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                let avatarUrl = "/assets/avatars/avatardef.png";
                
                // Vérifie si l'avatar existe dans les données
                if (userData.avatar) {
                    avatarUrl = userData.avatar;
                }
                
                // Met à jour tous les avatars trouvés
                avatars.forEach(img => {
                    img.src = avatarUrl;
                    
                    // Gestion des erreurs de chargement d'image
                    img.onerror = () => {
                        img.src = "/assets/avatars/avatardef.png";
                        console.warn("Avatar personnalisé non chargé, utilisation de l'avatar par défaut");
                    };
                    
                    img.classList.remove("opacity-0");
                });
                
                // Met à jour le nom d'utilisateur si l'élément existe
                const userNameElement = document.getElementById("userName");
                if (userNameElement && userData.displayName) {
                    userNameElement.textContent = userData.displayName;
                }
                
                // Met à jour le rôle si l'élément existe
                const userRoleElement = document.getElementById("userRole");
                if (userRoleElement && userData.role) {
                    userRoleElement.textContent = userData.role === "student" ? "Étudiant" : 
                                                userData.role === "teacher" ? "Professeur" : 
                                                "Utilisateur";
                }
                
            } else {
                // Document utilisateur non trouvé
                console.warn("Document utilisateur non trouvé dans Firestore");
                avatars.forEach(img => {
                    img.src = "/assets/avatars/avatardef.png";
                });
            }
            
        } catch (error) {
            console.error("Erreur lors du chargement de l'avatar:", error);
            
            // En cas d'erreur, utilise l'avatar par défaut
            avatars.forEach(img => {
                img.src = "/assets/avatars/avatardef.png";
            });
        }
    });
});