import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, onSnapshot } from "firebase/firestore";

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

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

// Authentication state listener
onAuthStateChanged(auth, user => {
  if (user) {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('fileManager').style.display = 'block';
  } else {
    document.getElementById('authContainer').style.display = 'block';
    document.getElementById('fileManager').style.display = 'none';
  }
});

// Sign In function
document.getElementById('signinBtn').addEventListener('click', async () => {
  const email = document.getElementById('signinEmail').value;
  const password = document.getElementById('signinPassword').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert('Failed to sign in: ' + error.message);
  }
});

// Sign Up function
document.getElementById('signupBtn').addEventListener('click', async () => {
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert('Failed to sign up: ' + error.message);
  }
});

// Logout function
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await signOut(auth);
});

// Upload file function
document.getElementById('uploadFileBtn').addEventListener('click', async () => {
  const file = document.getElementById('fileInput').files[0];

  if (!file) {
    alert('Please select a file to upload');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  const idToken = await auth.currentUser.getIdToken();

  try {
    const response = await fetch('http://localhost:3000/upload', {
      method: 'POST',
      headers: {
        'Authorization': idToken
      },
      body: formData
    });

    const data = await response.json();
    if (data.message === "File uploaded successfully") {
      alert('File uploaded successfully');
    } else {
      alert('Error uploading file');
    }
  } catch (error) {
    alert('Error uploading file');
  }
});

// Create folder function
document.getElementById('createFolderBtn').addEventListener('click', async () => {
  const folderName = document.getElementById('folderName').value;

  if (!folderName) {
    alert('Please enter a folder name');
    return;
  }

  const idToken = await auth.currentUser.getIdToken();

  try {
    const response = await fetch('http://localhost:3000/createFolder', {
      method: 'POST',
      headers: {
        'Authorization': idToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ folderName, parentID: null })
    });

    const data = await response.json();
    if (data.message === "Folder created successfully") {
      alert('Folder created successfully');
    } else {
      alert('Error creating folder');
    }
  } catch (error) {
    alert('Error creating folder');
  }
});

// Delete item (folder or file)
document.getElementById('deleteFolderBtn').addEventListener('click', async () => {
  const itemID = 'itemID'; // Get the selected folder/file ID
  const isFolder = true; // Check if it's a folder or not

  const idToken = await auth.currentUser.getIdToken();

  try {
    const response = await fetch('http://localhost:3000/deleteItem', {
      method: 'DELETE',
      headers: {
        'Authorization': idToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ itemID, isFolder })
    });

    const data = await response.json();
    if (data.message === "Item deleted successfully") {
      alert('Item deleted successfully');
    } else {
      alert('Error deleting item');
    }
  } catch (error) {
    alert('Error deleting item');
  }
});
