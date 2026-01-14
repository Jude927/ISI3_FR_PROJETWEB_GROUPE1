/****************************************************
 * firestore-sync.js - MARQUE EN LIGNE AUTOMATIQUEMENT
 ****************************************************/
import { db, auth } from "../auth/firebase-config.js";
import { doc, updateDoc, serverTimestamp, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getPeerId } from "./peer-init.js";

console.log("🔗 firestore-sync.js chargé");

// ========================================
// MARQUER EN LIGNE AUTOMATIQUEMENT
// ========================================

function setupAutoOnline() {
    const user = auth.currentUser;
    if (!user) {
        console.log("⚠️ Pas d'utilisateur pour auto-online");
        return;
    }

    console.log("🟢 Marquage EN LIGNE automatique...");

    // Marquer en ligne immédiatement
    markOnline();

    // Heartbeat toutes les 30 secondes
    setInterval(() => {
        markOnline();
    }, 30000);

    // Marquer hors ligne à la fermeture
    window.addEventListener('beforeunload', () => {
        markOffline();
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            markOffline();
        } else {
            markOnline();
        }
    });

    console.log("✅ Auto-online configuré (heartbeat 30s)");
}

async function markOnline() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
            isOnline: true,
            lastSeen: serverTimestamp()
        });

        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            const role = userDoc.data().role;
            
            if (role === "teacher") {
                await updateDoc(doc(db, "teachers", user.uid), {
                    isOnline: true,
                    lastSeen: serverTimestamp()
                });
            } else if (role === "student") {
                await updateDoc(doc(db, "students", user.uid), {
                    isOnline: true,
                    lastSeen: serverTimestamp()
                });
            }
        }

        console.log("🟢 Marqué EN LIGNE");
    } catch (error) {
        console.error("❌ Erreur markOnline:", error);
    }
}

async function markOffline() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
            isOnline: false,
            lastSeen: serverTimestamp()
        });

        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            const role = userDoc.data().role;
            
            if (role === "teacher") {
                await updateDoc(doc(db, "teachers", user.uid), {
                    isOnline: false,
                    lastSeen: serverTimestamp()
                });
            } else if (role === "student") {
                await updateDoc(doc(db, "students", user.uid), {
                    isOnline: false,
                    lastSeen: serverTimestamp()
                });
            }
        }

        console.log("⚫ Marqué HORS LIGNE");
    } catch (error) {
        console.error("❌ Erreur markOffline:", error);
    }
}

// ========================================
// EXPORTS
// ========================================

export async function savePeerIdToFirestore() {
    const user = auth.currentUser;
    if (!user) throw new Error("Non connecté");

    const peerId = getPeerId();
    if (!peerId) throw new Error("Peer ID indisponible");

    console.log("💾 Sauvegarde Peer ID:", peerId);

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) throw new Error("User introuvable");
    
    const role = userDoc.data().role;
    
    await updateDoc(userRef, { 
        peerId, 
        isOnline: true, 
        lastSeen: serverTimestamp() 
    });
    
    if (role === "teacher") {
        const teacherRef = doc(db, "teachers", user.uid);
        const teacherDoc = await getDoc(teacherRef);
        if (teacherDoc.exists()) {
            await updateDoc(teacherRef, { 
                peerId, 
                isOnline: true, 
                isAvailable: true, 
                lastSeen: serverTimestamp() 
            });
        } else {
            await setDoc(teacherRef, { 
                peerId, 
                isOnline: true, 
                isAvailable: true, 
                lastSeen: serverTimestamp(), 
                subjects: [], 
                totalSessions: 0 
            });
        }
    } else if (role === "student") {
        const studentRef = doc(db, "students", user.uid);
        const studentDoc = await getDoc(studentRef);
        if (studentDoc.exists()) {
            await updateDoc(studentRef, { 
                peerId, 
                isOnline: true, 
                lastSeen: serverTimestamp() 
            });
        } else {
            await setDoc(studentRef, { 
                peerId, 
                isOnline: true, 
                lastSeen: serverTimestamp(), 
                totalStudyHours: 0, 
                totalSessions: 0 
            });
        }
    }
    
    // ⭐ ACTIVER AUTO-ONLINE
    setupAutoOnline();
    
    console.log("✅ Peer ID sauvegardé + Auto-online activé");
}

export async function removePeerIdFromFirestore() { 
    await markOffline(); 
}

export async function getPeerIdFromFirestore(userId) {
    const userDoc = await getDoc(doc(db, "users", userId));
    return userDoc.exists() ? userDoc.data().peerId : null;
}

export async function updateHeartbeat() {
    await markOnline();
}

export async function updateAvailability(isAvailable) {
    const user = auth.currentUser;
    if (user) await updateDoc(doc(db, "teachers", user.uid), { 
        isAvailable, 
        lastSeen: serverTimestamp() 
    });
}

export function startHeartbeat() {}
export function stopHeartbeat() {}
export async function handleDisconnect() { await markOffline(); }
export function watchUserStatus() { return () => {}; }

console.log("✅ firestore-sync.js prêt");