import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, query, where, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase configuration and initialization
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// DOM Elements
const folderList = document.getElementById("folderList");
const fileList = document.getElementById("fileList");
const createFolderBtn = document.getElementById("createFolderBtn");
const folderNameInput = document.getElementById("folderName");
const uploadFileBtn = document.getElementById("uploadFileBtn");
const fileInput = document.getElementById("fileInput");

// Global Variables
let currentFolderID = "root";

// Load folders and synchronize in real-time
function loadFolders() {
  const q = db.collection("folders").where("parentID", "==", currentFolderID).where("isDeleted", "==", false);
  
  q.onSnapshot((snapshot) => {
    folderList.innerHTML = ""; // Clear folder list
    snapshot.forEach((doc) => {
      const folder = doc.data();
      const folderDiv = document.createElement("div");
      folderDiv.className = "folder";
      folderDiv.textContent = folder.name;
      folderDiv.onclick = () => {
        currentFolderID = doc.id;
        loadFolders();
        loadFiles();
      };
      folderList.appendChild(folderDiv);
    });
  }, (error) => {
    console.error("Error loading folders:", error);
  });
}

// Load files and synchronize in real-time
function loadFiles() {
  const q = db.collection("files").where("folderID", "==", currentFolderID);

  q.onSnapshot((snapshot) => {
    fileList.innerHTML = ""; // Clear file list
    snapshot.forEach((doc) => {
      const file = doc.data();
      const fileDiv = document.createElement("div");
      fileDiv.className = "file";
      fileDiv.textContent = file.name;
      fileDiv.onclick = () => window.open(file.url, "_blank");
      fileList.appendChild(fileDiv);
    });
  }, (error) => {
    console.error("Error loading files:", error);
  });
}

// Create a new folder
createFolderBtn.addEventListener("click", async () => {
  const folderName = folderNameInput.value.trim();
  if (!folderName) return alert("Folder name is required!");

  await db.collection("folders").add({
    name: folderName,
    parentID: currentFolderID,
    isDeleted: false,
  });

  folderNameInput.value = ""; // Clear input field
});

// Upload a file
uploadFileBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];
  if (!file) return alert("Please select a file.");

  uploadFileBtn.disabled = true;
  uploadFileBtn.textContent = "Uploading...";

  const formData = new FormData();
  formData.append("file", file);

  try {
    // Upload file to third-party service
    const response = await fetch("https://browser-folder-redirection-royandoyan.onrender.com/uploadFile", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    if (!result.fileUrl) throw new Error("Failed to upload file.");

    // Save file metadata in Firestore
    await db.collection("files").add({
      name: file.name,
      url: result.fileUrl,
      folderID: currentFolderID,
    });

    alert("File uploaded successfully!");
  } catch (error) {
    console.error("Error uploading file:", error);
    alert("An error occurred while uploading the file.");
  } finally {
    uploadFileBtn.disabled = false;
    uploadFileBtn.textContent = "Upload File";
  }
});

// Initialize app on user login
auth.onAuthStateChanged((user) => {
  if (user) {
    loadFolders();
    loadFiles();
  } else {
    alert("Please log in to access your files and folders.");
  }
});
