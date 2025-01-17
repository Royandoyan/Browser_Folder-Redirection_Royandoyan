import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAIKjugxiJh9Bd0B32SEd4t9FImRQ9SVK8",
  authDomain: "browser-redirection.firebaseapp.com",
  projectId: "browser-redirection",
  storageBucket: "browser-redirection.appspot.com",
  messagingSenderId: "119718481062",
  appId: "1:119718481062:web:3f57b707f3438fc309f867",
  measurementId: "G-RG2M2FHGWV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app); // Firebase Storage

let currentFolderId = null;

// Load folders dynamically
function loadFolders() {
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

    loadFiles(); // Load files inside the selected folder
}

// Create a folder
async function createFolder() {
    const folderName = document.getElementById("folderName").value;
    if (!folderName) return alert("Please enter a folder name!");

    try {
        await addDoc(collection(db, "folders"), {
            name: folderName,
            createdAt: new Date(),
            isDeleted: false,
            parentId: currentFolderId || null
        });
        document.getElementById("folderName").value = "";
        console.log("Folder created successfully!");
    } catch (error) {
        console.error("Error creating folder: ", error);
    }
}

// Delete a folder
async function deleteFolder() {
    if (!currentFolderId) return alert("No folder selected!");

    try {
        await updateDoc(doc(db, "folders", currentFolderId), { isDeleted: true });
        alert("Folder moved to trash!");
        loadFolders();
    } catch (error) {
        console.error("Error deleting folder: ", error);
    }
}

// Navigate inside a folder
function navigateToFolder(folderId, folderName) {
    currentFolderId = folderId;
    document.getElementById("folderPath").textContent = folderName;
    loadFolders();
}

// Upload a file inside the selected folder
async function uploadFile() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];
    if (!file) return alert("Please select a file to upload!");
    if (!currentFolderId) return alert("Please select a folder first!");

    const fileRef = ref(storage, `folders/${currentFolderId}/${file.name}`);
    
    try {
        await uploadBytes(fileRef, file); // Upload file to Firebase Storage
        const fileURL = await getDownloadURL(fileRef); // Get file URL
        await addDoc(collection(db, "files"), {
            name: file.name,
            url: fileURL,
            folderId: currentFolderId,
            uploadedAt: new Date()
        });

        alert("File uploaded successfully!");
        loadFiles(); // Refresh file list
    } catch (error) {
        console.error("Error uploading file: ", error);
    }
}

// Load files inside the selected folder
function loadFiles() {
    const fileList = document.getElementById("fileList");
    fileList.innerHTML = "";
    if (!currentFolderId) return;

    const filesRef = collection(db, "files");
    const q = query(filesRef, where("folderId", "==", currentFolderId));

    onSnapshot(q, (snapshot) => {
        fileList.innerHTML = "";
        snapshot.forEach(doc => {
            const file = doc.data();
            const div = document.createElement("div");
            div.classList.add("file");
            div.innerHTML = `<a href="${file.url}" target="_blank">${file.name}</a>`;
            fileList.appendChild(div);
        });
    });
}

// Attach event listeners
document.getElementById("createFolderBtn").addEventListener("click", createFolder);
document.getElementById("deleteFolderBtn").addEventListener("click", deleteFolder);
document.getElementById("uploadFileBtn").addEventListener("click", uploadFile);

// Initialize the page
window.onload = () => loadFolders();
