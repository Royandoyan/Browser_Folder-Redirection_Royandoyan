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

// Create Folder
async function createFolder() {
  const folderName = document.getElementById("folderName").value;
  if (!folderName) return alert("Please enter a folder name!");

  const folderRef = collection(db, "folders");
  await addDoc(folderRef, {
    name: folderName,
    createdAt: new Date(),
  });

  document.getElementById("folderName").value = "";
  alert("Folder created successfully!");
  loadFolders();
}

// Load Folders
async function loadFolders() {
  const folderList = document.getElementById("folderList");
  folderList.innerHTML = "";

  const folderRef = collection(db, "folders");
  const snapshot = await getDocs(folderRef);
  snapshot.forEach(doc => {
    const folder = doc.data();
    const li = document.createElement("li");
    li.textContent = folder.name;
    folderList.appendChild(li);
  });
}

// Upload Files
async function uploadFiles() {
  const files = document.getElementById("fileInput").files;
  if (files.length === 0) return alert("Please select files to upload!");

  const folderName = prompt("Enter the folder name to upload files:");
  const folderRef = query(collection(db, "folders"), where("name", "==", folderName));

  const folderSnapshot = await getDocs(folderRef);
  if (folderSnapshot.empty) return alert("Folder not found!");

  const folderDoc = folderSnapshot.docs[0];
  const folderId = folderDoc.id;

  for (let file of files) {
    const fileRef = ref(storage, `files/${folderId}/${file.name}`);
    await uploadBytes(fileRef, file);

    const fileUrl = await getDownloadURL(fileRef);
    await addDoc(collection(db, "files"), {
      folderId: folderId,
      name: file.name,
      url: fileUrl,
      createdAt: new Date(),
    });
  }

  alert("Files uploaded successfully!");
  loadFiles();
}

// Load Files
async function loadFiles() {
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
loadFolders();
loadFiles();
