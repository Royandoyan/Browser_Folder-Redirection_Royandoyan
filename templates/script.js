import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-storage.js";

// Initialize Firebase
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
const db = firebase.firestore(app);

// DOM elements
const authContainer = document.getElementById('authContainer');
const signinForm = document.getElementById('signinForm');
const signupForm = document.getElementById('signupForm');
const fileManager = document.getElementById('fileManager');
const folderList = document.getElementById('folderList');
const folderPath = document.getElementById('folderPath');
const createFolderBtn = document.getElementById('createFolderBtn');
const folderNameInput = document.getElementById('folderName');
const fileInput = document.getElementById('fileInput');
const uploadFileBtn = document.getElementById('uploadFileBtn');
const uploadStatus = document.getElementById('uploadStatus');
const logoutBtn = document.getElementById('logoutBtn');

// Upload.io API key
const uploadIOKey = 'public_G22nhXS4Z4biETXGSrSV42HFA3Gz';

// Show the signup form
document.getElementById('showSignup').addEventListener('click', () => {
  signinForm.style.display = 'none';
  signupForm.style.display = 'block';
});

// Show the signin form
document.getElementById('showSignin').addEventListener('click', () => {
  signupForm.style.display = 'none';
  signinForm.style.display = 'block';
});

// Sign Up user
document.getElementById('signupBtn').addEventListener('click', () => {
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const fullName = document.getElementById('fullName').value;
  const age = document.getElementById('age').value;
  const address = document.getElementById('address').value;

  auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
          // Save user info in Firestore
          const user = userCredential.user;
          db.collection('users').doc(user.uid).set({
              fullName,
              age,
              address,
              email
          });
          alert('Account created!');
          signinForm.style.display = 'block';
          signupForm.style.display = 'none';
      })
      .catch((error) => {
          alert(error.message);
      });
});

// Sign In user
document.getElementById('signinBtn').addEventListener('click', () => {
  const email = document.getElementById('signinEmail').value;
  const password = document.getElementById('signinPassword').value;

  auth.signInWithEmailAndPassword(email, password)
      .then(() => {
          authContainer.style.display = 'none';
          fileManager.style.display = 'block';
          loadFolders(); // Load the folders after signing in
      })
      .catch((error) => {
          alert(error.message);
      });
});

// Logout user
logoutBtn.addEventListener('click', () => {
  auth.signOut().then(() => {
      authContainer.style.display = 'block';
      fileManager.style.display = 'none';
  });
});

// Create folder function
createFolderBtn.addEventListener('click', () => {
  const folderName = folderNameInput.value.trim();
  if (folderName) {
      const user = auth.currentUser;
      db.collection('folders').add({
          name: folderName,
          parentID: null, // root level folder
          isDeleted: false,
          userID: user.uid
      });
      folderNameInput.value = ''; // Clear input after creating folder
  }
});

// Load folders from Firestore
function loadFolders() {
  const user = auth.currentUser;
  db.collection('folders')
      .where('parentID', '==', null)
      .where('isDeleted', '==', false)
      .where('userID', '==', user.uid)
      .onSnapshot((snapshot) => {
          folderList.innerHTML = '';
          snapshot.forEach((doc) => {
              const folder = doc.data();
              const folderDiv = document.createElement('div');
              folderDiv.innerHTML = folder.name;
              folderDiv.classList.add('folder');
              folderDiv.addEventListener('click', () => loadSubfolders(doc.id));
              folderList.appendChild(folderDiv);
          });
      });
}

// Load subfolders when a folder is clicked
function loadSubfolders(folderID) {
  db.collection('folders')
      .where('parentID', '==', folderID)
      .where('isDeleted', '==', false)
      .onSnapshot((snapshot) => {
          folderList.innerHTML = '';
          snapshot.forEach((doc) => {
              const folder = doc.data();
              const folderDiv = document.createElement('div');
              folderDiv.innerHTML = folder.name;
              folderDiv.classList.add('folder');
              folderDiv.addEventListener('click', () => loadSubfolders(doc.id));
              folderList.appendChild(folderDiv);
          });
          folderPath.innerHTML = `Folder Path: ${folderID}`;
      });
}

// Upload file to Upload.io and store metadata in Firestore
uploadFileBtn.addEventListener('click', () => {
  const file = fileInput.files[0];
  if (file) {
      uploadStatus.innerHTML = 'Uploading...';

      const formData = new FormData();
      formData.append('file', file);
      
      fetch('https://upload.upload.io', {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${uploadIOKey}`
          },
          body: formData
      })
      .then(response => response.json())
      .then(data => {
          uploadStatus.innerHTML = 'File uploaded successfully!';
          
          // Save file metadata to Firestore
          const user = auth.currentUser;
          db.collection('files').add({
              fileName: file.name,
              fileURL: data.url,  // Assuming `data.url` contains the file URL
              userID: user.uid,
              folderID: folderPath.innerHTML.split(':')[1].trim() // Save folder ID too
          });
      })
      .catch(error => {
          uploadStatus.innerHTML = 'File upload failed';
          console.error(error);
      });
  }
});
