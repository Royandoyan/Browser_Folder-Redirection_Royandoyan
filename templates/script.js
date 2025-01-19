import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, doc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const authContainer = document.getElementById('authContainer');
const fileManager = document.getElementById('fileManager');
const folderList = document.getElementById('folderList');
const fileList = document.getElementById('fileList');
const folderNameInput = document.getElementById('folderName');
const createFolderBtn = document.getElementById('createFolderBtn');
const fileInput = document.getElementById('fileInput');
const uploadFileBtn = document.getElementById('uploadFileBtn');
const uploadStatus = document.getElementById('uploadStatus');
const folderPath = document.getElementById('folderPath');
const logoutBtn = document.getElementById('logoutBtn');
const signinForm = document.getElementById('signinForm');
const signupForm = document.getElementById('signupForm');
const signinEmail = document.getElementById('signinEmail');
const signinPassword = document.getElementById('signinPassword');
const signupEmail = document.getElementById('signupEmail');
const signupPassword = document.getElementById('signupPassword');
const showSignup = document.getElementById('showSignup');
const showSignin = document.getElementById('showSignin');

// Show sign up form
showSignup.addEventListener('click', () => {
    signinForm.style.display = 'none';
    signupForm.style.display = 'block';
});

// Show sign in form
showSignin.addEventListener('click', () => {
    signupForm.style.display = 'none';
    signinForm.style.display = 'block';
});

// Sign up function
document.getElementById('signupBtn').addEventListener('click', () => {
    const email = signupEmail.value;
    const password = signupPassword.value;
    createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
            alert("Sign Up Successful!");
            signinForm.style.display = 'block';
            signupForm.style.display = 'none';
        })
        .catch((error) => alert(error.message));
});

// Sign in function
document.getElementById('signinBtn').addEventListener('click', () => {
    const email = signinEmail.value;
    const password = signinPassword.value;
    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            authContainer.style.display = 'none';
            fileManager.style.display = 'block';
            loadFolders();
        })
        .catch((error) => alert(error.message));
});

// Logout function
logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        authContainer.style.display = 'block';
        fileManager.style.display = 'none';
    }).catch((error) => alert(error.message));
});

// Load folders from Firestore
function loadFolders() {
    const foldersRef = collection(db, 'folders');
    const q = query(foldersRef, where('ownerId', '==', auth.currentUser.uid), where('parentID', '==', null), where('isDeleted', '==', false));

    onSnapshot(q, snapshot => {
        folderList.innerHTML = '';
        snapshot.forEach(doc => {
            const folderData = doc.data();
            const folderDiv = document.createElement('div');
            folderDiv.classList.add('folder');
            folderDiv.textContent = folderData.name;
            folderDiv.addEventListener('click', () => {
                loadSubFolders(doc.id);
            });
            folderList.appendChild(folderDiv);
        });
    });
}

// Load subfolders when a folder is clicked
function loadSubFolders(parentId) {
    const foldersRef = collection(db, 'folders');
    const q = query(foldersRef, where('parentID', '==', parentId), where('isDeleted', '==', false));

    onSnapshot(q, snapshot => {
        folderList.innerHTML = '';
        snapshot.forEach(doc => {
            const folderData = doc.data();
            const folderDiv = document.createElement('div');
            folderDiv.classList.add('folder');
            folderDiv.textContent = folderData.name;
            folderDiv.addEventListener('click', () => {
                loadSubFolders(doc.id);
            });
            folderList.appendChild(folderDiv);
        });
    });
}

// Create a new folder
createFolderBtn.addEventListener('click', () => {
    const folderName = folderNameInput.value;
    const parentID = folderPath.textContent !== 'Home' ? folderPath.textContent : null; // Check if you're inside a folder
    
    const newFolder = {
        folderName: folderName,
        parentID: parentID,  // Set the parent ID based on current folder path
    };

    // Use the backend API to create a folder
    fetch('/api/create-folder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFolder),
    })
        .then(response => response.json())
        .then(data => {
            alert("Folder Created Successfully");
            loadFolders(); // Reload folders after creation
        })
        .catch(error => alert("Error creating folder: " + error.message));
});


// Upload file to an external service (e.g., upload.io)
uploadFileBtn.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folderId', folderPath.textContent !== 'Home' ? folderPath.textContent : null);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            uploadStatus.textContent = "Upload Successful!";
            loadFiles(); // Reload the list of files after upload
        })
        .catch(error => {
            uploadStatus.textContent = "Error uploading file.";
            alert(error.message);
        });
    }
});
