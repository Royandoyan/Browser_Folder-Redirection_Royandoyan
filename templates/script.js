// Firebase initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// Firebase configuration (replace with your Firebase project details)
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
const firestore = getFirestore(app);

// DOM elements
const signinBtn = document.getElementById('signinBtn');
const signupBtn = document.getElementById('signupBtn');
const createFolderBtn = document.getElementById('createFolderBtn');
const uploadFileBtn = document.getElementById('uploadFileBtn');
const logoutBtn = document.getElementById('logoutBtn');
const folderNameInput = document.getElementById('folderName');
const fileInput = document.getElementById('fileInput');
const folderList = document.getElementById('folderList');
const fileList = document.getElementById('fileList');
const folderPath = document.getElementById('folderPath');
const authContainer = document.getElementById('authContainer');
const fileManager = document.getElementById('fileManager');

// Authentication: Sign-in functionality
signinBtn.addEventListener('click', async () => {
  const email = document.getElementById('signinEmail').value;
  const password = document.getElementById('signinPassword').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    authContainer.style.display = 'none';
    fileManager.style.display = 'block';
    loadFolders(); // Load folders once logged in
  } catch (error) {
    alert(error.message);
  }
});

// Authentication: Sign-up functionality
signupBtn.addEventListener('click', async () => {
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const fullName = document.getElementById('fullName').value;
  const age = document.getElementById('age').value;
  const address = document.getElementById('address').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user details in Firestore
    await firestore.collection('users').doc(user.uid).set({
      fullName,
      age,
      address,
    });

    alert('Sign-up successful!');
    authContainer.style.display = 'none';
    fileManager.style.display = 'block';
    loadFolders(); // Load folders after signup
  } catch (error) {
    alert(error.message);
  }
});

// Logout functionality
logoutBtn.addEventListener('click', () => {
  signOut(auth);
  authContainer.style.display = 'block';
  fileManager.style.display = 'none';
});

// Load folders from Firestore with real-time updates
async function loadFolders(parentID = null) {
  const q = query(
    collection(firestore, 'folders'),
    where('parentID', '==', parentID),
    where('isDeleted', '==', false)
  );

  // Real-time listener for folders
  onSnapshot(q, (snapshot) => {
    folderList.innerHTML = '';
    snapshot.forEach(doc => {
      const folder = doc.data();
      const folderItem = document.createElement('div');
      folderItem.textContent = folder.folderName;
      folderItem.addEventListener('click', () => loadFolders(doc.id));
      folderList.appendChild(folderItem);
    });
  });
}

// Create a folder
createFolderBtn.addEventListener('click', async () => {
  const folderName = folderNameInput.value;
  const userId = auth.currentUser.uid; // Get current user's ID
  const parentID = null; // Set to current folder ID if inside a folder

  if (folderName.trim() === '') {
    alert('Folder name is required');
    return;
  }

  try {
    await addDoc(collection(firestore, 'folders'), {
      folderName,
      parentID,
      isDeleted: false,
      userId,
    });
    loadFolders(); // Reload folders after creation
  } catch (error) {
    console.error('Error creating folder:', error);
  }
});

// File upload functionality (integrate with Upload.io)
uploadFileBtn.addEventListener('click', async () => {
  const file = fileInput.files[0];
  if (!file) {
    alert('No file selected');
    return;
  }

  try {
    const fileMetadata = {
      name: file.name,
      size: file.size,
      type: file.type,
    };

    // Use Upload.io or another API for file upload
    const fileUrl = await uploadFile(file);

    // Save file metadata and URL in Firestore
    const userId = auth.currentUser.uid; // Get current user's ID
    const folderID = null; // Change based on selected folder

    await addDoc(collection(firestore, 'files'), {
      fileUrl,
      fileMetadata,
      folderID,
      userId,
    });

    alert('File uploaded successfully');
  } catch (error) {
    console.error('Error uploading file:', error);
  }
});

// Helper function to upload file (example for Upload.io)
async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('https://upload.upload.io', {
    method: 'POST',
    headers: {
      'Authorization': 'public_G22nhXS4Z4biETXGSrSV42HFA3Gz',
    },
    body: formData,
  });

  const data = await response.json();
  return data.url; // Replace with the actual returned URL from Upload.io
}
aw