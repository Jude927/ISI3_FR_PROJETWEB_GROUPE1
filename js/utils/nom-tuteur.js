
        import { auth, db } from "/js/auth/firebase-config.js";
        import { doc, getDoc } from
            "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

        auth.onAuthStateChanged(async (user) => {
            if (!user) return;

            const snap = await getDoc(doc(db, "teachers", user.uid));
            if (!snap.exists()) return;

            document.querySelectorAll("#teacher-name")
                .forEach(el => el.textContent = snap.data().fullName);
        });
  