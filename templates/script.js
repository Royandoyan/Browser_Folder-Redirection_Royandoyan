import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, doc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIKjugxiJh9Bd0B32SEd4t9FImRQ9SVK8",
  authDomain: "browser-redirection.firebaseapp.com",
  databaseURL: "https://browser-redirection.firebaseio.com",
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

// DOM elements
const authContainer = document.getElementById('authContainer');
const fileManager = document.getElementById('fileManager');
const folderList = document.getElementById('folderList');
const fileList = document.getElementById('fileList');
const folderName = document.getElementById('folderName');
const createFolderBtn = document.getElementById('createFolderBtn');
const uploadFileBtn = document.getElementById('uploadFileBtn');
const fileInput = document.getElementById('fileInput');
const uploadStatus = document.getElementById('uploadStatus');

// API Key for Upload.io or ByteScale
const uploadAPIKey = "public_G22nhXS4Z4biETXGSrSV42HFA3Gz";
const uploadAPIUrl = "https://api.upload.io/v1/files"; // Upload.io API URL

// Sign In/Sign Up Handling
document.getElementById('signinBtn').addEventListener('click', signIn);
document.getElementById('signupBtn').addEventListener('click', signUp);
document.getElementById('showSignup').addEventListener('click', showSignup);
document.getElementById('showSignin').addEventListener('click', showSignin);

// Sign In
async function signIn() {
  const email = document.getElementById('signinEmail').value;
  const password = document.getElementById('signinPassword').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    showFileManager();
  } catch (error) {
    alert(error.message);
  }
}

// Sign Up
async function signUp() {
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    showFileManager();
  } catch (error) {
    alert(error.message);
  }
}

// Show Sign Up Form
function showSignup() {
  document.getElementById('signinForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'block';
}

// Show Sign In Form
function showSignin() {
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('signinForm').style.display = 'block';
}

// Show File Manager
function showFileManager() {
  authContainer.style.display = 'none';
  fileManager.style.display = 'block';
  loadFolders();
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await signOut(auth);
  authContainer.style.display = 'block';
  fileManager.style.display = 'none';
});

// Create Folder
createFolderBtn.addEventListener('click', createFolder);
async function createFolder() {
  const name = folderName.value.trim();
  if (!name) {
    return alert('Folder name cannot be empty');
  }

  const userId = auth.currentUser.uid;
  const parentID = null; // You can set this dynamically if needed

  await addDoc(collection(db, 'folders'), {
    userId,
    folderName: name,
    parentID,
    isDeleted: false,
    createdAt: new Date()
  });

  folderName.value = '';
  loadFolders();
}

// Load Folders
async function loadFolders() {
  const userId = auth.currentUser.uid;
  const q = query(collection(db, 'folders'), where('userId', '==', userId), where('isDeleted', '==', false));

  const querySnapshot = await getDocs(q);
  folderList.innerHTML = '';
  querySnapshot.forEach(doc => {
    const folder = doc.data();
    const div = document.createElement('div');
    div.classList.add('folder');
    div.textContent = folder.folderName;
    div.addEventListener('click', () => loadFiles(doc.id));
    folderList.appendChild(div);
  });
}

// Load Files for a Folder
async function loadFiles(folderId) {
  const q = query(collection(db, 'files'), where('folderId', '==', folderId));

  const querySnapshot = await getDocs(q);
  fileList.innerHTML = '';
  querySnapshot.forEach(doc => {
    const file = doc.data();
    const div = document.createElement('div');
    div.classList.add('file');
    div.textContent = file.fileName;
    fileList.appendChild(div);
  });
}

// Upload File
uploadFileBtn.addEventListener('click', uploadFile);
async function uploadFile() {
  const file = fileInput.files[0];
  if (!file) {
    return alert('Please select a file');
  }

  const folderId = 'someFolderId'; // Set dynamically based on current folder
  
  // Step 1: Upload file to external API (Upload.io or ByteScale)
  const formData = new FormData();
  formData.append('file', file);
  formData.append('publicKey', uploadAPIKey);

  const response = await fetch(uploadAPIUrl, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    return alert('File upload failed');
  }

  const fileData = await response.json();
  const fileUrl = fileData.file.url;  // Assuming the response has the URL under 'file.url'

  // Step 2: Store file metadata in Firestore
  await addDoc(collection(db, 'files'), {
    folderId,
    fileName: file.name,
    fileUrl,
    createdAt: new Date()
  });

  loadFiles(folderId);
}
