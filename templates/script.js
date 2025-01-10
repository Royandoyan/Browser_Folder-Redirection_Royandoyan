// script.js
const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`);

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'update') {
    fetchFileStructure();
  }
};

// Fetching and displaying file/folder structure
async function fetchFileStructure() {
  const response = await fetch('/files');
  const data = await response.json();

  const container = document.getElementById('file-structure');
  container.innerHTML = ''; // Clear previous content

  data.forEach(item => {
    const element = document.createElement('div');
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

      // Show image preview for image files
      if (item.name.match(/\.(jpeg|jpg|gif|png)$/i)) {
        const imgPreview = document.createElement('img');
        imgPreview.src = `/uploads/${item.name}`;
        element.appendChild(imgPreview);
      }

      element.appendChild(fileName);
    }
    container.appendChild(element);
  });
}

// Image preview before upload
document.getElementById('fileInput').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const imagePreview = document.getElementById('imagePreview');
      imagePreview.src = e.target.result;
      imagePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
});

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
  formData.append('file', fileInput.files[0]);

  const response = await fetch('/upload', { method: 'POST', body: formData });
  if (response.ok) {
    alert('File uploaded successfully');
    fetchFileStructure();
  } else {
    alert('Failed to upload file');
  }
});

fetchFileStructure(); // Load files and folders on page load
