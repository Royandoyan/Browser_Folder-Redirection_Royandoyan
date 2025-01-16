/* Establish WebSocket connection for real-time updates
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
*/







// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIKjugxiJh9Bd0B32SEd4t9FImRQ9SVK8",
  authDomain: "browser-redirection.firebaseapp.com",
  databaseURL: "https://browser-redirection-default-rtdb.firebaseio.com",
  projectId: "browser-redirection",
  storageBucket: "browser-redirection.appspot.com",  // Make sure to correct this if needed
  messagingSenderId: "119718481062",
  appId: "1:119718481062:web:3f57b707f3438fc309f867",
  measurementId: "G-RG2M2FHGWV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


// DOM Elements
const folderNameInput = document.getElementById("folder-name");
const createFolderButton = document.getElementById("create-folder");
const fileUploadInput = document.getElementById("file-upload");
const uploadFilesButton = document.getElementById("upload-files");
const foldersDiv = document.getElementById("folders");

// Folder Collection Reference
const foldersCollection = db.collection("folders");

// Create Folder
createFolderButton.addEventListener("click", async () => {
  const folderName = folderNameInput.value.trim();
  if (folderName) {
    await foldersCollection.add({
      name: folderName,
      parentID: null,
      isDeleted: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    folderNameInput.value = "";
  }
});

// Render Folders
const renderFolders = async () => {
  foldersDiv.innerHTML = "";
  const snapshot = await foldersCollection
    .where("parentID", "==", null)
    .where("isDeleted", "==", false)
    .get();

  snapshot.forEach((doc) => {
    const folder = doc.data();
    const folderDiv = document.createElement("div");
    folderDiv.className = "folder";
    folderDiv.textContent = folder.name;
    foldersDiv.appendChild(folderDiv);

    // Folder click event
    folderDiv.addEventListener("click", () => {
      console.log(`Clicked folder: ${folder.name}`);
      // Add logic to show nested folders/files
    });

    // Delete Folder
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    folderDiv.appendChild(deleteButton);
    deleteButton.addEventListener("click", async () => {
      await foldersCollection.doc(doc.id).update({ isDeleted: true });
    });
  });
};

// Real-Time Listener
foldersCollection.onSnapshot(() => {
  renderFolders();
});

// Upload Files
uploadFilesButton.addEventListener("click", () => {
  const files = fileUploadInput.files;
  if (files.length > 0) {
    console.log("Files to upload:", files);
    // Add file upload logic here (e.g., upload to Firebase Storage)
  }
});

// Initial Render
renderFolders();
