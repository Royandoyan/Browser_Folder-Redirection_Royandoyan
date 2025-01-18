import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, onSnapshot, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAIKjugxiJh9Bd0B32SEd4t9FImRQ9SVK8",
  authDomain: "browser-redirection.firebaseapp.com",
  projectId: "browser-redirection",
  storageBucket: "browser-redirection.appspot.com",
  messagingSenderId: "119718481062",
  appId: "1:119718481062:web:3f57b707f3438fc309f867",
  measurementId: "G-RG2M2FHGWV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
const storage = getStorage(app);

let currentFolderId = null; // Track the currently opened folder ID

// Sign Up and Sign In logic
document.getElementById("signinBtn").addEventListener("click", async () => {
    const email = document.getElementById("signinEmail").value;
    const password = document.getElementById("signinPassword").value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        document.getElementById("authContainer").style.display = "none";
        document.getElementById("fileManager").style.display = "block";
        loadFolders();
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById("signupBtn").addEventListener("click", async () => {
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Account created successfully!");
        document.getElementById("signupForm").style.display = "none";
        document.getElementById("signinForm").style.display = "block";
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
    signOut(auth).then(() => {
        document.getElementById("authContainer").style.display = "block";
        document.getElementById("fileManager").style.display = "none";
    }).catch((error) => {
        alert(error.message);
    });
});

// File Upload with Success/Error Handling
document.getElementById("uploadFileBtn").addEventListener("click", async () => {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  if (!file || !currentFolderId) {
    alert("Please select a file and ensure you have a folder selected.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("http://localhost:3000/upload", {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    if (data.fileUrl) {
      alert("Upload successful!");
      console.log("File URL:", data.fileUrl);
      // Handle the file URL (e.g., store it in Firestore, display it on the UI, etc.)
    } else {
      alert("Error uploading file.");
    }
  } catch (error) {
    alert("Error uploading file.");
    console.error(error);
  }
});


// Function to load files for the current folder
function loadFiles() {
  const fileList = document.getElementById("fileList");
  fileList.innerHTML = ""; // Clear the current file list

  const filesRef = collection(db, "files");
  const filesQuery = query(filesRef, where("folderId", "==", currentFolderId));
  onSnapshot(filesQuery, (snapshot) => {
    snapshot.docs.forEach(doc => {
      const fileData = doc.data();
      const fileItem = document.createElement("div");
      fileItem.classList.add("file");
      fileItem.innerHTML = `<a href="${fileData.url}" target="_blank">${fileData.name}</a>`;
      fileList.appendChild(fileItem);
    });
  }, (error) => {
    console.error("Error fetching files:", error);
    alert("Error loading files. Please check your Firestore permissions.");
  });
}

// Folder creation logic
document.getElementById("createFolderBtn").addEventListener("click", async () => {
  const folderName = document.getElementById("folderName").value;
  if (!folderName) {
    alert("Please enter a folder name.");
    return;
  }

  try {
    const newFolder = await addDoc(collection(db, "folders"), {
      name: folderName,
      parentId: currentFolderId || null,
      createdAt: new Date(),
      isDeleted: false
    });
    loadFolders();
  } catch (error) {
    alert("Error creating folder:", error.message);
  }
});

// Load folders and display them
function loadFolders() {
  const folderList = document.getElementById("folderList");
  folderList.innerHTML = ""; // Clear current folders list
  const folderRef = collection(db, "folders");
  const folderQuery = query(folderRef, where("parentId", "==", currentFolderId || null), where("isDeleted", "==", false));
  onSnapshot(folderQuery, (snapshot) => {
    snapshot.docs.forEach(doc => {
      const folderData = doc.data();
      const folderItem = document.createElement("div");
      folderItem.classList.add("folder");
      folderItem.textContent = folderData.name;
      folderItem.addEventListener("click", () => {
        currentFolderId = doc.id; // Set the selected folder as the current folder
        loadFolders();
        loadFiles();
        document.getElementById("folderPath").textContent = folderData.name;
      });
      folderList.appendChild(folderItem);
    });
  }, (error) => {
    console.error("Error loading folders:", error);
    alert("Error loading folders. Please check your Firestore permissions.");
  });
}

// Folder deletion logic
document.getElementById("deleteFolderBtn").addEventListener("click", async () => {
  if (!currentFolderId) {
    alert("No folder selected to delete.");
    return;
  }

  try {
    await updateDoc(doc(db, "folders", currentFolderId), { isDeleted: true });
    alert("Folder deleted successfully!");
    currentFolderId = null;
    loadFolders();
    loadFiles();
  } catch (error) {
    alert("Error deleting folder:", error.message);
  }
});

window.onload = () => {
  const user = auth.currentUser;
  if (user) {
    document.getElementById("authContainer").style.display = "none";
    document.getElementById("fileManager").style.display = "block";
    loadFolders();
  }
};
