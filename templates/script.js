import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, query, where, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
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
    loadFolders();
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
      loadFolders();
    });
    folderList.appendChild(folder);
  });
}

// Create Folder
document.getElementById("createFolderBtn").addEventListener("click", async () => {
  const folderName = document.getElementById("folderName").value;
  if (!folderName) return alert("Folder name is required!");
  await setDoc(doc(db, "folders", crypto.randomUUID()), {
    name: folderName,
    parentID: currentFolderID,
    isDeleted: false,
  });
  loadFolders();
});

// File Upload
document.getElementById("uploadFileBtn").addEventListener("click", async () => {
  const fileInput = document.getElementById("fileInput").files[0];
  if (!fileInput) return alert("Please select a file.");
  const formData = new FormData();
  formData.append("file", fileInput);
  const response = await fetch("http://localhost:3000/uploadFile", {
    method: "POST",
    body: formData,
  });
  const result = await response.json();
  if (result.error) {
    alert(result.error);
  } else {
    alert("File uploaded successfully!");
    loadFolders();
  }
});
