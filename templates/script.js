import firebase from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Firebase Configuration
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

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM elements
const authContainer = document.getElementById("authContainer");
const fileManager = document.getElementById("fileManager");
const folderList = document.getElementById("folderList");
const fileList = document.getElementById("fileList");
const folderPath = document.getElementById("folderPath");
const createFolderBtn = document.getElementById("createFolderBtn");
const uploadFileBtn = document.getElementById("uploadFileBtn");
const uploadFileInput = document.getElementById("fileInput");
const logoutBtn = document.getElementById("logoutBtn");
const folderNameInput = document.getElementById("folderName");
const signinForm = document.getElementById("signinForm");
const signupForm = document.getElementById("signupForm");

// Auth Logic
const showSignin = document.getElementById("showSignin");
const showSignup = document.getElementById("showSignup");

document.getElementById("signinBtn").onclick = async () => {
    const email = document.getElementById("signinEmail").value;
    const password = document.getElementById("signinPassword").value;
    try {
        await auth.signInWithEmailAndPassword(email, password);
        authContainer.style.display = 'none';
        fileManager.style.display = 'block';
        loadFolders(null);
    } catch (error) {
        alert(error.message);
    }
};

document.getElementById("signupBtn").onclick = async () => {
    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    try {
        await auth.createUserWithEmailAndPassword(email, password);
        alert("Account created successfully!");
        showSignin.click();
    } catch (error) {
        alert(error.message);
    }
};

showSignup.onclick = () => {
    signinForm.style.display = 'none';
    signupForm.style.display = 'block';
};

showSignin.onclick = () => {
    signupForm.style.display = 'none';
    signinForm.style.display = 'block';
};

logoutBtn.onclick = () => {
    auth.signOut();
    authContainer.style.display = 'block';
    fileManager.style.display = 'none';
};

// Folder and File Operations
createFolderBtn.onclick = async () => {
    const folderName = folderNameInput.value.trim();
    if (!folderName) {
        alert("Folder name is required.");
        return;
    }
    const userId = auth.currentUser.uid;
    await fetch('/createFolder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId,
            folderName,
            parentID: null
        })
    });
    loadFolders(null);
};

const loadFolders = async (parentID) => {
    folderList.innerHTML = '';
    const snapshot = await db.collection('folders')
        .where('parentID', '==', parentID)
        .where('isDeleted', '==', false)
        .get();
    snapshot.forEach(doc => {
        const folder = doc.data();
        const folderElement = document.createElement('div');
        folderElement.textContent = folder.folderName;
        folderElement.onclick = () => {
            folderPath.textContent = folder.folderName;
            loadFolders(doc.id);
        };
        folderList.appendChild(folderElement);
    });
};

// Syncing File Upload with Upload.io
uploadFileBtn.onclick = async () => {
    const file = uploadFileInput.files[0];
    if (!file) return;

    // Prepare metadata for file
    const fileMetadata = {
        userId: auth.currentUser.uid,
        folderId: folderPath.textContent
    };

    const formData = new FormData();
    formData.append("file", file);
    formData.append("public_key", "public_G22nhXS4Z4biETXGSrSV42HFA3Gz"); // Upload.io public key
    formData.append("metadata", JSON.stringify(fileMetadata));

    const uploadResponse = await fetch('https://api.upload.io/upload', {
        method: 'POST',
        body: formData
    });
    const uploadData = await uploadResponse.json();

    // Save file metadata to Firestore
    await db.collection('files').add({
        fileUrl: uploadData.fileUrl,  // Assuming the URL returned by Upload.io
        fileName: file.name,
        folderId: folderPath.textContent,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    loadFiles(folderPath.textContent);
};

// Load Files in a Folder
const loadFiles = async (folderId) => {
    fileList.innerHTML = '';
    const snapshot = await db.collection('files')
        .where('folderId', '==', folderId)
        .get();
    snapshot.forEach(doc => {
        const file = doc.data();
        const fileElement = document.createElement('div');
        fileElement.textContent = file.fileName;
        fileList.appendChild(fileElement);
    });
};
