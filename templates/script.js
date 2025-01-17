// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-storage.js";

// Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Current folder ID and path for navigation
let currentFolderId = null;
let currentFolderPath = "Root";

// Create Folder
window.createFolder = async function createFolder() {
  const folderName = document.getElementById("folderName").value;
  if (!folderName) return alert("Please enter a folder name!");

  const folderRef = collection(db, "folders");
  const folderDoc = await addDoc(folderRef, {
    name: folderName,
    createdAt: new Date(),
    parentId: currentFolderId || null, // Save parent folder ID if inside a folder
  });

  document.getElementById("folderName").value = "";
  alert("Folder created successfully!");
  loadFolders();
}

// Load Folders (inside the current folder)
window.loadFolders = async function loadFolders() {
  const folderList = document.getElementById("folderList");
  folderList.innerHTML = "";

  const folderRef = collection(db, "folders");
  const folderQuery = currentFolderId ? query(folderRef, where("parentId", "==", currentFolderId)) : folderRef;
  const snapshot = await getDocs(folderQuery);

  snapshot.forEach(doc => {
    const folder = doc.data();
    const li = document.createElement("div");
    li.classList.add("folder");
    li.textContent = folder.name;

    // When folder is clicked, navigate into it
    li.onclick = () => {
      currentFolderId = doc.id;
      currentFolderPath = currentFolderPath === "Root" ? folder.name : `${currentFolderPath} > ${folder.name}`;
      document.getElementById("folderPath").textContent = currentFolderPath;
      loadFolders(); // Reload folders in the new path
      loadFiles(); // Reload files inside the selected folder
    };

    folderList.appendChild(li);
  });
}

// Upload Files
window.uploadFiles = async function uploadFiles() {
  const files = document.getElementById("fileInput").files;
  if (files.length === 0) return alert("Please select files to upload!");

  const folderPath = currentFolderId ? `folders/${currentFolderId}/` : "outside/";

  for (let file of files) {
    const fileRef = ref(storage, `${folderPath}${file.name}`);
    await uploadBytes(fileRef, file);

    const fileUrl = await getDownloadURL(fileRef);
    await addDoc(collection(db, "files"), {
      folderId: currentFolderId,
      name: file.name,
      url: fileUrl,
      createdAt: new Date(),
    });
  }

  alert("Files uploaded successfully!");
  loadFiles();
}

// Load Files inside the current folder
window.loadFiles = async function loadFiles() {
  const fileList = document.getElementById("fileList");
  fileList.innerHTML = "";

  const fileRef = collection(db, "files");
  const snapshot = await getDocs(fileRef);
  snapshot.forEach(doc => {
    const file = doc.data();
    if (file.folderId === currentFolderId || !file.folderId) { // Check if file belongs to current folder
      const li = document.createElement("li");
      li.textContent = `${file.name} - ${file.url}`;
      fileList.appendChild(li);
    }
  });
}

// Initial Load
window.loadFolders();
window.loadFiles();
