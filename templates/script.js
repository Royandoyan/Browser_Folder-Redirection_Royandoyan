import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, onSnapshot, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-storage.js";

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
const storage = getStorage(app);

let currentFolderId = null;
let currentFolderPath = "Root";

// Load folders from Firestore
async function loadFolders() {
  const folderList = document.getElementById("folderList");
  folderList.innerHTML = "";

  const folderRef = collection(db, "folders");
  const snapshot = await getDocs(query(folderRef, where("parentId", "==", null), where("isDeleted", "==", false)));
  
  snapshot.forEach(doc => {
    const folder = doc.data();
    const li = document.createElement("div");
    li.classList.add("folder");
    li.textContent = folder.name;
    li.onclick = () => {
      currentFolderId = doc.id;
      currentFolderPath = folder.name;
      document.getElementById("folderPath").textContent = currentFolderPath;
      loadFolders(); 
    };

    folderList.appendChild(li);
  });
}

async function createFolder() {
  const folderName = document.getElementById("folderName").value;
  if (!folderName) return alert("Please enter a folder name!");

  await addDoc(collection(db, "folders"), {
    name: folderName,
    createdAt: new Date(),
    isDeleted: false,
    parentId: currentFolderId || null,
  });
  
  alert("Folder created successfully!");
  loadFolders();
}

async function uploadFiles() {
  const files = document.getElementById("fileInput").files;
  if (files.length === 0) return alert("Please select files to upload!");

  for (let file of files) {
    const fileRef = ref(storage, `folders/${currentFolderId || "root"}/${file.name}`);
    await uploadBytes(fileRef, file);
    const fileUrl = await getDownloadURL(fileRef);
    await addDoc(collection(db, "files"), {
      name: file.name,
      url: fileUrl,
      folderId: currentFolderId || null,
      createdAt: new Date(),
    });
  }

  

  alert("Files uploaded successfully!");
}

window.onload = () => {
  loadFolders();
};
