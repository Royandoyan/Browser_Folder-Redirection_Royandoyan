import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAIKjugxiJh9Bd0B32SEd4t9FImRQ9SVK8",
  authDomain: "browser-redirection.firebaseapp.com",
  projectId: "browser-redirection",
  storageBucket: "browser-redirection.appspot.com",
  messagingSenderId: "119718481062",
  appId: "1:119718481062:web:3f57b707f3438fc309f867"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

let currentFolderId = null;

// Toggle between Sign In and Sign Up Forms
document.getElementById("showSignup").addEventListener("click", () => {
    document.getElementById("signinForm").style.display = "none";
    document.getElementById("signupForm").style.display = "block";
});

document.getElementById("showSignin").addEventListener("click", () => {
    document.getElementById("signupForm").style.display = "none";
    document.getElementById("signinForm").style.display = "block";
});

// Sign Up
document.getElementById("signupBtn").addEventListener("click", async () => {
    const fullName = document.getElementById("fullName").value;
    const age = document.getElementById("age").value;
    const address = document.getElementById("address").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await addDoc(collection(db, "users"), { fullName, age, address, email, uid: userCredential.user.uid });
        alert("Account created successfully!");
        toggleAuthUI(true);
    } catch (error) {
        console.error("Error signing up: ", error);
    }
});

// Sign In
document.getElementById("signinBtn").addEventListener("click", async () => {
    const email = document.getElementById("signinEmail").value;
    const password = document.getElementById("signinPassword").value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Signed in successfully!");
        toggleAuthUI(true);
    } catch (error) {
        console.error("Error signing in: ", error);
    }
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
    await signOut(auth);
    toggleAuthUI(false);
});

// Toggle UI Based on Auth State
function toggleAuthUI(isAuthenticated) {
    document.getElementById("authContainer").style.display = isAuthenticated ? "none" : "block";
    document.getElementById("fileManager").style.display = isAuthenticated ? "block" : "none";
}

// Load folders dynamically
function loadFolders() {
    const folderList = document.getElementById("folderList");
    folderList.innerHTML = "";
    const q = query(collection(db, "folders"), where("parentId", "==", currentFolderId), where("isDeleted", "==", false));

    onSnapshot(q, (snapshot) => {
        folderList.innerHTML = "";
        snapshot.forEach(doc => {
            const folder = doc.data();
            const div = document.createElement("div");
            div.classList.add("folder");
            div.textContent = folder.name;
            div.onclick = () => navigateToFolder(doc.id, folder.name);
            folderList.appendChild(div);
        });
    });

    loadFiles();
}

// Check Auth State
auth.onAuthStateChanged(user => {
    toggleAuthUI(!!user);
    if (user) loadFolders();
});
