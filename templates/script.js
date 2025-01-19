// Import Firebase modules
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
const auth = getAuth();
const db = getFirestore(app);

// DOM elements
const authContainer = document.getElementById('authContainer');
const signinForm = document.getElementById('signinForm');
const signupForm = document.getElementById('signupForm');
const fileManager = document.getElementById('fileManager');
const folderList = document.getElementById('folderList');
const fileList = document.getElementById('fileList');
const folderNameInput = document.getElementById('folderName');
const createFolderBtn = document.getElementById('createFolderBtn');
const uploadFileBtn = document.getElementById('uploadFileBtn');
const uploadStatus = document.getElementById('uploadStatus');
const fileInput = document.getElementById('fileInput');
const folderPath = document.getElementById('folderPath');
const logoutBtn = document.getElementById('logoutBtn');

// Authentication state change listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    authContainer.style.display = 'none';
    fileManager.style.display = 'block';
    loadFolders();
  } else {
    authContainer.style.display = 'block';
    fileManager.style.display = 'none';
  }
});

// Sign in
document.getElementById('signinBtn').addEventListener('click', () => {
  const email = document.getElementById('signinEmail').value;
  const password = document.getElementById('signinPassword').value;
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log('User signed in:', userCredential.user);
    })
    .catch((error) => {
      console.error(error.message);
    });
});

// Sign up
document.getElementById('signupBtn').addEventListener('click', () => {
  const fullName = document.getElementById('fullName').value;
  const age = document.getElementById('age').value;
  const address = document.getElementById('address').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log('User signed up:', userCredential.user);
    })
    .catch((error) => {
      console.error(error.message);
    });
});

// Log out
logoutBtn.addEventListener('click', () => {
  signOut(auth).then(() => {
    console.log('User signed out');
  }).catch((error) => {
    console.error(error.message);
  });
});

// Create folder
createFolderBtn.addEventListener('click', () => {
  const folderName = folderNameInput.value;
  const user = auth.currentUser;

  if (user) {
    addDoc(collection(db, 'folders'), {
      name: folderName,
      parentID: null,
      isDeleted: false,
      userID: user.uid
    })
    .then((docRef) => {
      console.log('Folder created:', docRef.id);
    })
    .catch((error) => {
      console.error('Error creating folder:', error);
    });
  }
});

// Load folders from Firestore
const loadFolders = () => {
  const user = auth.currentUser;

  if (user) {
    const q = query(collection(db, 'folders'), where('userID', '==', user.uid), where('parentID', '==', null), where('isDeleted', '==', false));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      folderList.innerHTML = '';
      querySnapshot.forEach((doc) => {
        const folderData = doc.data();
        const folderElement = document.createElement('div');
        folderElement.className = 'folder';
        folderElement.innerText = folderData.name;
        folderElement.addEventListener('click', () => loadSubfolders(doc.id));
        folderList.appendChild(folderElement);
      });
    });
  }
};

// Load subfolders for a folder
const loadSubfolders = (parentID) => {
  const q = query(collection(db, 'folders'), where('parentID', '==', parentID), where('isDeleted', '==', false));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    folderList.innerHTML = '';
    querySnapshot.forEach((doc) => {
      const folderData = doc.data();
      const folderElement = document.createElement('div');
      folderElement.className = 'folder';
      folderElement.innerText = folderData.name;
      folderElement.addEventListener('click', () => loadSubfolders(doc.id));
      folderList.appendChild(folderElement);
    });
  });
};

// File upload functionality (Upload to upload.io or bytescale)
uploadFileBtn.addEventListener('click', () => {
  const file = fileInput.files[0];
  if (file) {
    const metadata = {
      name: file.name,
      size: file.size,
      type: file.type
    };
    // Here, you will call the external API (e.g., upload.io) to upload the file
    // After upload is successful, store the metadata in Firestore
    uploadStatus.innerText = 'File uploaded successfully!';
  }
});
