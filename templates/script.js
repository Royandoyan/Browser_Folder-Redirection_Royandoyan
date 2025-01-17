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
  appId: "1:119718481062:web:3f57b707f3438fc309f867"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
const storage = getStorage(app);

let currentFolderId = null;

// Toggle between Sign In and Sign Up Forms
document.getElementById("showSignup").addEventListener("click", () => {
  document.getElementById("signinForm").style.display = "none";
  document.getElementById("signupForm").style.display = "block";
});

document.getElementById("showSignin").addEventListener("click", () => {
  document.getElementById("signupForm").style.display = "none";
  document.getElementById("signinForm").style.display = "block";
});

// Sign Up
document.getElementById("signupBtn").addEventListener("click", async () => {
  const fullName = document.getElementById("fullName").value;
  const age = document.getElementById("age").value;
  const address = document.getElementById("address").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await addDoc(collection(db, "users"), { fullName, age, address, email, uid: userCredential.user.uid });
      alert("Account created successfully!");
      document.getElementById("fileManager").style.display = "none";
      document.getElementById("authContainer").style.display = "block";  // Show the Sign In form after successful Sign Up
  } catch (error) {
      console.error("Error signing up: ", error);
  }
});

// Sign In
document.getElementById("signinBtn").addEventListener("click", async () => {
  const email = document.getElementById("signinEmail").value;
  const password = document.getElementById("signinPassword").value;

  try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Signed in successfully!");
      toggleAuthUI(true);  // Only show File Manager after Sign In
  } catch (error) {
      console.error("Error signing in: ", error);
  }
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  toggleAuthUI(false);  // Hide File Manager on Logout
});

// Toggle UI Based on Auth State
function toggleAuthUI(isAuthenticated) {
  document.getElementById("authContainer").style.display = isAuthenticated ? "none" : "block";
  document.getElementById("fileManager").style.display = isAuthenticated ? "block" : "none";
}

// Load files (if required)
function loadFiles() {
  const fileList = document.getElementById("fileList");
  fileList.innerHTML = "";

  if (!currentFolderId) return; // No folder selected

  const fileRef = collection(db, "files"); // Assuming you have a collection for files
  const q = query(fileRef, where("folderId", "==", currentFolderId));

  onSnapshot(q, (snapshot) => {
    snapshot.forEach(doc => {
      const file = doc.data();
      const div = document.createElement("div");
      div.classList.add("file");
      div.textContent = file.name;
      div.onclick = () => viewFileDetails(file.url);
      fileList.appendChild(div);
    });
  });
}

// View file details without opening
function viewFileDetails(url) {
  // Display file details like URL or other properties
  const fileDetails = document.getElementById("fileDetails");
  fileDetails.innerHTML = `<p>File URL: <a href="${url}" target="_blank">${url}</a></p>`;
}

// Navigate to a specific folder
function navigateToFolder(folderId, folderName) {
  currentFolderId = folderId;
  document.getElementById("folderPath").textContent = folderName;
  loadFolders();  // Reload folders for the current folder
  loadFiles();    // Reload files for the current folder
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
          parentId: currentFolderId,
          isDeleted: false
      });
      alert("Folder created successfully!");
      loadFolders(); // Reload folders after creating a new one
  } catch (error) {
      console.error("Error creating folder: ", error);
  }
});

// Upload File
document.getElementById("uploadFileBtn").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file || !currentFolderId) return;

  const fileRef = ref(storage, `files/${currentFolderId}/${file.name}`); // Save file in the current folder
  try {
      const snapshot = await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(snapshot.ref);
      
      // Save file metadata in Firestore
      await addDoc(collection(db, "files"), {
          name: file.name,
          url: fileUrl,
          folderId: currentFolderId
      });

      alert("File uploaded successfully!");
      loadFiles(); // Reload files after upload
  } catch (error) {
      console.error("Error uploading file: ", error);
  }
});

// Check Auth State
auth.onAuthStateChanged(user => {
  toggleAuthUI(!!user);
  if (user) loadFolders();
});
