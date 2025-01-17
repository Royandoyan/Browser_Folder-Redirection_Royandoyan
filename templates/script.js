// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";
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

// Current selected folder ID
let selectedFolderId = null;

// Create Folder
window.createFolder = async function createFolder() {
  const folderName = document.getElementById("folderName").value;
  if (!folderName) return alert("Please enter a folder name!");

  const folderRef = collection(db, "folders");
  const folderDoc = await addDoc(folderRef, {
    name: folderName,
    createdAt: new Date(),
  });

  document.getElementById("folderName").value = "";
  alert("Folder created successfully!");
  loadFolders();
}

// Load Folders
window.loadFolders = async function loadFolders() {
  const folderList = document.getElementById("folderList");
  folderList.innerHTML = "";

  const folderRef = collection(db, "folders");
  const snapshot = await getDocs(folderRef);
  snapshot.forEach(doc => {
    const folder = doc.data();
    const li = document.createElement("div");
    li.classList.add("folder");
    li.textContent = folder.name;

    // When folder is clicked, set it as the selected folder
    li.onclick = () => {
      selectedFolderId = doc.id;
      alert(`Folder "${folder.name}" selected! You can now upload files here.`);
    };

    folderList.appendChild(li);
  });
}

// Upload Files
window.uploadFiles = async function uploadFiles() {
  const files = document.getElementById("fileInput").files;
  if (files.length === 0) return alert("Please select files to upload!");

  // If no folder is selected, ask the user where to upload
  if (!selectedFolderId) {
    const uploadOutside = confirm("Do you want to upload files outside of any folder?");
    if (!uploadOutside) return alert("Please select a folder first!");
    selectedFolderId = null; // Uploading outside any folder
  }

  for (let file of files) {
    const folderPath = selectedFolderId ? `folders/${selectedFolderId}/` : "outside/";

    const fileRef = ref(storage, `${folderPath}${file.name}`);
    await uploadBytes(fileRef, file);

    const fileUrl = await getDownloadURL(fileRef);
    await addDoc(collection(db, "files"), {
      folderId: selectedFolderId,
      name: file.name,
      url: fileUrl,
      createdAt: new Date(),
    });
  }

  alert("Files uploaded successfully!");
  loadFiles();
}

// Load Files
window.loadFiles = async function loadFiles() {
  const fileList = document.getElementById("fileList");
  fileList.innerHTML = "";

  const fileRef = collection(db, "files");
  const snapshot = await getDocs(fileRef);
  snapshot.forEach(doc => {
    const file = doc.data();
    const li = document.createElement("li");
    li.textContent = `${file.name} - ${file.url}`;
    fileList.appendChild(li);
  });
}

// Initial Load
window.loadFolders();
window.loadFiles();
