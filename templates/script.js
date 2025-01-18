import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";
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

  // Show upload progress
  const uploadStatus = document.getElementById("uploadStatus");
  uploadStatus.textContent = "Uploading... Please wait.";

  const fileRef = ref(storage, `files/${currentFolderId}/${file.name}`); // Store in the selected folder

  try {
    // Upload file to Firebase Storage
    const snapshot = await uploadBytes(fileRef, file);
    const fileUrl = await getDownloadURL(snapshot.ref); // Get the download URL for the uploaded file

    // Store file metadata in Firestore under the selected folder
    await addDoc(collection(db, "files"), {
      name: file.name,
      url: fileUrl,
      folderId: currentFolderId, // Linking the file to the folder using currentFolderId
      createdAt: new Date()
    });

    uploadStatus.textContent = "Upload successful!";
    loadFiles(); // Reload files to show the newly uploaded one
  } catch (error) {
    uploadStatus.textContent = "Upload failed. Please try again.";
    console.error("Error uploading file:", error);
  }
});

// Function to load files for the current folder
function loadFiles() {
  const fileList = document.getElementById("fileList");
  fileList.innerHTML = ""; // Clear the current file list

  if (!currentFolderId) return; // No folder selected

  const fileRef = collection(db, "files"); // Reference to Firestore 'files' collection
  const q = query(fileRef, where("folderId", "==", currentFolderId));

  onSnapshot(q, (snapshot) => {
    fileList.innerHTML = ""; // Clear previous files
    snapshot.forEach(doc => {
      const file = doc.data();
      const div = document.createElement("div");
      div.classList.add("file");
      div.textContent = file.name;
      div.onclick = () => viewFileDetails(file.url); // On click, show file URL
      fileList.appendChild(div);
    });
  });
}

// Function to view file details (display file URL or other metadata)
function viewFileDetails(url) {
  const fileDetails = document.getElementById("fileDetails");
  fileDetails.innerHTML = `<p>File URL: <a href="${url}" target="_blank">${url}</a></p>`;
}

// Navigate to a specific folder
function navigateToFolder(folderId, folderName) {
  currentFolderId = folderId;
  document.getElementById("folderPath").textContent = folderName;
  loadFiles();  // Load files for the selected folder
}

// Load folders dynamically
function loadFolders() {
  const folderList = document.getElementById("folderList");
  folderList.innerHTML = "";
  const q = query(collection(db, "folders"), where("parentId", "==", currentFolderId), where("isDeleted", "==", false));

  onSnapshot(q, (snapshot) => {
      folderList.innerHTML = "";
      snapshot.forEach(doc => {
          const folder = doc.data();
          const div = document.createElement("div");
          div.classList.add("folder");
          div.textContent = folder.name;
          div.onclick = () => navigateToFolder(doc.id, folder.name);
          folderList.appendChild(div);
      });
  });

  loadFiles();  // Load files for the current folder
}

// Create Folder
document.getElementById("createFolderBtn").addEventListener("click", async () => {
  const folderName = document.getElementById("folderName").value;
  if (folderName.trim() === "") {
    alert("Folder name is required");
    return;
  }

  try {
      await addDoc(collection(db, "folders"), {
          name: folderName,
          parentId: currentFolderId, // Set parentId to the current folder's id
          isDeleted: false
      });
      alert("Folder created successfully!");
      loadFolders(); // Reload folders after creating a new one
  } catch (error) {
      console.error("Error creating folder: ", error);
  }
});
