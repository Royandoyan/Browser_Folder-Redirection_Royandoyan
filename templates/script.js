// script.js

// WebSocket for live updates
const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`);

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'update') {
    fetchFileStructure();
  }
};

// Fetch and display the file and folder structure
async function fetchFileStructure() {
  const response = await fetch('/files');
  const data = await response.json();

  const container = document.getElementById('file-structure');
  container.innerHTML = ''; // Clear previous content

  data.forEach(item => {
    const element = document.createElement('div');
    
    // If it's a folder
    if (item.isDirectory) {
      const folderIcon = document.createElement('span');
      folderIcon.className = 'folder-icon';
      element.appendChild(folderIcon);

      const folderName = document.createElement('span');
      folderName.textContent = item.name;
      folderName.className = 'folder';
      element.appendChild(folderName);
    } else {
      const fileName = document.createElement('span');
      fileName.textContent = item.name;
      fileName.className = 'file';

      // Create a link to download the exact file
      const fileLink = document.createElement('a');
      fileLink.href = `/uploads/${item.name}`;
      fileLink.textContent = item.name;
      fileLink.target = '_blank'; // Open the file in a new tab for download
      element.appendChild(fileLink);
      
      element.appendChild(fileName);
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

  // Loop through all files selected
  Array.from(fileInput.files).forEach(file => {
    formData.append('file', file);
  });

  const response = await fetch('/upload', { method: 'POST', body: formData });
  if (response.ok) {
    alert('Files uploaded successfully');
    fetchFileStructure();
  } else {
    alert('Failed to upload files');
  }
});

// Load the file structure on page load
fetchFileStructure();
