import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth } from "/js/auth/firebase-config.js";
import { loadHistoryFirestore, saveToFirestore } from "/js/ai/history.js";
import { serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { currentLanguage } from "../lang.js";

/* ===============================
   🔹 TRADUCTIONS
   =============================== */
const translations = {
  fr: {
    // Interface chat
    selectConversation: "Sélectionne d'abord une conversation...",
    writeMessage: "Écris ton message ici...",
    online: "En ligne",
    offline: "Hors ligne",
    
    // États vides
    newConversation: "Nouvelle conversation avec l'assistant IA",
    firstQuestion: "Commence par poser ta première question !",
    noMessages: "Aucun message",
    
    // Indicateur de saisie
    thinking: "L'IA réfléchit...",
    
    // Catégories IA
    categoryGeneral: "Général",
    categoryMathematics: "Mathématiques",
    categoryPhysics: "Physique",
    categoryChemistry: "Chimie",
    categoryLanguages: "Langues",
    categoryComputer: "Informatique",
    categoryHistory: "Histoire",
    categoryGeography: "Géographie",
    
    // Noms de conversations
    aiAssistant: "Assistant IA",
    
    // Messages d'erreur
    errorOccurred: "Désolé, une erreur est survenue.",
    tryAgain: "Veuillez réessayer dans quelques instants.",
    checkConnection: "Si le problème persiste, vérifiez votre connexion internet.",
    
    // Réponses simulées du professeur
    professorResponses: [
      "Je vais regarder ça et je te réponds rapidement.",
      "C'est une bonne question, laisse-moi réfléchir.",
      "Merci pour ton message, je te réponds dès que possible.",
      "Je suis en cours pour le moment, je te réponds plus tard.",
      "Pouvez-vous m'envoyer une photo de l'exercice pour que je puisse mieux vous aider ?"
    ],
    
    // Boutons et actions
    send: "Envoyer",
    back: "Retour",
    
    // Format de temps
    timeLocale: "fr-FR"
  },
  en: {
    // Chat interface
    selectConversation: "Select a conversation first...",
    writeMessage: "Write your message here...",
    online: "Online",
    offline: "Offline",
    
    // Empty states
    newConversation: "New conversation with AI assistant",
    firstQuestion: "Start by asking your first question!",
    noMessages: "No messages",
    
    // Typing indicator
    thinking: "AI is thinking...",
    
    // AI Categories
    categoryGeneral: "General",
    categoryMathematics: "Mathematics",
    categoryPhysics: "Physics",
    categoryChemistry: "Chemistry",
    categoryLanguages: "Languages",
    categoryComputer: "Computer Science",
    categoryHistory: "History",
    categoryGeography: "Geography",
    
    
    // Conversation names
    aiAssistant: "AI Assistant",
    
    // Error messages
    errorOccurred: "Sorry, an error occurred.",
    tryAgain: "Please try again in a few moments.",
    checkConnection: "If the problem persists, check your internet connection.",
    
    // Simulated professor responses
    professorResponses: [
      "I'll look at that and get back to you quickly.",
      "That's a good question, let me think about it.",
      "Thanks for your message, I'll reply as soon as possible.",
      "I'm in class right now, I'll reply later.",
      "Can you send me a photo of the exercise so I can help you better?"
    ],
    
    // Buttons and actions
    send: "Send",
    back: "Back",
    
    // Time format
    timeLocale: "en-US"
  }
};

document.addEventListener("DOMContentLoaded", () => {
    // Éléments DOM
    const conversationList = document.getElementById("conversation-list");
    const chatPanel = document.getElementById("chat-panel");
    const chatMessages = document.getElementById("chat-messages");
    const messageInput = document.getElementById("messageInput");
    const sendBtn = document.getElementById("sendBtn");
    const categorySelect = document.getElementById("ai-category");
    const chatAvatar = document.getElementById("chat-avatar");
    const chatName = document.getElementById("chat-name");
    const chatStatus = document.getElementById("chat-status");
    const backToList = document.getElementById("back-to-list");
    const messageInputContainer = document.getElementById("message-input-container");
    const backToListText = backToList?.querySelector('span:not(.material-symbols-outlined)');
    
    // Variables d'état
    let currentUser = null;
    let STORAGE_KEY = null;
    let store = null;
    let currentConversation = null;
    let isTypingIndicatorActive = false;
    
    // Clé API DeepSeek
    const encoded = "c2stb3ItdjEtN2QxNjgxYWE3ZTgzMmMxN2U1MjFjNWE5MzYwYTVjODk3ZjVmMjNmZWE5OTVkMjZlZTIzMDcyODZjOTc5ZWUzZA==";
    const apiKey = atob(encoded);
    
    // Configuration des conversations
    const conversations = {
        "ia": {
            name: translations[currentLanguage].aiAssistant,
            avatar: "https://m.thewire.in/sortd-service/imaginary/v22-01/jpg/large/high?url=dGhld2lyZS1pbi1wcm9kLXNvcnRkL21lZGlhZjBmODY5MDAtNGM3ZC0xMWYwLWJmMjMtZjFjNDdiZWUxMTRjLmpwZw==",
            status: translations[currentLanguage].online,
            statusColor: "text-emerald-500"
        }
    };
    
    // Fonction pour obtenir les traductions actuelles
    function getTranslations() {
        return translations[currentLanguage];
    }
    
    // Mettre à jour les catégories du select
    function updateCategorySelect() {
        if (!categorySelect) return;
        
        const t = getTranslations();
        
        // Vider les options existantes
        categorySelect.innerHTML = '';
        
        // Ajouter les options traduites
        const categories = [
            { value: "general", text: t.categoryGeneral },
            { value: "mathematics", text: t.categoryMathematics },
            { value: "physics", text: t.categoryPhysics },
            { value: "chemistry", text: t.categoryChemistry },
            { value: "languages", text: t.categoryLanguages },
            { value: "computer", text: t.categoryComputer },
            { value: "history", text: t.categoryHistory },
            { value: "geography", text: t.categoryGeography },
           
        ];
        
        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.value;
            option.textContent = category.text;
            categorySelect.appendChild(option);
        });
    }
    
    // Mettre à jour les textes de l'interface
    function updateUITexts() {
        const t = getTranslations();
        
        // Mettre à jour le bouton d'envoi
        if (sendBtn) {
            const sendText = sendBtn.querySelector('span:not(.material-symbols-outlined)');
            if (sendText) {
                sendText.textContent = t.send;
            }
        }
        
        // Mettre à jour le bouton retour
        if (backToListText) {
            backToListText.textContent = t.back;
        }
        
        // Mettre à jour le nom de l'assistant IA
        if (conversations["ia"]) {
            conversations["ia"].name = t.aiAssistant;
            conversations["ia"].status = t.online;
        }
        
        // Mettre à jour les conversations existantes dans la liste
        document.querySelectorAll('.conversation-item').forEach(item => {
            const nameElement = item.querySelector('.conversation-name');
            if (nameElement && item.dataset.conversationId === "ia") {
                nameElement.textContent = t.aiAssistant;
            }
        });
        
        // Mettre à jour le placeholder du champ de saisie
        if (messageInput && !currentConversation) {
            messageInput.placeholder = t.selectConversation;
        }
        
        // Mettre à jour les catégories
        updateCategorySelect();
    }
    
    // Active/désactive la zone de saisie
    function toggleMessageInput(enabled) {
        if (!messageInputContainer) return;
        
        const t = getTranslations();
        
        if (enabled) {
            messageInputContainer.classList.remove("opacity-50", "pointer-events-none");
            messageInput.disabled = false;
            messageInput.placeholder = t.writeMessage;
            sendBtn.classList.remove("bg-gray-300", "dark:bg-gray-700", "cursor-not-allowed");
            sendBtn.classList.add("bg-gradient-to-r", "from-[var(--p-accent-orange)]", "to-[#C0754D]", "hover:shadow-xl", "hover:scale-105");
        } else {
            messageInputContainer.classList.add("opacity-50", "pointer-events-none");
            messageInput.disabled = true;
            messageInput.placeholder = t.selectConversation;
            sendBtn.classList.add("bg-gray-300", "dark:bg-gray-700", "cursor-not-allowed");
            sendBtn.classList.remove("bg-gradient-to-r", "from-[var(--p-accent-orange)]", "to-[#C0754D]", "hover:shadow-xl", "hover:scale-105");
        }
    }
    
    // Gestion responsive mobile
    function handleMobileChatOpen() {
        if (window.innerWidth < 1024) {
            conversationList?.classList.add("hidden");
            chatPanel?.classList.remove("hidden");
            chatPanel?.classList.add("flex");
        } else {
            chatPanel?.classList.remove("hidden");
            chatPanel?.classList.add("flex");
        }
    }
    
    // Stockage local
    function setUserStorage(uid) {
        STORAGE_KEY = `djangou_chat_student_${uid}`;
    }
    
    function loadStorage() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
            conversations: {},
            ia: {}
        };
    }
    
    function saveStorage(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    
    // Fonctions utilitaires
    function nowTime() {
        const t = getTranslations();
        return new Date().toLocaleTimeString(t.timeLocale, {
            hour: "2-digit",
            minute: "2-digit"
        });
    }
    
    function formatTime(timestamp) {
        if (!timestamp) return "";
        const t = getTranslations();
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleTimeString(t.timeLocale, {
            hour: "2-digit",
            minute: "2-digit"
        });
    }
    
    // Groupe l'historique IA par catégorie
    function groupAIHistoryByCategory(aiHistory) {
        const grouped = {};
        (aiHistory || []).forEach(entry => {
            const cat = entry.category || "general";
            grouped[cat] ||= [];
            
            grouped[cat].push({
                from: "me",
                text: entry.question || "",
                time: formatTime(entry.createdAt)
            });
            
            grouped[cat].push({
                from: "them",
                text: entry.answer || "",
                time: formatTime(entry.createdAt)
            });
        });
        return grouped;
    }
    
    // Fusionne le stockage local avec Firestore
    function mergeAIStore(localIA, firestoreIA) {
        const merged = { ...(localIA || {}) };
        Object.keys(firestoreIA || {}).forEach(cat => {
            merged[cat] = [...(merged[cat] || []), ...firestoreIA[cat]];
        });
        return merged;
    }
    
    // Crée une bulle de message
    function createMessageBubble(from, text, time) {
        const div = document.createElement("div");
        div.className = from === "me" ? "chat-bubble-sent new-message" : "chat-bubble-received new-message";
        
        div.innerHTML = `
            <p class="text-sm leading-relaxed">${text}</p>
            <span class="text-[10px] text-slate-500 mt-2 block opacity-70">${time}</span>
        `;
        
        return div;
    }
    
    // Crée un indicateur de saisie - AMÉLIORÉ
    function createTypingIndicator() {
        if (isTypingIndicatorActive) return null;
        
        const t = getTranslations();
        const div = document.createElement("div");
        div.className = "typing-indicator";
        div.id = "typing-indicator";
        
        div.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <span class="text-[10px] text-slate-500 ml-2">${t.thinking}</span>
        `;
        
        isTypingIndicatorActive = true;
        return div;
    }
    
    // Supprime l'indicateur de saisie
    function removeTypingIndicator() {
        const indicator = document.getElementById("typing-indicator");
        if (indicator) {
            indicator.remove();
            isTypingIndicatorActive = false;
        }
    }
    
    // Met à jour l'aperçu d'une conversation
    function updateConversationPreview(conversationId, lastMessage) {
        const item = document.querySelector(`.conversation-item[data-conversation-id="${conversationId}"]`);
        if (!item) return;
        
        const preview = item.querySelector(".conversation-preview");
        
        if (preview && lastMessage && lastMessage.text) {
            const shortText = lastMessage.text.length > 35 
                ? lastMessage.text.substring(0, 35) + "..." 
                : lastMessage.text;
            preview.textContent = shortText;
        }
    }
    
    // Met à jour toutes les conversations
    function updateAllConversations() {
        document.querySelectorAll(".conversation-item").forEach(item => {
            const id = item.dataset.conversationId;
            let messages = [];
            
            if (id === "ia") {
                const category = categorySelect?.value || "general";
                messages = store.ia?.[category] || [];
            } else {
                messages = store.conversations?.[id] || [];
            }
            
            if (messages.length > 0) {
                updateConversationPreview(id, messages[messages.length - 1]);
            }
        });
    }
    
    // Affiche les messages
    function renderMessages(messages) {
        chatMessages.innerHTML = "";
        
        if (!messages || messages.length === 0) {
            // État vide stylisé
            chatMessages.classList.add("chat-empty-state");
            const t = getTranslations();
            chatMessages.innerHTML = `
                <div class="text-center">
                    <span class="material-symbols-outlined text-5xl text-[var(--p-accent-orange)]/30 mb-4">
                        forum
                    </span>
                    <p class="text-slate-400 text-sm mb-2">${t.newConversation}</p>
                    <p class="text-slate-500 text-xs">${t.firstQuestion}</p>
                </div>
            `;
            return;
        }
        
        chatMessages.classList.remove("chat-empty-state");
        
        messages.forEach(msg => {
            chatMessages.appendChild(createMessageBubble(msg.from, msg.text, msg.time));
        });
        
        // Petit délai pour s'assurer que le DOM est mis à jour
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 50);
    }
    
    // Ouvre une conversation - MODIFIÉ
    function openConversation(id) {
        if (!id) return;
        
        currentConversation = id;
        
        // Active la zone de saisie
        toggleMessageInput(true);
        
        // Met à jour l'en-tête
        const conv = conversations[id];
        const t = getTranslations();
        if (conv) {
            chatAvatar.src = conv.avatar;
            chatName.textContent = conv.name;
            chatStatus.innerHTML = `
                <span class="w-1.5 h-1.5 rounded-full ${conv.status === t.online ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}"></span>
                ${conv.status}
            `;
        }
        
        // Charge les messages
        let messages = [];
        if (id === "ia") {
            const category = categorySelect?.value || "general";
            store.ia[category] ||= [];
            messages = store.ia[category];
        } else {
            store.conversations[id] ||= [];
            messages = store.conversations[id];
        }
        
        renderMessages(messages);
        
        // Gestion mobile
        handleMobileChatOpen();
        
        // Sauvegarde la dernière conversation active
        if (currentUser?.uid) {
            localStorage.setItem(`djangou_last_active_${currentUser.uid}`, id);
        }
        
        // Focus sur le champ de saisie
        setTimeout(() => {
            messageInput.focus();
        }, 100);
    }
    
    // Envoie un message
    async function sendMessage() {
        const text = messageInput.value.trim();
        if (!text || !currentConversation) return;
        
        messageInput.value = "";
        
        const userMessage = {
            from: "me",
            text: text,
            time: nowTime()
        };
        
        if (currentConversation === "ia") {
            const category = categorySelect?.value || "general";
            store.ia[category] ||= [];
            store.ia[category].push(userMessage);
            
            // Affiche immédiatement le message
            renderMessages(store.ia[category]);
            
            // Envoie à l'IA
            await askIA(text, category);
        } else {
            store.conversations[currentConversation] ||= [];
            store.conversations[currentConversation].push(userMessage);
            
            // Affiche le message
            renderMessages(store.conversations[currentConversation]);
            
            // Simulation de réponse du prof
            simulateProfessorResponse();
        }
        
        saveStorage(store);
        updateConversationPreview(currentConversation, userMessage);
    }
    
    // Interroge l'IA - CORRIGÉ POUR L'ANIMATION
    async function askIA(question, category) {
        try {
            // Affiche l'indicateur de saisie AVANT la requête
            const typingIndicator = createTypingIndicator();
            if (typingIndicator) {
                chatMessages.appendChild(typingIndicator);
                setTimeout(() => {
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }, 50);
            }
            
            // Prépare les messages pour l'API
            const t = getTranslations();
            const categoryName = t[`category${category.charAt(0).toUpperCase() + category.slice(1)}`] || category;
            
            let apiMessages = [
                { 
                    role: "system", 

                    content: `Tu es un assistant pédagogique spécialisé pour les étudiants en ${categoryName}. 
                            Tu parles à un étudiant qui a besoin d'aide dans ses études. 
                            Sois patient, pédagogique et encourageant. 
                            Utilise un langage simple et clair. 
                            Si tu ne connais pas la réponse, dis-le honnêtement.`
                }
            ];

            if (currentLanguage === "fr") {
                apiMessages[0].content = `Tu es un assistant pédagogique spécialisé pour les étudiants en ${categoryName}. 
                        Tu parles à un étudiant qui a besoin d'aide dans ses études. 
                        Sois patient, pédagogique et encourageant. 
                        Utilise un langage simple et clair en français. 
                        Si tu ne connais pas la réponse, dis-le honnêtement.`;
            }
            else {
                apiMessages[0].content = `You are an educational assistant specialized for students in ${categoryName}. 
                        You are talking to a student who needs help with their studies.` +
                        ` Be patient, educational, and encouraging. 
                        Use simple and clear language in English. 
                        If you don't know the answer, honestly say so.`;
            }
            // Ajoute l'historique récent
            const recentHistory = store.ia[category].slice(-10);
            recentHistory.forEach(msg => {
                apiMessages.push({
                    role: msg.from === "me" ? "user" : "assistant",
                    content: msg.text
                });
            });
            
            // Effectue la requête
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "deepseek/deepseek-r1-0528:free",
                    messages: apiMessages,
                    max_tokens: 1500,
                    temperature: 0.7
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.choices && data.choices[0]) {
                const answer = data.choices[0].message.content;
                
                // Supprime l'indicateur de saisie
                removeTypingIndicator();
                
                const iaMessage = {
                    from: "them",
                    text: answer,
                    time: nowTime()
                };
                
                store.ia[category].push(iaMessage);
                saveStorage(store);
                
                // Réaffiche tous les messages avec la nouvelle réponse
                renderMessages(store.ia[category]);
                
                // Sauvegarde dans Firestore
                if (currentUser?.uid) {
                    await saveToFirestore({
                        uid: currentUser.uid,
                        category: category,
                        question: question,
                        answer: answer,
                        role: "student",
                        createdAt: serverTimestamp()
                    });
                }
                
                updateConversationPreview("ia", iaMessage);
                
            } else {
                throw new Error("Réponse IA invalide");
            }
            
        } catch (error) {
            console.error("Erreur IA:", error);
            
            // Supprime l'indicateur de saisie en cas d'erreur
            removeTypingIndicator();
            
            const t = getTranslations();
            const errorMessage = {
                from: "them",
                text: `${t.errorOccurred} ${t.tryAgain} ${t.checkConnection}`,
                time: nowTime()
            };
            
            if (currentConversation === "ia") {
                const category = categorySelect?.value || "general";
                store.ia[category].push(errorMessage);
                saveStorage(store);
                renderMessages(store.ia[category]);
            }
        }
    }
    
    // Simule une réponse de professeur
    function simulateProfessorResponse() {
        if (currentConversation === "ia") return;
        
        setTimeout(() => {
            const t = getTranslations();
            const responses = t.professorResponses;
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            
            const profMessage = {
                from: "them",
                text: randomResponse,
                time: nowTime()
            };
            
            store.conversations[currentConversation].push(profMessage);
            saveStorage(store);
            
            renderMessages(store.conversations[currentConversation]);
            updateConversationPreview(currentConversation, profMessage);
            
        }, 2000 + Math.random() * 3000);
    }
    
    // Écouteurs d'événements
    function setupEventListeners() {
        // Clic sur les conversations
        document.querySelectorAll(".conversation-item").forEach(item => {
            item.addEventListener("click", () => {
                document.querySelectorAll(".conversation-item")
                    .forEach(i => i.classList.remove("active"));
                item.classList.add("active");
                
                const id = item.dataset.conversationId;
                openConversation(id);
            });
        });
        
        // Envoi de message
        if (sendBtn) {
            sendBtn.addEventListener("click", sendMessage);
        }
        
        if (messageInput) {
            messageInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }
        
        // Changement de catégorie IA
        if (categorySelect) {
            categorySelect.addEventListener("change", () => {
                if (currentConversation === "ia") {
                    // Recharge la conversation avec la nouvelle catégorie
                    openConversation("ia");
                }
            });
        }
        
        // Retour à la liste (mobile)
        if (backToList) {
            backToList.addEventListener("click", () => {
                if (window.innerWidth < 1024) {
                    conversationList?.classList.remove("hidden");
                    chatPanel?.classList.add("hidden");
                    toggleMessageInput(false);
                }
            });
        }
        
        // Gestion responsive
        window.addEventListener("resize", () => {
            if (window.innerWidth >= 1024) {
                conversationList?.classList.remove("hidden");
            }
        });
    }
    
    // Initialisation Firebase
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = "login.html";
            return;
        }
        
        currentUser = user;
        setUserStorage(user.uid);
        store = loadStorage();
        
        // Mettre à jour les textes de l'interface
        updateUITexts();
        
        try {
            // Charge l'historique Firestore
            const aiHistory = await loadHistoryFirestore(user.uid);
            const firestoreIA = groupAIHistoryByCategory(aiHistory);
            store.ia = firestoreIA || {};
            saveStorage(store);
            
        } catch (error) {
            console.error("Erreur chargement Firestore:", error);
        }
        
        // Met à jour les aperçus
        updateAllConversations();
        
        // Configure les écouteurs
        setupEventListeners();
        
        // Initialisation de l'état
        toggleMessageInput(false);
    });
});

// Fonction pour rafraîchir les traductions
export function refreshTranslations() {
    // Cette fonction peut être appelée quand la langue change
    if (typeof updateUITexts === 'function') {
        updateUITexts();
        
        // Si une conversation est ouverte, la recharger
        if (typeof openConversation === 'function' && currentConversation) {
            openConversation(currentConversation);
        }
    }
}

// Gestion de l'ouverture automatique de l'IA - DÉSACTIVÉ
document.addEventListener("DOMContentLoaded", () => {
    // Ne pas ouvrir automatiquement l'IA
    // L'utilisateur doit cliquer sur la conversation
});