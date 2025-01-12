// Establish WebSocket connection for real-time updates
const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`);

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'update') {
    fetchFileStructure();
  }
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

// Firebase Authentication and Database
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

import { 
  ref, 
  set, 
  get, 
  remove 
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

const auth = firebaseAuth; // Firebase Authentication instance
const db = firebaseDatabase; // Firebase Realtime Database instance

// Signup Form
document.getElementById('signup').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const name = document.getElementById('name').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;
    await set(ref(db, 'users/' + userId), { email, name });
    alert('Signup successful!');
    toggleForms('login');
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
});

// Login Form
document.getElementById('login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert('Login successful!');
    toggleForms('fileManager');
    fetchUserProfile();
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
});

// Fetch User Profile
async function fetchUserProfile() {
  const userId = auth.currentUser.uid;
  const userProfile = await get(ref(db, 'users/' + userId));
  if (userProfile.exists()) {
    const data = userProfile.val();
    document.getElementById('profile-name').value = data.name || '';
  }
}

// Update Profile
document.getElementById('profile-update-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const userId = auth.currentUser.uid;
  const name = document.getElementById('profile-name').value;

  try {
    await set(ref(db, 'users/' + userId), { name, email: auth.currentUser.email });
    alert('Profile updated successfully!');
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
});

// Delete Profile
document.getElementById('delete-profile').addEventListener('click', async () => {
  const userId = auth.currentUser.uid;

  try {
    await remove(ref(db, 'users/' + userId));
    await signOut(auth);
    alert('Profile deleted and signed out!');
    toggleForms('login');
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
});

// Handle Authentication State
onAuthStateChanged(auth, (user) => {
  if (user) {
    toggleForms('fileManager');
    fetchUserProfile();
  } else {
    toggleForms('login');
  }
});

// Toggle Forms
function toggleForms(formType) {
  const forms = ['login-form', 'signup-form', 'file-manager', 'profile-form'];
  forms.forEach(formId => {
    document.getElementById(formId).style.display = formId === formType + '-form' ? 'block' : 'none';
  });
}

// Navigation Between Forms
document.getElementById('signup-link').addEventListener('click', () => toggleForms('signup'));
document.getElementById('login-link').addEventListener('click', () => toggleForms('login'));
