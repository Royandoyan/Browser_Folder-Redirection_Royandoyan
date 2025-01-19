import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, query, where, getDocs, onSnapshot } from "firebase/firestore";

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
const auth = getAuth();
const db = getFirestore(app);

// DOM elements
const signinForm = document.getElementById("signinForm");
const signupForm = document.getElementById("signupForm");
const fileManager = document.getElementById("fileManager");
const folderPath = document.getElementById("folderPath");
const folderList = document.getElementById("folderList");
const fileInput = document.getElementById("fileInput");
const uploadFileBtn = document.getElementById("uploadFileBtn");
const folderName = document.getElementById("folderName");
const createFolderBtn = document.getElementById("createFolderBtn");
const uploadStatus = document.getElementById("uploadStatus");
const logoutBtn = document.getElementById("logoutBtn");

// Firebase Auth: Sign in and Sign up
document.getElementById("signinBtn").addEventListener("click", async () => {
  const email = document.getElementById("signinEmail").value;
  const password = document.getElementById("signinPassword").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    signinForm.style.display = "none";
    fileManager.style.display = "block";
    loadFolders();
  } catch (error) {
    alert("Error signing in: " + error.message);
  }
});

document.getElementById("signupBtn").addEventListener("click", async () => {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const fullName = document.getElementById("fullName").value;
  const age = document.getElementById("age").value;
  const address = document.getElementById("address").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    await addDoc(collection(db, "users"), {
      fullName,
      age,
      address,
      email,
    });
    alert("Account created! Please sign in.");
    signupForm.style.display = "none";
    signinForm.style.display = "block";
  } catch (error) {
    alert("Error signing up: " + error.message);
  }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  fileManager.style.display = "none";
  signinForm.style.display = "block";
});

// Firestore: Fetch and display folders
async function loadFolders() {
  const q = query(collection(db, "folders"), where("parentID", "==", null), where("isDeleted", "==", false));
  const querySnapshot = await getDocs(q);
  folderList.innerHTML = "";
  querySnapshot.forEach(doc => {
    const folderData = doc.data();
    const folderElement = document.createElement("div");
    folderElement.textContent = folderData.name;
    folderElement.classList.add("folder");
    folderElement.addEventListener("click", () => openFolder(doc.id));
    folderList.appendChild(folderElement);
  });

  // Real-time updates with Firestore
  onSnapshot(q, loadFolders);
}

// Firestore: Create folder
createFolderBtn.addEventListener("click", async () => {
  const name = folderName.value;
  if (name) {
    await addDoc(collection(db, "folders"), {
      name,
      parentID: null,
      isDeleted: false
    });
    folderName.value = "";
  } else {
    alert("Please enter a folder name.");
  }
});

// Firestore: Open folder and show files
async function openFolder(folderId) {
  const q = query(collection(db, "folders"), where("parentID", "==", folderId));
  const querySnapshot = await getDocs(q);
  folderPath.textContent = `Folder: ${folderId}`;
  folderList.innerHTML = "";
  querySnapshot.forEach(doc => {
    const folderData = doc.data();
    const folderElement = document.createElement("div");
    folderElement.textContent = folderData.name;
    folderElement.classList.add("folder");
    folderElement.addEventListener("click", () => openFolder(doc.id));
    folderList.appendChild(folderElement);
  });
}

// Upload file to upload.io
uploadFileBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];
  if (file) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("https://upload.io/api/1/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer public_G22nhXS4Z4biETXGSrSV42HFA3Gz`,
        },
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        uploadStatus.textContent = "File uploaded successfully!";
        // Store metadata in Firestore
        await addDoc(collection(db, "files"), {
          folderId: folderPath.textContent,
          fileName: file.name,
          fileUrl: data.url
        });
      } else {
        uploadStatus.textContent = "Error uploading file.";
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  }
});
