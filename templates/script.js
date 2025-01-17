import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAIKjugxiJh9Bd0B32SEd4t9FImRQ9SVK8",
  authDomain: "browser-redirection.firebaseapp.com",
  databaseURL: "https://browser-redirection-default-rtdb.firebaseio.com",
  projectId: "browser-redirection",
  storageBucket: "browser-redirection.firebasestorage.app",
  messagingSenderId: "119718481062",
  appId: "1:119718481062:web:3f57b707f3438fc309f867",
  measurementId: "G-RG2M2FHGWV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentFolderId = null;

// Load folders dynamically
async function loadFolders() {
    const folderList = document.getElementById("folderList");
    folderList.innerHTML = "";
    const folderRef = collection(db, "folders");
    const q = query(folderRef, where("parentId", "==", currentFolderId), where("isDeleted", "==", false));
    
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
}

// Create a folder
async function createFolder() {
    const folderName = document.getElementById("folderName").value;
    if (!folderName) return alert("Please enter a folder name!");
    await addDoc(collection(db, "folders"), { name: folderName, createdAt: new Date(), isDeleted: false, parentId: currentFolderId || null });
    document.getElementById("folderName").value = "";
}

// Delete a folder
async function deleteFolder() {
    if (!currentFolderId) return alert("No folder selected!");
    await updateDoc(doc(db, "folders", currentFolderId), { isDeleted: true });
    alert("Folder moved to trash!");
    loadFolders();
}

// Navigate inside a folder
function navigateToFolder(folderId, folderName) {
    currentFolderId = folderId;
    document.getElementById("folderPath").textContent = folderName;
    loadFolders();
}

// Initialize the page
window.onload = () => loadFolders();