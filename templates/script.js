// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIKjugxiJh9Bd0B32SEd4t9FImRQ9SVK8",
  authDomain: "browser-redirection.firebaseapp.com",
  databaseURL: "https://browser-redirection-default-rtdb.firebaseio.com",
  projectId: "browser-redirection",
  storageBucket: "browser-redirection.appspot.com", // Updated typo in storageBucket
  messagingSenderId: "119718481062",
  appId: "1:119718481062:web:3f57b707f3438fc309f867",
  measurementId: "G-RG2M2FHGWV",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

// DOM Elements
const authContainer = document.getElementById("authContainer");
const signinForm = document.getElementById("signinForm");
const signupForm = document.getElementById("signupForm");
const fileManager = document.getElementById("fileManager");
const folderList = document.getElementById("folderList");
const folderPath = document.getElementById("folderPath");

let currentFolderID = null; // Tracks current folder ID

// Sign Up
document.getElementById("signupBtn").addEventListener("click", async () => {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Sign-up successful!");
    toggleForms();
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
});

// Sign In
document.getElementById("signinBtn").addEventListener("click", async () => {
  const email = document.getElementById("signinEmail").value;
  const password = document.getElementById("signinPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    authContainer.style.display = "none";
    fileManager.style.display = "block";
    loadFolders(); // Load folders upon sign-in
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
});

// Toggle Forms (Sign In / Sign Up)
function toggleForms() {
  signinForm.style.display = signinForm.style.display === "none" ? "block" : "none";
  signupForm.style.display = signupForm.style.display === "none" ? "block" : "none";
}

document.getElementById("showSignup").addEventListener("click", toggleForms);
document.getElementById("showSignin").addEventListener("click", toggleForms);

// Load Folders
async function loadFolders() {
  folderList.innerHTML = "";

  const q = query(
    collection(db, "folders"),
    where("parentID", "==", currentFolderID),
    where("isDeleted", "==", false)
  );

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    const folder = document.createElement("div");
    folder.className = "folder";
    folder.textContent = doc.data().name;

    folder.addEventListener("click", () => {
      currentFolderID = doc.id;
      folderPath.textContent = doc.data().name;
      loadFolders(); // Load subfolders
    });

    folderList.appendChild(folder);
  });
}

// Create Folder
document.getElementById("createFolderBtn").addEventListener("click", async () => {
  const folderName = document.getElementById("folderName").value;

  if (!folderName) {
    alert("Folder name is required!");
    return;
  }

  // Create new folder in Firestore
  await setDoc(doc(db, "folders", crypto.randomUUID()), {
    name: folderName,
    parentID: currentFolderID || null, // Use null for root folder
    isDeleted: false,
  });

  loadFolders(); // Refresh folder list
});

// File Upload
document.getElementById("uploadFileBtn").addEventListener("click", async () => {
  const fileInput = document.getElementById("fileInput").files[0];
  if (!fileInput) return alert("Please select a file.");

  const formData = new FormData();
  formData.append("file", fileInput);
  formData.append("fileName", fileInput.name);
  formData.append("folderID", currentFolderID || "root");

  try {
    const response = await fetch("/uploadFile", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    if (result.error) {
      alert(`Error: ${result.error}`);
    } else {
      alert("File uploaded successfully!");
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    alert("Failed to upload file.");
  }
});
