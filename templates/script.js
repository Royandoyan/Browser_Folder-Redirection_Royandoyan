import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, query, where, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

// DOM Elements
const authContainer = document.getElementById("authContainer");
const signinForm = document.getElementById("signinForm");
const signupForm = document.getElementById("signupForm");
const fileManager = document.getElementById("fileManager");
const folderList = document.getElementById("folderList");
const fileList = document.getElementById("fileList");
const folderPath = document.getElementById("folderPath");
let currentFolderID = null;

// Sign Up
document.getElementById("signupBtn").addEventListener("click", async () => {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Sign-up successful!");
    toggleForms();
  } catch (error) {
    alert(error.message);
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
    loadFolders();  // Load folders when signed in
  } catch (error) {
    alert(error.message);
  }
});

// Toggle Forms
document.getElementById("showSignup").addEventListener("click", () => toggleForms());
document.getElementById("showSignin").addEventListener("click", () => toggleForms());

function toggleForms() {
  signinForm.style.display = signinForm.style.display === "none" ? "block" : "none";
  signupForm.style.display = signupForm.style.display === "none" ? "block" : "none";
}

// Load Folders
async function loadFolders() {
  folderList.innerHTML = "";
  const q = query(collection(db, "folders"), where("parentID", "==", currentFolderID), where("isDeleted", "==", false));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    const folder = document.createElement("div");
    folder.className = "folder";
    folder.textContent = doc.data().name;
    folder.addEventListener("click", () => {
      currentFolderID = doc.id;
      folderPath.textContent = doc.data().name;
      loadFolders();  // Load subfolders
    });
    folderList.appendChild(folder);
  });
}

// Create Folder
document.getElementById("createFolderBtn").addEventListener("click", async () => {
  const folderName = document.getElementById("folderName").value;
  if (!folderName) return alert("Folder name is required!");
  
  // Create a new folder with the current parent folder ID
  await setDoc(doc(db, "folders", crypto.randomUUID()), {
    name: folderName,
    parentID: currentFolderID,  // Set parentID to the current folder ID (or null for root)
    isDeleted: false,
  });
  loadFolders();  // Reload folder list after creating a folder
});

// File Upload
document.getElementById("uploadFileBtn").addEventListener("click", async () => {
  const fileInput = document.getElementById("fileInput").files[0];
  if (!fileInput) {
    alert("Please select a file.");
    return;
  }

  const formData = new FormData();
  formData.append('file', fileInput);
  formData.append('fileName', fileInput.name);
  formData.append('folderID', currentFolderID);

  try {
    const response = await fetch("https://browser-folder-redirection-royandoyan.onrender.com/uploadFile", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    if (result.error) {
      alert("Error: " + result.error);
    } else {
      alert("File uploaded successfully! URL: " + result.fileUrl);
      // Save metadata to Firestore after upload
      await saveFileMetadata(result.fileUrl, fileInput.name);
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    alert("An error occurred while uploading the file.");
  }
});

// Function to save file metadata to Firestore
async function saveFileMetadata(fileUrl, fileName) {
  try {
    // Save file metadata to Firestore
    await setDoc(doc(db, "files", crypto.randomUUID()), {
      fileName: fileName,
      fileUrl: fileUrl,
      folderID: currentFolderID,  // Store the folder ID
      createdAt: new Date(),
    });
    console.log("File metadata saved to Firestore!");
    loadFiles();  // Reload the file list
  } catch (error) {
    console.error("Error saving file metadata:", error);
  }
}

// Function to load files and display them
async function loadFiles() {
  fileList.innerHTML = "";  // Clear previous files
  const q = query(collection(db, "files"), where("folderID", "==", currentFolderID));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    const fileData = doc.data();
    const fileElement = document.createElement("div");
    fileElement.className = "file";
    fileElement.innerHTML = `<a href="${fileData.fileUrl}" target="_blank">${fileData.fileName}</a>`;
    fileList.appendChild(fileElement);
  });
}

// Function to convert a file to Base64
function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onloadend = () => {
      resolve(reader.result.split(',')[1]); // Get the base64 string (skip "data:image/png;base64," part)
    };

    reader.onerror = reject; // If there's an error, reject the promise
    reader.readAsDataURL(file); // Start reading the file
  });
}
