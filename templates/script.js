// Firebase Imports (Use the Firebase CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const database = getDatabase(app);

// WebSocket variable declaration (outside of window.onload to avoid hoisting issues)
let ws;

// Show login form initially
window.onload = function() {
  showLoginForm();

  // Establish WebSocket connection for real-time updates after the page loads
  ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`);

  // WebSocket message handler
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === 'update') {
      fetchFileStructure();
    } else if (message.type === 'profileDeleted') {
      alert('A profile has been deleted!');
      showLoginForm(); // Optionally show login form again after profile deletion
    }
  };
};

// Fetch user data from Firebase and display it in the profile section
window.showProfile = function() {
  const user = auth.currentUser;
  if (user) {
    const userRef = ref(database, 'users/' + user.uid);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        document.getElementById('profile-name').value = userData.name;
        document.getElementById('profile-age').value = userData.age;
        document.getElementById('profile-address').value = userData.address;
        document.getElementById('profile-gender').value = userData.gender;
      } else {
        // If no profile data exists (i.e., it was deleted), leave fields empty
        document.getElementById('profile-name').value = '';
        document.getElementById('profile-age').value = '';
        document.getElementById('profile-address').value = '';
        document.getElementById('profile-gender').value = '';
      }

      // Show profile form
      document.getElementById('profile-form').style.display = 'block';
    }).catch((error) => {
      alert("Error fetching user data: " + error.message);
    });
  }
};

// Show login form
window.showLoginForm = function() {
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('signup-form').style.display = 'none';
  document.getElementById('file-manager').style.display = 'none';
};

// Show signup form
window.showSignupForm = function() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('signup-form').style.display = 'block';
  document.getElementById('file-manager').style.display = 'none';
};

// Show file manager
window.showFileManager = function() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('signup-form').style.display = 'none';
  document.getElementById('file-manager').style.display = 'block';
};

// Signup function
function signupUser() {
  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;
  const address = document.getElementById("address").value;
  const gender = document.getElementById("gender").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      // Save additional user data to Firebase Realtime Database
      set(ref(database, 'users/' + user.uid), {
        name: name,
        age: age,
        address: address,
        gender: gender,
        email: email
      }).then(() => {
        alert("User signed up successfully! Now log in.");
        showLoginForm();
      }).catch((error) => {
        alert("Error saving user data: " + error.message);
      });
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert("Error: " + errorMessage);
    });
}

// Attach signupUser to the global window object
window.signupUser = signupUser;

// Login function
function loginUser() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      alert("Login successful!");
      // Show profile and file manager after successful login
      showProfile();
      showFileManager(); // Show both profile and file manager at the same time
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert("Error: " + errorMessage);
    });
}

// Attach loginUser to the global window object
window.loginUser = loginUser;

// Clear the input field value when the X button is clicked
window.clearField = function(fieldId) {
  document.getElementById(fieldId).value = ''; // Clear the value of the input field
};

// Handle profile deletion with real-time synchronization
window.deleteProfileData = function() {
  const user = auth.currentUser;
  if (user) {
    const userRef = ref(database, 'users/' + user.uid);
    // Remove user data from the database (only the profile data)
    set(userRef, null).then(() => {
      alert("Profile data deleted successfully!");

      // Clear only the input fields in the profile form, not the form itself
      document.getElementById('profile-name').value = '';
      document.getElementById('profile-age').value = '';
      document.getElementById('profile-address').value = '';
      document.getElementById('profile-gender').value = '';

      // Optionally notify all connected clients about the profile deletion
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'profileDeleted', userId: user.uid }));
      }
    }).catch((error) => {
      alert("Error deleting profile data: " + error.message);
    });
  } else {
    alert("No user is logged in.");
  }
};

// WebSocket listener for handling profile deletion event in all browsers
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'profileDeleted') {
    alert('A profile has been deleted!');
    // You can perform any additional actions here if needed (e.g., clearing data in other clients)
    // In this case, just alerting other clients that the profile was deleted
  }
};

// WebSocket connection for real-time updates
const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`);

// Handle WebSocket connection opening (optional)
ws.onopen = () => {
  console.log("WebSocket connection established!");
};

// Handle WebSocket errors (optional)
ws.onerror = (error) => {
  console.error("WebSocket error:", error);
};




// Fetch and display file/folder structure
async function fetchFileStructure() {
  const response = await fetch('/files');
  const data = await response.json();

  const container = document.getElementById('file-structure');
  container.innerHTML = '';

  data.forEach(item => {
    const element = document.createElement('div');
    element.className = item.isDirectory ? 'folder' : 'file';

    if (item.isDirectory) {
      const folderIcon = document.createElement('span');
      folderIcon.className = 'folder-icon';
      element.appendChild(folderIcon);

      const folderName = document.createElement('span');
      folderName.textContent = item.name;
      element.appendChild(folderName);
    } else {
      const fileLink = document.createElement('a');
      fileLink.href = `/uploads/${item.name}`;
      fileLink.target = '_blank';

      let mediaPreview = null;

      // Preview images
      if (item.name.match(/\.(jpeg|jpg|png|gif)$/i)) {
        mediaPreview = document.createElement('img');
        mediaPreview.src = `/uploads/${item.name}`;
        mediaPreview.alt = item.name;
        mediaPreview.className = 'file-image';
      }
      // Preview videos
      else if (item.name.match(/\.(mp4|webm|ogg)$/i)) {
        mediaPreview = document.createElement('video');
        mediaPreview.src = `/uploads/${item.name}`;
        mediaPreview.controls = true; // Add playback controls
        mediaPreview.className = 'file-video';
      }
      // Assign icons for other files
      else if (item.name.match(/\.(ppt|pptx)$/i)) {
        mediaPreview = document.createElement('img');
        mediaPreview.src = 'ppt.png'; // Relative to templates folder
        mediaPreview.alt = 'PowerPoint File';
        mediaPreview.className = 'file-icon';
      } else if (item.name.match(/\.(doc|docx)$/i)) {
        mediaPreview = document.createElement('img');
        mediaPreview.src = 'doc.png'; // Relative to templates folder
        mediaPreview.alt = 'Word File';
        mediaPreview.className = 'file-icon';
      } else if (item.name.match(/\.(xls|xlsx)$/i)) {
        mediaPreview = document.createElement('img');
        mediaPreview.src = 'xls.png'; // Relative to templates folder
        mediaPreview.alt = 'Excel File';
        mediaPreview.className = 'file-icon';
      }

      if (mediaPreview) {
        element.appendChild(mediaPreview);
      }

      const fileName = document.createElement('span');
      fileName.textContent = item.name;
      fileLink.appendChild(fileName);
      element.appendChild(fileLink);
    }
    container.appendChild(element);
  });
}

// Handle folder creation
document.getElementById('create-folder-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const folderName = document.getElementById('folderName').value;
  const response = await fetch(`/create-folder?folderName=${folderName}`, { method: 'POST' });
  if (response.ok) {
    alert('Folder created successfully');
    fetchFileStructure();
  } else {
    alert('Failed to create folder');
  }
});

// Handle file upload
document.getElementById('upload-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('fileInput');
  const formData = new FormData();

  Array.from(fileInput.files).forEach(file => {
    formData.append('files', file);
  });

  const response = await fetch('/upload', { method: 'POST', body: formData });
  if (response.ok) {
    alert('Files uploaded successfully');
    fetchFileStructure(); // Refresh the structure to include uploaded files
  } else {
    alert('Failed to upload files');
  }
});

// Fetch file structure on page load
fetchFileStructure();
