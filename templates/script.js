import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-storage.js";
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
const storage = getStorage(app);
const auth = getAuth();

let currentFolderId = null;

// Signup
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

// Signin
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

// UI toggle for auth
function toggleAuthUI(isAuthenticated) {
    document.getElementById("authContainer").style.display = isAuthenticated ? "none" : "block";
    document.getElementById("fileManager").style.display = isAuthenticated ? "block" : "none";
    document.getElementById("logoutBtn").style.display = isAuthenticated ? "block" : "none";
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

// Attach event listeners
document.getElementById("createFolderBtn").addEventListener("click", createFolder);
document.getElementById("deleteFolderBtn").addEventListener("click", deleteFolder);
document.getElementById("uploadFileBtn").addEventListener("click", uploadFile);

// Check auth state
auth.onAuthStateChanged(user => {
    toggleAuthUI(!!user);
    if (user) loadFolders();
});
