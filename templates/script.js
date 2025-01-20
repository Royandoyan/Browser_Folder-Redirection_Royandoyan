import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, setDoc, deleteDoc, collection, query, where, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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

// Load Folders with Real-Time Synchronization
async function loadFolders() {
  folderList.innerHTML = "";
  const q = query(collection(db, "folders"), where("parentID", "==", currentFolderID), where("isDeleted", "==", false));
  
  // Real-time listener for folder changes
  onSnapshot(q, (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const folder = document.createElement("div");
      folder.className = "folder";
      folder.textContent = doc.data().name;
      
      folder.addEventListener("click", () => {
        currentFolderID = doc.id;
        folderPath.textContent = doc.data().name;
        loadFolders();  // Load subfolders
      });
      
      // Deletion Button
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent the click event from propagating to the folder
        deleteFolder(doc.id);
      });
      folder.appendChild(deleteButton);
      folderList.appendChild(folder);
    });
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

// Delete Folder
async function deleteFolder(folderID) {
  const folderRef = doc(db, "folders", folderID);
  try {
    await deleteDoc(folderRef);
    alert("Folder deleted successfully!");
    loadFolders(); // Reload the folder list after deletion
  } catch (error) {
    alert("Error deleting folder: " + error.message);
  }
}

// File Upload
document.getElementById("uploadFileBtn").addEventListener("click", async () => {
  const fileInput = document.getElementById("fileInput").files[0];
  if (!fileInput) {
    alert("Please select a file.");
    return;
  }

  // Convert the file to base64
  const fileData = await convertToBase64(fileInput);
  const fileName = fileInput.name;  // Get the file name

  const data = {
    fileData: fileData,
    fileName: fileName,
    folderID: currentFolderID,  // Include the current folder ID if needed
  };

  // Log the request data to ensure it is being sent correctly
  console.log("Uploading file:", data);

  // Send the file data to the server
  try {
    const response = await fetch("https://browser-folder-redirection-royandoyan.onrender.com/uploadFile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Ensure this is set for JSON data
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (result.error) {
      alert("Error: " + result.error);
    } else {
      alert("File uploaded successfully! URL: " + result.fileUrl);
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    alert("An error occurred while uploading the file.");
  }
});

// Real-Time File List Synchronization
async function loadFiles() {
  fileList.innerHTML = "";
  const q = query(collection(db, "files"), where("folderID", "==", currentFolderID));

  // Real-time listener for file changes
  onSnapshot(q, (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const file = document.createElement("div");
      file.className = "file";
      file.textContent = doc.data().fileName;
      fileList.appendChild(file);
    });
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
